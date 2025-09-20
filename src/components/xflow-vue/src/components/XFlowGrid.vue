<template>
  <!-- Grid 插件不需要渲染内容 -->
</template>

<script setup>
import { onMounted, watch, nextTick } from 'vue';
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
const updateGrid = async () => {
  if (!graph || !graph.value) return;
  
  // 等待DOM更新
  await nextTick();
  
  try {
    // 先清除，再根据最新类型重绘，保证切换立即生效
    graph.value.clearGrid();

    if (props.visible) {
      graph.value.drawGrid({
        type: props.type,
        args: {
          size: props.size,
          ...props.args,
        },
      });
      // 显示网格
      graph.value.showGrid();
    } else {
      // 隐藏网格
      graph.value.hideGrid();
    }
  } catch (error) {
    console.warn('Grid update error:', error);
  }
};

onMounted(async () => {
  // 等待一小段时间确保Graph完全初始化
  await nextTick();
  setTimeout(() => {
    updateGrid();
  }, 100);
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
