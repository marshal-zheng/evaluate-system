import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'
import { businessRoutes } from '@/components/ZXHL/router'
import { componentRoutes } from '@/components/ZXHL/router/routes/components.js'

// 路由配置 - 使用模块化的业务路由配置
const routes = [
  {
    path: '/',
    redirect: '/evaluation/evaluate/list'
  },
  {
    path: '/',
    component: Layout,
    children: [
      ...businessRoutes,
      // 组件演示路由
      ...componentRoutes.map(route => ({
        ...route,
        path: `/demo/${route.path}`
      })),
      // 保留的测试页面已移除
    ]
  },
  // 404 页面路由 - 必须放在最后
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/404.vue')
  }
]


const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

// 导出路由配置供其他组件使用
export { routes }