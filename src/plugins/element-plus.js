import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import '@/assets/css/dark-blue-theme.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'

// Custom Element Plus configuration
export const elementPlusConfig = {
  locale: zhCn, // Default to Chinese, can be switched
  size: 'default', // default, large, small
  zIndex: 3000,
  namespace: 'el', // CSS namespace
}

// Install Element Plus plugin
export function setupElementPlus(app) {
  // Install Element Plus with configuration
  app.use(ElementPlus, elementPlusConfig)
  
  // Register all icons globally
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
}

// Locale switching utility
export function switchLocale(locale) {
  elementPlusConfig.locale = locale === 'en' ? en : zhCn
}

// Size switching utility 
export function switchSize(size) {
  elementPlusConfig.size = size
}

export { zhCn, en }