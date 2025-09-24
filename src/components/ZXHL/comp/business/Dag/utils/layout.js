import { DagreLayout } from '@antv/layout';
import Hierarchy from '@antv/hierarchy';
import { getNodeSizeByDirection } from './nodeGeometry.js';

const DIRECTION_META = {
  LR: {
    rankdir: 'LR',
    orientation: 'horizontal',
    allowedGroups: ['left', 'right'],
    sourcePort: 'r',
    targetPort: 'l',
  },
  TB: {
    rankdir: 'TB',
    orientation: 'vertical',
    allowedGroups: ['top', 'bottom'],
    sourcePort: 'b',
    targetPort: 't',
  },
};

// 企业级边样式配置 - 参考阿里、腾讯等大厂DAG可视化最佳实践
const EDGE_ROUTER = {
  LR: { name: 'orth', args: { padding: 24, offset: 16, excludeShapes: ['edge'] } },
  TB: { name: 'orth', args: { padding: 24, offset: 16, excludeShapes: ['edge'] } },
};

const EDGE_CONNECTOR = { 
  name: 'rounded', 
  args: { radius: 12 } // 增加圆角半径，让连接更流畅
};
const MINDMAP_PADDING = 30;
const VIRTUAL_ROOT_ID = '__virtual_root__';

/**
 * 企业级DAG布局引擎
 * 统一使用 @antv/layout 的 DagreLayout，提供稳定可靠的布局效果
 * 支持手动布局位置保持，确保回显一致性
 */
export async function dagreLayout(graph, direction = 'TB', ranksep = 120, nodesep = 60, options = {}) {
  const g = graph?.value ?? graph;
  if (!g) return;

  const {
    applyLayout = true,
    preserveManualPositions = false,
    preserveManualVertices = false,
  } = options;

  const meta = DIRECTION_META[direction] ?? DIRECTION_META.TB;
  const nodes = g.getNodes();
  if (nodes.length === 0) return;

  const sizeConfig = getNodeSizeByDirection(direction);

  // 检查是否有手动设置的节点位置
  const hasManualPositions = preserveManualPositions || checkHasManualPositions(nodes);

  g.batchUpdate?.(() => {
    nodes.forEach((node) => syncNodeAppearance(node, meta, sizeConfig));
  });

  if (!applyLayout || hasManualPositions) {
    // 仅更新边样式，保持节点位置不变
    updateEdges(g, meta, { preserveManualVertices: true });
    console.log('⚡ 保持手动布局位置，仅更新边样式');
    return;
  }

  const edges = g.getEdges();
  const layoutResult = await computeLayoutModel({
    nodes,
    edges,
    meta,
    ranksep,
    nodesep,
    sizeConfig,
  });

  const positionMap = layoutResult.positions ?? new Map();
  const controlPoints = layoutResult.controlPoints ?? new Map();

  g.batchUpdate?.(() => {
    if (positionMap.size > 0) {
      applyNodePositions(g, positionMap, sizeConfig);
    }
    updateEdges(g, meta, {
      controlPoints,
      preserveManualVertices,
    });
  });

  console.log('✨ Dagre自动布局完成');
}

/**
 * 检查节点是否有手动设置的位置
 * 通过检查节点的 data.manualPosition 标记或位置的合理性来判断
 */
function checkHasManualPositions(nodes) {
  if (!nodes || nodes.length === 0) return false;
  
  // 检查是否有明确的手动位置标记
  const hasManualMarks = nodes.some(node => {
    const data = node.getData?.() || {};
    return data.manualPosition === true;
  });
  
  if (hasManualMarks) return true;
  
  // 检查位置是否看起来像手动设置的（非规律性布局）
  const positions = nodes.map(node => node.getPosition()).filter(pos => pos.x !== 0 || pos.y !== 0);
  if (positions.length < 2) return false;
  
  // 如果节点位置呈现明显的网格或规律性排列，可能是自动布局
  // 如果位置比较随意，可能是手动布局
  const avgDistance = positions.reduce((sum, pos, i) => {
    if (i === 0) return sum;
    const prevPos = positions[i - 1];
    return sum + Math.sqrt(Math.pow(pos.x - prevPos.x, 2) + Math.pow(pos.y - prevPos.y, 2));
  }, 0) / Math.max(positions.length - 1, 1);
  
  // 如果平均距离在合理范围内且节点已经有位置，认为是手动布局
  return avgDistance > 50 && positions.length === nodes.length;
}

async function computeLayoutModel({ nodes, edges, meta, ranksep, nodesep }) {
  // 统一使用企业级 Dagre 布局算法，确保稳定性和一致性
  return runDagreLayoutModel({ nodes, edges, meta, ranksep, nodesep });
}

function runDagreLayoutModel({ nodes, edges, meta, ranksep, nodesep }) {
  const layout = new DagreLayout({
    rankdir: meta.rankdir,
    ranksep,
    nodesep,
    controlPoints: true,
    align: 'UL',
  });

  const modelNodes = nodes.map((node) => {
    const size = node.getSize();
    return {
      id: node.id,
      width: size.width,
      height: size.height,
    };
  });

  const modelEdges = edges.map((edge) => ({
    id: edge.id,
    source: edge.getSourceCellId(),
    target: edge.getTargetCellId(),
  }));

  const result = layout.layout({ nodes: modelNodes, edges: modelEdges }) || { nodes: [], edges: [] };
  const positionMap = new Map();
  result.nodes?.forEach?.((item) => {
    if (!item?.id) return;
    positionMap.set(item.id, {
      x: item.x,
      y: item.y,
    });
  });

  const controlPointMap = new Map();
  result.edges?.forEach?.((edgeModel) => {
    if (!edgeModel?.id) return;
    controlPointMap.set(edgeModel.id, edgeModel.controlPoints || []);
  });

  return { positions: positionMap, controlPoints: controlPointMap };
}

// 移除复杂的mindmap布局逻辑，统一使用稳定的Dagre算法

function applyNodePositions(graph, positionMap, fallbackSize) {
  positionMap.forEach((coords, nodeId) => {
    const node = graph.getCellById(nodeId);
    if (!node) return;
    const size = node.getSize?.() || fallbackSize;
    const x = coords.x - size.width / 2;
    const y = coords.y - size.height / 2;
    node.position(x, y);
  });
}

function syncNodeAppearance(node, meta, sizeConfig) {
  const prevData = node.getData?.() || {};
  if (prevData.layoutDirection !== meta.orientation) {
    node.setData({
      ...prevData,
      layoutDirection: meta.orientation,
    });
  }

  const size = node.getSize?.();
  if (!size || size.width !== sizeConfig.width || size.height !== sizeConfig.height) {
    node.resize(sizeConfig.width, sizeConfig.height);
  }

  ensureSidePorts(node);
  smartPortManagement(node, meta.allowedGroups);
}

function updateEdges(graph, meta, options = {}) {
  const {
    controlPoints,
    preserveManualVertices = false,
  } = options;

  const controlPointMap = normalizeControlPoints(controlPoints);
  const routerConfig = EDGE_ROUTER[meta.rankdir] ?? EDGE_ROUTER.TB;

  graph.getEdges().forEach((edge) => {
    try {
      const sourceId = edge.getSourceCellId();
      const targetId = edge.getTargetCellId();
      if (!sourceId || !targetId) return;

      const sourceNode = graph.getCellById(sourceId);
      const targetNode = graph.getCellById(targetId);
      if (!sourceNode || !targetNode) return;

      if (!preserveManualVertices) {
        const points = controlPointMap.get(edge.id) || [];
        edge.setVertices(points.map(({ x, y }) => ({ x, y })));
      }

      rebindPortIfNeeded(edge, sourceNode, meta.sourcePort, meta.allowedGroups, 'source');
      rebindPortIfNeeded(edge, targetNode, meta.targetPort, meta.allowedGroups, 'target');

      if (routerConfig) {
        edge.setRouter(routerConfig.name, routerConfig.args);
      }
      if (EDGE_CONNECTOR) {
        edge.setConnector(EDGE_CONNECTOR.name, EDGE_CONNECTOR.args);
      }
    } catch (error) {
      console.warn('Failed to update edge:', error);
    }
  });
}

function normalizeControlPoints(controlPoints) {
  if (!controlPoints) {
    return new Map();
  }
  if (controlPoints instanceof Map) {
    return controlPoints;
  }
  const map = new Map();
  if (Array.isArray(controlPoints)) {
    controlPoints.forEach((edgeModel) => {
      if (!edgeModel || !edgeModel.id) return;
      map.set(edgeModel.id, edgeModel.controlPoints || []);
    });
  }
  return map;
}

function rebindPortIfNeeded(edge, node, preferPortId, allowedGroups, type) {
  const next = type === 'source' ? edge.getSource() : edge.getTarget();
  let needUpdate = false;

  if (next && next.port) {
    const group = node.getPortProp?.(next.port, 'group');
    const visible = node.getPortProp?.(next.port, 'attrs/circle/style/display') !== 'none';
    if (!allowedGroups.includes(group) || !visible) {
      needUpdate = true;
    }
  } else {
    needUpdate = true;
  }

  if (!needUpdate) return;

  const ports = node.getPorts?.() || [];
  const exists = ports.some((p) => p.id === preferPortId);
  if (!exists) return;

  if (type === 'source') {
    edge.setSource({ cell: node.id, port: preferPortId });
  } else {
    edge.setTarget({ cell: node.id, port: preferPortId });
  }
}

function ensureSidePorts(node) {
  const list = (node.getPorts?.() || []).map((p) => p.id);
  const need = [
    { id: 't', group: 'top' },
    { id: 'b', group: 'bottom' },
    { id: 'l', group: 'left' },
    { id: 'r', group: 'right' },
  ];
  need.forEach(({ id, group }) => {
    if (!list.includes(id)) {
      node.addPort({ id, group });
    } else if (node.setPortProp) {
      node.setPortProp(id, 'group', group);
    }
  });
}

function smartPortManagement(node, allowedGroups) {
  const ports = node.getPorts?.() || [];
  const standardPorts = new Set(['t', 'b', 'l', 'r']);
  const connectedEdges = node.getEdges?.() || [];
  const usedPorts = new Set();

  connectedEdges.forEach((edge) => {
    const source = edge.getSource();
    const target = edge.getTarget();
    if (source && source.cell === node.id && source.port) {
      usedPorts.add(source.port);
    }
    if (target && target.cell === node.id && target.port) {
      usedPorts.add(target.port);
    }
  });

  const groupVisiblePort = new Map();
  const groupPorts = new Map();

  ports.forEach((p) => {
    const group = p.group || node.getPortProp?.(p.id, 'group');
    if (!group) return;
    if (!groupPorts.has(group)) {
      groupPorts.set(group, []);
    }
    groupPorts.get(group).push(p);
  });

  groupPorts.forEach((portList, group) => {
    const standardPort = portList.find((p) => standardPorts.has(p.id));
    if (standardPort) {
      groupVisiblePort.set(group, standardPort.id);
      return;
    }
    const usedPort = portList.find((p) => usedPorts.has(p.id));
    if (usedPort) {
      groupVisiblePort.set(group, usedPort.id);
      return;
    }
    if (portList.length > 0) {
      groupVisiblePort.set(group, portList[0].id);
    }
  });

  ports.forEach((p) => {
    const group = p.group || node.getPortProp?.(p.id, 'group');
    const isGroupRepresentative = groupVisiblePort.get(group) === p.id;
    const shouldShowByDirection = allowedGroups.includes(group);
    const shouldShow = isGroupRepresentative && shouldShowByDirection;

    node.setPortProp?.(p.id, 'attrs/circle/style/display', shouldShow ? '' : 'none');
    node.setPortProp?.(p.id, 'attrs/circle/magnet', !!shouldShow);

    if (shouldShow && isGroupRepresentative) {
      const positionConfig = getPortPositionConfig(group);
      if (positionConfig) {
        node.setPortProp?.(p.id, 'position', positionConfig);
      }
    }
  });
}

function getPortPositionConfig(group) {
  const configs = {
    top: {
      name: 'top',
      args: { x: '50%', y: 0 },
    },
    bottom: {
      name: 'bottom',
      args: { x: '50%', y: 0 },
    },
    left: {
      name: 'left',
      args: { x: 0, y: '50%' },
    },
    right: {
      name: 'right',
      args: { x: 0, y: '50%' },
    },
  };
  return configs[group] || null;
}
