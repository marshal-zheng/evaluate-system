<template>
  <!-- 背景组件不需要渲染可见内容，只设置图的背景 -->
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { useGraphInstance } from '../composables';

defineOptions({
  name: 'Background'
});

const props = defineProps({
  color: {
    type: String,
    default: '#ffffff'
  },
  image: {
    type: String,
    default: ''
  },
  position: {
    type: String,
    default: 'center',
    validator: (value) => [
      'center',
      'top',
      'bottom',
      'left',
      'right',
      'top-left',
      'top-right',
      'bottom-left',
      'bottom-right'
    ].includes(value)
  },
  size: {
    type: String,
    default: 'auto',
    validator: (value) => ['auto', 'cover', 'contain'].includes(value)
  },
  repeat: {
    type: String,
    default: 'no-repeat',
    validator: (value) => ['no-repeat', 'repeat', 'repeat-x', 'repeat-y'].includes(value)
  },
  opacity: {
    type: Number,
    default: 1,
    validator: (value) => value >= 0 && value <= 1
  }
});

const graph = useGraphInstance();

// 设置背景
const setupBackground = () => {
  if (!graph.value) return;

  const backgroundOptions = {
    color: props.color,
    opacity: props.opacity
  };

  // 如果有背景图片
  if (props.image) {
    backgroundOptions.image = props.image;
    backgroundOptions.position = props.position;
    backgroundOptions.size = props.size;
    backgroundOptions.repeat = props.repeat;
  }

  graph.value.drawBackground(backgroundOptions);
};

// 清除背景
const clearBackground = () => {
  if (!graph.value) return;
  
  graph.value.clearBackground();
};

// 监听属性变化
watch([
  () => props.color,
  () => props.image,
  () => props.position,
  () => props.size,
  () => props.repeat,
  () => props.opacity
], () => {
  setupBackground();
});

onMounted(() => {
  setupBackground();
});

defineExpose({
  setupBackground,
  clearBackground
});
</script>