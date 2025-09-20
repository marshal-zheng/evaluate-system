/**
 * 标准交互管理器
 * 集成企业级标准的图编辑器交互功能
 */

import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useContextMenu } from './useContextMenu.js';
import { useDeviceSupport } from './useDeviceSupport.js';

export function useStandardInteractions(graph, options = {}) {
  const { isMacOs, isCtrlKeyPressed } = useDeviceSupport();
  
  // 默认配置
  const defaultOptions = {
    enableContextMenu: true,
    enableDoubleClickFit: true,
    enableStandardSelection: true,
    enableKeyboardShortcuts: true,
    contextMenuOptions: {},
    // 是否允许边被选择/框选
    allowEdgeSelection: false,
  };

  const config = { ...defaultOptions, ...options };

  // 初始化右键菜单
  const contextMenuComposable = config.enableContextMenu 
    ? useContextMenu(graph, config.contextMenuOptions)
    : null;

  // 选择状态
  const selectedCells = ref([]);

  // 设置标准交互事件
  const setupStandardEvents = (graphInstance = null) => {
    const g = graphInstance || graph?.value || graph;
    if (!g || typeof g.on !== 'function') {
      console.warn('Graph instance is not ready for event setup');
      return;
    }

    // 选择变化监听
    g.on('selection:changed', ({ selected }) => {
      // 如果不允许边选择，则过滤掉边
      if (!config.allowEdgeSelection && Array.isArray(selected)) {
        const filtered = selected.filter((cell) => !cell.isEdge());
        // 如果存在边被选中，立即移除
        if (filtered.length !== selected.length) {
          g.cleanSelection();
          if (filtered.length > 0) g.select(filtered);
          selectedCells.value = filtered;
          return;
        }
        selectedCells.value = filtered;
        return;
      }
      selectedCells.value = selected;
    });

    // 双击空白区域适应画布
    if (config.enableDoubleClickFit) {
      g.on('blank:dblclick', () => {
        g.scaleContentToFit({ padding: 20 });
      });
    }

    // 标准选择交互
    if (config.enableStandardSelection) {
      setupSelectionInteractions(g);
    }

    // 右键菜单事件已在 useContextMenu 中处理
    if (contextMenuComposable) {
      contextMenuComposable.setupGraphEvents(g);
    }
  };

  // 设置选择交互
  const setupSelectionInteractions = (graphInstance = null) => {
    const g = graphInstance || graph?.value || graph;
    if (!g || typeof g.on !== 'function') return;

    // 点击空白区域：在未按住修饰键时清除选择
    g.on('blank:click', ({ e }) => {
      if (!isCtrlKeyPressed(e)) {
        g.cleanSelection();
      }
    });

    // 节点点击选择逻辑
    g.on('node:click', ({ e, node }) => {
      if (isCtrlKeyPressed(e)) {
        // Ctrl/Cmd + 点击：切换选择状态
        if (g.isSelected(node)) {
          g.unselect(node);
        } else {
          g.select(node, { silent: false });
        }
      } else {
        // 普通点击：单选
        g.cleanSelection();
        g.select(node);
      }
    });

    // 边点击选择逻辑
    g.on('edge:click', ({ e, edge }) => {
      // 如果不允许边选择，直接返回，不做任何选择操作
      if (!config.allowEdgeSelection) return;
      if (isCtrlKeyPressed(e)) {
        if (g.isSelected(edge)) {
          g.unselect(edge);
        } else {
          g.select(edge, { silent: false });
        }
      } else {
        g.cleanSelection();
        g.select(edge);
      }
    });
  };

  // 选择操作方法
  const selectAll = () => {
    const g = graph?.value || graph;
    if (g) {
      g.selectAll();
    }
  };

  const clearSelection = () => {
    const g = graph?.value || graph;
    if (g) {
      g.cleanSelection();
    }
  };

  const deleteSelected = () => {
    const g = graph?.value || graph;
    if (g && selectedCells.value.length > 0) {
      g.removeCells(selectedCells.value);
    }
  };

  // 视图操作方法
  const zoomToFit = () => {
    const g = graph?.value || graph;
    if (g) {
      g.scaleContentToFit({ padding: 20 });
    }
  };

  const zoomToActual = () => {
    const g = graph?.value || graph;
    if (g) {
      g.scale(1);
      g.centerContent();
    }
  };

  const centerContent = () => {
    const g = graph?.value || graph;
    if (g) {
      g.centerContent();
    }
  };

  // 设置处理器给右键菜单
  const setupHandlers = (clipboardActions, historyActions) => {
    if (contextMenuComposable) {
      // 设置剪贴板处理器
      contextMenuComposable.setClipboardHandler(clipboardActions);
      
      // 设置历史处理器
      contextMenuComposable.setHistoryHandler(historyActions);
      
      // 设置选择处理器
      contextMenuComposable.setSelectionHandler({
        selectAll,
        clearSelection,
        deleteSelected,
      });
    }
  };

  // 获取当前选择的处理器
  const getSelectionHandler = () => ({
    selectedCells: selectedCells.value,
    selectAll,
    clearSelection,
    deleteSelected,
  });

  // 获取视图操作处理器
  const getViewHandler = () => ({
    zoomToFit,
    zoomToActual,
    centerContent,
  });

  // 初始化将由外部调用

  return {
    // 状态
    selectedCells,
    
    // 右键菜单
    contextMenu: contextMenuComposable?.contextMenu,
    handleMenuClick: contextMenuComposable?.handleMenuClick,
    
    // 操作方法
    selectAll,
    clearSelection,
    deleteSelected,
    zoomToFit,
    zoomToActual,
    centerContent,
    
    // 处理器设置
    setupHandlers,
    getSelectionHandler,
    getViewHandler,
    
    // 事件设置
    setupStandardEvents,
  };
}
