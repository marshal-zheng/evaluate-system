<template>
  <!-- Snapline 插件不需要渲染内容 -->
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { Snapline } from '@antv/x6-plugin-snapline';
import { useGraphInstance } from '../composables/useGraphInstance';

// Props 定义
const props = defineProps({
  enabled: {
    type: Boolean,
    default: true,
  },
  className: {
    type: String,
    default: 'x6-widget-snapline',
  },
  tolerance: {
    type: Number,
    default: 10,
  },
  sharp: {
    type: Boolean,
    default: false,
  },
});

const graph = useGraphInstance();

// 初始化 Snapline 插件
const initSnapline = () => {
  if (!graph || !graph.value) return;
  
  // 移除已存在的插件
  if (graph.value.getPlugin('snapline')) {
    graph.value.disposePlugins('snapline');
  }
  
  // 添加新插件
  graph.value.use(
    new Snapline({
      enabled: props.enabled,
      className: props.className,
      tolerance: props.tolerance,
      sharp: props.sharp,
    })
  );
};

onMounted(() => {
  initSnapline();
});

// 监听属性变化重新初始化插件
watch(() => [
  props.enabled,
  props.className,
  props.tolerance,
  props.sharp,
], () => {
  initSnapline();
});
</script>
