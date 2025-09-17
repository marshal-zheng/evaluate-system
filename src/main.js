import { createApp } from 'vue'
import './style.css'
import './assets/css/element-plus-theme.css'
import './assets/icon-font/iconfont.css'
import './components/ZXHL/styles/index.scss'
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

app.mount('#app')
