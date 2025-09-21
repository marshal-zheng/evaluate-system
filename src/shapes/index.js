// 业务层图形注册
// 这里定义项目特定的节点和边

import { Graph } from '@antv/x6';
import { Path } from '@antv/x6-geometry';
import { register } from '@antv/x6-vue-shape';

// 导入业务组件
import VueNodeComponent from './VueNodeComponent.vue';

// 防重复注册标记
const getFlags = () => {
  const hasWindow = typeof window !== 'undefined';
  return hasWindow
    ? (window.__BUSINESS_SHAPES_FLAGS__ || (window.__BUSINESS_SHAPES_FLAGS__ = {}))
    : {};
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const normalizeDirection = (direction) => {
  if (!direction) return null;
  const dir = String(direction).toUpperCase();

  if (dir === 'H' || dir === 'V') return dir;
  if (dir === 'L' || dir === 'R') return 'H';
  if (dir === 'T' || dir === 'B') return 'V';

  return null;
};

/**
 * 注册基础业务节点
 * 包括常用的矩形、圆形、菱形节点
 */
export function registerBasicBusinessShapes() {
  const flags = getFlags();
  if (flags.__basic_business_shapes__) return;

  try {
    // 矩形节点
    Graph.registerNode('rect-node', {
      inherit: 'rect',
      width: 120,
      height: 60,
      attrs: {
        body: {
          stroke: '#1890ff',
          strokeWidth: 2,
          fill: '#ffffff',
          rx: 8,
          ry: 8,
        },
        text: {
          fontSize: 12,
          fill: '#262626',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
          fontFamily: 'Arial, sans-serif',
        },
      },
    });

    // 圆形节点
    Graph.registerNode('circle-node', {
      inherit: 'circle',
      width: 80,
      height: 80,
      attrs: {
        body: {
          stroke: '#52c41a',
          strokeWidth: 2,
          fill: '#ffffff',
        },
        text: {
          fontSize: 12,
          fill: '#262626',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
          fontFamily: 'Arial, sans-serif',
        },
      },
      ports: {
        groups: {
          default: {
            position: {
              name: 'ellipse',
              args: { start: 0, step: 90 },
            },
            attrs: {
              circle: {
                r: 6,
                magnet: true,
                stroke: '#8c8c8c',
                strokeWidth: 1,
                fill: '#fff',
              },
            },
          },
        },
        items: [
          { id: 'port1', group: 'default' },
          { id: 'port2', group: 'default' },
          { id: 'port3', group: 'default' },
          { id: 'port4', group: 'default' },
        ],
      },
    });

    // 菱形节点
    Graph.registerNode('diamond-node', {
      inherit: 'polygon',
      width: 100,
      height: 60,
      attrs: {
        body: {
          refPoints: '0,10 10,0 20,10 10,20',
          stroke: '#faad14',
          strokeWidth: 2,
          fill: '#ffffff',
        },
        text: {
          fontSize: 12,
          fill: '#262626',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
          fontFamily: 'Arial, sans-serif',
        },
      },
    });

    // 基础连线
    Graph.registerEdge('basic-edge', {
      inherit: 'edge',
      attrs: {
        line: {
          stroke: '#d9d9d9',
          strokeWidth: 2,
          targetMarker: {
            name: 'classic',
            size: 8,
          },
        },
      },
    });

    console.log('基础业务图形注册成功');
    flags.__basic_business_shapes__ = true;
  } catch (e) {
    console.warn('基础业务图形注册失败:', e);
  }
}

/**
 * 注册端口节点（用于流程图）
 */
export function registerPortNodes() {
  const flags = getFlags();
  if (flags.__port_nodes__) return;

  try {
    Graph.registerNode('port-node', {
      inherit: 'rect',
      width: 140,
      height: 80,
      attrs: {
        body: {
          stroke: '#1890ff',
          strokeWidth: 2,
          fill: '#ffffff',
          rx: 8,
          ry: 8,
        },
        text: {
          fontSize: 12,
          fill: '#262626',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
          fontFamily: 'Arial, sans-serif',
        },
      },
      ports: {
        groups: {
          input: {
            position: 'left',
            attrs: {
              circle: {
                r: 6,
                magnet: true,
                stroke: '#52c41a',
                strokeWidth: 2,
                fill: '#fff',
              },
            },
          },
          output: {
            position: 'right',
            attrs: {
              circle: {
                r: 6,
                magnet: true,
                stroke: '#1890ff',
                strokeWidth: 2,
                fill: '#fff',
              },
            },
          },
        },
        items: [
          { 
            id: 'input', 
            group: 'input',
            args: { 
              type: 'input',
              defaultStroke: '#52c41a',
              defaultStrokeWidth: 2 
            }
          },
          { 
            id: 'output', 
            group: 'output',
            args: { 
              type: 'output',
              defaultStroke: '#1890ff',
              defaultStrokeWidth: 2 
            }
          },
        ],
      },
    });

    console.log('端口节点注册成功');
    flags.__port_nodes__ = true;
  } catch (e) {
    console.warn('端口节点注册失败:', e);
  }
}

/**
 * 注册 Vue 组件节点
 */
export function registerVueNodes() {
  const flags = getFlags();
  if (flags.__vue_nodes__) return;

  try {
    // 先注册基础节点结构
    Graph.registerNode('vue-node', {
      inherit: 'rect',
      width: 200,
      height: 120,
      // 强制设置边界框
      getBBox() {
        const position = this.position();
        return {
          x: position.x,
          y: position.y,
          width: 200,
          height: 120,
        };
      },
      attrs: {
        body: {
          width: 200,
          height: 120,
          fill: 'transparent',
          stroke: 'none',
        },
        fo: {
          width: 200,
          height: 120,
          x: 0,
          y: 0,
        },
      },
      markup: [
        {
          tagName: 'rect',
          selector: 'body',
        },
        {
          tagName: 'foreignObject',
          selector: 'fo',
        },
      ],
    });

    // 使用 @antv/x6-vue-shape 覆盖注册 Vue 组件
    register({
      shape: 'vue-node',
      component: VueNodeComponent,
      effect: ['data'],
    });
    
    console.log('Vue 组件节点注册成功');
    flags.__vue_nodes__ = true;
  } catch (e) {
    console.warn('Vue 组件节点注册失败，使用降级方案:', e);
    
    // 降级为带 Vue 标识的普通节点
    try {
      Graph.registerNode('vue-node', {
        inherit: 'rect',
        width: 200,
        height: 120,
        attrs: {
          body: {
            stroke: '#722ed1',
            strokeWidth: 2,
            fill: '#f9f0ff',
            rx: 12,
            ry: 12,
          },
          text: {
            fontSize: 12,
            fill: '#722ed1',
            textAnchor: 'middle',
            textVerticalAnchor: 'middle',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold',
          },
        },
        markup: [
          {
            tagName: 'rect',
            selector: 'body',
          },
          {
            tagName: 'text',
            selector: 'text',
          },
          {
            tagName: 'rect',
            selector: 'vue-badge',
            attrs: {
              width: 30,
              height: 16,
              x: -15,
              y: -8,
              fill: '#42b883',
              rx: 8,
              ry: 8,
            },
          },
          {
            tagName: 'text',
            selector: 'vue-text',
            attrs: {
              text: 'Vue',
              fontSize: 8,
              fill: 'white',
              fontWeight: 'bold',
              textAnchor: 'middle',
              textVerticalAnchor: 'middle',
              x: 0,
              y: 0,
            },
          },
        ],
      });
      console.log('Vue 节点降级为普通节点');
      flags.__vue_nodes__ = true;
    } catch (e2) {
      console.warn('vue-node already registered');
    }
  }
}

/**
 * 注册业务自定义连接器
 * 为 Demo13 等功能提供曲线连接器支持
 */
export function registerBusinessConnectors() {
  const flags = getFlags();
  if (flags.__business_connectors__) return;

  Graph.registerConnector(
    'curve',
    (sourcePoint, targetPoint, routePoints, options = {}) => {
      const path = new Path();
      const normalizedDirection = normalizeDirection(options.direction);
      const curvature = clamp(options.curvature ?? options.tension ?? 0.5, 0, 1);
      const points =
        routePoints && routePoints.length
          ? [sourcePoint, ...routePoints, targetPoint]
          : [sourcePoint, targetPoint];

      path.appendSegment(Path.createSegment('M', points[0]));

      for (let i = 0; i < points.length - 1; i += 1) {
        const start = points[i];
        const end = points[i + 1];

        if (start.x === end.x && start.y === end.y) {
          continue;
        }

        let segmentDirection = normalizedDirection;
        const deltaX = end.x - start.x;
        const deltaY = end.y - start.y;

        if (!segmentDirection) {
          const absX = Math.abs(deltaX);
          const absY = Math.abs(deltaY);
          segmentDirection = absX >= absY ? 'H' : 'V';
        } else if (segmentDirection === 'H' && Math.abs(deltaX) < 1) {
          segmentDirection = 'V';
        } else if (segmentDirection === 'V' && Math.abs(deltaY) < 1) {
          segmentDirection = 'H';
        }

        if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) {
          path.appendSegment(Path.createSegment('L', end.x, end.y));
          continue;
        }

        if (curvature === 0) {
          path.appendSegment(Path.createSegment('L', end.x, end.y));
          continue;
        }

        if (segmentDirection === 'H') {
          const offset = deltaX * curvature;
          path.appendSegment(
            Path.createSegment(
              'C',
              start.x + offset,
              start.y,
              end.x - offset,
              end.y,
              end.x,
              end.y,
            ),
          );
        } else {
          const offset = deltaY * curvature;
          path.appendSegment(
            Path.createSegment(
              'C',
              start.x,
              start.y + offset,
              end.x,
              end.y - offset,
              end.x,
              end.y,
            ),
          );
        }
      }

      return options.raw ? path : path.serialize();
    },
    true,
  );

  flags.__business_connectors__ = true;
}

/**
 * 注册所有业务图形
 * 这是对外的主要接口
 */
export function registerAllBusinessShapes() {
  registerBasicBusinessShapes();
  registerPortNodes();
  registerVueNodes();
  registerBusinessConnectors();
}

// 向旧版 API 保持兼容
export const registerBasicShapes = registerBasicBusinessShapes;
export const registerVueShapes = registerVueNodes;

/**
 * 获取可用的图形列表
 * 用于工具栏或节点库展示
 */
export function getAvailableShapes() {
  return {
    basic: [
      { shape: 'rect-node', name: '矩形', icon: '□' },
      { shape: 'circle-node', name: '圆形', icon: '○' },
      { shape: 'diamond-node', name: '菱形', icon: '◇' },
    ],
    flow: [
      { shape: 'port-node', name: '端口节点', icon: '⚡' },
    ],
    advanced: [
      { shape: 'vue-node', name: 'Vue 组件', icon: 'V' },
    ],
  };
}
