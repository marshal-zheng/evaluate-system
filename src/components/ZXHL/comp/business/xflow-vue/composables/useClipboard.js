import { ref, onMounted, onUnmounted } from 'vue';
import { Clipboard } from '@antv/x6-plugin-clipboard';
import { useGraphInstance } from './useGraphInstance';

/**
 * 剪贴板功能的 composable
 * @param {Object} options - 剪贴板配置选项
 * @returns {Object} 剪贴板相关方法和状态
 */
export function useClipboard(options = {}) {
  const graph = useGraphInstance();
  const clipboard = ref(null);
  const clipboardData = ref(null);
  
  // 初始化剪贴板插件
  const initClipboard = () => {
    if (!graph.value) {
      console.warn('图实例未初始化，无法初始化剪贴板功能');
      return;
    }
    
    clipboard.value = new Clipboard({
      enabled: true,
      useLocalStorage: false,
      ...options
    });
    
    graph.value.use(clipboard.value);
  };
  
  /**
   * 复制选中的单元格
   * @param {Array} cells - 要复制的单元格数组，如果不传则复制当前选中的单元格
   * @returns {Promise} 复制操作的Promise
   */
  const copy = (cells) => {
    if (!graph.value) {
      console.warn('图实例未初始化');
      return Promise.reject(new Error('图实例未初始化'));
    }
    
    const cellsToClip = cells || graph.value.getSelectedCells();
    if (cellsToClip.length === 0) {
      console.warn('没有选中的单元格可复制');
      return Promise.resolve();
    }
    
    try {
      graph.value.copy(cellsToClip);
      clipboardData.value = cellsToClip;
      return Promise.resolve(cellsToClip);
    } catch (error) {
      console.error('复制失败:', error);
      return Promise.reject(error);
    }
  };
  
  /**
   * 剪切选中的单元格
   * @param {Array} cells - 要剪切的单元格数组，如果不传则剪切当前选中的单元格
   * @returns {Promise} 剪切操作的Promise
   */
  const cut = (cells) => {
    if (!graph.value) {
      console.warn('图实例未初始化');
      return Promise.reject(new Error('图实例未初始化'));
    }
    
    const cellsToCut = cells || graph.value.getSelectedCells();
    if (cellsToCut.length === 0) {
      console.warn('没有选中的单元格可剪切');
      return Promise.resolve();
    }
    
    try {
      graph.value.cut(cellsToCut);
      clipboardData.value = cellsToCut;
      return Promise.resolve(cellsToCut);
    } catch (error) {
      console.error('剪切失败:', error);
      return Promise.reject(error);
    }
  };
  
  /**
   * 粘贴剪贴板中的单元格
   * @param {Object} options - 粘贴选项
   * @returns {Promise} 粘贴操作的Promise
   */
  const paste = (pasteOptions = {}) => {
    if (!graph.value) {
      console.warn('图实例未初始化');
      return Promise.reject(new Error('图实例未初始化'));
    }
    
    if (!clipboard.value.isEmpty()) {
      try {
        const cells = graph.value.paste(pasteOptions);
        return Promise.resolve(cells);
      } catch (error) {
        console.error('粘贴失败:', error);
        return Promise.reject(error);
      }
    } else {
      console.warn('剪贴板为空');
      return Promise.resolve([]);
    }
  };
  
  /**
   * 检查剪贴板是否为空
   * @returns {boolean} 是否为空
   */
  const isEmpty = () => {
    return clipboard.value ? clipboard.value.isEmpty() : true;
  };
  
  /**
   * 清空剪贴板
   */
  const clear = () => {
    if (clipboard.value) {
      clipboard.value.clean();
      clipboardData.value = null;
    }
  };
  
  /**
   * 快捷键处理
   */
  const setupKeyboardShortcuts = () => {
    if (!graph.value) return;
    
    // Ctrl+C / Cmd+C - 复制
    graph.value.bindKey(['ctrl+c', 'cmd+c'], () => {
      copy();
    });
    
    // Ctrl+X / Cmd+X - 剪切
    graph.value.bindKey(['ctrl+x', 'cmd+x'], () => {
      cut();
    });
    
    // Ctrl+V / Cmd+V - 粘贴
    graph.value.bindKey(['ctrl+v', 'cmd+v'], () => {
      paste();
    });
  };
  
  /**
   * 清理快捷键
   */
  const cleanupKeyboardShortcuts = () => {
    if (!graph.value) return;
    
    graph.value.unbindKey(['ctrl+c', 'cmd+c']);
    graph.value.unbindKey(['ctrl+x', 'cmd+x']);
    graph.value.unbindKey(['ctrl+v', 'cmd+v']);
  };
  
  onMounted(() => {
    initClipboard();
    setupKeyboardShortcuts();
  });
  
  onUnmounted(() => {
    cleanupKeyboardShortcuts();
    if (clipboard.value) {
      clipboard.value.dispose();
      clipboard.value = null;
    }
  });
  
  return {
    clipboard,
    clipboardData,
    copy,
    cut,
    paste,
    isEmpty,
    clear
  };
}