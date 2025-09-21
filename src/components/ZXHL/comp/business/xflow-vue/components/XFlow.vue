<template>
  <div class="xflow-vue">
    <slot />
  </div>
</template>

<script setup>
import { ref, provide, onUnmounted } from 'vue';
import { useXFlowStore } from '../stores';

defineOptions({
  name: 'XFlow'
});

// 创建图实例的响应式引用
const graph = ref(null);

// 提供图实例给子组件
provide('xflow-graph', graph);

// 初始化 store
const store = useXFlowStore();

// 组件卸载时清理
onUnmounted(() => {
  if (graph.value) {
    graph.value.dispose();
    graph.value = null;
  }
  store.reset();
});

// 暴露给父组件的方法和属性
defineExpose({
  graph,
  store
});
</script>

<style scoped>
.xflow-vue {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}
</style>