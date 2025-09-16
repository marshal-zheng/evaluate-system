import Component from './index.vue'
import './service.js' // 导入服务文件以执行全局变量设置

// 从全局变量获取服务（Vue SFC 不支持命名导出）
const getService = () => window.__ZxConfirmInputService

Component.install = (app) => {
  app.component('ZxConfirmInput', Component)
  
  // 等待组件加载完成后获取服务
  setTimeout(() => {
    const serviceExports = getService()
    if (serviceExports) {
      // 设置宿主应用上下文，供服务式调用使用
      serviceExports.setHostAppContext(app._context)
      
      // 注册全局属性
      app.config.globalProperties.$confirmInput = serviceExports.service
      
      // 提供注入
      app.provide('$confirmInput', serviceExports.service)
      
      // 将服务添加到组件上，便于外部访问
      Component.service = serviceExports.service
      Component.createConfirmInput = serviceExports.createConfirmInput
      Component.danger = serviceExports.danger
      Component.warning = serviceExports.warning
      Component.info = serviceExports.info
      
      console.log('✅ ZxConfirmInput 组件和服务已注册，可使用 $confirmInput')
    }
  }, 0)
}

export default Component
