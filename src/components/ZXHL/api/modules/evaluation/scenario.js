// 评估场景API
import ZXR from '../../http/index.js'

// 获取场景列表
export function getScenarioList(params) {
  return ZXR.get({
    url: '/api/evaluation/scenarios/list',
    params
  })
}

// 获取场景详情
export function getScenarioDetail(id) {
  return ZXR.get({
    url: `/api/evaluation/scenarios/detail/${id}`
  })
}

// 创建场景
export function createScenario(data) {
  return ZXR.post({
    url: '/api/evaluation/scenarios/create',
    data
  })
}

// 更新场景
export function updateScenario(data) {
  return ZXR.put({
    url: '/api/evaluation/scenarios/update',
    data
  })
}

// 删除场景
export function deleteScenario(id) {
  return ZXR.delete({
    url: `/api/evaluation/scenarios/delete/${id}`
  })
}

// 批量删除场景
export function batchDeleteScenarios(ids) {
  return ZXR.post({
    url: '/api/evaluation/scenarios/batch-delete',
    data: { ids }
  })
}

// 复制场景
export function copyScenario(id) {
  return ZXR.post({
    url: `/api/evaluation/scenarios/copy/${id}`
  })
}

// 执行场景
export function executeScenario(id, data) {
  return ZXR.post({
    url: `/api/evaluation/scenarios/execute/${id}`,
    data
  })
}

// 批量执行场景
export function batchExecuteScenarios(data) {
  return ZXR.post({
    url: '/api/evaluation/scenarios/batch-execute',
    data
  })
}

// 停止场景执行
export function stopScenarioExecution(id) {
  return ZXR.post({
    url: `/api/evaluation/scenarios/stop/${id}`
  })
}

// 获取场景执行状态
export function getScenarioExecutionStatus(id) {
  return ZXR.get({
    url: `/api/evaluation/scenarios/status/${id}`
  })
}

// 获取场景执行历史
export function getScenarioExecutionHistory(id, params) {
  return ZXR.get({
    url: `/api/evaluation/scenarios/history/${id}`,
    params
  })
}

// 获取场景步骤
export function getScenarioSteps(id) {
  return ZXR.get({
    url: `/api/evaluation/scenarios/steps/${id}`
  })
}

// 添加场景步骤
export function addScenarioStep(data) {
  return ZXR.post({
    url: '/api/evaluation/scenarios/steps/add',
    data
  })
}

// 更新场景步骤
export function updateScenarioStep(data) {
  return ZXR.put({
    url: '/api/evaluation/scenarios/steps/update',
    data
  })
}

// 删除场景步骤
export function deleteScenarioStep(id) {
  return ZXR.delete({
    url: `/api/evaluation/scenarios/steps/delete/${id}`
  })
}

// 调整场景步骤顺序
export function sortScenarioSteps(data) {
  return ZXR.post({
    url: '/api/evaluation/scenarios/steps/sort',
    data
  })
}

// 获取场景变量
export function getScenarioVariables(id) {
  return ZXR.get({
    url: `/api/evaluation/scenarios/variables/${id}`
  })
}

// 更新场景变量
export function updateScenarioVariables(data) {
  return ZXR.put({
    url: '/api/evaluation/scenarios/variables/update',
    data
  })
}

// 验证场景配置
export function validateScenario(data) {
  return ZXR.post({
    url: '/api/evaluation/scenarios/validate',
    data
  })
}

// 导入场景
export function importScenario(file) {
  const formData = new FormData()
  formData.append('file', file)
  
  return ZXR.upload({
    url: '/api/evaluation/scenarios/import',
    data: formData
  })
}

// 导出场景
export function exportScenario(id) {
  return ZXR.get({
    url: `/api/evaluation/scenarios/export/${id}`,
    responseType: 'blob'
  })
}

// 批量导出场景
export function batchExportScenarios(ids) {
  return ZXR.post({
    url: '/api/evaluation/scenarios/batch-export',
    data: { ids },
    responseType: 'blob'
  })
}

// 获取场景模板
export function getScenarioTemplates(params) {
  return ZXR.get({
    url: '/api/evaluation/scenarios/templates',
    params
  })
}

// 从模板创建场景
export function createScenarioFromTemplate(templateId, data) {
  return ZXR.post({
    url: `/api/evaluation/scenarios/from-template/${templateId}`,
    data
  })
}

export default {
  getScenarioList,
  getScenarioDetail,
  createScenario,
  updateScenario,
  deleteScenario,
  batchDeleteScenarios,
  copyScenario,
  executeScenario,
  batchExecuteScenarios,
  stopScenarioExecution,
  getScenarioExecutionStatus,
  getScenarioExecutionHistory,
  getScenarioSteps,
  addScenarioStep,
  updateScenarioStep,
  deleteScenarioStep,
  sortScenarioSteps,
  getScenarioVariables,
  updateScenarioVariables,
  validateScenario,
  importScenario,
  exportScenario,
  batchExportScenarios,
  getScenarioTemplates,
  createScenarioFromTemplate
}