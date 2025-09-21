<template>
  <!-- 状态组件不需要渲染任何内容，只处理状态逻辑 -->
</template>

<script setup>
import { watch, onMounted } from 'vue';
import { useGraphInstance } from '../composables';

defineOptions({
  name: 'State'
});

const props = defineProps({
  connectionEdgeOptions: {
    type: Object,
    default: () => ({})
  },
  centerView: {
    type: Boolean,
    default: false
  },
  centerViewOptions: {
    type: Object,
    default: () => ({})
  },
  fitView: {
    type: Boolean,
    default: false
  },
  fitViewOptions: {
    type: Object,
    default: () => ({})
  }
});

const graph = useGraphInstance();

// 居中视图
const handleCenterView = () => {
  if (!graph.value || !props.centerView) return;
  
  graph.value.centerContent(props.centerViewOptions);
};

// 适应视图
const handleFitView = () => {
  if (!graph.value || !props.fitView) return;
  
  graph.value.zoomToFit(props.fitViewOptions);
};

// 监听属性变化
watch(() => props.centerView, (newVal) => {
  if (newVal) {
    handleCenterView();
  }
});

watch(() => props.fitView, (newVal) => {
  if (newVal) {
    handleFitView();
  }
});

// 组件挂载后处理初始状态
onMounted(() => {
  if (props.centerView) {
    handleCenterView();
  }
  if (props.fitView) {
    handleFitView();
  }
});
</script>