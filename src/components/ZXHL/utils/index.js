/**
 * 计算树形结构的最大深度
 * @param {Array} arr - 节点数组
 * @param {number} depth - 当前深度
 * @returns {number} 最大深度
 */
export function calculateMaxDepth(arr, depth = 0) {
  if (!arr || arr.length === 0) {
    return depth;
  }

  let maxDepth = depth;
  Object.values(arr).forEach((item) => {
    const childDepth = calculateMaxDepth(item.children, depth + 1);
    maxDepth = Math.max(maxDepth, childDepth);
  });

  return maxDepth;
}