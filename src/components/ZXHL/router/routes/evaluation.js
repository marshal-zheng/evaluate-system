import PureRouterView from '@/components/ZXHL/comp/pure/ZxPureRouterView/index.vue'
export const evaluationRoutes = [
  {
    path: 'evaluate',
    name: 'EvaluationOverview',
    meta: { 
      title: '评估任务管理',
      icon: 'EditPen'
    },
    redirect: 'list',
    component: PureRouterView,
    children: [{
      path: 'list',
      name: 'EvaluationList',
      meta: { 
        title: '任务管理',
      },
      component: () => import('@/components/ZXHL/pages/evaluation/list.vue')
    }, {
      path: 'detail/:id',
      name: 'EvaluationDetail',
      meta: {
        routeKey: 'evaluationDetail',
        title: '评估详情',
        showInMenu: false
      },
      component: () => import('@/components/ZXHL/pages/evaluation/detail.vue')
    }]
  }
]