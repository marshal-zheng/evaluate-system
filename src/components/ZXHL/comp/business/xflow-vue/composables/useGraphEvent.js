import { onMounted, onUnmounted } from 'vue';
import { useGraphInstance } from './useGraphInstance';

/**
 * 图事件监听的 composable
 * @returns {Object} 事件监听相关方法
 */
export function useGraphEvent() {
  const graph = useGraphInstance();
  
  /**
   * 添加事件监听器
   * @param {string} eventName - 事件名称
   * @param {Function} handler - 事件处理函数
   * @param {Object} options - 选项
   */
  const addEventListener = (eventName, handler, options = {}) => {
    if (!graph.value) {
      console.warn('图实例未初始化，无法添加事件监听器');
      return;
    }
    
    graph.value.on(eventName, handler, options.context);
  };
  
  /**
   * 移除事件监听器
   * @param {string} eventName - 事件名称
   * @param {Function} handler - 事件处理函数
   */
  const removeEventListener = (eventName, handler) => {
    if (!graph.value) return;
    
    graph.value.off(eventName, handler);
  };
  
  /**
   * 添加一次性事件监听器
   * @param {string} eventName - 事件名称
   * @param {Function} handler - 事件处理函数
   */
  const addEventListenerOnce = (eventName, handler) => {
    if (!graph.value) {
      console.warn('图实例未初始化，无法添加事件监听器');
      return;
    }
    
    graph.value.once(eventName, handler);
  };
  
  /**
   * 发射事件
   * @param {string} eventName - 事件名称
   * @param {...any} args - 事件参数
   */
  const emitEvent = (eventName, ...args) => {
    if (!graph.value) return;
    
    graph.value.trigger(eventName, ...args);
  };
  
  /**
   * 自动清理事件监听器的生命周期钩子
   * @param {Array} events - 事件配置数组 [{ name, handler, options }]
   */
  const useEventListeners = (events) => {
    onMounted(() => {
      events.forEach(({ name, handler, options }) => {
        addEventListener(name, handler, options);
      });
    });
    
    onUnmounted(() => {
      events.forEach(({ name, handler }) => {
        removeEventListener(name, handler);
      });
    });
  };
  
  return {
    addEventListener,
    removeEventListener,
    addEventListenerOnce,
    emitEvent,
    useEventListeners
  };
}