import PureRouterView from '@/components/ZXHL/comp/pure/ZxPureRouterView/index.vue'

// 评估任务管理一级菜单，任务管理 / 模版管理作为二级菜单项
export const evaluationRoutes = [
  {
    path: '',
    name: 'EvaluationManagement',
    meta: {
      title: '评估任务管理',
      icon: 'EditPen'
    },
    redirect: '/evaluation/evaluate/list',
    component: PureRouterView,
    children: [
      {
        path: 'evaluate/list',
        name: 'EvaluationList',
        meta: { title: '任务管理' },
        component: () => import('@/components/ZXHL/pages/evaluation/taskManagement/list.vue')
      },
      {
        path: 'evaluate/detail/:id',
        name: 'EvaluationDetail',
        meta: {
          routeKey: 'evaluationDetail',
          title: '评估详情',
          showInMenu: false
        },
        component: () => import('@/components/ZXHL/pages/evaluation/taskManagement/detail.vue')
      },
      {
        path: 'template/list',
        name: 'TemplateList',
        meta: { title: '模版管理' },
        component: () => import('@/components/ZXHL/pages/evaluation/templateManagement/Detail.vue')
      },
      {
        path: 'template/detail/:id',
        name: 'TemplateDetail',
        meta: {
          routeKey: 'templateDetail',
          title: '模版详情',
          showInMenu: false
        },
        component: () => import('@/components/ZXHL/pages/evaluation/templateManagement/Detail.vue')
      }
    ]
  }
]
