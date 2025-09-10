import { createApp } from 'vue'
import './style.css'
import './assets/css/element-plus-theme.css'
import './components/ZXHL/styles/index.scss'
import App from './App.vue'
import router from './router'

// Element Plus setup
import { setupElementPlus } from './plugins/element-plus.js'

// Theme setup
import { initTheme } from './utils/theme.js'

// Create app
const app = createApp(App)

// Setup Element Plus
setupElementPlus(app)

// Setup Router
app.use(router)

// Initialize theme
initTheme()

app.mount('#app')
