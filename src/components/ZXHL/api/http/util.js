import { cloneDeep } from "lodash-es"
import { get } from "lodash-es"

/**
 * 检查值是否有效（不为null、undefined、空字符串）
 * @param {any} value - 要检查的值
 * @returns {boolean} 是否有效
 */
function isValue(value) {
  return value !== null && value !== undefined && value !== ''
}

/**
 * 标准化请求参数，将嵌套结构转换为扁平结构
 * @param {object} params - 原始参数对象
 * @returns {object} 标准化后的参数对象
 */
function normalizeParams(params) {
  const normalized = cloneDeep(params) || {}
  
  // Handle pagination parameters
  if (normalized.pager) {
    const { page, size } = normalized.pager
    if (isValue(page)) normalized.pageNumber = page
    if (isValue(size)) normalized.pageSize = size
    delete normalized.pager
  }
  
  // Handle query parameters and sorting
  if (normalized.query) {
    const { sortProp, sortOrder, ...restQuery } = normalized.query
    
    // Process sorting
    if (isValue(sortProp) && isValue(sortOrder)) {
      const orderMap = { ascending: 'asc', descending: 'desc' }
      normalized.col = sortProp
      normalized.order = orderMap[sortOrder] || sortOrder
    }
    
    // Merge remaining query parameters
    Object.assign(normalized, restQuery)
    delete normalized.query
  }

  // Clean up unnecessary fields
  delete normalized.total

  return normalized
}

/**
 * 序列化响应数据，标准化分页信息
 * @param {object} res - 响应对象
 * @returns {object} 序列化后的数据对象
 */
function serializeResponse(res) {
  // 修复数据路径，直接从 res.data 获取数据
  const data = get(res, 'data.data') || get(res, 'data') || {}
  const copyData = cloneDeep(data) || {}
  
  
  // 处理新格式的分页数据 (current, pages, records, size, total)
  const { current, pages, records, size, total, page, list } = copyData
  
  // 兼容新旧两种格式
  if ([current, size, total].some(v => isValue(v))) {
    // 新格式：使用 current, pages, records
    copyData.pager = { 
      page: current, 
      size, 
      total,
      pages 
    }

    // 如果有 records 字段，将其映射为 list 以保持向后兼容
    if (records && Array.isArray(records)) {
      copyData.list = records
      // 清理原始字段
      delete copyData.records
      delete copyData.current
      delete copyData.pages
    }
  } else if ([page, size, total].some(v => isValue(v))) {
    // 旧格式：使用 page, size, total
    copyData.pager = { page, size, total }
    // list 字段保持不变
  }

  // 清理多余的分页字段
  delete copyData.size
  delete copyData.total

  console.log('copyData', copyData)
  return copyData
}

// 导出工具函数
export { normalizeParams, serializeResponse, isValue }