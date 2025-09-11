/**
 * Pure 组件全局注册插件
 * 提供统一的组件注册方式
 */

import PureComponents from '@/components/ZXHL/comp/pure'

/**
 * 安装 Pure 组件库
 * @param {App} app Vue 应用实例
 */
export function setupPureComponents(app) {
  // 使用统一的 install 方法注册所有 Pure 组件
  app.use(PureComponents)
}

/**
 * 按需注册单个组件的示例
 * @param {App} app Vue 应用实例
 * @param {Array} componentNames 要注册的组件名称数组
 */
export function setupPureComponentsSelective(app, componentNames = []) {
  const { 
    ZxIcon, 
    ZxSearch, 
    ZxSelect, 
    ZxTooltipOrPopover, 
    ZxPureRouterView 
  } = PureComponents
  
  const componentMap = {
    ZxIcon,
    ZxSearch,
    ZxSelect,
    ZxTooltipOrPopover,
    ZxPureRouterView
  }
  
  componentNames.forEach(name => {
    const component = componentMap[name]
    if (component) {
      if (component.install) {
        app.use(component)
      } else {
        app.component(name, component)
      }
      console.log(`✅ ${name} 组件已注册`)
    } else {
      console.warn(`⚠️ 组件 ${name} 不存在`)
    }
  })
}

export default {
  setupPureComponents,
  setupPureComponentsSelective
}