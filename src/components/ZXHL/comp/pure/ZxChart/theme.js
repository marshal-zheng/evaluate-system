/**
 * ECharts 主题配置工具
 * 基于 CSS3 变量动态生成 ECharts 主题配置
 * 支持跟随系统主题切换
 */

/**
 * 获取 CSS 变量值
 * @param {string} variable - CSS 变量名
 * @param {Element} element - 目标元素，默认为 document.documentElement
 * @returns {string} CSS 变量值
 */
function getCSSVariable(variable, element = document.documentElement) {
  // 参数验证：确保 element 是有效的 DOM 元素
  if (!element || typeof element.getAttribute !== 'function') {
    element = document.documentElement || document.body
  }
  
  // 如果仍然无效，返回空字符串
  if (!element || typeof element.getAttribute !== 'function') {
    return ''
  }
  
  try {
    return getComputedStyle(element).getPropertyValue(variable).trim()
  } catch (error) {
    console.warn('getCSSVariable error:', error)
    return ''
  }
}

/**
 * 获取当前主题信息
 * 通过检测CSS变量值动态判断主题，支持任意主题扩展
 * @param {Element} element - 目标元素，默认为 document.documentElement
 * @returns {Object} 主题信息对象 { name: string, type: string, isDark: boolean }
 */
export function getCurrentTheme(element = document.documentElement) {
  // 参数验证：确保 element 是有效的 DOM 元素
  if (!element || typeof element.getAttribute !== 'function') {
    element = document.documentElement || document.body
  }
  
  // 如果仍然无效，返回默认主题
  if (!element || typeof element.getAttribute !== 'function') {
    return {
      name: 'light',
      type: 'light',
      isDark: false
    }
  }
  
  // 1. 优先从 data-theme 属性获取主题名称
  const explicitTheme = element.getAttribute('data-theme')
  if (explicitTheme) {
    return {
      name: explicitTheme,
      type: explicitTheme,
      isDark: detectIsDarkTheme(element)
    }
  }
  
  // 2. 从 CSS 类名中检测主题
  const classList = Array.from(element.classList)
  const themeClass = classList.find(cls => 
    cls.includes('theme-') || 
    cls.includes('dark') || 
    cls.includes('light') ||
    cls.match(/^(dark|light|blue|green|red|purple|orange)(-\w+)?$/)
  )
  
  if (themeClass) {
    return {
      name: themeClass,
      type: themeClass,
      isDark: detectIsDarkTheme(element)
    }
  }
  
  // 3. 通过CSS变量值智能检测主题类型
  const detectedTheme = detectThemeFromVariables(element)
  return detectedTheme
}

/**
 * 通过CSS变量值检测是否为深色主题
 * @param {Element} element - 目标元素
 * @returns {boolean} 是否为深色主题
 */
export function detectIsDarkTheme(element = document.documentElement) {
  // 参数验证：确保 element 是有效的 DOM 元素
  if (!element || typeof element.getAttribute !== 'function') {
    element = document.documentElement || document.body
  }
  
  // 如果仍然无效，返回默认值（浅色主题）
  if (!element || typeof element.getAttribute !== 'function') {
    return false
  }
  
  // 检测背景色亮度
  const backgroundColor = getCSSVariable('--el-bg-color', element) || '#ffffff'
  const bgBrightness = getColorBrightness(backgroundColor)
  
  // 检测文字色亮度
  const textColor = getCSSVariable('--el-text-color-primary', element) || '#000000'
  const textBrightness = getColorBrightness(textColor)
  
  // 深色主题特征：背景色较暗，文字色较亮
  return bgBrightness < 128 || textBrightness > 128
}

/**
 * 通过CSS变量值智能检测主题信息
 * @param {Element} element - 目标元素
 * @returns {Object} 主题信息
 */
export function detectThemeFromVariables(element = document.documentElement) {
  const isDark = detectIsDarkTheme(element)
  const themeType = isDark ? 'dark' : 'light'
  
  // 生成基于CSS变量值的唯一主题标识
  const primaryColor = getCSSVariable('--el-color-primary', element) || '#409eff'
  const backgroundColor = getCSSVariable('--el-bg-color', element) || '#ffffff'
  
  // 使用颜色值的哈希作为主题名称的一部分，确保唯一性
  const themeHash = generateColorHash(primaryColor, backgroundColor)
  const themeName = `${themeType}-${themeHash}`
  
  return {
    name: themeName,
    type: themeType,
    isDark,
    // 提供原始颜色信息供调试使用
    colors: {
      primary: primaryColor,
      background: backgroundColor
    }
  }
}

/**
 * 生成基于颜色的简短哈希标识
 * @param {string} primaryColor - 主色
 * @param {string} backgroundColor - 背景色
 * @returns {string} 6位哈希字符串
 */
export function generateColorHash(primaryColor, backgroundColor) {
  // 简单的颜色哈希算法，生成6位字符标识
  const colorString = `${primaryColor}${backgroundColor}`.replace(/[#\s]/g, '')
  let hash = 0
  
  for (let i = 0; i < colorString.length; i++) {
    const char = colorString.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 转换为32位整数
  }
  
  // 转换为6位字母数字字符串
  return Math.abs(hash).toString(36).substring(0, 6).padEnd(6, '0')
}

/**
 * 计算颜色亮度 (0-255)
 * @param {string} color - 颜色值 (hex, rgb, rgba等)
 * @returns {number} 亮度值
 */
function getColorBrightness(color) {
  // 创建临时元素来获取计算后的RGB值
  const tempElement = document.createElement('div')
  tempElement.style.color = color
  document.body.appendChild(tempElement)
  
  const computedColor = getComputedStyle(tempElement).color
  document.body.removeChild(tempElement)
  
  // 解析RGB值
  const rgbMatch = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (!rgbMatch) return 128 // 默认中等亮度
  
  const [, r, g, b] = rgbMatch.map(Number)
  
  // 使用标准亮度计算公式
  return Math.round(0.299 * r + 0.587 * g + 0.114 * b)
}

/**
 * 生成基于 CSS3 变量的 ECharts 主题配置
 * @param {Element} container - 图表容器元素
 * @returns {Object} ECharts 主题配置对象
 */
export function generateEChartsTheme(container = document.documentElement) {
  const themeInfo = getCurrentTheme(container)
  
  // 基础颜色配置
  const colors = {
    // 主色调
    primary: getCSSVariable('--el-color-primary', container),
    success: getCSSVariable('--el-color-success', container),
    warning: getCSSVariable('--el-color-warning', container),
    danger: getCSSVariable('--el-color-danger', container),
    info: getCSSVariable('--el-color-info', container),
    
    // 文字颜色
    textPrimary: getCSSVariable('--el-text-color-primary', container),
    textRegular: getCSSVariable('--el-text-color-regular', container),
    textSecondary: getCSSVariable('--el-text-color-secondary', container),
    textPlaceholder: getCSSVariable('--el-text-color-placeholder', container),
    
    // 背景颜色
    background: getCSSVariable('--el-bg-color', container),
    backgroundOverlay: getCSSVariable('--el-bg-color-overlay', container),
    
    // 边框颜色
    border: getCSSVariable('--el-border-color', container),
    borderLight: getCSSVariable('--el-border-color-light', container),
    borderLighter: getCSSVariable('--el-border-color-lighter', container),
    
    // 填充颜色
    fill: getCSSVariable('--el-fill-color', container),
    fillLight: getCSSVariable('--el-fill-color-light', container),
  }
  
  // 图表专用颜色配置
  const chartColors = {
    // 从 ZxChart 变量中获取图表专用颜色
    chartBackground: getCSSVariable('--cmp-chart-new-background', container) || colors.background,
    chartTextPrimary: getCSSVariable('--cmp-chart-new-text-color-primary', container) || colors.textPrimary,
    chartTextRegular: getCSSVariable('--cmp-chart-new-text-color-regular', container) || colors.textRegular,
    chartGridLine: getCSSVariable('--cmp-chart-new-grid-line-color', container) || colors.borderLighter,
    chartAxisLine: getCSSVariable('--cmp-chart-new-axis-line-color', container) || colors.borderLight,
    chartAxisLabel: getCSSVariable('--cmp-chart-new-axis-label-color', container) || colors.textRegular,
    chartTooltipBg: getCSSVariable('--cmp-chart-new-tooltip-background', container) || colors.backgroundOverlay,
    chartTooltipBorder: getCSSVariable('--cmp-chart-new-tooltip-border-color', container) || colors.border,
    chartTooltipText: getCSSVariable('--cmp-chart-new-tooltip-text-color', container) || colors.textPrimary,
    chartLegendText: getCSSVariable('--cmp-chart-new-legend-text-color', container) || colors.textRegular,
    chartLegendInactive: getCSSVariable('--cmp-chart-new-legend-inactive-color', container) || colors.textPlaceholder,
  }

  // 生成图表色彩序列
  const colorPalette = [
    colors.primary || '#409eff',
    colors.success || '#67c23a',
    colors.warning || '#e6a23c',
    colors.danger || '#f56c6c',
    colors.info || '#909399',
    '#ff7875',
    '#ffa940',
    '#ffec3d',
    '#bae637',
    '#73d13d',
    '#40a9ff',
    '#b37feb',
    '#ff85c0'
  ]

  return {
    color: colorPalette,
    backgroundColor: chartColors.chartBackground,
    textStyle: {
      fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
      color: chartColors.chartTextPrimary,
      fontSize: getResponsiveFontSize(12, container)
    },
    title: {
      textStyle: {
        color: chartColors.chartTextPrimary,
        fontSize: getResponsiveFontSize(16, container),
        fontWeight: 'bold'
      },
      subtextStyle: {
        color: chartColors.chartTextRegular,
        fontSize: getResponsiveFontSize(12, container)
      }
    },
    line: {
      itemStyle: {
        borderWidth: 1
      },
      lineStyle: {
        width: 2
      },
      symbolSize: 4,
      symbol: 'emptyCircle',
      smooth: false
    },
    radar: {
      itemStyle: {
        borderWidth: 1
      },
      lineStyle: {
        width: 2
      },
      symbolSize: 4,
      symbol: 'emptyCircle',
      smooth: false
    },
    bar: {
      itemStyle: {
        barBorderWidth: 0,
        barBorderColor: chartColors.chartAxisLine
      }
    },
    pie: {
      itemStyle: {
        borderWidth: 0,
        borderColor: chartColors.chartAxisLine
      }
    },
    scatter: {
      itemStyle: {
        borderWidth: 0,
        borderColor: chartColors.chartAxisLine
      }
    },
    boxplot: {
      itemStyle: {
        borderWidth: 0,
        borderColor: chartColors.chartAxisLine
      }
    },
    parallel: {
      itemStyle: {
        borderWidth: 0,
        borderColor: chartColors.chartAxisLine
      }
    },
    sankey: {
      itemStyle: {
        borderWidth: 0,
        borderColor: chartColors.chartAxisLine
      }
    },
    funnel: {
      itemStyle: {
        borderWidth: 0,
        borderColor: chartColors.chartAxisLine
      }
    },
    gauge: {
      itemStyle: {
        borderWidth: 0,
        borderColor: chartColors.chartAxisLine
      }
    },
    candlestick: {
      itemStyle: {
        color: colors.danger,
        color0: colors.success,
        borderColor: colors.danger,
        borderColor0: colors.success,
        borderWidth: 1
      }
    },
    graph: {
      itemStyle: {
        borderWidth: 0,
        borderColor: chartColors.chartAxisLine
      },
      lineStyle: {
        width: 1,
        color: chartColors.chartGridLine
      },
      symbolSize: 4,
      symbol: 'emptyCircle',
      smooth: false,
      color: colorPalette,
      label: {
        color: chartColors.chartTextRegular
      }
    },
    map: {
      itemStyle: {
        areaColor: chartColors.chartBackground,
        borderColor: chartColors.chartGridLine,
        borderWidth: 0.5
      },
      label: {
        color: chartColors.chartTextRegular
      },
      emphasis: {
        itemStyle: {
          areaColor: colors.primary,
          borderColor: chartColors.chartAxisLine,
          borderWidth: 1
        },
        label: {
          color: chartColors.chartTextPrimary
        }
      }
    },
    geo: {
      itemStyle: {
        areaColor: chartColors.chartBackground,
        borderColor: chartColors.chartGridLine,
        borderWidth: 0.5
      },
      label: {
        color: chartColors.chartTextRegular
      },
      emphasis: {
        itemStyle: {
          areaColor: colors.primary,
          borderColor: chartColors.chartAxisLine,
          borderWidth: 1
        },
        label: {
          color: chartColors.chartTextPrimary
        }
      }
    },
    categoryAxis: {
      axisLine: {
        show: true,
        lineStyle: {
          color: chartColors.chartAxisLine
        }
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: chartColors.chartAxisLine
        }
      },
      axisLabel: {
        show: true,
        color: chartColors.chartAxisLabel,
        fontSize: getResponsiveFontSize(11, container)
      },
      splitLine: {
        show: false,
        lineStyle: {
          color: [chartColors.chartGridLine]
        }
      },
      splitArea: {
        show: false,
        areaStyle: {
          color: [chartColors.chartBackground]
        }
      }
    },
    valueAxis: {
      axisLine: {
        show: true,
        lineStyle: {
          color: chartColors.chartAxisLine
        }
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: chartColors.chartAxisLine
        }
      },
      axisLabel: {
        show: true,
        color: chartColors.chartAxisLabel,
        fontSize: getResponsiveFontSize(11, container)
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: [chartColors.chartGridLine]
        }
      },
      splitArea: {
        show: false,
        areaStyle: {
          color: [chartColors.chartBackground]
        }
      }
    },
    logAxis: {
      axisLine: {
        show: true,
        lineStyle: {
          color: chartColors.chartAxisLine
        }
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: chartColors.chartAxisLine
        }
      },
      axisLabel: {
        show: true,
        color: chartColors.chartAxisLabel,
        fontSize: getResponsiveFontSize(11, container)
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: [chartColors.chartGridLine]
        }
      },
      splitArea: {
        show: false,
        areaStyle: {
          color: [chartColors.chartBackground]
        }
      }
    },
    timeAxis: {
      axisLine: {
        show: true,
        lineStyle: {
          color: chartColors.chartAxisLine
        }
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: chartColors.chartAxisLine
        }
      },
      axisLabel: {
        show: true,
        color: chartColors.chartAxisLabel,
        fontSize: getResponsiveFontSize(11, container)
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: [chartColors.chartGridLine]
        }
      },
      splitArea: {
        show: false,
        areaStyle: {
          color: [chartColors.chartBackground]
        }
      }
    },
    toolbox: {
      iconStyle: {
        borderColor: chartColors.chartTextRegular
      },
      emphasis: {
        iconStyle: {
          borderColor: chartColors.chartTextPrimary
        }
      }
    },
    legend: {
      textStyle: {
        color: chartColors.chartLegendText,
        fontSize: getResponsiveFontSize(12, container)
      },
      inactiveColor: chartColors.chartLegendInactive
    },
    tooltip: {
      backgroundColor: chartColors.chartTooltipBg,
      borderColor: chartColors.chartTooltipBorder,
      borderWidth: 1,
      textStyle: {
        color: chartColors.chartTooltipText,
        fontSize: getResponsiveFontSize(12, container)
      }
    },
    timeline: {
      lineStyle: {
        color: chartColors.chartAxisLine,
        width: 1
      },
      itemStyle: {
        color: colors.primary,
        borderWidth: 1
      },
      controlStyle: {
        color: colors.primary,
        borderColor: colors.primary,
        borderWidth: 0.5
      },
      checkpointStyle: {
        color: colors.primary,
        borderColor: chartColors.chartAxisLine
      },
      label: {
        color: chartColors.chartTextRegular,
        fontSize: getResponsiveFontSize(11, container)
      },
      emphasis: {
        itemStyle: {
          color: colors.primary
        },
        controlStyle: {
          color: colors.primary,
          borderColor: colors.primary,
          borderWidth: 0.5
        },
        label: {
          color: chartColors.chartTextPrimary,
          fontSize: getResponsiveFontSize(11, container)
        }
      }
    },
    visualMap: {
      color: [colors.danger, colors.warning, colors.success],
      textStyle: {
        color: chartColors.chartTextRegular,
        fontSize: getResponsiveFontSize(11, container)
      }
    },
    dataZoom: {
      backgroundColor: 'rgba(47,69,84,0)',
      dataBackgroundColor: 'rgba(47,69,84,0.3)',
      fillerColor: 'rgba(167,183,204,0.4)',
      handleColor: colors.primary,
      handleSize: '100%',
      textStyle: {
        color: chartColors.chartTextRegular,
        fontSize: getResponsiveFontSize(11, container)
      }
    },
    markPoint: {
      label: {
        color: chartColors.chartTextPrimary,
        fontSize: getResponsiveFontSize(11, container)
      },
      emphasis: {
        label: {
          color: chartColors.chartTextPrimary,
          fontSize: getResponsiveFontSize(11, container)
        }
      }
    }
  }
}

/**
 * 创建主题监听器
 * @param {Function} callback - 主题变化回调函数
 * @returns {Function} 清理函数
 */
export function createThemeWatcher(callback) {
  if (typeof callback !== 'function') {
    console.warn('createThemeWatcher: callback must be a function')
    return () => {}
  }

  let currentTheme = getCurrentTheme()
  
  // 定时检查主题变化
  const checkThemeChange = () => {
    const newTheme = getCurrentTheme()
    
    // 安全检查：确保主题对象有必要的属性
    if (!currentTheme || typeof currentTheme !== 'object') {
      currentTheme = { name: 'light', type: 'light', isDark: false }
    }
    if (!newTheme || typeof newTheme !== 'object') {
      return
    }
    
    // 比较主题是否发生变化
    if (
      newTheme.name !== currentTheme.name ||
      newTheme.type !== currentTheme.type ||
      newTheme.isDark !== currentTheme.isDark
    ) {
      currentTheme = newTheme
      callback(newTheme)
    }
  }
  
  // 使用 MutationObserver 监听 DOM 变化
  const observer = new MutationObserver(checkThemeChange)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'data-theme', 'style']
  })
  
  // 监听媒体查询变化（系统主题切换）
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleMediaChange = () => {
    setTimeout(checkThemeChange, 50) // 延迟检查，确保CSS变量已更新
  }
  
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleMediaChange)
  } else {
    // 兼容旧版浏览器
    mediaQuery.addListener(handleMediaChange)
  }
  
  // 返回清理函数
  return () => {
    observer.disconnect()
    if (mediaQuery.removeEventListener) {
      mediaQuery.removeEventListener('change', handleMediaChange)
    } else {
      mediaQuery.removeListener(handleMediaChange)
    }
  }
}

/**
 * 获取响应式字体大小
 * @param {number} baseSize - 基础字体大小
 * @param {Element} container - 容器元素
 * @returns {number} 响应式字体大小
 */
export function getResponsiveFontSize(baseSize = 12, container = document.documentElement) {
  const containerWidth = container.clientWidth || window.innerWidth
  
  // 响应式字体缩放规则
  if (containerWidth < 768) {
    return Math.max(baseSize * 0.8, 10) // 移动端缩小
  } else if (containerWidth > 1920) {
    return baseSize * 1.1 // 大屏幕放大
  }
  
  return baseSize
}

/**
 * 将主题应用到 ECharts 配置选项
 * @param {Object} option - ECharts 配置选项
 * @param {Element} container - 图表容器元素
 * @returns {Object} 应用主题后的配置选项
 */
export function applyThemeToOption(option, themeOrContainer = document.documentElement) {
  if (!option || typeof option !== 'object') {
    return option
  }
  
  let theme = null
  const maybeTheme = themeOrContainer
  const isDomNode = maybeTheme && typeof maybeTheme === 'object' && (
    maybeTheme.nodeType === 1 ||
    maybeTheme.nodeType === 9 ||
    typeof maybeTheme.tagName === 'string'
  )

  if (!isDomNode && maybeTheme && typeof maybeTheme === 'object' && (maybeTheme.color || maybeTheme.textStyle)) {
    theme = maybeTheme
  } else {
    const container = isDomNode ? maybeTheme : document.documentElement
    theme = generateEChartsTheme(container)
  }
  
  // 深度合并配置，优先保留用户配置
  const mergedOption = JSON.parse(JSON.stringify(option))
  
  // 应用主题色彩
  if (!mergedOption.color && theme.color) {
    mergedOption.color = theme.color
  }
  
  // 应用背景色
  if (!mergedOption.backgroundColor && theme.backgroundColor) {
    mergedOption.backgroundColor = theme.backgroundColor
  }
  
  // 应用文字样式
  if (!mergedOption.textStyle) {
    mergedOption.textStyle = theme.textStyle
  } else {
    mergedOption.textStyle = { ...theme.textStyle, ...mergedOption.textStyle }
  }
  
  // 应用标题样式
  if (mergedOption.title) {
    if (Array.isArray(mergedOption.title)) {
      mergedOption.title = mergedOption.title.map(titleItem => ({
        ...theme.title,
        ...titleItem,
        textStyle: { ...theme.title.textStyle, ...(titleItem.textStyle || {}) },
        subtextStyle: { ...theme.title.subtextStyle, ...(titleItem.subtextStyle || {}) }
      }))
    } else {
      mergedOption.title = {
        ...theme.title,
        ...mergedOption.title,
        textStyle: { ...theme.title.textStyle, ...(mergedOption.title.textStyle || {}) },
        subtextStyle: { ...theme.title.subtextStyle, ...(mergedOption.title.subtextStyle || {}) }
      }
    }
  }
  
  // 应用图例样式
  if (mergedOption.legend) {
    if (Array.isArray(mergedOption.legend)) {
      mergedOption.legend = mergedOption.legend.map(legendItem => ({
        ...theme.legend,
        ...legendItem,
        textStyle: { ...theme.legend.textStyle, ...(legendItem.textStyle || {}) }
      }))
    } else {
      mergedOption.legend = {
        ...theme.legend,
        ...mergedOption.legend,
        textStyle: { ...theme.legend.textStyle, ...(mergedOption.legend.textStyle || {}) }
      }
    }
  }
  
  // 应用提示框样式
  if (mergedOption.tooltip) {
    mergedOption.tooltip = {
      ...theme.tooltip,
      ...mergedOption.tooltip,
      textStyle: { ...theme.tooltip.textStyle, ...(mergedOption.tooltip.textStyle || {}) }
    }
  }
  
  // 应用坐标轴样式
  const axisTypes = ['xAxis', 'yAxis']
  axisTypes.forEach(axisType => {
    if (mergedOption[axisType]) {
      if (Array.isArray(mergedOption[axisType])) {
        mergedOption[axisType] = mergedOption[axisType].map(axis => {
          // 安全检查：确保 axis 对象存在且有 type 属性
          if (!axis || typeof axis !== 'object') {
            axis = {}
          }
          const axisTheme = (axis.type === 'category') ? theme.categoryAxis : theme.valueAxis
          return {
            ...axisTheme,
            ...axis,
            axisLine: { ...axisTheme.axisLine, ...(axis.axisLine || {}) },
            axisTick: { ...axisTheme.axisTick, ...(axis.axisTick || {}) },
            axisLabel: { ...axisTheme.axisLabel, ...(axis.axisLabel || {}) },
            splitLine: { ...axisTheme.splitLine, ...(axis.splitLine || {}) }
          }
        })
      } else {
        // 安全检查：确保 mergedOption[axisType] 对象存在且有 type 属性
        if (!mergedOption[axisType] || typeof mergedOption[axisType] !== 'object') {
          mergedOption[axisType] = {}
        }
        const axisTheme = (mergedOption[axisType].type === 'category') ? theme.categoryAxis : theme.valueAxis
        mergedOption[axisType] = {
          ...axisTheme,
          ...mergedOption[axisType],
          axisLine: { ...axisTheme.axisLine, ...(mergedOption[axisType].axisLine || {}) },
          axisTick: { ...axisTheme.axisTick, ...(mergedOption[axisType].axisTick || {}) },
          axisLabel: { ...axisTheme.axisLabel, ...(mergedOption[axisType].axisLabel || {}) },
          splitLine: { ...axisTheme.splitLine, ...(mergedOption[axisType].splitLine || {}) }
        }
      }
    }
  })
  
  return mergedOption
}

export default {
  generateEChartsTheme,
  createThemeWatcher,
  getResponsiveFontSize,
  applyThemeToOption,
  getCurrentTheme,
  detectIsDarkTheme,
  detectThemeFromVariables,
  generateColorHash,
}
