// 评估任务管理模块API
import ZXR from '../../http/index.js'

// 获取评估任务列表
export function getEvaluationList(params) {
  // 返回完整的后端响应结构（包含 code/message/data），以兼容现有页面逻辑
  return ZXR.get(
    {
      url: '/evaluation/list',
      params,
    }
  )
}

// 获取评估任务详情
export function getEvaluationDetail(id) {
  return ZXR.get({
  url: `/evaluation/detail/${id}`
  })
}

// 创建评估任务
export function createEvaluation(data) {
  return ZXR.post({
  url: '/evaluation/create',
    data
  })
}

// 更新评估任务
export function updateEvaluation(data) {
  return ZXR.put({
  url: '/evaluation/update',
    data
  })
}

// 删除评估任务
export function deleteEvaluation(id) {
  return ZXR.delete({
  url: `/evaluation/delete/${id}`
  })
}

// 批量删除评估任务
export function batchDeleteEvaluation(ids) {
  return ZXR.post({
  url: '/evaluation/batch-delete',
    data: { ids }
  })
}

// 启动评估任务
export function startEvaluation(id) {
  return ZXR.post({
  url: `/evaluation/start/${id}`
  })
}

// 停止评估任务
export function stopEvaluation(id) {
  return ZXR.post({
  url: `/evaluation/stop/${id}`
  })
}

// 获取评估任务状态
export function getEvaluationStatus(id) {
  return ZXR.get({
  url: `/evaluation/status/${id}`
  })
}

// 获取评估任务结果
export function getEvaluationResult(id) {
  return ZXR.get({
  url: `/evaluation/result/${id}`
  })
}

// 导出评估任务结果
export function exportEvaluationResult(id) {
  return ZXR.get({
  url: `/evaluation/export/${id}`,
    responseType: 'blob'
  })
}

// 获取评估任务统计信息
export function getEvaluationStatistics(params) {
  return ZXR.get({
  url: '/evaluation/statistics',
    params
  })
}

// 默认导出所有API
export const evaluationApi = {
  getEvaluationList,
  getEvaluationDetail,
  createEvaluation,
  updateEvaluation,
  deleteEvaluation,
  batchDeleteEvaluation,
  startEvaluation,
  stopEvaluation,
  getEvaluationStatus,
  getEvaluationResult,
  exportEvaluationResult,
  getEvaluationStatistics
}

export default evaluationApi