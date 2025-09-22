import { Graph, Path } from '@antv/x6';
import { register } from '@antv/x6-vue-shape';
import DagNode from './DagNode.vue';

export const DAG_NODE = 'dag-node';
export const DAG_EDGE = 'dag-edge';
export const DAG_CONNECTOR = 'dag-connector';

let registered = false;

export const registerDagShapes = () => {
  if (registered) {
    return;
  }

  register({
    shape: DAG_NODE,
    width: 180,
    height: 36,
    component: DagNode,
    effect: ['data'],
    attrs: {
      body: {
        width: 180,
        height: 36,
      },
    },
    ports: {
      groups: {
        top: {
          position: {
            name: 'top',
            args: {
              x: '50%',
              y: 0,
            },
          },
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#C2C8D5',
              strokeWidth: 1,
              fill: '#fff',
              opacity: 0, // 默认隐藏
            },
          },
        },
        bottom: {
          position: {
            name: 'bottom',
            args: {
              x: '50%',
              y: 0,
            },
          },
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#C2C8D5',
              strokeWidth: 1,
              fill: '#fff',
              opacity: 0, // 默认隐藏
            },
          },
        },
        left: {
          position: {
            name: 'left',
            args: {
              x: 0,
              y: '50%',
            },
          },
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#C2C8D5',
              strokeWidth: 1,
              fill: '#fff',
              opacity: 0, // 默认隐藏
            },
          },
        },
        right: {
          position: {
            name: 'right',
            args: {
              x: 0,
              y: '50%',
            },
          },
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#C2C8D5',
              strokeWidth: 1,
              fill: '#fff',
              opacity: 0, // 默认隐藏
            },
          },
        },
      },
    },
  });

  Graph.registerConnector(
    DAG_CONNECTOR,
    (s, e) => {
      const offset = 4;
      const deltaY = Math.abs(e.y - s.y);
      const control = Math.floor((deltaY / 3) * 2);
      const v1 = { x: s.x, y: s.y + offset + control };
      const v2 = { x: e.x, y: e.y - offset - control };

      return Path.normalize(
        `M ${s.x} ${s.y}
         L ${s.x} ${s.y + offset}
         C ${v1.x} ${v1.y} ${v2.x} ${v2.y} ${e.x} ${e.y - offset}
         L ${e.x} ${e.y}`,
      );
    },
    true,
  );

  Graph.registerEdge(
    DAG_EDGE,
    {
      inherit: 'edge',
      attrs: {
        line: {
          stroke: '#C2C8D5',
          strokeWidth: 1,
          targetMarker: null,
        },
      },
      // 默认走直角路由与圆角连接器，兼容四向布局
      router: 'manhattan',
      connector: 'rounded',
      zIndex: -1,
    },
    true,
  );

  registered = true;
};
