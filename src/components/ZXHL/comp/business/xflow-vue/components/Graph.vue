<template>
  <div 
    :class="className" 
    :style="{ width: '100%', height: '100%', ...style }"
  >
    <div 
      ref="containerRef" 
      style="width: 100%; height: 100%;" 
    />
    <Wrapper>
      <State
        :connection-edge-options="connectionEdgeOptions"
        :center-view="centerView"
        :center-view-options="centerViewOptions"
        :fit-view="fitView"
        :fit-view-options="fitViewOptions"
      />
      <slot />
    </Wrapper>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, onUnmounted, watch, computed } from 'vue';
import { Graph, Options } from '@antv/x6';
import { Keyboard } from '@antv/x6-plugin-keyboard';
import { Scroller } from '@antv/x6-plugin-scroller';
import { Selection } from '@antv/x6-plugin-selection';
import { useXFlowStore } from '../stores';
import { GraphOptions } from '../types';
import Wrapper from './Wrapper.vue';
import State from './State.vue';

defineOptions({
  name: 'XFlowGraph'
});

// 定义组件属性
const props = defineProps(GraphOptions);

// 获取注入的图实例引用
const graphRef = inject('xflow-graph');
const store = useXFlowStore();

// 模板引用
const containerRef = ref(null);

// 内部图实例
const internalGraph = ref(null);

// 计算属性 - 当前图实例
const currentGraph = computed(() => internalGraph.value);

// 初始化图实例
const initGraph = () => {
  if (!containerRef.value) {
    console.warn('容器元素未找到');
    return;
  }

  const graph = new Graph({
    container: containerRef.value,
    autoResize: true,
    virtual: props.virtual,
    scaling: {
      min: props.minScale,
      max: props.maxScale,
    },
    connecting: {
      ...props.connectionOptions,
      createEdge() {
        return this.createEdge({
          shape: 'edge',
          ...props.connectionEdgeOptions,
        });
      },
    },
    highlighting: {
      default: props.defaultHighlightOptions,
      embedding: props.embedHighlightOptions,
      nodeAvailable: props.nodeAvailableHighlightOptions,
      magnetAvailable: props.magnetAvailableHighlightOptions,
      magnetAdsorbed: props.magnetAdsorbedHighlightOptions,
    },
    onPortRendered: props.onPortRendered,
    onEdgeLabelRendered: props.onEdgeLabelRendered,
    createCellView: props.createCellView,
  });

  // 添加选择插件
  graph.use(new Selection({ 
    enabled: true, 
    ...props.selectOptions 
  }));

  // 添加键盘插件
  graph.use(new Keyboard({ 
    enabled: true, 
    ...props.keyboardOptions 
  }));

  // 添加滚动插件（强制禁用插件自带的平移，避免与 Graph 自身平移冲突）
  if (props.scroller) {
    graph.use(new Scroller({
      enabled: true,
      ...props.scrollerOptions,
      pannable: false,
    }));
  }

  // 设置图实例
  internalGraph.value = graph;
  graphRef.value = graph;
  store.setGraph(graph);

  return graph;
};

// 更新只读状态
const updateReadonly = () => {
  if (!currentGraph.value) return;

  if (props.readonly) {
    currentGraph.value.options.interacting = false;
  } else {
    currentGraph.value.options.interacting = {
      nodeMovable: (view) => {
        const cell = view.cell;
        return cell.prop('draggable') !== false;
      },
      edgeMovable: (view) => {
        const cell = view.cell;
        return cell.prop('draggable') !== false;
      },
      edgeLabelMovable: (view) => {
        const cell = view.cell;
        return cell.prop('labelDraggable') === true;
      },
    };
  }
};

// 更新缩放功能
const updateZoomable = () => {
  if (!currentGraph.value) return;

  if (props.zoomable) {
    currentGraph.value.enableMouseWheel();
    currentGraph.value.options.mousewheel = {
      ...Options.defaults.mousewheel,
      ...props.zoomOptions,
      enabled: true,
    };
  } else {
    currentGraph.value.disableMouseWheel();
  }
};

// 更新平移功能
const updatePannable = () => {
  if (!currentGraph.value) return;

  if (props.pannable) {
    currentGraph.value.options.panning = {
      ...Options.defaults.panning,
      enabled: true,
      ...props.panOptions,
    };
    currentGraph.value.enablePanning();
  } else {
    currentGraph.value.disablePanning();
  }
};

// 更新嵌入功能
const updateEmbedable = () => {
  if (!currentGraph.value) return;

  if (props.embedable) {
    currentGraph.value.options.embedding = {
      ...Options.defaults.embedding,
      enabled: true,
      validate: () => true,
      ...props.embedOptions,
    };
  } else {
    currentGraph.value.options.embedding = { 
      enabled: false, 
      validate: () => false 
    };
  }
};

// 更新限制功能
const updateRestrict = () => {
  if (!currentGraph.value) return;

  if (props.restrict) {
    currentGraph.value.options.translating = {
      restrict: props.restrictOptions ? props.restrictOptions.bound : props.restrict,
    };
  } else {
    currentGraph.value.options.translating = { restrict: false };
  }
};

// 监听属性变化
watch(() => props.readonly, updateReadonly);
watch(() => props.zoomable, updateZoomable);
watch(() => props.zoomOptions, updateZoomable, { deep: true });
watch(() => props.pannable, updatePannable);
watch(() => props.panOptions, updatePannable, { deep: true });
watch(() => props.embedable, updateEmbedable);
watch(() => props.embedOptions, updateEmbedable, { deep: true });
watch(() => props.restrict, updateRestrict);
watch(() => props.restrictOptions, updateRestrict, { deep: true });

// 生命周期钩子
onMounted(() => {
  const graph = initGraph();
  if (graph) {
    // 应用初始配置
    updateReadonly();
    updateZoomable();
    updatePannable();
    updateEmbedable();
    updateRestrict();
  }
});

onUnmounted(() => {
  if (internalGraph.value) {
    internalGraph.value.dispose();
    internalGraph.value = null;
  }
  if (graphRef.value) {
    graphRef.value = null;
  }
});

// 暴露给父组件
defineExpose({
  graph: currentGraph,
  getGraph: () => currentGraph.value
});
</script>

<style scoped>
/* 确保图容器不产生滚动条 */
:deep(.x6-graph-container) {
  overflow: hidden;
}

:deep(.x6-graph-scroller) {
  overflow: hidden;
}
</style>