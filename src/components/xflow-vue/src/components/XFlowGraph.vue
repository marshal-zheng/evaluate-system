<template>
  <div 
    class="xflow-graph" 
    :class="className" 
    :style="style"
  >
    <div ref="containerRef" class="xflow-graph-container" />
    <div class="xflow-graph-wrapper">
      <slot />
    </div>
    
    <!-- 右键菜单 -->
    <XFlowContextMenu
      v-if="standardInteractions && standardInteractions.contextMenu"
      :context-menu="standardInteractions.contextMenu"
      @menu-click="handleContextMenuClick"
    />
    
    <!-- Debug: 显示菜单状态 -->
    <div v-if="true" style="position: fixed; top: 10px; right: 10px; background: white; padding: 10px; z-index: 10000; border: 1px solid red;">
      Debug: {{ standardInteractions?.contextMenu?.visible ? 'Menu Visible' : 'Menu Hidden' }}<br>
      HasContextMenu: {{ !!standardInteractions?.contextMenu }}<br>
      MenuItems: {{ standardInteractions?.contextMenu?.items?.length || 0 }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { Graph, Options, Shape } from '@antv/x6';
import { Keyboard } from '@antv/x6-plugin-keyboard';
import { Scroller } from '@antv/x6-plugin-scroller';
import { Selection } from '@antv/x6-plugin-selection';
import { useGraphInstance } from '../composables/useGraphInstance';
import { useKeyboardManager } from '../composables/useKeyboardManager';
import { useStandardInteractions } from '../composables/useStandardInteractions';
import XFlowContextMenu from './XFlowContextMenu.vue';

// Props 定义
const props = defineProps({
  className: {
    type: String,
    default: '',
  },
  style: {
    type: Object,
    default: () => ({}),
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  virtual: {
    type: Boolean,
    default: false,
  },
  minScale: {
    type: Number,
    default: 0.05,
  },
  maxScale: {
    type: Number,
    default: 12,
  },
  zoomable: {
    type: Boolean,
    default: true,
  },
  zoomOptions: {
    type: Object,
    default: () => ({}),
  },
  pannable: {
    type: Boolean,
    default: true,
  },
  panOptions: {
    type: Object,
    default: () => ({}),
  },
  embedable: {
    type: Boolean,
    default: false,
  },
  embedOptions: {
    type: Object,
    default: () => ({}),
  },
  restrict: {
    type: Boolean,
    default: false,
  },
  restrictOptions: {
    type: Object,
    default: () => ({}),
  },
  connectionOptions: {
    type: Object,
    default: () => ({}),
  },
  onPortRendered: {
    type: Function,
    default: null,
  },
  onEdgeLabelRendered: {
    type: Function,
    default: null,
  },
  createCellView: {
    type: Function,
    default: null,
  },
  selectOptions: {
    type: Object,
    default: () => ({}),
  },
  keyboardOptions: {
    type: Object,
    default: () => ({}),
  },
  scroller: {
    type: Boolean,
    default: false,
  },
  scrollerOptions: {
    type: Object,
    default: () => ({}),
  },
  connectionEdgeOptions: {
    type: Object,
    default: () => ({}),
  },
  defaultHighlightOptions: {
    type: Object,
    default: () => ({}),
  },
  embedHighlightOptions: {
    type: Object,
    default: () => ({}),
  },
  nodeAvailableHighlightOptions: {
    type: Object,
    default: () => ({}),
  },
  magnetAvailableHighlightOptions: {
    type: Object,
    default: () => ({}),
  },
  magnetAdsorbedHighlightOptions: {
    type: Object,
    default: () => ({}),
  },
  centerView: {
    type: Boolean,
    default: false,
  },
  centerViewOptions: {
    type: Object,
    default: () => ({}),
  },
  fitView: {
    type: Boolean,
    default: false,
  },
  fitViewOptions: {
    type: Object,
    default: () => ({}),
  },
  // 标准交互配置
  enableStandardInteractions: {
    type: Boolean,
    default: true,
  },
  enableContextMenu: {
    type: Boolean,
    default: true,
  },
  enableDoubleClickFit: {
    type: Boolean,
    default: true,
  },
  contextMenuOptions: {
    type: Object,
    default: () => ({}),
  },
});

const containerRef = ref(null);
const graph = useGraphInstance();
const emit = defineEmits(['ready']);

// 键盘管理器
const {
  initKeyboardManager,
  setInteractionMode,
  setClipboardHandler,
  setHistoryHandler,
  INTERACTION_MODES,
} = useKeyboardManager(graph);

// 标准交互管理器
const standardInteractions = props.enableStandardInteractions 
  ? useStandardInteractions(graph, {
      enableContextMenu: props.enableContextMenu,
      enableDoubleClickFit: props.enableDoubleClickFit,
      contextMenuOptions: props.contextMenuOptions,
      // 当未开启边的选择框时，不允许边被选中/框选
      allowEdgeSelection: props.selectOptions?.showEdgeSelectionBox === true || props.selectOptions?.allowEdgeSelection === true,
    })
  : null;

// 初始化 Graph
const initGraph = async () => {
  await nextTick();
  
  if (!containerRef.value) return;
  
  const g = new Graph({
    container: containerRef.value,
    autoResize: true,
    virtual: props.virtual,
    scaling: {
      min: props.minScale,
      max: props.maxScale,
    },
    connecting: {
      ...props.connectionOptions,
      allowBlank: false,
      allowLoop: false,
      allowEdge: false,
      highlight: true,
      snap: true,
      validateConnection({ sourceMagnet, targetMagnet }) {
        return !!(sourceMagnet && targetMagnet);
      },
      createEdge() {
        return new Shape.Edge({
          shape: 'basic-edge',
          ...props.connectionEdgeOptions,
        });
      },
    },
    highlighting: {
      default: {
        name: 'stroke',
        args: {
          padding: 3,
          attrs: {
            strokeWidth: 3,
            stroke: '#1890ff',
          },
        },
        ...props.defaultHighlightOptions,
      },
      embedding: {
        name: 'stroke',
        args: {
          padding: 3,
          attrs: {
            strokeWidth: 3,
            stroke: '#52c41a',
          },
        },
        ...props.embedHighlightOptions,
      },
      nodeAvailable: {
        name: 'className',
        args: {
          className: 'available',
        },
        ...props.nodeAvailableHighlightOptions,
      },
      magnetAvailable: {
        name: 'stroke',
        args: {
          attrs: {
            fill: '#1890ff',
            stroke: '#1890ff',
          },
        },
        ...props.magnetAvailableHighlightOptions,
      },
      magnetAdsorbed: {
        name: 'stroke',
        args: {
          attrs: {
            fill: '#52c41a',
            stroke: '#52c41a',
          },
        },
        ...props.magnetAdsorbedHighlightOptions,
      },
    },
    onPortRendered: props.onPortRendered,
    onEdgeLabelRendered: props.onEdgeLabelRendered,
    createCellView: props.createCellView,
  });

  // 添加插件：启用 Selection 作为基础能力（支持多选/框选/Shift 触发）
  g.use(new Selection({
    enabled: true,
    multiple: true,
    rubberband: true,
    rubberbandModifiers: ['shift'],
    showNodeSelectionBox: true,
    // 根据配置决定是否显示边的选择框
    showEdgeSelectionBox: props.selectOptions?.showEdgeSelectionBox ?? false,
    selectEdgeOnMoveEdge: false,
    modifiers: ['meta', 'ctrl'],
    // 动态过滤器：根据是否显示边选择框来决定是否允许选择边
    filter: (cell) => {
      if (cell.isNode()) return true;
      if (cell.isEdge()) {
        // 只有在显示边选择框时才允许选择边
        return props.selectOptions?.showEdgeSelectionBox ?? false;
      }
      return true;
    },
    ...(props.selectOptions || {}),
  }));
  g.use(new Keyboard({ enabled: true, ...props.keyboardOptions }));

  if (props.scroller) {
    g.use(new Scroller({ enabled: true, ...props.scrollerOptions }));
  }

  // 设置 graph 实例
  if (graph) {
    graph.value = g;
  }

  // 初始应用交互与限制配置
  updateZoom(props.zoomable, props.zoomOptions);
  updatePan(props.pannable, props.panOptions);
  updateEmbed(props.embedable, props.embedOptions);
  updateRestrict(props.restrict, props.restrictOptions);
  updateReadonly(props.readonly);

  // 初始化键盘管理器
  const keyboardMgr = initKeyboardManager();
  // 将边选择开关同步给 keyboardManager
  keyboardMgr.options.allowEdgeSelection = props.selectOptions?.showEdgeSelectionBox === true || props.selectOptions?.allowEdgeSelection === true;
  
  // 初始化标准交互（在键盘管理器之后）
  if (standardInteractions) {
    // 直接传递 graph 实例
    standardInteractions.setupStandardEvents(g);
  }
  
  // 向外通知已就绪，同时传递键盘管理器和标准交互
  emit('ready', g, keyboardMgr, standardInteractions);

  return g;
};

// 销毁 Graph
const destroyGraph = () => {
  if (graph && graph.value) {
    graph.value.dispose();
    graph.value = null;
  }
};

// 更新只读模式
const updateReadonly = (readonly) => {
  if (!graph || !graph.value) return;
  
  if (readonly) {
    graph.value.options.interacting = false;
  } else {
    graph.value.options.interacting = {
      nodeMovable: (view) => {
        const cell = view.cell;
        return cell.prop('draggable') !== false;
      },
      // 禁用边的拖拽移动，避免出现可拖拽但无法移动的选框
      edgeMovable: false,
      edgeLabelMovable: (view) => {
        const cell = view.cell;
        return cell.prop('labelDraggable') === true;
      },
    };
  }
};

// 更新缩放设置
const updateZoom = (zoomable, zoomOptions) => {
  if (!graph || !graph.value) return;
  
  if (zoomable) {
    graph.value.enableMouseWheel();
    graph.value.options.mousewheel = {
      ...Options.defaults.mousewheel,
      ...zoomOptions,
      enabled: true,
    };
  } else {
    graph.value.disableMouseWheel();
  }
};

// 更新平移设置
const updatePan = (pannable, panOptions) => {
  if (!graph || !graph.value) return;
  
  if (pannable) {
    graph.value.options.panning = {
      ...Options.defaults.panning,
      enabled: true,
      ...panOptions,
    };
    graph.value.enablePanning();
  } else {
    graph.value.disablePanning();
  }
};

// 更新嵌入设置
const updateEmbed = (embedable, embedOptions) => {
  if (!graph || !graph.value) return;
  
  if (embedable) {
    graph.value.options.embedding = {
      ...Options.defaults.embedding,
      enabled: true,
      validate: () => true,
      ...embedOptions,
    };
  } else {
    graph.value.options.embedding = { enabled: false, validate: () => false };
  }
};

// 更新限制设置
const updateRestrict = (restrict, restrictOptions) => {
  if (!graph || !graph.value) return;
  
  if (restrict) {
    graph.value.options.translating = {
      restrict: restrictOptions?.bound || restrict,
    };
  } else {
    graph.value.options.translating = { restrict: false };
  }
};

// 视图操作
const handleViewOperations = () => {
  if (!graph || !graph.value) return;
  
  nextTick(() => {
    if (props.centerView) {
      graph.value.centerContent(props.centerViewOptions);
    }
    
    if (props.fitView) {
      graph.value.scaleContentToFit(props.fitViewOptions);
    }
  });
};

// 右键菜单点击处理
const handleContextMenuClick = (item) => {
  // 调用标准交互中的菜单点击处理
  if (standardInteractions?.handleMenuClick) {
    standardInteractions.handleMenuClick(item);
  } else {
    // 降级处理：直接执行菜单项的动作
    console.log('Context menu item clicked:', item);
    if (item && typeof item.action === 'function') {
      item.action();
    }
  }
};

onMounted(async () => {
  await initGraph();
  handleViewOperations();
});

onUnmounted(() => {
  destroyGraph();
});

// 监听属性变化
watch(() => props.readonly, updateReadonly, { immediate: true });
watch(() => [props.zoomable, props.zoomOptions], ([zoomable, zoomOptions]) => {
  updateZoom(zoomable, zoomOptions);
}, { immediate: true });
watch(() => [props.pannable, props.panOptions], ([pannable, panOptions]) => {
  updatePan(pannable, panOptions);
}, { immediate: true });
watch(() => [props.embedable, props.embedOptions], ([embedable, embedOptions]) => {
  updateEmbed(embedable, embedOptions);
}, { immediate: true });
watch(() => [props.restrict, props.restrictOptions], ([restrict, restrictOptions]) => {
  updateRestrict(restrict, restrictOptions);
}, { immediate: true });
watch(() => [props.centerView, props.fitView], handleViewOperations);

// 监听选择配置变化 - 由KeyboardManager管理，避免冲突
// watch(
//   () => props.selectOptions,
//   (opts) => {
//     if (!graph || !graph.value) return;
//     if (graph.value.getPlugin('selection')) {
//       graph.value.disposePlugins('selection');
//     }
//     graph.value.use(
//       new Selection({
//         enabled: true,
//         ...(opts || {}),
//       }),
//     );
//   },
//   { deep: true, immediate: false },
// );
</script>

<style scoped>
.xflow-graph {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: #fafafa;
}

.xflow-graph-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.xflow-graph-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.xflow-graph-wrapper > * {
  pointer-events: auto;
}
</style>
