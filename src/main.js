import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// import VContextmenu from 'v-contextmenu'
// import 'v-contextmenu/dist/index.css'

import './style.css'
import './assets/css/element-plus-theme.css'
import './assets/icon-font/iconfont.css'
import './components/ZXHL/styles/index.scss'
import './components/xflow-vue/src/styles/index.scss'
import App from './App.vue'
import router from './router'

// 导入 SVG icons
import 'virtual:svg-icons-register'

// Element Plus setup
import { setupElementPlus } from './plugins/element-plus.js'

// Pure Components setup
import { setupPureComponents } from './plugins/pure-components.js'

// Theme setup
import { initTheme } from './utils/theme.js'

// Create app
const app = createApp(App)

// Setup Element Plus
setupElementPlus(app)

// Setup Pure Components
setupPureComponents(app)

// Setup Router
app.use(router)

// Initialize theme
initTheme()

// 配置 Pinia
const pinia = createPinia()
app.use(pinia)

// 配置 Element Plus
app.use(ElementPlus)

// 注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 配置右键菜单
// app.use(VContextmenu)

app.mount('#app')
