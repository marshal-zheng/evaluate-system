// 导入评估任务管理模块的路由配置
import { evaluationRoutes } from './routes/evaluation.js'
// 导入系统管理模块的路由配置
import { systemManagementRoutes } from './routes/systemManagement.js'
import Layout from '@/layout/index.vue'

// 整合评估业务路由: 为每个一级路由加上统一前缀 /evaluation
const evaluationBusinessRoutes = evaluationRoutes.map(route => {
  const prefixedPath = `/evaluation/${route.path}`
  // 若 redirect 是相对子路径，转成绝对路径；若本身以 / 开头则保持
  let redirect = route.redirect
  if (redirect && !redirect.startsWith('/')) {
    redirect = `${prefixedPath.replace(/\/$/, '')}/${redirect.replace(/^\//, '')}`
  }
  return {
    ...route,
    path: prefixedPath,
    redirect
  }
})

// 整合系统管理路由: 为每个一级路由加上统一前缀 /system
const systemBusinessRoutes = systemManagementRoutes.map(route => {
  const prefixedPath = `/system/${route.path}`
  // 若 redirect 是相对子路径，转成绝对路径；若本身以 / 开头则保持
  let redirect = route.redirect
  if (redirect && !redirect.startsWith('/')) {
    redirect = `${prefixedPath.replace(/\/$/, '')}/${redirect.replace(/^\//, '')}`
  }
  return {
    ...route,
    path: prefixedPath,
    redirect
  }
})

// 合并所有业务路由
export const businessRoutes = [
  ...evaluationBusinessRoutes,
  ...systemBusinessRoutes
]

// 导出路由模块
export {
  evaluationRoutes,
  systemManagementRoutes
}