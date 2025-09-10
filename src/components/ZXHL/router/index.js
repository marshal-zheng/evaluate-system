// 导入评估管理模块的路由配置
import { evaluationRoutes } from './routes/evaluation.js'
import Layout from '@/layout/index.vue'

// 整合所有业务路由
export const businessRoutes = evaluationRoutes.map(route => ({
  ...route,
  path: `/evaluation/${route.path}`
}))

// 导出路由模块
export {
  evaluationRoutes
}