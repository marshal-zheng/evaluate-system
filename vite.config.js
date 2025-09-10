import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import legacy from '@vitejs/plugin-legacy'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { viteMockServe } from 'vite-plugin-mock'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'zhpg',
    target: 'chrome 50, edge 50, firefox 50',
  },
  plugins: [
    vue(),
    legacy({
      targets: ['chrome 80', 'edge 80', 'firefox 50']
    }),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue', 'vue-router'],
      dts: true, // Generate type definitions
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: true, // Generate type definitions
    }),
    viteMockServe({
      mockPath: 'mock',
      localEnabled: true,
      prodEnabled: false,
      logger: true
    }),
  ],
  base: './',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'views': fileURLToPath(new URL('./src/views', import.meta.url)),
      'assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
      'components': fileURLToPath(new URL('./src/components', import.meta.url)),
      'stores': fileURLToPath(new URL('./src/stores', import.meta.url)),
      'utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      'http': fileURLToPath(new URL('./src/http', import.meta.url)),
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@use "@/assets/css/custom.scss" as *;'
      }
    }
  },
  server: {
    host: '0.0.0.0',
    // 开发环境使用Mock数据，注释掉代理配置
    // proxy: {
    //   '/api': {
    //     target: 'http://10.7.7.81:7999',
    //     rewrite: (path) => path.replace(/^/api/, '/'),
    //   }
    // }
  }
})