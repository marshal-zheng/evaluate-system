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