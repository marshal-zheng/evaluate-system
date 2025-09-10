// 评估报告API
import ZXR from '../../http/index.js'

// 获取报告列表
export function getReportList(params) {
  return ZXR.get({
    url: '/api/evaluation/reports/list',
    params
  })
}

// 获取报告详情
export function getReportDetail(id) {
  return ZXR.get({
    url: `/api/evaluation/reports/detail/${id}`
  })
}

// 生成报告
export function generateReport(data) {
  return ZXR.post({
    url: '/api/evaluation/reports/generate',
    data
  })
}

// 更新报告
export function updateReport(data) {
  return ZXR.put({
    url: '/api/evaluation/reports/update',
    data
  })
}

// 删除报告
export function deleteReport(id) {
  return ZXR.delete({
    url: `/api/evaluation/reports/delete/${id}`
  })
}

// 批量删除报告
export function batchDeleteReports(ids) {
  return ZXR.post({
    url: '/api/evaluation/reports/batch-delete',
    data: { ids }
  })
}

// 导出报告
export function exportReport(id, format = 'pdf') {
  return ZXR.get({
    url: `/api/evaluation/reports/export/${id}`,
    params: { format },
    responseType: 'blob'
  })
}

// 批量导出报告
export function batchExportReports(ids, format = 'pdf') {
  return ZXR.post({
    url: '/api/evaluation/reports/batch-export',
    data: { ids, format },
    responseType: 'blob'
  })
}

// 分享报告
export function shareReport(id, data) {
  return ZXR.post({
    url: `/api/evaluation/reports/share/${id}`,
    data
  })
}

// 获取分享链接
export function getShareLink(id) {
  return ZXR.get({
    url: `/api/evaluation/reports/share-link/${id}`
  })
}

// 取消分享
export function cancelShare(id) {
  return ZXR.delete({
    url: `/api/evaluation/reports/share/${id}`
  })
}

// 获取报告统计数据
export function getReportStatistics(params) {
  return ZXR.get({
    url: '/api/evaluation/reports/statistics',
    params
  })
}

// 获取报告图表数据
export function getReportChartData(id, chartType) {
  return ZXR.get({
    url: `/api/evaluation/reports/chart/${id}`,
    params: { chartType }
  })
}

// 获取报告对比数据
export function getReportComparison(ids) {
  return ZXR.post({
    url: '/api/evaluation/reports/comparison',
    data: { ids }
  })
}

// 获取报告模板
export function getReportTemplates(params) {
  return ZXR.get({
    url: '/api/evaluation/reports/templates',
    params
  })
}

// 创建报告模板
export function createReportTemplate(data) {
  return ZXR.post({
    url: '/api/evaluation/reports/templates/create',
    data
  })
}

// 更新报告模板
export function updateReportTemplate(data) {
  return ZXR.put({
    url: '/api/evaluation/reports/templates/update',
    data
  })
}

// 删除报告模板
export function deleteReportTemplate(id) {
  return ZXR.delete({
    url: `/api/evaluation/reports/templates/delete/${id}`
  })
}

// 预览报告
export function previewReport(data) {
  return ZXR.post({
    url: '/api/evaluation/reports/preview',
    data
  })
}

export default {
  getReportList,
  getReportDetail,
  generateReport,
  updateReport,
  deleteReport,
  batchDeleteReports,
  exportReport,
  batchExportReports,
  shareReport,
  getShareLink,
  cancelShare,
  getReportStatistics,
  getReportChartData,
  getReportComparison,
  getReportTemplates,
  createReportTemplate,
  updateReportTemplate,
  deleteReportTemplate,
  previewReport
}