<template>
  <div class="demo8-container">
    <h2>Demo 8 - Vue 组件节点与连接约束</h2>
    
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-button-group>
        <el-button size="small" @click="addVueNode" :icon="Plus">添加 Vue 节点</el-button>
        <el-button size="small" @click="addPortNode" :icon="Connection">添加端口节点</el-button>
        <el-button size="small" @click="toggleConnecting" :type="connectingMode ? 'primary' : 'default'">
          {{ connectingMode ? '退出连接' : '连接模式' }}
        </el-button>
      </el-button-group>
      
      <el-button-group>
        <el-button size="small" @click="layoutDagre" :icon="Grid">层次布局</el-button>
        <el-button size="small" @click="layoutForce" :icon="Refresh">力导向</el-button>
        <el-button size="small" @click="resetLayout" :icon="RefreshLeft">重置布局</el-button>
      </el-button-group>
      
      <el-button-group>
        <el-button size="small" @click="validateConnections" :icon="Check">验证连接</el-button>
        <el-button size="small" @click="clearInvalidConnections" :icon="Warning" type="warning">清理无效连接</el-button>
      </el-button-group>
    </div>

    <!-- 画布容器 -->
    <div class="canvas-container">
      <XFlow>
        <XFlowGraph
          :style="{ width: '100%', height: '600px' }"
          :zoomable="true"
          :pannable="true"
          :scroller="false"
          :connection-options="connectionOptions"
          @ready="onGraphReady"
        >
          <XFlowHistory />
          <XFlowClipboard />
          <XFlowSnapline />
          <XFlowBackground color="#f8f9fa" />
          <XFlowGrid :size="20" type="mesh" />
          
          <!-- 小地图 -->
          <XFlowMinimap 
            :width="180" 
            :height="120" 
            :simple="false"
            :style="{ position: 'absolute', top: '10px', right: '10px' }"
          />
        </XFlowGraph>
      </XFlow>
    </div>

    <!-- 状态信息 -->
    <div class="status-bar">
      <el-space>
        <span>Vue 节点: {{ vueNodeCount }}</span>
        <span>端口节点: {{ portNodeCount }}</span>
        <span>连接数: {{ edgeCount }}</span>
        <span>有效连接: {{ validConnections }}</span>
        <span v-if="connectingMode" class="connect-tip">🔗 连接模式：点击端口进行连接</span>
      </el-space>
    </div>

    <!-- 操作提示 -->
    <div class="tips">
      <el-alert 
        title="Vue 组件节点与连接约束演示" 
        type="info" 
        :closable="false"
        show-icon
      >
        <div>
          <p><strong>Vue 组件节点：</strong></p>
          <ul>
            <li>使用 @antv/x6-vue-shape 渲染的真实 Vue 组件</li>
            <li>支持完整的 Vue 响应式数据和事件</li>
            <li>可以包含 Element Plus 组件</li>
          </ul>
          <p><strong>连接约束：</strong></p>
          <ul>
            <li>只能在端口之间建立连接</li>
            <li>输入端口只能接收一个连接</li>
            <li>输出端口可以连接多个目标</li>
            <li>不允许自连接和重复连接</li>
          </ul>
          <p><strong>布局算法：</strong></p>
          <ul>
            <li>层次布局：适用于流程图和树状结构</li>
            <li>力导向布局：自动优化节点位置</li>
          </ul>
        </div>
      </el-alert>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  Plus, 
  Connection,
  Grid,
  Refresh,
  RefreshLeft,
  Check,
  Warning
} from '@element-plus/icons-vue';

// 导入组件
import {
  XFlow,
  XFlowGraph,
  XFlowHistory,
  XFlowClipboard,
  XFlowSnapline,
  XFlowBackground,
  XFlowGrid,
  XFlowMinimap,
} from '../xflow-vue/src/components/index.js';

// 导入组合式函数
import {
  useHistory,
  useClipboard,
} from '../xflow-vue/src/composables/index.js';

// 导入业务图形注册函数
import { registerAllBusinessShapes, getAvailableShapes } from '../../shapes/index.js';

// 响应式数据
const selectedCells = ref([]);
const connectingMode = ref(false);
const connectingSource = ref(null);

// Graph 实例
let graph = null;

// 连接配置（统一样式 + 严格校验：输入端口只允许一个入边）
const connectionOptions = {
  snap: true,
  allowBlank: false,
  allowLoop: false,
  allowNode: false,
  allowEdge: false,
  allowPort: true,
  highlight: true,
  connector: { name: 'rounded', args: { radius: 8 } },
  router: { name: 'manhattan', args: { padding: 6 } },
  createEdge() {
    return graph.createEdge({
      attrs: {
        line: {
          stroke: '#6375ff',
          strokeWidth: 2,
          targetMarker: { name: 'block', width: 12, height: 8 },
          sourceMarker: null,
        },
      },
      connector: { name: 'rounded', args: { radius: 8 } },
      router: { name: 'manhattan', args: { padding: 6 } },
    });
  },
  validateConnection({ sourceCell, targetCell, sourcePort, targetPort, sourceMagnet, targetMagnet }) {
    console.log('validateConnection 调用:', { 
      sourceCell: sourceCell?.id, 
      targetCell: targetCell?.id, 
      sourcePort, 
      targetPort 
    });

    if (!sourceMagnet || !targetMagnet) {
      console.log('验证失败: 缺少磁铁');
      return false;
    }
    if (!sourceCell || !targetCell) {
      console.log('验证失败: 缺少节点');
      return false;
    }

    // 不允许自连接
    if (sourceCell.id === targetCell.id) {
      console.log('验证失败: 自连接');
      return false;
    }

    const sPort = sourceCell.getPort(sourcePort);
    const tPort = targetCell.getPort(targetPort);
    if (!sPort || !tPort) {
      console.log('验证失败: 端口不存在');
      return false;
    }

    // 端口方向约束：源必须是 output，目标必须是 input
    if (sPort.group !== 'output') {
      console.log('验证失败: 源端口不是 output, 实际是:', sPort.group);
      return false;
    }
    if (tPort.group !== 'input') {
      console.log('验证失败: 目标端口不是 input, 实际是:', tPort.group);
      return false;
    }

    // 关键修复：输入端口只允许一个入边
    const existingEdges = graph.getEdges().filter(edge => {
      return edge.getTargetCellId() === targetCell.id && 
             edge.getTargetPortId() === targetPort;
    });
    
    if (existingEdges.length > 0) {
      console.log('验证失败: 输入端口已有连接', existingEdges.length);
      return false;
    }

    // 防重复连接：同一对端口仅一条边
    const duplicate = graph.getEdges().some(edge => {
      return edge.getSourceCellId() === sourceCell.id &&
             edge.getSourcePortId() === sourcePort &&
             edge.getTargetCellId() === targetCell.id &&
             edge.getTargetPortId() === targetPort;
    });
    
    if (duplicate) {
      console.log('验证失败: 重复连接');
      return false;
    }

    console.log('验证通过');
    return true;
  },
};

// 计算属性
const vueNodeCount = computed(() => {
  if (!graph) return 0;
  return graph.getNodes().filter(node => 
    node.shape === 'vue-node' || node.getData()?.type === 'vue'
  ).length;
});

const portNodeCount = computed(() => {
  if (!graph) return 0;
  return graph.getNodes().filter(node => 
    node.shape === 'port-node' || node.getData()?.type === 'port'
  ).length;
});

const edgeCount = computed(() => {
  if (!graph) return 0;
  return graph.getEdges().length;
});

const validConnections = computed(() => {
  if (!graph) return 0;
  return graph.getEdges().filter(edge => {
    const source = edge.getSourceNode();
    const target = edge.getTargetNode();
    return source && target;
  }).length;
});

// 图形准备就绪回调
const onGraphReady = (g, keyboardMgr) => {
  graph = g;
  
  // 设置键盘处理器
  if (keyboardMgr) {
    const clipboardActions = useClipboard(g);
    keyboardMgr.setClipboardHandler((action) => {
      switch (action) {
        case 'copy':
          clipboardActions.copy();
          break;
        case 'paste':
          const cells = clipboardActions.paste({ offset: 20 });
          if (cells?.length) {
            graph.cleanSelection();
            graph.select(cells);
          }
          break;
        case 'cut':
          clipboardActions.cut();
          break;
      }
    });
    
    const historyActions = useHistory(g);
    keyboardMgr.setHistoryHandler((action) => {
      switch (action) {
        case 'undo':
          historyActions.undo();
          break;
        case 'redo':
          historyActions.redo();
          break;
      }
    });
  }
  
  setupGraphEvents();
  createInitialNodes();
};

// 设置图形事件
const setupGraphEvents = () => {
  if (!graph) return;
  
  // 监听选择变化
  graph.on('selection:changed', ({ selected }) => {
    selectedCells.value = selected;
  });
  
  // 监听端口点击（连接模式）
  graph.on('cell:mouseenter', ({ cell }) => {
    if (connectingMode.value && cell.isNode()) {
      // 高亮显示端口
      const ports = cell.getPorts();
      ports.forEach(port => {
        cell.portProp(port.id, 'attrs/circle/stroke', '#1890ff');
        cell.portProp(port.id, 'attrs/circle/strokeWidth', 3);
      });
    }
  });
  
  graph.on('cell:mouseleave', ({ cell }) => {
    if (connectingMode.value && cell.isNode()) {
      // 恢复端口样式
      const ports = cell.getPorts();
      ports.forEach(port => {
        const portData = port.args || {};
        cell.portProp(port.id, 'attrs/circle/stroke', portData.defaultStroke || '#8c8c8c');
        cell.portProp(port.id, 'attrs/circle/strokeWidth', portData.defaultStrokeWidth || 1);
      });
    }
  });
  
  // 监听连接创建
  graph.on('edge:connected', ({ edge }) => {
    console.log('连接创建:', {
      source: edge.getSourceNode()?.getLabel(),
      target: edge.getTargetNode()?.getLabel(),
      sourcePort: edge.getSourcePortId(),
      targetPort: edge.getTargetPortId(),
    });
  });
};

// 创建初始节点
const createInitialNodes = () => {
  // 创建一些带端口的节点用于测试连接
  const nodes = [
    {
      id: 'start',
      shape: 'port-node',
      x: 100,
      y: 150,
      label: '开始节点',
      data: { type: 'start' }
    },
    {
      id: 'process1',
      shape: 'port-node',
      x: 350,
      y: 100,
      label: '处理节点1',
      data: { type: 'process' }
    },
    {
      id: 'process2',
      shape: 'port-node',
      x: 350,
      y: 250,
      label: '处理节点2',
      data: { type: 'process' }
    },
    {
      id: 'end',
      shape: 'port-node',
      x: 600,
      y: 175,
      label: '结束节点',
      data: { type: 'end' }
    }
  ];
  
  nodes.forEach(nodeData => {
    graph.addNode(nodeData);
  });
  
  // 添加一个示例连接（使用统一样式）
  const eg = graph.createEdge({
    source: { cell: 'start', port: 'output' },
    target: { cell: 'process1', port: 'input' },
    attrs: {
      line: {
        stroke: '#6375ff',
        strokeWidth: 2,
        targetMarker: { name: 'block', width: 12, height: 8 },
      },
    },
    connector: { name: 'rounded', args: { radius: 8 } },
    router: { name: 'manhattan', args: { padding: 6 } },
  });
  graph.addEdge(eg);
  
  // 在初始化完成后验证连接
  setTimeout(() => {
    validateConnections();
  }, 100);
};

// 添加 Vue 组件节点
const addVueNode = () => {
  if (!graph) return;
  
  const node = graph.addNode({
    shape: 'vue-node',
    x: Math.random() * 400 + 100,
    y: Math.random() * 300 + 100,
    width: 200,
    height: 120,
    label: 'Vue 组件节点',
    data: {
      type: 'vue',
      props: {
        title: 'Vue 节点',
        count: Math.floor(Math.random() * 100),
        status: 'active'
      }
    }
  });
  
  graph.select(node);
};

// 添加端口节点
const addPortNode = () => {
  if (!graph) return;
  
  const node = graph.addNode({
    shape: 'port-node',
    x: Math.random() * 400 + 100,
    y: Math.random() * 300 + 100,
    label: '端口节点',
    data: {
      type: 'port',
      inputCount: 2,
      outputCount: 2
    }
  });
  
  graph.select(node);
};

// 切换连接模式
const toggleConnecting = () => {
  connectingMode.value = !connectingMode.value;
  connectingSource.value = null;
  
  if (connectingMode.value) {
    // 进入连接模式
    graph.disablePanning();
    console.log('进入连接模式');
  } else {
    // 退出连接模式
    graph.enablePanning();
    console.log('退出连接模式');
  }
};

// 布局算法
const layoutDagre = () => {
  if (!graph) return;
  
  // 简单的层次布局实现
  const nodes = graph.getNodes();
  const edges = graph.getEdges();
  
  // 计算节点层级
  const levels = new Map();
  const visited = new Set();
  
  // 找出起始节点（没有输入的节点）
  const startNodes = nodes.filter(node => {
    const incomingEdges = edges.filter(edge => edge.getTargetNode()?.id === node.id);
    return incomingEdges.length === 0;
  });
  
  // BFS 分层
  const queue = startNodes.map(node => ({ node, level: 0 }));
  
  while (queue.length > 0) {
    const { node, level } = queue.shift();
    
    if (visited.has(node.id)) continue;
    visited.add(node.id);
    levels.set(node.id, level);
    
    // 找出下一层节点
    const outgoingEdges = edges.filter(edge => edge.getSourceNode()?.id === node.id);
    outgoingEdges.forEach(edge => {
      const targetNode = edge.getTargetNode();
      if (targetNode && !visited.has(targetNode.id)) {
        queue.push({ node: targetNode, level: level + 1 });
      }
    });
  }
  
  // 按层级排列
  const levelGroups = new Map();
  levels.forEach((level, nodeId) => {
    if (!levelGroups.has(level)) {
      levelGroups.set(level, []);
    }
    const node = graph.getCellById(nodeId);
    if (node) {
      levelGroups.get(level).push(node);
    }
  });
  
  // 重新定位节点
  levelGroups.forEach((nodesInLevel, level) => {
    const startY = 100;
    const levelHeight = 150;
    const nodeSpacing = 180;
    const startX = 100;
    
    nodesInLevel.forEach((node, index) => {
      node.position(
        startX + level * 200,
        startY + index * levelHeight
      );
    });
  });
};

const layoutForce = () => {
  if (!graph) return;
  
  // 简单的力导向布局
  const nodes = graph.getNodes();
  const edges = graph.getEdges();
  
  // 计算中心点
  const center = { x: 400, y: 300 };
  const radius = 200;
  
  // 如果没有边，使用圆形布局
  if (edges.length === 0) {
    nodes.forEach((node, index) => {
      const angle = (2 * Math.PI * index) / nodes.length;
      const x = center.x + radius * Math.cos(angle);
      const y = center.y + radius * Math.sin(angle);
      node.position(x, y);
    });
    return;
  }
  
  // 简单的弹簧力模拟
  const positions = new Map();
  const velocities = new Map();
  
  // 初始化位置和速度
  nodes.forEach(node => {
    const pos = node.position();
    positions.set(node.id, { x: pos.x, y: pos.y });
    velocities.set(node.id, { x: 0, y: 0 });
  });
  
  // 力导向迭代
  for (let iteration = 0; iteration < 50; iteration++) {
    const forces = new Map();
    
    // 初始化力
    nodes.forEach(node => {
      forces.set(node.id, { x: 0, y: 0 });
    });
    
    // 计算排斥力
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];
        const pos1 = positions.get(node1.id);
        const pos2 = positions.get(node2.id);
        
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        
        const force = 1000 / (distance * distance);
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;
        
        const force1 = forces.get(node1.id);
        const force2 = forces.get(node2.id);
        
        force1.x += fx;
        force1.y += fy;
        force2.x -= fx;
        force2.y -= fy;
      }
    }
    
    // 计算吸引力（连接的节点）
    edges.forEach(edge => {
      const sourceNode = edge.getSourceNode();
      const targetNode = edge.getTargetNode();
      
      if (!sourceNode || !targetNode) return;
      
      const pos1 = positions.get(sourceNode.id);
      const pos2 = positions.get(targetNode.id);
      
      if (!pos1 || !pos2) return;
      
      const dx = pos2.x - pos1.x;
      const dy = pos2.y - pos1.y;
      const distance = Math.sqrt(dx * dx + dy * dy) || 1;
      
      const force = distance * 0.01;
      const fx = (dx / distance) * force;
      const fy = (dy / distance) * force;
      
      const force1 = forces.get(sourceNode.id);
      const force2 = forces.get(targetNode.id);
      
      force1.x += fx;
      force1.y += fy;
      force2.x -= fx;
      force2.y -= fy;
    });
    
    // 更新位置
    nodes.forEach(node => {
      const force = forces.get(node.id);
      const velocity = velocities.get(node.id);
      const position = positions.get(node.id);
      
      velocity.x = (velocity.x + force.x) * 0.8;
      velocity.y = (velocity.y + force.y) * 0.8;
      
      position.x += velocity.x;
      position.y += velocity.y;
      
      // 边界约束
      position.x = Math.max(50, Math.min(750, position.x));
      position.y = Math.max(50, Math.min(550, position.y));
    });
  }
  
  // 应用最终位置
  nodes.forEach(node => {
    const finalPos = positions.get(node.id);
    node.position(finalPos.x, finalPos.y);
  });
};

const resetLayout = () => {
  if (!graph) return;
  
  graph.clearCells();
  setTimeout(() => {
    createInitialNodes();
  }, 100);
};

// 验证连接（完整的约束检查）
const validateConnections = () => {
  if (!graph) return;
  
  const edges = graph.getEdges();
  const invalidEdges = [];
  const inputPortConnections = new Map(); // 跟踪每个输入端口的连接数
  
  edges.forEach(edge => {
    const source = edge.getSourceNode();
    const target = edge.getTargetNode();
    const sourcePort = edge.getSourcePortId();
    const targetPort = edge.getTargetPortId();
    
    let isInvalid = false;
    let reason = '';
    
    // 基本有效性检查
    if (!source || !target || !sourcePort || !targetPort) {
      isInvalid = true;
      reason = '缺少节点或端口信息';
    }
    
    // 自连接检查
    else if (source.id === target.id) {
      isInvalid = true;
      reason = '自连接';
    }
    
    // 端口方向检查
    else {
      const sPort = source.getPort(sourcePort);
      const tPort = target.getPort(targetPort);
      
      if (!sPort || !tPort) {
        isInvalid = true;
        reason = '端口不存在';
      } else if (sPort.group !== 'output' || tPort.group !== 'input') {
        isInvalid = true;
        reason = '端口方向错误';
      }
    }
    
    // 输入端口连接数检查
    if (!isInvalid && target && targetPort) {
      const key = `${target.id}:${targetPort}`;
      const count = inputPortConnections.get(key) || 0;
      inputPortConnections.set(key, count + 1);
      
      if (count >= 1) {
        isInvalid = true;
        reason = '输入端口多重连接';
      }
    }
    
    if (isInvalid) {
      invalidEdges.push({ edge, reason });
    }
  });
  
  if (invalidEdges.length > 0) {
    console.log('发现无效连接:', invalidEdges.length);
    invalidEdges.forEach(({ edge, reason }) => {
      console.log(`- 无效连接 ${edge.id}: ${reason}`);
      // 高亮无效连接
      edge.attr('line/stroke', '#f5222d');
      edge.attr('line/strokeWidth', 3);
      edge.attr('line/strokeDasharray', '5,5');
    });
  } else {
    console.log('所有连接都有效');
    // 恢复正常样式
    edges.forEach(edge => {
      edge.attr('line/stroke', '#6375ff');
      edge.attr('line/strokeWidth', 2);
      edge.attr('line/strokeDasharray', 'none');
    });
  }
};

const clearInvalidConnections = () => {
  if (!graph) return;
  
  const edges = graph.getEdges();
  const invalidEdges = [];
  const inputPortConnections = new Map();
  
  edges.forEach(edge => {
    const source = edge.getSourceNode();
    const target = edge.getTargetNode();
    const sourcePort = edge.getSourcePortId();
    const targetPort = edge.getTargetPortId();
    
    let isInvalid = false;
    
    // 基本有效性检查
    if (!source || !target || !sourcePort || !targetPort) {
      isInvalid = true;
    }
    // 自连接检查
    else if (source.id === target.id) {
      isInvalid = true;
    }
    // 端口方向检查
    else {
      const sPort = source.getPort(sourcePort);
      const tPort = target.getPort(targetPort);
      
      if (!sPort || !tPort || sPort.group !== 'output' || tPort.group !== 'input') {
        isInvalid = true;
      }
    }
    
    // 输入端口连接数检查
    if (!isInvalid && target && targetPort) {
      const key = `${target.id}:${targetPort}`;
      const count = inputPortConnections.get(key) || 0;
      inputPortConnections.set(key, count + 1);
      
      // 如果这是该输入端口的第二个或更多连接，标记为无效
      if (count >= 1) {
        isInvalid = true;
      }
    }
    
    if (isInvalid) {
      invalidEdges.push(edge);
    }
  });
  
  if (invalidEdges.length > 0) {
    graph.removeCells(invalidEdges);
    console.log('清理了', invalidEdges.length, '个无效连接');
    
    // 重新验证剩余连接
    setTimeout(() => {
      validateConnections();
    }, 100);
  } else {
    console.log('没有发现无效连接');
  }
};

onMounted(() => {
  // 注册所有业务图形
  registerAllBusinessShapes();
  
  // 打印可用图形信息
  console.log('可用图形:', getAvailableShapes());
});
</script>

<style scoped>
.demo8-container {
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin: 10px 0;
  background-color: #f9f9f9;
}

.toolbar {
  margin-bottom: 16px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.canvas-container {
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.status-bar {
  margin-top: 12px;
  padding: 8px 12px;
  background: white;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.connect-tip {
  color: #1890ff;
  font-weight: bold;
}

.tips {
  margin-top: 16px;
}

.tips ul {
  margin: 8px 0;
  padding-left: 20px;
}

.tips li {
  margin: 4px 0;
}

/* 端口样式 */
:deep(.x6-port-body) {
  cursor: crosshair;
  transition: all 0.2s;
}

:deep(.x6-port-body:hover) {
  r: 6;
  stroke-width: 2;
}

/* 连接线样式 */
:deep(.x6-edge-selected .x6-edge-line) {
  stroke: #1890ff;
  stroke-width: 3;
}

/* 无效连接样式 */
:deep(.x6-edge-invalid .x6-edge-line) {
  stroke: #f5222d;
  stroke-width: 3;
  stroke-dasharray: 5,5;
}
</style>
