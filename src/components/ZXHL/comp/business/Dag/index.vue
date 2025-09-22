<template>
  <XFlow>
    <div class="zx-dag-page">
      <div class="dag-container">
        <div class="dag-left">
          <div class="dag-left__header">算子组件库</div>
          <DagDnd 
            :operators="operators"
            :loading="operatorsLoading"
            :title="dndConfig.title"
            :search-placeholder="dndConfig.searchPlaceholder"
            :layout="currentLayout"
            :text-config="dndConfig.textConfig"
          />
        </div>
        <div class="dag-center">
          <div class="dag-toolbar">
            <DagToolbar @layout-change="onToolbarLayoutChange" />
          </div>
          <div class="dag-graph">
            <XFlowGraph
              pannable
              :connection-options="connectionOptions"
              :connection-edge-options="connectionEdgeOptions"
              :select-options="{ showEdgeSelectionBox: true }"
              :enable-context-menu="true"
              :custom-menu-items="wrappedCustomMenuItems"
              :fit-view="false"
              :zoom-options="zoomOptions"
            >
              <XFlowState :edge-animation-duration="30" />
              <XFlowClipboard />
              <XFlowHistory />
              <DagInitData />
              <DagConnect />
              <XFlowBackground color="#fafafa" />
              <XFlowGrid :size="20" type="dot" />
              <!-- 小地图 -->
              <XFlowMinimap 
                :width="200" 
                :height="150" 
                :simple="true"
                :style="{ right: '24px', top: '24px' }"
                class="dag-minimap"
              />
              <div class="dag-graph__control">
                <DagGraphControl />
              </div>
            </XFlowGraph>
          </div>
        </div>
      </div>
      <DagConfigDrawer />
    </div>
  </XFlow>
</template>

<script>
import { defineComponent, toRefs, ref, onMounted, computed } from 'vue';
import { willCreateCycle } from './utils/graphConstraints.js';
import { XFlow, XFlowGraph, XFlowClipboard, XFlowState, XFlowHistory, XFlowGrid, XFlowBackground, XFlowMinimap, XFlowContextMenu } from '../ZxFlow/components';
import DagConfigDrawer from './components/DagConfigDrawer.vue';
import DagConnect from './components/DagConnect.vue';
import DagDnd from './components/DagDnd.vue';
import DagGraphControl from './components/DagGraphControl.vue';
import DagInitData from './components/DagInitData.vue';
import DagToolbar from './components/DagToolbar.vue';
import { DAG_CONNECTOR, DAG_EDGE } from './shapes/registerDagShapes';

const connectionEdgeOptions = {
  shape: DAG_EDGE,
  animated: true,
  zIndex: -1,
  attrs: {
    line: {
      stroke: '#C2C8D5',
      strokeWidth: 1,
      targetMarker: null,
    },
  },
  router: 'manhattan',
  connector: 'rounded',
};

const DAGPage = defineComponent({
  name: 'DAGPage',
  props: {
    /**
     * 算子数据列表
     * @type {Array<{key: string, title: string, shortDesc?: string, category?: string, ports?: Array}>}
     */
    operators: {
      type: Array,
      default: () => []
    },
    /**
     * 算子数据加载状态
     */
    operatorsLoading: {
      type: Boolean,
      default: false
    },
    /**
     * DnD 组件配置
     */
    dndConfig: {
      type: Object,
      default: () => ({
        title: '算子库',
        searchPlaceholder: '搜索算子、组件...'
      })
    },
    /**
     * 布局方向
     */
    layout: {
      type: String,
      default: 'horizontal'
    },
    /**
     * 自定义右键菜单项
     */
    customMenuItems: {
      type: Object,
      default: () => ({})
    }
  },
  components: {
    XFlow,
    XFlowGraph,
    XFlowClipboard,
    XFlowState,
    XFlowHistory,
    XFlowGrid,
    XFlowBackground,
    XFlowMinimap,
    XFlowContextMenu,
    DagConfigDrawer,
    DagConnect,
    DagDnd,
    DagGraphControl,
    DagInitData,
    DagToolbar,
  },
  emits: ['edit-node', 'delete-node', 'copy-node', 'add-node'],
  setup(props, { emit }) {
    const currentLayout = ref(props.layout === 'vertical' ? 'vertical' : 'horizontal');

    

    // 缩放配置 - 调慢缩放步进
    const zoomOptions = {
      factor: 1.05, // 默认是 1.2，改为 1.05 让缩放更平缓
      minScale: 0.1, // 最小缩放比例
      maxScale: 3,   // 最大缩放比例
    };

    const connectionOptions = {
      snap: true,
      allowBlank: false,
      allowLoop: false,
      highlight: true,
      connectionPoint: 'anchor',
      anchor: 'center',
      connector: DAG_CONNECTOR,
      validateMagnet({ magnet }) {
        return magnet.getAttribute('port-group') !== 'top';
      },
      validateConnection({ sourceCell, targetCell, sourceMagnet, targetMagnet, sourceView }) {
        if (!sourceMagnet || !targetMagnet) return false;
        // 从 sourceView 获取 graph 实例
        const g = sourceView?.graph;
        if (!g) return true;
        const sourceId = sourceCell?.id;
        const targetId = targetCell?.id;
        if (!sourceId || !targetId) return false;
        // 预防成环
        if (willCreateCycle(g, sourceId, targetId)) return false;
        return true;
      },
    };

    // 保持对 props 的响应式引用，避免值拷贝导致后续更新丢失
    const { operators, operatorsLoading, dndConfig, layout, customMenuItems } = toRefs(props);

    // 包装自定义菜单项，添加事件发射功能
    const wrappedCustomMenuItems = computed(() => {
      const wrapped = {};
      const items = customMenuItems.value || {};
      
      Object.keys(items).forEach(type => {
        wrapped[type] = items[type].map(item => ({
          ...item,
          action: (target) => {
            // 执行原始action
            if (typeof item.action === 'function') {
              item.action(target);
            }
            
            // 根据ID发射对应的事件
            if (item.id === 'edit-indicator') {
              emit('edit-node', target);
            } else if (item.id === 'delete-indicator') {
              emit('delete-node', target);
            } else if (item.id === 'copy-indicator') {
              emit('copy-node', target);
            } else if (item.id === 'add-indicator') {
              emit('add-node', target);
            }
          }
        }));
      });
      return wrapped;
    });

    const onToolbarLayoutChange = (dir) => {
      currentLayout.value = dir === 'LR' ? 'horizontal' : 'vertical';
    };


    return { 
      connectionOptions, 
      connectionEdgeOptions,
      zoomOptions,
      // 传递给子组件的数据（保持响应式）
      operators,
      operatorsLoading,
      dndConfig,
      layout,
      currentLayout,
      onToolbarLayoutChange,
      // 新增的处理器相关
      customMenuItems,
      wrappedCustomMenuItems,
    };
  },
});

export default DAGPage;
export { DAGPage };
</script>

<style lang="scss">
.zx-dag-page foreignObject > body {
  margin: 0;
  display: block;
  place-items: initial;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  min-height: 100%;
}
.zx-dag-page {
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;

  .dag-container {
    display: flex;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    box-sizing: border-box;
  }

  .dag-left {
    display: flex;
    flex-direction: column;
    width: 240px;
    height: 100%;
    background: linear-gradient(180deg, #fafbfc 0%, #f6f8fa 100%);

    &__header {
      display: none; // 隐藏原有的头部，因为DagDnd组件现在有自己的头部
    }
  }

  .dag-center {
    position: relative;
    flex: 1;
    height: 100%;
    outline: none;
    background: #fff;

    .dag-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 42px;
      padding: 0 16px;
      background-color: #f6f8fa;
      border-bottom: 1px solid #eaebed;
    }

    .dag-graph {
      position: relative;
      width: 100%;
      height: calc(100% - 42px);

      &__control {
        position: absolute;
        right: 24px;
        bottom: 24px;
        z-index: 10;
      }
    }
  }
}
</style>

<style lang="scss">
.zx-dag-page .xflow-graph {
  width: 100%;
  height: 100%;
}

/* 修复 x6-vue-shape 容器尺寸问题：
   注意：.x6-node-body 是 SVG foreignObject，设置百分比会相对整个 SVG 视口，
   会导致节点被撑满画布。这里只保留内部容器 100%，不修改 .x6-node-body 尺寸。 */
.zx-dag-page .x6-node[data-shape='dag-node'] {
  .vue-shape-view {
    width: 100% !important;
    height: 100% !important;
    box-sizing: border-box !important;
  }
}

.x6-node-selected .zx-dag-node {
  border-color: #1890ff;
  border-radius: 2px;
  box-shadow: 0 0 0 4px #d4e8fe;
}

.x6-node-selected .zx-dag-node.success {
  border-color: #52c41a;
  box-shadow: 0 0 0 4px #ccecc0;
}

.x6-node-selected .zx-dag-node.failed {
  border-color: #ff4d4f;
  box-shadow: 0 0 0 4px #fedcdc;
}

.x6-edge:hover path:nth-child(2) {
  stroke: #1890ff;
  stroke-width: 1px;
}

.x6-edge-selected path:nth-child(2) {
  stroke: #1890ff;
  stroke-width: 1.5px !important;
}

/* 锁定节点的视觉样式 */
.zx-dag-page .x6-node[data-locked="true"] .zx-dag-node {
  opacity: 0.5;
  cursor: not-allowed;
}

.zx-dag-page .x6-node[data-locked="true"] .zx-dag-node::after {
  content: '🔒';
  position: absolute;
  top: -8px;
  right: -8px;
  font-size: 12px;
  background: #ff4d4f;
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

/* 小地图样式 */
.dag-minimap {
  border: 1px solid #e0e0e0 !important;
  border-radius: 6px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(4px) !important;
}

.dag-minimap:hover {
  border-color: #1890ff !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

/* 端口连接点控制 */
.zx-dag-page .x6-port-body {
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
}

/* hover 节点时显示所有端口 */
.zx-dag-page .x6-node:hover .x6-port-body {
  opacity: 1;
}

/* 连接模式时显示所有端口 */
.zx-dag-page.connecting .x6-port-body {
  opacity: 1;
}

/* 可连接的端口高亮 */
.zx-dag-page .x6-port-body.available {
  opacity: 1;
  fill: #1890ff !important;
  stroke: #1890ff !important;
}

/* 已连接的端口高亮 */
.zx-dag-page .x6-port-body.adsorbed {
  opacity: 1;
  fill: #52c41a !important;
  stroke: #52c41a !important;
}
</style>
