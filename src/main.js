import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// import VContextmenu from 'v-contextmenu'
// import 'v-contextmenu/dist/index.css'

import './style.css'
import './components/xflow-vue/src/styles/index.scss'
import App from './App.vue'

const app = createApp(App)

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
