import { AppEventImpl } from './types.js'

const typeList = new Set()

/**
 * 事件工厂函数
 * 创建应用事件对象，确保事件名称的唯一性
 * @param {string} name - 事件名称
 * @returns {Object} 应用事件对象
 */
export function eventFactory(name) {
  if (typeList.has(name)) {
    throw new Error(`There is already an event defined with type '${name}'`)
  }

  typeList.add(name)
  return { name }
}

/**
 * 创建带载荷的事件
 * @param {string} name - 事件名称
 * @param {*} payload - 事件载荷
 * @returns {Object} 应用事件对象
 */
export function createEventWithPayload(name, payload) {
  const event = eventFactory(name)
  return new AppEventImpl(event.name, payload)
}

/**
 * 重置事件类型列表（主要用于测试）
 */
export function resetEventTypes() {
  typeList.clear()
}

/**
 * 检查事件类型是否已存在
 * @param {string} name - 事件名称
 * @returns {boolean} 是否存在
 */
export function hasEventType(name) {
  return typeList.has(name)
}

/**
 * 获取所有已注册的事件类型
 * @returns {Array} 事件类型数组
 */
export function getAllEventTypes() {
  return Array.from(typeList)
}