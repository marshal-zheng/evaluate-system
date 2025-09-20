import { onMounted, onUnmounted } from 'vue';
import { useGraphInstance } from './useGraphInstance';

export function useGraphEvent(eventName, callback) {
  const graph = useGraphInstance();
  
  onMounted(() => {
    if (graph && graph.value) {
      graph.value.on(eventName, callback);
    }
  });
  
  onUnmounted(() => {
    if (graph && graph.value) {
      graph.value.off(eventName, callback);
    }
  });
  
  return {
    graph,
  };
}
