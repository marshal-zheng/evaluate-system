<template></template>

<script setup>
import { useGraphEvent } from '@/components/xflow-vue/src/composables/useGraphEvent';
import { useGraphStore } from '@/components/xflow-vue/src/composables/useGraphStore';
import { useGraphInstance } from '@/components/xflow-vue/src/composables/useGraphInstance';
import { willCreateCycle } from '../utils/graphConstraints.js';

const graphStore = useGraphStore();
const graph = useGraphInstance();

// 禁止成环：在连接创建前进行校验
useGraphEvent('edge:adding', ({ edge, isNew, options }) => {
  const g = graph?.value;
  if (!g) return;
  try {
    const sourceId = edge.getSourceCellId?.();
    const targetId = edge.getTargetCellId?.();
    if (!sourceId || !targetId) return;
    if (willCreateCycle(g, sourceId, targetId)) {
      // 阻止新增该边
      options?.cancel && (options.cancel = true);
      edge.remove?.();
    }
  } catch (e) {}
});

useGraphEvent('edge:connected', ({ edge }) => {
  const g = graph?.value;
  if (!edge || !g) return;
  // 二次保险：若已形成环，直接删除该边
  try {
    const sourceId = edge.getSourceCellId?.();
    const targetId = edge.getTargetCellId?.();
    if (sourceId && targetId && willCreateCycle(g, sourceId, targetId)) {
      edge.remove?.();
      return;
    }
  } catch (e) {}
  if (edge.id) {
    graphStore.updateEdge(edge.id, { animated: false });
  }
});
</script>

<style scoped>
</style>
