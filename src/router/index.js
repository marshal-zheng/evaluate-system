import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'
import { businessRoutes } from '@/components/ZXHL/router'

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
      // ZxSearch 组件演示页面
      {
        path: '/search-demo',
        name: 'SearchDemo',
        component: () => import('@/views/search-demo.vue'),
        meta: {
          title: 'ZxSearch 组件演示'
        }
      },
      // ZxIcon 组件演示页面
      {
          path: '/icon-demo',
          name: 'IconDemo',
          component: () => import('@/views/icon-demo.vue'),
          meta: {
            title: 'ZxIcon 组件演示'
          }
        },
        {
          path: '/pure-components-demo',
          name: 'PureComponentsDemo',
          component: () => import('@/views/pure-components-demo.vue'),
          meta: {
            title: 'Pure 组件统一注册演示'
          }
        }
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