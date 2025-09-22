<template>
  <XFlow>
    <div class="zx-dag-page" :class="{ 'readonly': readonly }">
      <div class="dag-container">
        <div v-if="showSidebar" class="dag-left">
          <div class="dag-left__header">算子组件库</div>
          <DagDnd 
            :operators="operators"
            :loading="finalOperatorsLoading"
            :title="dndConfig.title"
            :search-placeholder="dndConfig.searchPlaceholder"
            :layout="currentLayout"
            :text-config="dndConfig.textConfig"
            :readonly="readonly"
          />
        </div>
        <div class="dag-center">
          <div v-if="showToolbar" class="dag-toolbar">
            <DagToolbar 
              @layout-change="onToolbarLayoutChange" 
              @save="onSave" 
              :readonly="readonly"
            />
          </div>
          <div class="dag-graph" :class="{ 'no-toolbar': !showToolbar }">
            <!-- 加载状态遮罩 -->
            <div 
              v-loading="graphLoading"
              element-loading-text="正在加载指标体系数据..."
              element-loading-background="rgba(255, 255, 255, 0.8)"
              class="dag-graph__loading"
              :class="{ 'is-loading': graphLoading }"
            ></div>
            
            <XFlowGraph
              :pannable="!readonly"
              :connection-options="readonly ? null : connectionOptions"
              :connection-edge-options="readonly ? null : connectionEdgeOptions"
              :select-options="readonly ? { enabled: false } : { showEdgeSelectionBox: true }"
              :enable-context-menu="!readonly"
              :custom-menu-handler="readonly ? null : customMenuHandler"
              :fit-view="false"
              :zoom-options="zoomOptions"
              @ready="onGraphReady"
            >
              <XFlowState :edge-animation-duration="30" />
              <XFlowClipboard />
              <XFlowHistory />
              <XFlowSnapline 
                :enabled="snaplineEnabled"
                :tolerance="snaplineTolerance"
                :sharp="snaplineSharp"
              />
              <DagInitData 
                :initial-data="initialGraphData"
                :auto-layout="autoLayout"
                :layout-direction="currentLayout === 'horizontal' ? 'LR' : 'TB'"
                @data-updated="onGraphDataUpdated"
              />
              <DagConnect />
              <XFlowBackground color="#fafafa" />
              <XFlowGrid 
                :size="14" 
                type="mesh" 
                :dot-size="2"
                color="#e6e6e6"
              />
              <!-- 小地图 -->
              <XFlowMinimap 
                :key="minimapKey"
                :width="200" 
                :height="150" 
                :simple="true"
                :padding="24"
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
    </div>
  </XFlow>
</template>

<script>
import { defineComponent, toRefs, ref, onMounted, watch, computed } from 'vue';
import { willCreateCycle } from './utils/graphConstraints.js';
import { XFlow, XFlowGraph, XFlowClipboard, XFlowState, XFlowHistory, XFlowGrid, XFlowBackground, XFlowMinimap, XFlowContextMenu, XFlowSnapline } from '../ZxFlow/components';
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
  router: 'normal', // 使用直线路由，配合贝塞尔连接器
  connector: 'smooth', // 贝塞尔曲线连接器
};

const DAGPage = defineComponent({
  name: 'DAGPage',
  props: {
    /**
     * 算子数据列表，支持静态数据、Promise或函数
     * @type {Array<{key: string, title: string, shortDesc?: string, category?: string, ports?: Array}> | Promise | Function}
     */
    operators: {
      type: [Array, Promise, Function],
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
     * 自定义菜单处理器
     */
    customMenuHandler: {
      type: Function,
      default: null
    },
    /**
     * 对齐线配置
     */
    snaplineConfig: {
      type: Object,
      default: () => ({
        enabled: true,
        tolerance: 15, // 增加容差，更容易触发对齐
        sharp: false
      })
    },
    /**
     * 初始图数据，支持静态数据、Promise或函数
     */
    initialGraphData: {
      type: [Object, Promise, Function],
      default: null
    },
    /**
     * 图数据加载状态
     */
    graphLoading: {
      type: Boolean,
      default: false
    },
    /**
     * 是否自动布局
     */
    autoLayout: {
      type: Boolean,
      default: true
    },
    /**
     * 是否显示左侧指标库
     */
    showSidebar: {
      type: Boolean,
      default: true
    },
    /**
     * 是否为只读模式
     */
    readonly: {
      type: Boolean,
      default: false
    },
    /**
     * 是否显示工具栏
     */
    showToolbar: {
      type: Boolean,
      default: true
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
    XFlowSnapline,
    DagConnect,
    DagDnd,
    DagGraphControl,
    DagInitData,
    DagToolbar,
  },
  emits: ['edit-node', 'delete-node', 'copy-node', 'add-node', 'save', 'ready'],
  setup(props, { emit, expose }) {
    const currentLayout = ref(props.layout === 'vertical' ? 'vertical' : 'horizontal');
    const minimapKey = ref(0);
    const graphInstance = ref(null);

    // 对齐线配置
    const snaplineEnabled = ref(props.snaplineConfig.enabled);
    const snaplineTolerance = ref(props.snaplineConfig.tolerance);
    const snaplineSharp = ref(props.snaplineConfig.sharp);

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
    const { 
      operators: operatorsProp, 
      operatorsLoading, 
      dndConfig, 
      layout, 
      customMenuHandler,
      initialGraphData,
      graphLoading,
      autoLayout,
      showSidebar,
      readonly,
      showToolbar
    } = toRefs(props);

    // 处理 operators 数据，支持 Promise 和静态数据
    const operators = ref([]);
    const internalOperatorsLoading = ref(false);

    // 加载 operators 数据的函数
    const loadOperatorsData = async (dataSource) => {
      try {
        let data;
        
        // 如果是函数，调用函数获取数据
        if (typeof dataSource === 'function') {
          data = await dataSource();
        }
        // 如果是Promise，等待解析
        else if (dataSource && typeof dataSource.then === 'function') {
          data = await dataSource;
        } else if (Array.isArray(dataSource)) {
          data = dataSource;
        } else {
          data = [];
        }
        
        operators.value = data || [];
        
      } catch (error) {
        console.error('加载算子数据失败:', error);
        operators.value = [];
      } finally {
        internalOperatorsLoading.value = false;
      }
    };

    // 监听 operators prop 变化
    watch(operatorsProp, (newOperators) => {
      if (newOperators) {
        internalOperatorsLoading.value = true;
        loadOperatorsData(newOperators);
      }
    }, { immediate: true });

    // 合并加载状态 - 外部传入的 loading 状态 或 内部处理 Promise 的 loading 状态
    const finalOperatorsLoading = computed(() => {
      return operatorsLoading.value || internalOperatorsLoading.value;
    });

    const onToolbarLayoutChange = (dir) => {
      currentLayout.value = dir === 'LR' ? 'horizontal' : 'vertical';
      // 布局切换后强制重建小地图，避免插件偶发不同步/空白
      minimapKey.value += 1;
    };

    // 数据加载/布局完成后，强制重建小地图
    const onGraphDataUpdated = () => {
      minimapKey.value += 1;
    };

    // 保存数据处理
    const onSave = (graphData) => {
      emit('save', graphData);
    };

    // 暴露方法供外部调用
    const getSaveData = () => {
      // 这里直接调用 DagToolbar 的保存逻辑
      const g = graphInstance.value;
      if (!g) {
        console.warn('图实例不存在');
        return null;
      }

      try {
        // 清理节点数据，移除 originalData
        const cleanNodeData = (nodeData) => {
          if (!nodeData) return nodeData;
          const cleaned = { ...nodeData };
          if (cleaned.originalData) {
            delete cleaned.originalData;
          }
          return cleaned;
        };

        // 获取所有节点数据，格式与data.json保持一致
        const nodes = g.getNodes().map(node => {
          const position = node.getPosition();
          const nodeData = cleanNodeData(node.getData()) || {};
          
          return {
            id: node.id,
            type: nodeData.type || 'leaf-node', // 从节点数据中获取type
            x: position.x,
            y: position.y,
            properties: nodeData.properties || {}
          };
        });

        // 获取所有边数据，格式与data.json保持一致
        const edges = g.getEdges().map(edge => {
          const sourceNode = edge.getSourceNode();
          const targetNode = edge.getTargetNode();
          const sourcePoint = edge.getSourcePoint();
          const targetPoint = edge.getTargetPoint();
          const edgeData = edge.getData() || {};
          
          return {
            id: edge.id,
            type: "mindmap-edge", // 固定为mindmap-edge
            sourceNodeId: edge.getSourceCellId(),
            targetNodeId: edge.getTargetCellId(),
            startPoint: { x: sourcePoint.x, y: sourcePoint.y },
            endPoint: { x: targetPoint.x, y: targetPoint.y },
            properties: edgeData.properties || {},
            pointsList: edge.getVertices() || []
          };
        });

        // 构建完整的图数据，格式与data.json保持一致
        const graphData = {
          nodes,
          edges
        };

        console.log('格式化后的图数据:', graphData);
        return graphData;
      } catch (error) {
        console.error('获取图数据时出错:', error);
        return null;
      }
    };

    expose({ getSaveData });

    // 处理XFlowGraph的ready事件，确保standardInteractions正确初始化
    const onGraphReady = (graph, keyboardMgr, standardInteractions) => {
      // 保存图实例引用
      graphInstance.value = graph;
      
      // 检查对齐线插件是否正确加载
      setTimeout(() => {
        const snaplinePlugin = graph.getPlugin('snapline');
        if (snaplinePlugin) {
          console.log('✅ Snapline plugin loaded successfully:', snaplinePlugin);
          console.log('Snapline config:', {
            enabled: snaplineEnabled.value,
            tolerance: snaplineTolerance.value,
            sharp: snaplineSharp.value
          });
        } else {
          console.warn('❌ Snapline plugin not found');
        }
      }, 1000);
      
      // 这里可以添加额外的图形初始化逻辑
      // standardInteractions已经在XFlowGraph中正确设置了selectionHandler
      console.log('DAG Graph ready:', { graph, keyboardMgr, standardInteractions });
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
      minimapKey,
      onToolbarLayoutChange,
      onGraphDataUpdated,
      onGraphReady,
      onSave,
      // 新增的处理器相关
      customMenuHandler,
      // 对齐线相关
      snaplineEnabled,
      snaplineTolerance,
      snaplineSharp,
      // 图数据相关
      initialGraphData,
      graphLoading,
      autoLayout,
      // 新增的显示控制属性
      showSidebar,
      readonly,
      showToolbar,
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
      
      &.no-toolbar {
        height: 100%;
      }

      &__loading {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 100;
        
        &.is-loading {
          pointer-events: all;
        }
        
        &:not(.is-loading) {
          pointer-events: none;
          display: none;
        }
      }

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

/* 小地图视窗边框增强：确保初始就能看清 */
:deep(.xflow-minimap) {
  .x6-widget-minimap-viewport {
    stroke: #1890ff !important;
    stroke-width: 2px !important;
    fill: rgba(24, 144, 255, 0.08) !important;
    shape-rendering: crispEdges;
  }
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

/* 对齐线样式 - 增强可见性 */
:deep(.x6-widget-snapline) {
  opacity: 0.9 !important;
  pointer-events: none;
  z-index: 9999;
}

:deep(.x6-widget-snapline-horizontal) {
  stroke: #ff4d4f !important;
  stroke-width: 2 !important;
  stroke-dasharray: 8,4 !important;
  opacity: 0.9 !important;
}

:deep(.x6-widget-snapline-vertical) {
  stroke: #ff4d4f !important;
  stroke-width: 2 !important;
  stroke-dasharray: 8,4 !important;
  opacity: 0.9 !important;
}

/* 对齐线动画效果 */
:deep(.x6-widget-snapline-horizontal),
:deep(.x6-widget-snapline-vertical) {
  animation: snapline-pulse 1s ease-in-out infinite alternate;
}

@keyframes snapline-pulse {
  from {
    opacity: 0.7;
  }
  to {
    opacity: 1;
  }
}

/* 只读模式样式 */
.zx-dag-page.readonly {
  .dag-left {
    opacity: 0.8;
    pointer-events: none;
  }
  
  .dag-toolbar {
    opacity: 0.8;
  }
  
  .x6-node {
    cursor: default !important;
  }
  
  .x6-port-body {
    display: none !important;
  }
  
  &::after {
    content: '只读模式';
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(255, 77, 79, 0.9);
    color: white;
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 1000;
    backdrop-filter: blur(4px);
  }
}
</style>
