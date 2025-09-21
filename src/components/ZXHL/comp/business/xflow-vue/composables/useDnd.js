import { ref, onMounted, onUnmounted } from 'vue';
import { Dnd } from '@antv/x6-plugin-dnd';
import { useGraphInstance } from './useGraphInstance';

/**
 * 拖拽功能的 composable
 * @param {Object} options - 拖拽配置选项
 * @returns {Object} 拖拽相关方法和状态
 */
export function useDnd(options = {}) {
  const graph = useGraphInstance();
  const dnd = ref(null);
  const isDragging = ref(false);
  
  // 初始化拖拽插件
  const initDnd = () => {
    if (!graph.value) {
      console.warn('图实例未初始化，无法初始化拖拽功能');
      return;
    }
    
    dnd.value = new Dnd({
      target: graph.value,
      scaled: true,
      animation: true,
      getDragNode: (node) => {
        // 如果传入的是节点数据对象，创建新节点
        if (node && typeof node === 'object' && !node.clone) {
          return graph.value.createNode(node);
        }
        // 如果是已有节点，克隆它
        return node.clone ? node.clone({ keepId: false }) : graph.value.createNode(node);
      },
      getDropNode: (node) => {
        // 创建新的节点实例用于放置
        if (node && typeof node === 'object' && !node.clone) {
          return graph.value.createNode(node);
        }
        return node.clone ? node.clone({ keepId: false }) : graph.value.createNode(node);
      },
      ...options
    });
  };
  
  /**
   * 开始拖拽
   * @param {HTMLElement} element - 拖拽的元素
   * @param {Object} nodeData - 节点数据
   * @param {MouseEvent} event - 鼠标事件
   */
  const startDrag = (element, nodeData, event) => {
    if (!dnd.value) {
      console.warn('拖拽插件未初始化');
      return;
    }
    
    isDragging.value = true;
    dnd.value.start(nodeData, event);
  };
  
  /**
   * 停止拖拽
   */
  const stopDrag = () => {
    if (!dnd.value) return;
    
    isDragging.value = false;
    dnd.value.stop();
  };
  
  /**
   * 验证拖拽目标
   * @param {Object} validateFn - 验证函数
   */
  const setValidateFn = (validateFn) => {
    if (!dnd.value) return;
    
    dnd.value.options.validateNode = validateFn;
  };
  
  /**
   * 设置拖拽预览样式
   * @param {Object} getDragImageFn - 获取拖拽预览图像的函数
   */
  const setDragImageFn = (getDragImageFn) => {
    if (!dnd.value) return;
    
    dnd.value.options.getDragImage = getDragImageFn;
  };
  
  /**
   * 监听拖拽事件
   */
  const setupDragEvents = () => {
    if (!graph.value || !dnd.value) return;
    
    // 拖拽开始事件
    graph.value.on('node:dnd:start', () => {
      isDragging.value = true;
    });
    
    // 拖拽结束事件
    graph.value.on('node:dnd:stop', () => {
      isDragging.value = false;
    });
  };
  
  /**
   * 清理拖拽事件
   */
  const cleanupDragEvents = () => {
    if (!graph.value) return;
    
    graph.value.off('node:dnd:start');
    graph.value.off('node:dnd:stop');
  };
  
  onMounted(() => {
    initDnd();
    setupDragEvents();
  });
  
  onUnmounted(() => {
    cleanupDragEvents();
    if (dnd.value) {
      dnd.value.dispose();
      dnd.value = null;
    }
  });
  
  return {
    dnd,
    isDragging,
    startDrag,
    stopDrag,
    setValidateFn,
    setDragImageFn
  };
}