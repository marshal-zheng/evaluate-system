/**
 * 主题管理 Composable
 * 在Vue组件中使用主题功能
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  getCurrentTheme, 
  setTheme, 
  toggleTheme, 
  onThemeChange, 
  offThemeChange,
  THEME_TYPES,
  applyDarkBlueTheme,
  setCSSVariables,
  getCSSVariable
} from '@/utils/theme.js'

export function useTheme() {
  // 当前主题状态
  const currentTheme = ref(getCurrentTheme())
  
  // 是否为深色主题
  const isDark = computed(() => {
    return currentTheme.value === THEME_TYPES.DARK || currentTheme.value === THEME_TYPES.DARK_BLUE
  })
  
  // 是否为深蓝色主题
  const isDarkBlue = computed(() => {
    return currentTheme.value === THEME_TYPES.DARK_BLUE
  })
  
  // 是否为浅色主题
  const isLight = computed(() => {
    return currentTheme.value === THEME_TYPES.LIGHT
  })
  
  // 主题变更处理函数
  const handleThemeChange = (event) => {
    currentTheme.value = event.detail.theme
  }
  
  // 切换到指定主题
  const switchTheme = (theme) => {
    setTheme(theme)
  }
  
  // 切换主题（循环）
  const toggle = () => {
    toggleTheme()
  }
  
  // 设置自定义CSS变量
  const setCustomVariables = (variables) => {
    setCSSVariables(variables)
  }
  
  // 获取CSS变量值
  const getVariable = (variable) => {
    return getCSSVariable(variable)
  }
  
  // 应用深蓝色主题
  const applyDarkBlue = () => {
    switchTheme(THEME_TYPES.DARK_BLUE)
    applyDarkBlueTheme()
  }
  
  // 获取主题相关的CSS类名
  const getThemeClass = computed(() => {
    return {
      'theme-light': isLight.value,
      'theme-dark': isDark.value && !isDarkBlue.value,
      'theme-dark-blue': isDarkBlue.value,
    }
  })
  
  // 获取主题相关的样式对象
  const getThemeStyle = computed(() => {
    if (isDarkBlue.value) {
      return {
        backgroundColor: 'var(--el-bg-color)',
        color: 'var(--el-text-color-primary)',
      }
    }
    return {}
  })
  
  // 生命周期钩子
  onMounted(() => {
    onThemeChange(handleThemeChange)
    // 如果当前是深蓝色主题，确保变量正确应用
    if (currentTheme.value === THEME_TYPES.DARK_BLUE) {
      applyDarkBlueTheme()
    }
  })
  
  onUnmounted(() => {
    offThemeChange(handleThemeChange)
  })
  
  return {
    // 状态
    currentTheme,
    isDark,
    isDarkBlue,
    isLight,
    
    // 方法
    switchTheme,
    toggle,
    applyDarkBlue,
    setCustomVariables,
    getVariable,
    
    // 计算属性
    themeClass: getThemeClass,
    themeStyle: getThemeStyle,
    
    // 常量
    THEME_TYPES,
  }
}

export default useTheme
