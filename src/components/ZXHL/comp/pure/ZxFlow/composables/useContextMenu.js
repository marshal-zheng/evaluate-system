/**
 * 通用右键菜单组合式函数
 * 基于企业级最佳实践的上下文菜单管理
 */

import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useDeviceSupport } from './useDeviceSupport.js';

export function useContextMenu(graph, options = {}) {
  const { isMacOs, isCtrlKeyPressed } = useDeviceSupport();
  
  const contextMenu = ref({
    visible: false,
    x: 0,
    y: 0,
    items: [],
    target: null,
    type: 'blank', // 'blank' | 'node' | 'edge'
  });

  // 右键刚打开菜单后，短时间忽略一次全局 click，防止瞬时关闭
  let lastOpenAt = 0;

  // 默认配置
  const defaultOptions = {
    enabled: true,
    enableBlankMenu: true,
    enableNodeMenu: true,
    enableEdgeMenu: true,
    // 自定义菜单处理器 - 允许用户完全控制菜单内容
    customMenuHandler: null, // 函数：(standardItems, type, target) => customItems
    // 向后兼容的旧配置方式
    customItems: {}, // 自定义菜单项，支持 position 配置
  };

  const config = { ...defaultOptions, ...options };

  // 处理自定义菜单的核心函数
  const processCustomMenu = (standardItems, type, target = null) => {
    // 优先使用新的自定义菜单处理器
    if (typeof config.customMenuHandler === 'function') {
      try {
        const result = config.customMenuHandler(standardItems, type, target);
        // 确保返回的是数组
        return Array.isArray(result) ? result : standardItems;
      } catch (error) {
        console.error('自定义菜单处理器执行错误:', error);
        return standardItems;
      }
    }

    // 向后兼容：使用旧的合并逻辑
    return mergeCustomItems(standardItems, config.customItems[type]);
  };

  // 向后兼容的合并自定义菜单项函数
  const mergeCustomItems = (standardItems, customItems) => {
    if (!customItems || customItems.length === 0) {
      return standardItems;
    }

    const result = [...standardItems];
    const topItems = [];
    const bottomItems = [];

    // 分类自定义菜单项
    customItems.forEach(item => {
      if (item.position === 'top') {
        topItems.push(item);
      } else {
        // 默认为 bottom
        bottomItems.push(item);
      }
    });

    // 在顶部插入菜单项
    if (topItems.length > 0) {
      result.unshift({ type: 'divider' });
      result.unshift(...topItems);
    }

    // 在底部添加菜单项
    if (bottomItems.length > 0) {
      result.push({ type: 'divider' });
      result.push(...bottomItems);
    }

    return result;
  };

  // 获取剪贴板状态（需要外部注入）
  let clipboardHandler = null;
  let historyHandler = null;
  let selectionHandler = null;

  // 设置处理器
  const setClipboardHandler = (handler) => {
    clipboardHandler = handler;
  };

  const setHistoryHandler = (handler) => {
    historyHandler = handler;
  };

  const setSelectionHandler = (handler) => {
    selectionHandler = handler;
  };

  // 标准菜单项定义
  const getBlankMenuItems = () => {
    const items = [
      {
        id: 'select-all',
        label: '全选',
        shortcut: isMacOs ? 'Cmd+A' : 'Ctrl+A',
        icon: 'Select',
        action: () => selectionHandler?.selectAll(),
        disabled: !selectionHandler,
      },
      {
        id: 'paste',
        label: '粘贴',
        shortcut: isMacOs ? 'Cmd+V' : 'Ctrl+V',
        icon: 'DocumentCopy',
        action: () => clipboardHandler?.paste(),
        disabled: !clipboardHandler || clipboardHandler.isEmpty(),
      },
      { type: 'divider' },
      {
        id: 'zoom-to-fit',
        label: '适应画布',
        shortcut: isMacOs ? 'Cmd+0' : 'Ctrl+0',
        icon: 'FullScreen',
        action: () => {
          const g = graph?.value || graph;
          g?.scaleContentToFit({ padding: 20 });
        },
        disabled: !graph,
      },
      {
        id: 'zoom-to-actual',
        label: '实际大小',
        shortcut: isMacOs ? 'Cmd+1' : 'Ctrl+1',
        icon: 'ZoomIn',
        action: () => {
          const g = graph?.value || graph;
          g?.scale(1);
          g?.centerContent();
        },
        disabled: !graph,
      },
      { type: 'divider' },
      {
        id: 'clear-canvas',
        label: '清空画布',
        icon: 'Delete',
        action: () => {
          if (confirm('确定要清空画布吗？')) {
            const g = graph?.value || graph;
            g?.clearCells();
          }
        },
        disabled: !graph,
        danger: true,
      },
    ];

    // 使用新的自定义菜单处理逻辑
    return processCustomMenu(items, 'blank');
  };

  const getNodeMenuItems = (node) => {
    const items = [
      {
        id: 'copy',
        label: '复制',
        shortcut: isMacOs ? 'Cmd+C' : 'Ctrl+C',
        icon: 'DocumentCopy',
        action: () => clipboardHandler?.copy([node]),
        disabled: !clipboardHandler,
      },
      {
        id: 'delete',
        label: '删除',
        shortcut: 'Delete',
        icon: 'Delete',
        action: () => {
          const g = graph?.value || graph;
          g?.removeCell(node);
        },
        disabled: !graph,
        danger: true,
      },
      { type: 'divider' },
      {
        id: 'lock',
        label: (node?.prop('locked') || node?.getData()?.locked) ? '解锁' : '锁定',
        icon: (node?.prop('locked') || node?.getData()?.locked) ? 'Unlock' : 'Lock',
        action: () => toggleNodeLock(node),
        disabled: !node,
      },
    ];

    // 使用新的自定义菜单处理逻辑
    return processCustomMenu(items, 'node', node);
  };

  const getEdgeMenuItems = (edge) => {
    const items = [
      {
        id: 'edit-label',
        label: '编辑标签',
        icon: 'Edit',
        action: () => editEdgeLabel(edge),
        disabled: !edge,
      },
      {
        id: 'delete',
        label: '删除连接',
        shortcut: 'Delete',
        icon: 'Delete',
        action: () => {
          const g = graph?.value || graph;
          g?.removeCell(edge);
        },
        disabled: !graph,
        danger: true,
      },
    ];

    // 使用新的自定义菜单处理逻辑
    return processCustomMenu(items, 'edge', edge);
  };

  // 辅助函数：切换节点锁定状态
  const toggleNodeLock = (node) => {
    if (!node) return;
    
    const locked = node.prop('locked') || node.getData()?.locked;
    const newLocked = !locked;
    
    // 设置锁定状态到节点属性
    node.prop('locked', newLocked);
    
    // 设置节点的拖拽状态
    node.prop('movable', !newLocked);
    
    // 更新节点数据
    const currentData = node.getData() || {};
    if (newLocked) {
      node.setData({ ...currentData, locked: true });
    } else {
      const { locked: _, ...restData } = currentData;
      node.setData(restData);
    }
    
    // 设置视觉标识 - 使用更通用的方式
    try {
      if (newLocked) {
        // 添加锁定样式类
        node.addTools([{
          name: 'lock-indicator',
          args: {
            markup: [{
              tagName: 'rect',
              attrs: {
                width: 16,
                height: 16,
                x: -8,
                y: -8,
                fill: '#ff6b6b',
                stroke: '#fff',
                'stroke-width': 1,
                rx: 2,
              }
            }, {
              tagName: 'text',
              attrs: {
                text: '🔒',
                'font-size': 10,
                'text-anchor': 'middle',
                'dominant-baseline': 'central',
                x: 0,
                y: 0,
                fill: '#fff'
              }
            }],
            x: '100%',
            y: 0,
            offset: { x: -8, y: 8 }
          }
        }]);
        
        // 设置节点样式表示锁定状态
        const originalStroke = node.attr('body/stroke') || '#333';
        node.attr('body/strokeDasharray', '5,5');
        node.attr('body/stroke', '#ff6b6b');
        node.setData({ ...node.getData(), originalStroke });
      } else {
        // 移除锁定标识
        node.removeTool('lock-indicator');
        
        // 恢复原始样式
        const originalStroke = node.getData()?.originalStroke || '#333';
        node.attr('body/strokeDasharray', '');
        node.attr('body/stroke', originalStroke);
        
        // 清理原始样式记录
        const data = node.getData();
        if (data?.originalStroke) {
          const { originalStroke: _, ...restData } = data;
          node.setData(restData);
        }
      }
    } catch (error) {
      console.warn('设置锁定视觉标识时出错:', error);
      // 降级方案：仅使用边框样式
      if (newLocked) {
        node.attr('body/stroke', '#ff6b6b');
        node.attr('body/strokeDasharray', '5,5');
      } else {
        node.attr('body/stroke', '#333');
        node.attr('body/strokeDasharray', '');
      }
    }
    
    console.log(`节点 ${node.id} ${newLocked ? '已锁定' : '已解锁'}`);
  };

  // 辅助函数：编辑边标签
  const editEdgeLabel = (edge) => {
    if (!edge) return;
    
    const currentLabel = getEdgeLabelText(edge);
    const newLabel = prompt('请输入边的标签:', currentLabel);
    
    if (newLabel !== null) {
      if (newLabel === '') {
        edge.setLabels([]);
      } else {
        edge.setLabels([{
          attrs: {
            label: { text: newLabel },
          },
        }]);
      }
    }
  };

  // 获取边标签文本
  const getEdgeLabelText = (edge) => {
    if (!edge) return '';
    if (typeof edge.getLabelAt === 'function') {
      const label = edge.getLabelAt(0);
      if (!label) return '';
      if (typeof label === 'string') return label;
      if (label?.attrs?.label?.text != null) return label.attrs.label.text;
      if (label?.attrs?.text?.text != null) return label.attrs.text.text;
      if (typeof label?.text === 'string') return label.text;
    }
    return '';
  };

  // 显示右键菜单
  const showContextMenu = (x, y, type, target = null) => {
    console.log('showContextMenu called:', { x, y, type, target, enabled: config.enabled });
    
    if (!config.enabled) return;

    let items = [];
    
    switch (type) {
      case 'blank':
        if (!config.enableBlankMenu) return;
        items = getBlankMenuItems();
        break;
      case 'node':
        if (!config.enableNodeMenu) return;
        items = getNodeMenuItems(target);
        break;
      case 'edge':
        if (!config.enableEdgeMenu) return;
        items = getEdgeMenuItems(target);
        break;
      default:
        return;
    }

    // 过滤掉被禁用且不显示的项目
    items = items.filter(item => {
      if (item.type === 'divider') return true;
      return item.hidden !== true;
    });

    contextMenu.value = {
      visible: true,
      x,
      y,
      items,
      target,
      type,
    };

    console.log('contextMenu.value set to:', contextMenu.value);

    // 标记本次打开时间，用于抖动保护
    lastOpenAt = Date.now();

    // 防止菜单超出屏幕
    nextTick(() => {
      adjustMenuPosition();
    });
  };

  // 隐藏右键菜单
  const hideContextMenu = () => {
    contextMenu.value.visible = false;
  };

  // 调整菜单位置防止超出屏幕
  const adjustMenuPosition = () => {
    if (!contextMenu.value.visible) return;

    const menuEl = document.querySelector('.xflow-context-menu');
    if (!menuEl) return;

    const menuRect = menuEl.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let { x, y } = contextMenu.value;

    // 防止右侧超出
    if (x + menuRect.width > viewportWidth) {
      x = viewportWidth - menuRect.width - 10;
    }

    // 防止底部超出
    if (y + menuRect.height > viewportHeight) {
      y = viewportHeight - menuRect.height - 10;
    }

    // 防止左侧和顶部超出
    x = Math.max(10, x);
    y = Math.max(10, y);

    contextMenu.value.x = x;
    contextMenu.value.y = y;
  };

  // 处理菜单项点击
  const handleMenuClick = (item) => {
    if (item.disabled || item.type === 'divider') return;

    hideContextMenu();
    
    if (typeof item.action === 'function') {
      try {
        item.action();
      } catch (error) {
        console.error('Context menu action error:', error);
      }
    }
  };

  const setEnabled = (enabled) => {
    config.enabled = !!enabled;
    if (!config.enabled) {
      hideContextMenu();
    }
  };

  // 设置自定义菜单处理器
  const setCustomMenuHandler = (handler) => {
    if (typeof handler === 'function' || handler === null) {
      config.customMenuHandler = handler;
    } else {
      console.warn('customMenuHandler 必须是一个函数或 null');
    }
  };

  // 设置图形事件监听
  const setupGraphEvents = (graphInstance = null) => {
    const g = graphInstance || graph?.value || graph;
    if (!g || typeof g.on !== 'function') {
      console.warn('Graph instance is not ready for context menu setup');
      return;
    }

    // 节点右键
    g.on('node:contextmenu', ({ e, node }) => {
      console.log('node:contextmenu triggered', { e, node });
      e.preventDefault();
      showContextMenu(e.clientX, e.clientY, 'node', node);
    });

    // 边右键
    g.on('edge:contextmenu', ({ e, edge }) => {
      console.log('edge:contextmenu triggered', { e, edge });
      e.preventDefault();
      showContextMenu(e.clientX, e.clientY, 'edge', edge);
    });

    // 空白区域右键
    g.on('blank:contextmenu', ({ e }) => {
      console.log('blank:contextmenu triggered', { e });
      e.preventDefault();
      showContextMenu(e.clientX, e.clientY, 'blank');
    });

    // 点击空白/节点/边时隐藏菜单（忽略右键点击，避免刚打开就被关闭）
    g.on('blank:click', ({ e }) => {
      if (e && e.button === 2) return;
      hideContextMenu();
    });
    g.on('node:click', ({ e }) => {
      if (e && e.button === 2) return;
      hideContextMenu();
    });
    g.on('edge:click', ({ e }) => {
      if (e && e.button === 2) return;
      hideContextMenu();
    });
  };

  // 全局点击事件监听
  const handleGlobalClick = (e) => {
    // 右键（contextmenu）不触发隐藏，仅在左键单击空白处隐藏
    if (e.button === 2) return;
    // 打开菜单后的第一次 click（常在右键后立即发生）忽略
    if (lastOpenAt && Date.now() - lastOpenAt < 200) return;
    const menuEl = document.querySelector('.xflow-context-menu');
    if (menuEl && menuEl.contains(e.target)) return;
    hideContextMenu();
  };

  // 全局按键监听：允许 ESC 取消菜单
  const handleGlobalKeydown = (e) => {
    if (e.key === 'Escape') {
      hideContextMenu();
    }
  };

  // 初始化
  onMounted(() => {
    document.addEventListener('click', handleGlobalClick);
    document.addEventListener('keydown', handleGlobalKeydown, true);
  });

  // 清理
  onUnmounted(() => {
    document.removeEventListener('click', handleGlobalClick);
    document.removeEventListener('keydown', handleGlobalKeydown, true);
  });

  return {
    contextMenu: computed(() => contextMenu.value),
    showContextMenu,
    hideContextMenu,
    handleMenuClick,
    setEnabled,
    setClipboardHandler,
    setHistoryHandler,
    setSelectionHandler,
    setCustomMenuHandler, // 新增：设置自定义菜单处理器
    setupGraphEvents, // 允许手动设置事件
  };
}
