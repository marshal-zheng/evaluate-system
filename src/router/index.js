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
      {
        path: '/test/edit-pane',
        name: 'EditPaneTest',
        meta: { 
          title: 'EditPane 测试',
          showInMenu: false
        },
        component: () => import('@/views/panel-edit-test.vue')
      },
      {
        path: '/test/table-widget',
        name: 'TableWidgetTest',
        meta: { 
          title: 'TableWidget 测试',
          showInMenu: false
        },
        component: () => import('@/views/table-widget-test.vue')
      },
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