import { ref, onMounted } from 'vue';
import { Dnd } from '@antv/x6-plugin-dnd';
import { useGraphInstance } from './useGraphInstance';

export function useDnd(options = {}) {
  const graph = useGraphInstance();
  const dndRef = ref(null);
  
  onMounted(() => {
    if (graph.value && !dndRef.value) {
      dndRef.value = new Dnd({
        target: graph.value,
        getDragNode: (node) => node.clone({ keepId: true }),
        getDropNode: (node) => node.clone({ keepId: true }),
        ...options,
      });
    }
  });
  
  const startDrag = (nodeOptions, event) => {
    if (graph.value && dndRef.value) {
      const node = graph.value.createNode(nodeOptions);
      dndRef.value.start(node, event);
    }
  };
  
  return {
    startDrag,
  };
}
