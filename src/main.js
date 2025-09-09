import { createApp } from 'vue'
import './style.css'
import './assets/css/element-plus-theme.css'
import App from './App.vue'

// Element Plus setup
import { setupElementPlus } from './plugins/element-plus.js'

// Create app
const app = createApp(App)

// Setup Element Plus
setupElementPlus(app)

app.mount('#app')
