<template>
  <!-- 剪贴板组件不需要渲染可见内容，只提供剪贴板功能 -->
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useClipboard } from '../composables';

defineOptions({
  name: 'Clipboard'
});

const props = defineProps({
  enabled: {
    type: Boolean,
    default: true
  },
  useLocalStorage: {
    type: Boolean,
    default: false
  }
});

const {
  clipboard,
  copy,
  cut,
  paste,
  isEmpty,
  clear
} = useClipboard({
  enabled: props.enabled,
  useLocalStorage: props.useLocalStorage
});

defineExpose({
  clipboard,
  copy,
  cut,
  paste,
  isEmpty,
  clear
});
</script>