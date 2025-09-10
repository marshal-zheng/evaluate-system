// 评估任务管理API
import ZXR from '../../http/index.js'

// 模块管理
export function getModuleTree(params) {
  return ZXR.get({
    url: '/api/evaluation/modules/tree',
    params
  })
}

export function addModule(data) {
  return ZXR.post({
    url: '/api/evaluation/modules/add',
    data
  })
}

export function updateModule(data) {
  return ZXR.put({
    url: '/api/evaluation/modules/update',
    data
  })
}

export function deleteModule(id) {
  return ZXR.delete({
    url: `/api/evaluation/modules/delete/${id}`
  })
}

export function moveModule(data) {
  return ZXR.post({
    url: '/api/evaluation/modules/move',
    data
  })
}

// 任务管理
export function getTaskPage(params) {
  return ZXR.get({
    url: '/api/evaluation/tasks/page',
    params
  })
}

export function addTask(data) {
  return ZXR.post({
    url: '/api/evaluation/tasks/add',
    data
  })
}

export function updateTask(data) {
  return ZXR.put({
    url: '/api/evaluation/tasks/update',
    data
  })
}

export function deleteTask(id) {
  return ZXR.delete({
    url: `/api/evaluation/tasks/delete/${id}`
  })
}

export function batchDeleteTasks(data) {
  return ZXR.post({
    url: '/api/evaluation/tasks/batch-delete',
    data
  })
}

export function batchUpdateTasks(data) {
  return ZXR.post({
    url: '/api/evaluation/tasks/batch-update',
    data
  })
}

export function copyTask(id) {
  return ZXR.post({
    url: `/api/evaluation/tasks/copy/${id}`
  })
}

export function moveTask(data) {
  return ZXR.post({
    url: '/api/evaluation/tasks/move',
    data
  })
}

// 任务执行
export function executeTask(id, data) {
  return ZXR.post({
    url: `/api/evaluation/tasks/execute/${id}`,
    data
  })
}

export function batchExecuteTasks(data) {
  return ZXR.post({
    url: '/api/evaluation/tasks/batch-execute',
    data
  })
}

export function stopTaskExecution(id) {
  return ZXR.post({
    url: `/api/evaluation/tasks/stop/${id}`
  })
}

export function getTaskExecutionStatus(id) {
  return ZXR.get({
    url: `/api/evaluation/tasks/status/${id}`
  })
}

// 任务调度
export function createTaskSchedule(data) {
  return ZXR.post({
    url: '/api/evaluation/tasks/schedule/create',
    data
  })
}

export function updateTaskSchedule(data) {
  return ZXR.put({
    url: '/api/evaluation/tasks/schedule/update',
    data
  })
}

export function deleteTaskSchedule(id) {
  return ZXR.delete({
    url: `/api/evaluation/tasks/schedule/delete/${id}`
  })
}

export function getTaskSchedule(id) {
  return ZXR.get({
    url: `/api/evaluation/tasks/schedule/${id}`
  })
}

export function switchTaskSchedule(id) {
  return ZXR.post({
    url: `/api/evaluation/tasks/schedule/switch/${id}`
  })
}

// 报告管理
export function getReportPage(params) {
  return ZXR.get({
    url: '/api/evaluation/reports/page',
    params
  })
}

export function getReportDetail(id) {
  return ZXR.get({
    url: `/api/evaluation/reports/detail/${id}`
  })
}

export function deleteReport(id) {
  return ZXR.delete({
    url: `/api/evaluation/reports/delete/${id}`
  })
}

export function batchDeleteReports(data) {
  return ZXR.post({
    url: '/api/evaluation/reports/batch-delete',
    data
  })
}

export function exportReport(id, format) {
  return ZXR.get({
    url: `/api/evaluation/reports/export/${id}`,
    params: { format },
    responseType: 'blob'
  })
}

// 文件管理
export function uploadFile(file, taskId) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('taskId', taskId)
  
  return ZXR.upload({
    url: '/api/evaluation/files/upload',
    data: formData
  })
}

export function deleteFile(id) {
  return ZXR.delete({
    url: `/api/evaluation/files/delete/${id}`
  })
}

export function downloadFile(id) {
  return ZXR.get({
    url: `/api/evaluation/files/download/${id}`,
    responseType: 'blob'
  })
}

export default {
  // 模块管理
  getModuleTree,
  addModule,
  updateModule,
  deleteModule,
  moveModule,
  
  // 任务管理
  getTaskPage,
  addTask,
  updateTask,
  deleteTask,
  batchDeleteTasks,
  batchUpdateTasks,
  copyTask,
  moveTask,
  
  // 任务执行
  executeTask,
  batchExecuteTasks,
  stopTaskExecution,
  getTaskExecutionStatus,
  
  // 任务调度
  createTaskSchedule,
  updateTaskSchedule,
  deleteTaskSchedule,
  getTaskSchedule,
  switchTaskSchedule,
  
  // 报告管理
  getReportPage,
  getReportDetail,
  deleteReport,
  batchDeleteReports,
  exportReport,
  
  // 文件管理
  uploadFile,
  deleteFile,
  downloadFile
}