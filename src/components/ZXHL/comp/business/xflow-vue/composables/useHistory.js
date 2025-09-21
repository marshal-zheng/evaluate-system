import { ref, onMounted, onUnmounted } from 'vue';
import { History } from '@antv/x6-plugin-history';
import { useGraphInstance } from './useGraphInstance';

/**
 * 历史记录（撤销/重做）功能的 composable
 * @param {Object} options - 历史记录配置选项
 * @returns {Object} 历史记录相关方法和状态
 */
export function useHistory(options = {}) {
  const graph = useGraphInstance();
  const history = ref(null);
  const canUndo = ref(false);
  const canRedo = ref(false);
  const historyStack = ref([]);
  
  // 初始化历史记录插件
  const initHistory = () => {
    if (!graph.value) {
      console.warn('图实例未初始化，无法初始化历史记录功能');
      return;
    }
    
    history.value = new History({
      enabled: true,
      stackSize: 50,
      ignoreAdd: false,
      ignoreRemove: false,
      ignoreChange: false,
      ...options
    });
    
    graph.value.use(history.value);
    updateHistoryState();
    setupHistoryEvents();
  };
  
  /**
   * 更新历史记录状态
   */
  const updateHistoryState = () => {
    if (!history.value) return;
    
    canUndo.value = history.value.canUndo();
    canRedo.value = history.value.canRedo();
  };
  
  /**
   * 设置历史记录事件监听
   */
  const setupHistoryEvents = () => {
    if (!graph.value || !history.value) return;
    
    // 监听历史记录变化
    graph.value.on('history:change', () => {
      updateHistoryState();
    });
    
    // 监听撤销事件
    graph.value.on('history:undo', ({ cmds }) => {
      updateHistoryState();
      console.log('撤销操作:', cmds);
    });
    
    // 监听重做事件
    graph.value.on('history:redo', ({ cmds }) => {
      updateHistoryState();
      console.log('重做操作:', cmds);
    });
  };
  
  /**
   * 撤销操作
   * @returns {boolean} 是否成功撤销
   */
  const undo = () => {
    if (!history.value) {
      console.warn('历史记录插件未初始化');
      return false;
    }
    
    if (history.value.canUndo()) {
      history.value.undo();
      updateHistoryState();
      return true;
    }
    
    return false;
  };
  
  /**
   * 重做操作
   * @returns {boolean} 是否成功重做
   */
  const redo = () => {
    if (!history.value) {
      console.warn('历史记录插件未初始化');
      return false;
    }
    
    if (history.value.canRedo()) {
      history.value.redo();
      updateHistoryState();
      return true;
    }
    
    return false;
  };
  
  /**
   * 清空历史记录
   */
  const clean = () => {
    if (!history.value) return;
    
    history.value.clean();
    updateHistoryState();
  };
  
  /**
   * 启用历史记录
   */
  const enable = () => {
    if (!history.value) return;
    
    history.value.enable();
  };
  
  /**
   * 禁用历史记录
   */
  const disable = () => {
    if (!history.value) return;
    
    history.value.disable();
  };
  
  /**
   * 获取撤销堆栈
   * @returns {Array} 撤销堆栈
   */
  const getUndoStack = () => {
    if (!history.value) return [];
    
    return history.value.undoStack || [];
  };
  
  /**
   * 获取重做堆栈
   * @returns {Array} 重做堆栈
   */
  const getRedoStack = () => {
    if (!history.value) return [];
    
    return history.value.redoStack || [];
  };
  
  /**
   * 获取历史记录数量
   * @returns {Object} 包含撤销和重做数量的对象
   */
  const getHistoryCount = () => {
    const undoStack = getUndoStack();
    const redoStack = getRedoStack();
    
    return {
      undo: undoStack.length,
      redo: redoStack.length,
      total: undoStack.length + redoStack.length
    };
  };
  
  /**
   * 快捷键处理
   */
  const setupKeyboardShortcuts = () => {
    if (!graph.value) return;
    
    // Ctrl+Z / Cmd+Z - 撤销
    graph.value.bindKey(['ctrl+z', 'cmd+z'], () => {
      undo();
    });
    
    // Ctrl+Y / Cmd+Y / Ctrl+Shift+Z - 重做
    graph.value.bindKey(['ctrl+y', 'cmd+y', 'ctrl+shift+z'], () => {
      redo();
    });
  };
  
  /**
   * 清理快捷键
   */
  const cleanupKeyboardShortcuts = () => {
    if (!graph.value) return;
    
    graph.value.unbindKey(['ctrl+z', 'cmd+z']);
    graph.value.unbindKey(['ctrl+y', 'cmd+y', 'ctrl+shift+z']);
  };
  
  /**
   * 清理历史记录事件
   */
  const cleanupHistoryEvents = () => {
    if (!graph.value) return;
    
    graph.value.off('history:change');
    graph.value.off('history:undo');
    graph.value.off('history:redo');
  };
  
  onMounted(() => {
    initHistory();
    setupKeyboardShortcuts();
  });
  
  onUnmounted(() => {
    cleanupKeyboardShortcuts();
    cleanupHistoryEvents();
    if (history.value) {
      history.value.dispose();
      history.value = null;
    }
  });
  
  return {
    history,
    canUndo,
    canRedo,
    historyStack,
    undo,
    redo,
    clean,
    enable,
    disable,
    getUndoStack,
    getRedoStack,
    getHistoryCount,
    updateHistoryState
  };
}