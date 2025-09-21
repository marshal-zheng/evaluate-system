<template>
  <!-- 网格组件不需要渲染可见内容，只设置图的网格背景 -->
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { useGraphInstance } from '../composables';

defineOptions({
  name: 'Grid'
});

const props = defineProps({
  enabled: {
    type: Boolean,
    default: true
  },
  size: {
    type: Number,
    default: 10
  },
  visible: {
    type: Boolean,
    default: true
  },
  type: {
    type: String,
    default: 'dot', // 'dot' | 'fixedDot' | 'mesh'
    validator: (value) => ['dot', 'fixedDot', 'mesh'].includes(value)
  },
  args: {
    type: [Array, Object],
    default: () => []
  },
  color: {
    type: String,
    default: '#e5e5e5'
  },
  thickness: {
    type: Number,
    default: 1
  }
});

const graph = useGraphInstance();

// 设置网格
const setupGrid = () => {
  if (!graph.value) return;

  if (props.enabled) {
    graph.value.drawGrid({
      size: props.size,
      visible: props.visible,
      type: props.type,
      args: Array.isArray(props.args) ? props.args : [props.args],
      color: props.color,
      thickness: props.thickness
    });
  } else {
    graph.value.clearGrid();
  }
};

// 清除网格
const clearGrid = () => {
  if (!graph.value) return;
  
  graph.value.clearGrid();
};

// 显示网格
const showGrid = () => {
  if (!graph.value) return;
  
  graph.value.showGrid();
};

// 隐藏网格
const hideGrid = () => {
  if (!graph.value) return;
  
  graph.value.hideGrid();
};

// 监听属性变化
watch([
  () => props.enabled,
  () => props.size,
  () => props.visible,
  () => props.type,
  () => props.args,
  () => props.color,
  () => props.thickness
], () => {
  setupGrid();
}, { deep: true });

onMounted(() => {
  setupGrid();
});

defineExpose({
  setupGrid,
  clearGrid,
  showGrid,
  hideGrid
});
</script>