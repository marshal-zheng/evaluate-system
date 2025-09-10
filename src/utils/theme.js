/**
 * 深蓝色主题管理工具
 * 基于Element Plus CSS3变量的主题切换方案
 */

// 主题类型枚举
export const THEME_TYPES = {
  LIGHT: 'light',
  DARK: 'dark',
  DARK_BLUE: 'dark-blue'
}

// 当前主题状态
let currentTheme = THEME_TYPES.DARK_BLUE

/**
 * 获取当前主题
 */
export function getCurrentTheme() {
  return currentTheme
}

/**
 * 设置主题
 * @param {string} theme - 主题类型
 */
export function setTheme(theme) {
  const html = document.documentElement
  
  // 移除所有主题类
  html.classList.remove('light', 'dark', 'dark-blue')
  
  // 移除旧的data-theme属性
  html.removeAttribute('data-theme')
  
  switch (theme) {
    case THEME_TYPES.LIGHT:
      html.classList.add('light')
      html.setAttribute('data-theme', 'light')
      break
    case THEME_TYPES.DARK:
      html.classList.add('dark')
      html.setAttribute('data-theme', 'dark')
      break
    case THEME_TYPES.DARK_BLUE:
    default:
      html.classList.add('dark-blue')
      html.setAttribute('data-theme', 'dark-blue')
      break
  }
  
  currentTheme = theme
  
  // 保存到localStorage
  localStorage.setItem('theme', theme)
  
  // 触发主题变更事件
  window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme } }))
}

/**
 * 初始化主题
 */
export function initTheme() {
  // 从localStorage获取保存的主题，默认为深蓝色主题
  const savedTheme = localStorage.getItem('theme') || THEME_TYPES.DARK_BLUE
  setTheme(savedTheme)
}

/**
 * 切换主题
 */
export function toggleTheme() {
  const themes = Object.values(THEME_TYPES)
  const currentIndex = themes.indexOf(currentTheme)
  const nextIndex = (currentIndex + 1) % themes.length
  setTheme(themes[nextIndex])
}

/**
 * 监听主题变更
 * @param {Function} callback - 回调函数
 */
export function onThemeChange(callback) {
  window.addEventListener('theme-change', callback)
}

/**
 * 移除主题变更监听
 * @param {Function} callback - 回调函数
 */
export function offThemeChange(callback) {
  window.removeEventListener('theme-change', callback)
}

/**
 * 动态设置CSS变量
 * @param {Object} variables - CSS变量对象
 */
export function setCSSVariables(variables) {
  const root = document.documentElement
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
}

/**
 * 获取CSS变量值
 * @param {string} variable - CSS变量名
 */
export function getCSSVariable(variable) {
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim()
}

/**
 * 深蓝色主题的CSS变量配置
 */
export const DARK_BLUE_THEME_VARIABLES = {
  // 主色系
  '--el-color-primary': '#1a89c3',
  '--el-color-primary-light-3': '#53adde',
  '--el-color-primary-light-5': '#79c5f0',
  '--el-color-primary-light-7': '#9fddff',
  '--el-color-primary-light-9': '#c5f5ff',
  
  // 背景色
  '--el-bg-color': '#0c1d30',
  '--el-bg-color-page': '#0c1d30',
  '--el-bg-color-overlay': '#094d7b',
  '--el-fill-color': '#1a2940',
  '--el-fill-color-light': '#233550',
  '--el-fill-color-lighter': '#2c4160',
  
  // 文字色
  '--el-text-color-primary': '#ffffff',
  '--el-text-color-regular': '#ffffff',
  '--el-text-color-secondary': '#e6e6e6',
  '--el-text-color-placeholder': '#cccccc',
  
  // 边框色
  '--el-border-color': '#3a5a7a',
  '--el-border-color-light': '#4a6a8a',
  '--el-border-color-lighter': '#5a7a9a',
}

/**
 * 应用深蓝色主题变量
 */
export function applyDarkBlueTheme() {
  setCSSVariables(DARK_BLUE_THEME_VARIABLES)
}

// 自动初始化
if (typeof window !== 'undefined') {
  // 页面加载完成后初始化主题
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme)
  } else {
    initTheme()
  }
}
