/**
 * 计算树形结构的最大深度
 * @param {Array} arr - 节点数组
 * @param {number} depth - 当前深度
 * @returns {number} 最大深度
 */
export function calculateMaxDepth(arr, depth = 1) {
  if (!arr || arr.length === 0) {
    return depth;
  }

  let maxDepth = depth;
  arr.forEach((item) => {
    if (item.children && item.children.length > 0) {
      const childDepth = calculateMaxDepth(item.children, depth + 1);
      maxDepth = Math.max(maxDepth, childDepth);
    }
  });

  return maxDepth;
}

/**
 * 工具函数集合
 */

/**
 * 生成唯一ID
 * @param {string} prefix - ID前缀
 * @returns {string} 唯一ID
 */
export function getGenerateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 生成UUID
 * @returns {string} UUID字符串
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * 判断字符串是否为有效的JSON格式
 * @param {string} str - 要检查的字符串
 * @returns {boolean} 是否为有效JSON
 */
export function isJson(str) {
  if (typeof str !== 'string') {
    return false
  }
  
  try {
    const parsed = JSON.parse(str)
    // 确保解析结果是对象或数组
    return typeof parsed === 'object' && parsed !== null
  } catch (error) {
    return false
  }
}

/**
 * 判断数据是否为有效的JSON数据（支持字符串和对象）
 * @param {any} data - 要检查的数据
 * @returns {boolean} 是否为有效JSON数据
 */
export function isValidJsonData(data) {
  if (!data) {
    return false
  }
  
  // 如果已经是对象或数组，直接返回true
  if (typeof data === 'object' && data !== null) {
    return true
  }
  
  // 如果是字符串，尝试解析
  if (typeof data === 'string') {
    return isJson(data)
  }
  
  return false
}

// 导出图表数据处理工具
export * from './evaluationDataProcessor.js'