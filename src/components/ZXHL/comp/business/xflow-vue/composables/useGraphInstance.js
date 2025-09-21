import { inject, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useXFlowStore } from '../stores';

/**
 * 获取图实例的 composable
 * @returns {Object} 图实例对象
 */
export function useGraphInstance() {
  const injectedGraph = inject('xflow-graph', null);
  const store = useXFlowStore();
  const { graph: storeGraph } = storeToRefs(store);

  if (!injectedGraph && !storeGraph.value) {
    console.warn('useGraphInstance 需要在 XFlow 组件渲染完成后使用');
  }

  return computed(() => {
    if (injectedGraph && injectedGraph.value) {
      return injectedGraph.value;
    }

    return storeGraph.value;
  });
}
