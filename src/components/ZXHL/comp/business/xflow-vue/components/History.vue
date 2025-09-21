<template>
  <!-- 历史记录组件不需要渲染可见内容，只提供历史记录功能 -->
</template>

<script setup>
import { useHistory } from '../composables';

defineOptions({
  name: 'History'
});

const props = defineProps({
  enabled: {
    type: Boolean,
    default: true
  },
  stackSize: {
    type: Number,
    default: 50
  },
  ignoreAdd: {
    type: Boolean,
    default: false
  },
  ignoreRemove: {
    type: Boolean,
    default: false
  },
  ignoreChange: {
    type: Boolean,
    default: false
  }
});

const {
  history,
  canUndo,
  canRedo,
  undo,
  redo,
  clean,
  enable,
  disable,
  getUndoStack,
  getRedoStack,
  getHistoryCount
} = useHistory({
  enabled: props.enabled,
  stackSize: props.stackSize,
  ignoreAdd: props.ignoreAdd,
  ignoreRemove: props.ignoreRemove,
  ignoreChange: props.ignoreChange
});

defineExpose({
  history,
  canUndo,
  canRedo,
  undo,
  redo,
  clean,
  enable,
  disable,
  getUndoStack,
  getRedoStack,
  getHistoryCount
});
</script>