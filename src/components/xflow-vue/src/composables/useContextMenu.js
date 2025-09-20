import { getCurrentInstance } from 'vue';
import { useGraphInstance } from './useGraphInstance';
import { useGraphEvent } from './useGraphEvent';

export function useContextMenu() {
  const graph = useGraphInstance();
  const instance = getCurrentInstance();
  
  // 显示上下文菜单
  const showContextMenu = (x, y, menuItems) => {
    if (instance && instance.appContext.app.config.globalProperties.$contextmenu) {
      instance.appContext.app.config.globalProperties.$contextmenu({
        x,
        y,
        items: menuItems,
      });
    }
  };
  
  // 设置节点上下文菜单
  const setupNodeContextMenu = (menuItemsOrFactory) => {
    useGraphEvent('node:contextmenu', ({ e, node }) => {
      e.preventDefault();
      
      const menuItems = typeof menuItemsOrFactory === 'function' 
        ? menuItemsOrFactory(node) 
        : menuItemsOrFactory;
      
      showContextMenu(e.clientX, e.clientY, menuItems);
    });
  };
  
  // 设置边上下文菜单
  const setupEdgeContextMenu = (menuItemsOrFactory) => {
    useGraphEvent('edge:contextmenu', ({ e, edge }) => {
      e.preventDefault();
      
      const menuItems = typeof menuItemsOrFactory === 'function' 
        ? menuItemsOrFactory(edge) 
        : menuItemsOrFactory;
      
      showContextMenu(e.clientX, e.clientY, menuItems);
    });
  };
  
  // 设置空白区域上下文菜单
  const setupBlankContextMenu = (menuItemsOrFactory) => {
    useGraphEvent('blank:contextmenu', ({ e }) => {
      e.preventDefault();
      
      const menuItems = typeof menuItemsOrFactory === 'function' 
        ? menuItemsOrFactory() 
        : menuItemsOrFactory;
      
      showContextMenu(e.clientX, e.clientY, menuItems);
    });
  };
  
  // 创建标准菜单项
  const createMenuItem = (label, action, options = {}) => ({
    label,
    action,
    disabled: options.disabled || false,
    divided: options.divided || false,
    icon: options.icon,
    children: options.children,
    ...options,
  });
  
  // 创建分隔线
  const createDivider = () => ({
    divided: true,
  });
  
  return {
    showContextMenu,
    setupNodeContextMenu,
    setupEdgeContextMenu,
    setupBlankContextMenu,
    createMenuItem,
    createDivider,
  };
}
