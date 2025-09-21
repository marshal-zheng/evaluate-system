<template>
  <!-- 变换组件不需要渲染可见内容，只提供变换功能 -->
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Transform } from '@antv/x6-plugin-transform';
import { useGraphInstance } from '../composables';

defineOptions({
  name: 'Transform'
});

const props = defineProps({
  enabled: {
    type: Boolean,
    default: true
  },
  resizing: {
    type: Boolean,
    default: true
  },
  rotating: {
    type: Boolean,
    default: true
  },
  orthogonalResizing: {
    type: Boolean,
    default: true
  },
  restrictResize: {
    type: Boolean,
    default: false
  },
  preserveAspectRatio: {
    type: Boolean,
    default: false
  },
  allowReverse: {
    type: Boolean,
    default: true
  }
});

const graph = useGraphInstance();
const transform = ref(null);

// 初始化变换插件
const initTransform = () => {
  if (!graph.value) {
    console.warn('图实例未初始化，无法初始化变换功能');
    return;
  }

  transform.value = new Transform({
    resizing: props.resizing,
    rotating: props.rotating,
    orthogonalResizing: props.orthogonalResizing,
    restrictResize: props.restrictResize,
    preserveAspectRatio: props.preserveAspectRatio,
    allowReverse: props.allowReverse
  });

  if (props.enabled) {
    graph.value.use(transform.value);
  }
};

// 启用变换
const enable = () => {
  if (!transform.value || !graph.value) return;
  
  if (!graph.value.hasPlugin('transform')) {
    graph.value.use(transform.value);
  }
  transform.value.enable();
};

// 禁用变换
const disable = () => {
  if (!transform.value) return;
  
  transform.value.disable();
};

// 切换变换状态
const toggle = () => {
  if (!transform.value) return;
  
  if (transform.value.disabled) {
    enable();
  } else {
    disable();
  }
};

// 检查是否启用
const isEnabled = () => {
  return transform.value ? !transform.value.disabled : false;
};

onMounted(() => {
  initTransform();
});

onUnmounted(() => {
  if (transform.value) {
    transform.value.dispose();
    transform.value = null;
  }
});

defineExpose({
  transform,
  enable,
  disable,
  toggle,
  isEnabled
});
</script>