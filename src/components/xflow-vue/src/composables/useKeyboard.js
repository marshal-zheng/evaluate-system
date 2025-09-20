import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useGraphInstance } from './useGraphInstance';

export function useKeyboard(key, callback, action = 'keydown') {
  const graph = useGraphInstance();
  const callbackRef = ref(callback);
  
  // 更新回调引用
  const updateCallback = (newCallback) => {
    callbackRef.value = newCallback;
  };
  
  const bindKey = () => {
    if (graph && graph.value) {
      graph.value.bindKey(
        key,
        (e) => {
          if (callbackRef.value) {
            callbackRef.value(e);
          }
        },
        action
      );
    }
  };
  
  const unbindKey = () => {
    if (graph && graph.value) {
      graph.value.unbindKey(key);
    }
  };
  
  // 监听 graph 变化
  watch(graph, (newGraph) => {
    if (newGraph) {
      bindKey();
    }
  }, { immediate: true });
  
  onUnmounted(() => {
    unbindKey();
  });
  
  return {
    updateCallback,
    bindKey,
    unbindKey,
  };
}
