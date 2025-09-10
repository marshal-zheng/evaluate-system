/**
 * V2 API工具函数
 * 处理v2版本API的请求和响应数据转换
 */
import { cloneDeep, get, set, snakeCase } from 'lodash-es'

/**
 * 处理V2性能相关请求
 * @param {object} config - axios配置对象
 * @returns {object} 处理后的配置
 */
export function handleV2PerformanceRequest(config) {
  // 对于 performance/save 和 performance/edit 接口，检查是否是FormData
  if (config.url && (config.url.includes('/performance/save') || config.url.includes('/performance/edit'))) {
    const configCopy = cloneDeep(config)
    return configCopy
  }

  // 如果不是v2接口或没有数据，直接返回
  if (!config.url?.includes('/v2') || !config.data) {
    return config
  }

  const configCopy = { ...config }
  
  // 处理排序参数
  if (configCopy.data.sort) {
    configCopy.data.orders = Object.keys(configCopy.data.sort).map((key) => ({
      name: snakeCase(key),
      type: configCopy.data.sort[key],
    }))
    delete configCopy.data.sort
  }

  // 处理过滤参数
  if (configCopy.data.filter) {
    configCopy.data.filters = configCopy.data.filter
    delete configCopy.data.filter
  }
  
  // 处理名称参数
  if (!configCopy.data.name) {
    set(configCopy, 'data.name', configCopy.data?.keyword || '')
    Reflect.deleteProperty(configCopy.data, 'keyword')
  }
  
  return configCopy
}

/**
 * 处理V2性能相关响应
 * @param {object} res - axios响应对象
 * @returns {object} 处理后的响应
 */
export function handleV2PerformanceResponse(res) {
  // 如果不是v2接口，直接返回
  if (!res.config.url?.includes('/v2')) {
    return res
  }

  const resCopy = { ...res }
  const data = get(resCopy, 'data.data', {})

  if (data?.listObject) {
    const urlArr = res.config.url.split('/')
    const pageSize = +urlArr.slice(-2, -1)
    const pageIndex = +urlArr.slice(-1)
    
    // 处理分页数据
    set(resCopy, 'data.data.list', data.listObject)
    set(resCopy, 'data.data.total', data.totalCount || 0)
    set(resCopy, 'data.data.pageSize', pageSize || 10)
    set(resCopy, 'data.data.pageIndex', pageIndex || 1)
    
    // 删除原始字段
    Reflect.deleteProperty(data, 'listObject')
    Reflect.deleteProperty(data, 'totalCount')
  }

  return resCopy
}