// 指标体系设计模块API
import ZXR from '../../http/index.js'

// 获取指标体系设计选项
export function getIndicatorSystemOptions() {
  return ZXR.get({
    url: '/indicator/system/options'
  })
}

// 获取指标体系详情
export function getIndicatorSystemById(id) {
  return ZXR.get({
    url: `/indicator/system/${id}`
  })
}

// 获取指标体系列表
export function getIndicatorSystemList(params = {}) {
  return ZXR.get({
    url: '/indicator/system/list',
    params
  })
}

export const indicatorApi = {
  getIndicatorSystemOptions,
  getIndicatorSystemById,
  getIndicatorSystemList
}