import { register } from '@antv/x6-vue-shape';
import { Graph } from '@antv/x6';

// 注册基础矩形节点
export function registerBasicShapes() {
  // 全局防重复标记（HMR/多次调用都能避免重复注册）
  const hasWindow = typeof window !== 'undefined';
  const flags = hasWindow
    ? (window.__X6_REGISTERED_FLAGS__ || (window.__X6_REGISTERED_FLAGS__ = {}))
    : {};
  if (flags.__basic_shapes__) return;

  // 基础矩形节点
  try {
    Graph.registerNode('rect-node', {
    inherit: 'rect',
    width: 100,
    height: 60,
    attrs: {
      body: {
        stroke: '#1890ff',
        strokeWidth: 2,
        fill: '#ffffff',
        rx: 6,
        ry: 6,
      },
      text: {
        fontSize: 14,
        fill: '#262626',
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
        fontFamily: 'Arial, sans-serif',
      },
    },
    ports: {
      groups: {
        top: {
          position: 'top',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#1890ff',
              strokeWidth: 2,
              fill: '#fff',
              style: {
                visibility: 'hidden',
              },
            },
          },
        },
        right: {
          position: 'right',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#1890ff',
              strokeWidth: 2,
              fill: '#fff',
              style: {
                visibility: 'hidden',
              },
            },
          },
        },
        bottom: {
          position: 'bottom',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#1890ff',
              strokeWidth: 2,
              fill: '#fff',
              style: {
                visibility: 'hidden',
              },
            },
          },
        },
        left: {
          position: 'left',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#1890ff',
              strokeWidth: 2,
              fill: '#fff',
              style: {
                visibility: 'hidden',
              },
            },
          },
        },
      },
      items: [
        { group: 'top' },
        { group: 'right' },
        { group: 'bottom' },
        { group: 'left' },
      ],
    },
    });
  } catch (e) {}

  // 圆形节点
  try {
    Graph.registerNode('circle-node', {
    inherit: 'circle',
    width: 60,
    height: 60,
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
            args: {
              start: 0,
              step: 90,
            },
          },
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#52c41a',
              strokeWidth: 2,
              fill: '#fff',
              style: {
                visibility: 'hidden',
              },
            },
          },
        },
      },
      items: [
        { group: 'default' },
        { group: 'default' },
        { group: 'default' },
        { group: 'default' },
      ],
    },
    });
  } catch (e) {}

  // 菱形节点
  try {
    Graph.registerNode('diamond-node', {
    inherit: 'polygon',
    width: 80,
    height: 60,
    attrs: {
      body: {
        stroke: '#faad14',
        strokeWidth: 2,
        fill: '#ffffff',
        refPoints: '0,10 10,0 20,10 10,20',
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
  } catch (e) {}

  // 基础边
  try {
    Graph.registerEdge('basic-edge', {
    inherit: 'edge',
    attrs: {
      line: {
        stroke: '#8c8c8c',
        strokeWidth: 2,
        targetMarker: {
          name: 'block',
          width: 8,
          height: 6,
        },
      },
    },
    router: {
      name: 'manhattan',
    },
    connector: {
      name: 'rounded',
    },
    });
  } catch (e) {}

  // 标记为已注册
  flags.__basic_shapes__ = true;
}

// 注册 Vue 组件节点（示例）
export function registerVueShapes() {
  // 这里可以注册使用 Vue 组件的节点
  // register({
  //   shape: 'vue-node',
  //   component: VueNodeComponent,
  // });
}
