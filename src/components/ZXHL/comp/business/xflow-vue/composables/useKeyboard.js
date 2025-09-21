import { ref, onMounted, onUnmounted } from 'vue';
import { Keyboard } from '@antv/x6-plugin-keyboard';
import { useGraphInstance } from './useGraphInstance';

/**
 * 键盘功能的 composable
 * @param {Object} options - 键盘配置选项
 * @returns {Object} 键盘相关方法和状态
 */
export function useKeyboard(options = {}) {
  const graph = useGraphInstance();
  const keyboard = ref(null);
  const keyBindings = ref(new Map());
  
  // 初始化键盘插件
  const initKeyboard = () => {
    if (!graph.value) {
      console.warn('图实例未初始化，无法初始化键盘功能');
      return;
    }
    
    keyboard.value = new Keyboard({
      enabled: true,
      global: true,
      ...options
    });
    
    graph.value.use(keyboard.value);
  };
  
  /**
   * 绑定快捷键
   * @param {string|Array} keys - 快捷键组合
   * @param {Function} handler - 处理函数
   * @param {string} action - 动作名称（用于记录和管理）
   */
  const bindKey = (keys, handler, action = '') => {
    if (!graph.value) {
      console.warn('图实例未初始化');
      return;
    }
    
    const keyArray = Array.isArray(keys) ? keys : [keys];
    
    keyArray.forEach(key => {
      graph.value.bindKey(key, handler);
      
      // 记录快捷键绑定
      if (!keyBindings.value.has(key)) {
        keyBindings.value.set(key, []);
      }
      keyBindings.value.get(key).push({
        handler,
        action,
        key
      });
    });
  };
  
  /**
   * 解绑快捷键
   * @param {string|Array} keys - 快捷键组合
   */
  const unbindKey = (keys) => {
    if (!graph.value) return;
    
    const keyArray = Array.isArray(keys) ? keys : [keys];
    
    keyArray.forEach(key => {
      graph.value.unbindKey(key);
      keyBindings.value.delete(key);
    });
  };
  
  /**
   * 获取所有快捷键绑定
   * @returns {Map} 快捷键绑定映射
   */
  const getKeyBindings = () => {
    return keyBindings.value;
  };
  
  /**
   * 启用键盘功能
   */
  const enable = () => {
    if (!keyboard.value) return;
    
    keyboard.value.enable();
  };
  
  /**
   * 禁用键盘功能
   */
  const disable = () => {
    if (!keyboard.value) return;
    
    keyboard.value.disable();
  };
  
  /**
   * 检查是否启用
   * @returns {boolean} 是否启用
   */
  const isEnabled = () => {
    return keyboard.value ? keyboard.value.enabled : false;
  };
  
  /**
   * 设置常用快捷键
   */
  const setupCommonShortcuts = () => {
    // Delete - 删除选中元素
    bindKey('delete', () => {
      const selectedCells = graph.value?.getSelectedCells() || [];
      if (selectedCells.length > 0) {
        graph.value?.removeCells(selectedCells);
      }
    }, '删除选中元素');
    
    // Backspace - 删除选中元素
    bindKey('backspace', () => {
      const selectedCells = graph.value?.getSelectedCells() || [];
      if (selectedCells.length > 0) {
        graph.value?.removeCells(selectedCells);
      }
    }, '删除选中元素');
    
    // Ctrl+A / Cmd+A - 全选
    bindKey(['ctrl+a', 'cmd+a'], () => {
      graph.value?.selectAll();
    }, '全选');
    
    // Escape - 取消选择
    bindKey('escape', () => {
      graph.value?.cleanSelection();
    }, '取消选择');
    
    // Ctrl+D / Cmd+D - 复制选中元素
    bindKey(['ctrl+d', 'cmd+d'], () => {
      const selectedCells = graph.value?.getSelectedCells() || [];
      if (selectedCells.length > 0) {
        const cloned = graph.value?.cloneCells(selectedCells);
        if (cloned) {
          // 稍微偏移复制的元素
          cloned.forEach(cell => {
            if (cell.isNode()) {
              const pos = cell.getPosition();
              cell.setPosition(pos.x + 20, pos.y + 20);
            }
          });
          graph.value?.addCells(cloned);
          graph.value?.resetSelection(cloned);
        }
      }
    }, '复制选中元素');
    
    // 箭头键 - 移动选中元素
    bindKey('up', () => {
      moveSelectedCells(0, -10);
    }, '向上移动');
    
    bindKey('down', () => {
      moveSelectedCells(0, 10);
    }, '向下移动');
    
    bindKey('left', () => {
      moveSelectedCells(-10, 0);
    }, '向左移动');
    
    bindKey('right', () => {
      moveSelectedCells(10, 0);
    }, '向右移动');
    
    // Shift + 箭头键 - 快速移动
    bindKey('shift+up', () => {
      moveSelectedCells(0, -50);
    }, '快速向上移动');
    
    bindKey('shift+down', () => {
      moveSelectedCells(0, 50);
    }, '快速向下移动');
    
    bindKey('shift+left', () => {
      moveSelectedCells(-50, 0);
    }, '快速向左移动');
    
    bindKey('shift+right', () => {
      moveSelectedCells(50, 0);
    }, '快速向右移动');
  };
  
  /**
   * 移动选中的单元格
   * @param {number} dx - X轴偏移
   * @param {number} dy - Y轴偏移
   */
  const moveSelectedCells = (dx, dy) => {
    const selectedCells = graph.value?.getSelectedCells() || [];
    selectedCells.forEach(cell => {
      if (cell.isNode()) {
        const pos = cell.getPosition();
        cell.setPosition(pos.x + dx, pos.y + dy);
      }
    });
  };
  
  /**
   * 清理所有快捷键绑定
   */
  const cleanup = () => {
    keyBindings.value.forEach((bindings, key) => {
      unbindKey(key);
    });
    keyBindings.value.clear();
  };
  
  onMounted(() => {
    initKeyboard();
    setupCommonShortcuts();
  });
  
  onUnmounted(() => {
    cleanup();
    if (keyboard.value) {
      keyboard.value.dispose();
      keyboard.value = null;
    }
  });
  
  return {
    keyboard,
    keyBindings,
    bindKey,
    unbindKey,
    getKeyBindings,
    enable,
    disable,
    isEnabled,
    setupCommonShortcuts,
    moveSelectedCells,
    cleanup
  };
}