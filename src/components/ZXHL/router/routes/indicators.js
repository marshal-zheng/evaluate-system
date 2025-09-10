export const indicatorsRoutes = [
  {
    path: 'config',
    name: 'IndicatorsConfig',
    meta: { title: '指标配置' },
    component: () => import('@/components/ZXHL/pages/indicators/config/index.vue')
  },
  {
    path: 'weight',
    name: 'IndicatorsWeight',
    meta: { title: '权重设置' },
    component: () => import('@/components/ZXHL/pages/indicators/weight/index.vue')
  },
  {
    path: 'template',
    name: 'IndicatorsTemplate',
    meta: { title: '模板管理' },
    component: () => import('@/components/ZXHL/pages/indicators/template/index.vue')
  }
]