/**
 * 业务层确认对话框帮助函数
 * 基于 ZxConfirmInput 组件的业务封装
 * 
 * 使用方式：
 * import { deleteProject, deleteUser, resetSystem } from '@/utils/confirmHelpers'
 * 
 * // 删除项目
 * await deleteProject('项目名称')
 * 
 * // 删除用户
 * await deleteUser('用户名')
 * 
 * // 重置系统
 * await resetSystem()
 */

import { getCurrentInstance } from 'vue'

/**
 * 获取确认输入服务
 * 支持在组件内和组件外调用
 */
function getConfirmInputService() {
  // 尝试从当前组件实例获取
  const instance = getCurrentInstance()
  if (instance?.appContext?.config?.globalProperties?.$confirmInput) {
    return instance.appContext.config.globalProperties.$confirmInput
  }
  
  // 尝试从全局变量获取
  if (typeof window !== 'undefined' && window.ZxConfirmInput) {
    return window.ZxConfirmInput
  }
  
  throw new Error('ZxConfirmInput 服务未找到，请确保组件已正确注册')
}

/**
 * 删除项目的确认对话框
 * @param {string} projectName 项目名称
 * @param {Object} options 额外配置
 * @returns {Promise} 确认结果
 */
export const deleteProject = (projectName, options = {}) => {
  const service = getConfirmInputService()
  
  return service.danger({
    targetName: projectName,
    targetType: '项目',
    keyword: projectName,
    dangerMessage: `您即将删除项目 ${projectName}。删除的项目无法恢复！您确定要继续吗？`,
    description: '此操作将永久删除项目及其所有相关数据。为了防止意外操作，我们要求您确认项目名称。',
    okText: '确认删除项目',
    ...options
  })
}

/**
 * 删除用户的确认对话框
 * @param {string} username 用户名
 * @param {Object} options 额外配置
 * @returns {Promise} 确认结果
 */
export const deleteUser = (username, options = {}) => {
  const service = getConfirmInputService()
  
  return service.danger({
    targetName: username,
    targetType: '用户账户',
    keyword: username,
    dangerMessage: `您即将删除用户 ${username}。删除的用户账户无法恢复！您确定要继续吗？`,
    description: '此操作将永久删除用户账户及其所有相关数据。为了防止意外操作，我们要求您确认用户名。',
    okText: '确认删除用户',
    ...options
  })
}

/**
 * 重置系统的确认对话框
 * @param {Object} options 额外配置
 * @returns {Promise} 确认结果
 */
export const resetSystem = (options = {}) => {
  const service = getConfirmInputService()
  
  return service.warning({
    targetName: '系统配置',
    targetType: '配置',
    keyword: 'RESET',
    dangerMessage: '您即将重置系统设置。重置后所有配置将恢复到默认状态！您确定要继续吗？',
    description: '此操作将重置所有系统设置到默认状态。为了防止意外操作，我们要求您输入确认码。',
    placeholder: '请输入 RESET',
    expectedValue: 'RESET',
    okText: '确认重置',
    ...options
  })
}

/**
 * 删除文件的确认对话框
 * @param {string} fileName 文件名
 * @param {Object} options 额外配置
 * @returns {Promise} 确认结果
 */
export const deleteFile = (fileName, options = {}) => {
  const service = getConfirmInputService()
  
  return service.danger({
    targetName: fileName,
    targetType: '文件',
    keyword: fileName,
    dangerMessage: `您即将删除文件 ${fileName}。删除的文件无法恢复！您确定要继续吗？`,
    description: '此操作将永久删除文件。为了防止意外操作，我们要求您确认文件名。',
    okText: '确认删除文件',
    ...options
  })
}

/**
 * 清空数据的确认对话框
 * @param {string} dataType 数据类型
 * @param {Object} options 额外配置
 * @returns {Promise} 确认结果
 */
export const clearData = (dataType, options = {}) => {
  const service = getConfirmInputService()
  
  return service.warning({
    targetName: dataType,
    targetType: '数据',
    keyword: 'CLEAR',
    dangerMessage: `您即将清空所有${dataType}数据。清空后数据无法恢复！您确定要继续吗？`,
    description: '此操作将永久清空数据。为了防止意外操作，我们要求您输入确认码。',
    placeholder: '请输入 CLEAR',
    expectedValue: 'CLEAR',
    okText: '确认清空',
    ...options
  })
}

/**
 * 通用的危险操作确认对话框
 * @param {Object} config 配置对象
 * @returns {Promise} 确认结果
 */
export const confirmDangerousAction = (config) => {
  const service = getConfirmInputService()
  return service.danger(config)
}

/**
 * 通用的警告操作确认对话框
 * @param {Object} config 配置对象
 * @returns {Promise} 确认结果
 */
export const confirmWarningAction = (config) => {
  const service = getConfirmInputService()
  return service.warning(config)
}

/**
 * 通用的信息确认对话框
 * @param {Object} config 配置对象
 * @returns {Promise} 确认结果
 */
export const confirmInfoAction = (config) => {
  const service = getConfirmInputService()
  return service.info(config)
}

// 默认导出所有方法
export default {
  deleteProject,
  deleteUser,
  resetSystem,
  deleteFile,
  clearData,
  confirmDangerousAction,
  confirmWarningAction,
  confirmInfoAction
}