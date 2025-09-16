// ZxCollapsibleContainer 可折叠容器组件导出文件
// 支持展开收起的侧边容器组件，具有状态指示和平滑动画效果

import ZxCollapsibleContainer from './index.vue'

// 导出组件
export default ZxCollapsibleContainer

// 组件安装函数（用于全局注册）
ZxCollapsibleContainer.install = function(app) {
  app.component('ZxCollapsibleContainer', ZxCollapsibleContainer)
}