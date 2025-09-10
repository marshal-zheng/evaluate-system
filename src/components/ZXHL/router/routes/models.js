export const modelsRoutes = [
  {
    path: 'config',
    name: 'ModelsConfig',
    meta: { title: '模型配置' },
    component: () => import('@/components/ZXHL/pages/models/config/index.vue')
  },
  {
    path: 'algorithm',
    name: 'ModelsAlgorithm',
    meta: { title: '算法管理' },
    component: () => import('@/components/ZXHL/pages/models/algorithm/index.vue')
  },
  {
    path: 'validation',
    name: 'ModelsValidation',
    meta: { title: '模型验证' },
    component: () => import('@/components/ZXHL/pages/models/validation/index.vue')
  }
]