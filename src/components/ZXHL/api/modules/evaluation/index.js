// 评估任务管理模块API
import ZXR from '../../http/index.js'

// 获取评估结果数据（基础接口）
export function getEvaluationResultData(params) {
  return ZXR.get({
    url: '/evaluation/result',
    params
  })
}

// 根据ID获取评估结果数据
export function getEvaluationResultById(id, params = {}) {
  return ZXR.get({
    url: `/evaluation/result/${id}`,
    params: { id }
  })
}

// 获取评估列表数据
export function getEvaluationList(params = {}) {
  return ZXR.get({
    url: '/evaluation/list',
    params
  })
}

export const evaluationApi = {
  getEvaluationResultData,
  getEvaluationResultById,
  getEvaluationList
}