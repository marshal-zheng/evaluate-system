<template>
  <!-- Grid 插件不需要渲染内容 -->
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { useGraphInstance } from '../composables/useGraphInstance';

// Props 定义
const props = defineProps({
  size: {
    type: Number,
    default: 10,
  },
  type: {
    type: String,
    default: 'dot', // 'dot' | 'fixedDot' | 'mesh'
    validator: (value) => ['dot', 'fixedDot', 'mesh'].includes(value),
  },
  args: {
    type: Object,
    default: () => ({}),
  },
  visible: {
    type: Boolean,
    default: true,
  },
});

const graph = useGraphInstance();

// 更新网格
const updateGrid = () => {
  if (!graph || !graph.value) return;
  
  if (props.visible) {
    graph.value.drawGrid({
      type: props.type,
      args: {
        size: props.size,
        ...props.args,
      },
    });
  } else {
    graph.value.clearGrid();
  }
};

onMounted(() => {
  updateGrid();
});

// 监听属性变化
watch(() => [
  props.size,
  props.type,
  props.args,
  props.visible,
], () => {
  updateGrid();
});
</script>
