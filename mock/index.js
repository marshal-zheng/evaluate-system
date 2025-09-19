/**
 * Mock数据配置入口文件
 * 统一聚合各模块 mock 定义
 */

import evaluation from './evaluate'
import template from './template'
import indicator from './Indicator'

// 如果后续还有其它模块，比如用户、任务等，可以在此继续引入并合并
// import user from './user'

export default [
  ...evaluation,
  ...template,
  ...indicator
]