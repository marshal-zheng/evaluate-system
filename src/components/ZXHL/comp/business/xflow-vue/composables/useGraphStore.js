import { storeToRefs } from 'pinia';
import { useXFlowStore } from '../stores';

/**
 * 获取图数据状态的 composable
 * @param {Function} selector - 选择器函数，用于选择特定的状态
 * @returns {Object} 图数据状态
 */
export function useGraphStore(selector) {
  const store = useXFlowStore();
  
  if (typeof selector === 'function') {
    return selector(store);
  }
  
  // 如果没有选择器，返回所有响应式状态
  const { nodes, edges, changeList, graph } = storeToRefs(store);
  
  return {
    // 状态
    nodes,
    edges,
    changeList,
    graph,
    
    // 计算属性
    allNodes: store.allNodes,
    allEdges: store.allEdges,
    
    // 方法
    setGraph: store.setGraph,
    initData: store.initData,
    addNodes: store.addNodes,
    removeNodes: store.removeNodes,
    updateNode: store.updateNode,
    addEdges: store.addEdges,
    removeEdges: store.removeEdges,
    updateEdge: store.updateEdge,
    clearChangeList: store.clearChangeList,
    reset: store.reset,
    getNodeById: store.getNodeById,
    getEdgeById: store.getEdgeById
  };
}