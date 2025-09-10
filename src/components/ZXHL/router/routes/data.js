export const dataRoutes = [
  {
    path: 'management',
    name: 'DataManagement',
    meta: { title: '数据管理' },
    component: () => import('@/components/ZXHL/pages/data/management/index.vue')
  },
  {
    path: 'import',
    name: 'DataImport',
    meta: { title: '数据导入' },
    component: () => import('@/components/ZXHL/pages/data/import/index.vue')
  },
  {
    path: 'export',
    name: 'DataExport',
    meta: { title: '数据导出' },
    component: () => import('@/components/ZXHL/pages/data/export/index.vue')
  }
]