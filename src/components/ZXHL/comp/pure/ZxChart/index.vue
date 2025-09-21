<template>
  <div v-if="chartId" ref="chartContainer" class="zx-chart-new-wrapper" :style="{ width, height }">
    <div ref="chartDom" :style="{ width: '100%', height: '100%' }"></div>
    <!-- 加载状态 -->
    <div v-if="loading" class="chart-loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>图表加载中...</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted, markRaw, shallowRef } from 'vue';
import { getGenerateId } from '../../../utils'
import ResizeObserver from 'resize-observer-polyfill'
import { Loading } from '@element-plus/icons-vue'
import { getCurrentTheme, generateEChartsTheme, createThemeWatcher, applyThemeToOption } from './theme.js'

// 使用完整的 ECharts 4.9.0 导入
import * as echarts from 'echarts'

// 定义属性
const props = defineProps({
  options: {
    type: Object,
    default() {
      return {}
    },
  },
  autoResize: {
    type: Boolean,
    default: true,
  },
  width: {
    type: String,
    default: '100%',
  },
  height: {
    type: String,
    default: '100%',
  },
  // 自适应配置
  adaptiveConfig: {
    type: Object,
    default() {
      return {
        enabled: true,
        debounceTime: 150, // 恢复到合理的防抖时间，避免更新过于频繁
        breakpoints: {
          mobile: 768,
          tablet: 1024,
          desktop: 1440
        }
      }
    }
  },
  // 性能优化配置
  performanceConfig: {
    type: Object,
    default() {
      return {
        lazyUpdate: true,
        animation: true,
        progressive: 400,
        progressiveThreshold: 3000
      }
    }
  },
  // 主题配置
  theme: {
    type: [String, Object],
    default: 'auto'
  },
  // 启用主题自适应
  enableThemeAdaptation: {
    type: Boolean,
    default: true
  },
  // 调整大小防抖时间
  resizeDebounce: {
    type: Number,
    default: 150 // 从 300ms 减少到 150ms
  }
})

// 定义事件
const emit = defineEmits(['ready', 'click', 'dblclick', 'mouseover', 'mouseout', 'resize', 'data-zoom', 'theme-change'])

// 响应式数据
const chartDom = ref()
const chartContainer = ref()
const chartInstance = shallowRef(null);
const chartId = ref(getGenerateId())
const isReady = ref(false)
const loading = ref(false)
const resizeObserver = ref(null)
const adaptiveState = ref({
  screenSize: 'desktop',
  isAdaptive: false
})

// 主题相关响应式数据
const currentTheme = ref(null)
const themeCache = ref(null)
const themeObserver = ref(null)

// 缓存相关
const computedCache = ref(new Map())
const cacheKeys = {
  themeOptions: 'themeOptions',
  adaptiveOptions: 'adaptiveOptions'
}

// 通用防抖工具函数
const createDebouncedFunction = (func, delay = 100) => {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), delay)
  }
}

// 统一错误处理工具
const withErrorHandling = (fn, context = '') => {
  return async (...args) => {
    try {
      return await fn(...args)
    } catch (error) {
      console.warn(`${context}失败:`, error)
      return null
    }
  }
}

// 缓存管理工具
const getCachedValue = (key, computeFn, dependencies = []) => {
  const depKey = JSON.stringify(dependencies)
  const fullKey = `${key}_${depKey}`
  
  if (computedCache.value.has(fullKey)) {
    return computedCache.value.get(fullKey)
  }
  
  const result = computeFn()
  computedCache.value.set(fullKey, result)
  
  // 限制缓存大小
  if (computedCache.value.size > 20) {
    const firstKey = computedCache.value.keys().next().value
    computedCache.value.delete(firstKey)
  }
  
  return result
}

// 清理缓存
const clearCache = (key) => {
  if (key) {
    // 清理特定key的缓存
    for (const cacheKey of computedCache.value.keys()) {
      if (cacheKey.startsWith(key)) {
        computedCache.value.delete(cacheKey)
      }
    }
  } else {
    // 清理所有缓存
    computedCache.value.clear()
  }
}

// 自适应计算属性（优化版）
const adaptiveOptions = computed(() => {
  if (!props.adaptiveConfig.enabled) {
    return props.options
  }
  
  return getCachedValue(
    cacheKeys.adaptiveOptions,
    () => {
      const options = { ...props.options }
      const screenSize = adaptiveState.value.screenSize
      
      // 根据屏幕尺寸调整配置
      if (screenSize === 'mobile') {
        // 移动端优化
        if (options.grid) {
          options.grid = {
            ...options.grid,
            left: '5%',
            right: '5%',
            top: '15%',
            bottom: '15%'
          }
        }
        if (options.legend) {
          options.legend = {
            ...options.legend,
            orient: 'horizontal',
            bottom: 0,
            itemWidth: 15,
            itemHeight: 10,
            textStyle: { fontSize: 10 }
          }
        }
      } else if (screenSize === 'tablet') {
        // 平板端优化
        if (options.grid) {
          options.grid = {
            ...options.grid,
            left: '8%',
            right: '8%',
            top: '12%',
            bottom: '12%'
          }
        }
      }
      
      return options
    },
    [props.options, adaptiveState.value.screenSize, props.adaptiveConfig.enabled]
  )
})

// 主题计算属性（优化版）
const themeOptions = computed(() => {
  if (!props.enableThemeAdaptation) {
    return adaptiveOptions.value
  }
  
  return getCachedValue(
    cacheKeys.themeOptions,
    () => {
      try {
        // 生成当前主题的 ECharts 配置
        const themeConfig = generateEChartsTheme()
        
        // 使用 applyThemeToOption 应用主题到选项
        const options = applyThemeToOption(adaptiveOptions.value, themeConfig)
        
        return options
      } catch (error) {
        console.warn('主题应用失败:', error)
        return adaptiveOptions.value
      }
    },
    [adaptiveOptions.value, currentTheme.value, props.enableThemeAdaptation]
  )
})

// 防抖函数管理器
const debouncedFunctions = {
  detectScreenSize: null,
  refreshTheme: null,
  updateChart: null,
  resizeChart: null
}

// 初始化防抖函数
const initDebouncedFunctions = () => {
  // 屏幕尺寸检测：使用较短的延迟，提升响应速度
  debouncedFunctions.detectScreenSize = createDebouncedFunction(detectScreenSize, props.adaptiveConfig.debounceTime)
  
  // 主题刷新：使用较短的延迟，独立于 resize
  debouncedFunctions.refreshTheme = createDebouncedFunction(refreshTheme, 100)
  
  // 图表更新：使用合理的延迟，确保稳定性
  debouncedFunctions.updateChart = createDebouncedFunction(updateChart, 100)
  
  // 图表大小调整：使用 resize 专用延迟
  debouncedFunctions.resizeChart = createDebouncedFunction(resizeChart, props.resizeDebounce)
}

// 检测屏幕尺寸
const detectScreenSize = () => {
  const width = window.innerWidth
  const breakpoints = props.adaptiveConfig.breakpoints
  
  if (width < breakpoints.mobile) {
    adaptiveState.value.screenSize = 'mobile'
  } else if (width < breakpoints.tablet) {
    adaptiveState.value.screenSize = 'tablet'
  } else {
    adaptiveState.value.screenSize = 'desktop'
  }
  
  adaptiveState.value.isAdaptive = true
}

// 初始化主题
const initTheme = withErrorHandling(async () => {
  if (!props.enableThemeAdaptation) return
  
  // 获取当前主题
  currentTheme.value = getCurrentTheme()
  
  // 创建主题监听器
  themeCache.value = createThemeWatcher((newTheme) => {
    currentTheme.value = newTheme
    // 清理主题相关缓存
    clearCache(cacheKeys.themeOptions)
    // 触发主题变化事件
    emit('theme-change', newTheme)
    // 刷新图表
    debouncedFunctions.refreshTheme()
  })
  
  // 设置主题监听器
  setupThemeObserver()
}, '主题初始化')

// 设置主题监听器
const setupThemeObserver = withErrorHandling(() => {
  if (!props.enableThemeAdaptation || typeof MutationObserver === 'undefined') return
  
  // 监听 document.documentElement 的属性和类名变化
  themeObserver.value = new MutationObserver((mutations) => {
    let shouldUpdate = false
    
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes') {
        const { attributeName } = mutation
        if (attributeName === 'data-theme' || 
            attributeName === 'class' || 
            attributeName === 'style') {
          shouldUpdate = true
        }
      }
    })
    
    if (shouldUpdate) {
      clearCache(cacheKeys.themeOptions)
      debouncedFunctions.refreshTheme()
    }
  })
  
  // 开始监听
  themeObserver.value.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme', 'class', 'style']
  })
}, '主题监听器设置')

// 刷新主题
const refreshTheme = withErrorHandling(async () => {
  if (!props.enableThemeAdaptation) return
  
  // 更新当前主题
  currentTheme.value = getCurrentTheme()
  
  // 清理主题缓存
  clearCache(cacheKeys.themeOptions)
  
  // 更新图表
  if (chartInstance.value && isReady.value) {
    debouncedFunctions.updateChart()
  }
}, '主题刷新')

// 初始化图表
const initChart = withErrorHandling(async () => {
  if (!chartDom.value) return
  
  loading.value = true
  
  // 等待DOM更新
  await nextTick()
  
  // 初始化防抖函数
  initDebouncedFunctions()
  
  // 初始化主题
  await initTheme()
  
  // 创建 ECharts 实例
  chartInstance.value = markRaw(echarts.init(chartDom.value));
  
  // 检测屏幕尺寸
  detectScreenSize()
  
  // 设置图表配置（使用主题配置）
  chartInstance.value.setOption(themeOptions.value, true)
  
  // 绑定事件
  bindEvents()
  
  loading.value = false
  isReady.value = true
  emit('ready', chartInstance.value)
}, '图表初始化')

// 绑定事件
const bindEvents = () => {
  if (!chartInstance.value) return
  
  const eventHandlers = {
    click: (params) => emit('click', params),
    dblclick: (params) => emit('dblclick', params),
    mouseover: (params) => emit('mouseover', params),
    mouseout: (params) => emit('mouseout', params),
    datazoom: (params) => emit('data-zoom', params)
  }
  
  // 批量绑定事件
  Object.entries(eventHandlers).forEach(([event, handler]) => {
    chartInstance.value.on(event, handler)
  })
}

// 更新图表
const updateChart = withErrorHandling(() => {
  if (!chartInstance.value || !isReady.value) return
  
  chartInstance.value.setOption(themeOptions.value, false, props.performanceConfig.lazyUpdate)
}, '图表更新')

const resizeChart = withErrorHandling((payload = {}) => {
  if (!chartInstance.value || !isReady.value || !chartContainer.value) return

  const rect = chartContainer.value.getBoundingClientRect()
  chartInstance.value.resize({
    width: rect.width,
    height: rect.height
  })
  emit('resize', {
    type: payload?.event?.type || payload.type || 'resize',
    source: payload.source || 'manual',
    event: payload.event || null,
    entries: payload.entries || null,
    chart: chartInstance.value
  })
}, '图表大小调整')

const handleWindowResize = (event) => {
  // 清理自适应缓存
  clearCache(cacheKeys.adaptiveOptions)
  debouncedFunctions.detectScreenSize()
  debouncedFunctions.resizeChart({ source: 'window', event })
}

// 监听器设置
// 监听 themeOptions 变化，触发图表更新
watch(
  () => themeOptions.value,
  (newOptions) => {
    if (chartInstance.value && isReady.value && newOptions) {
      // 使用防抖的 updateChart 函数
      debouncedFunctions.updateChart?.()
    }
  },
  { 
    deep: props.watchShallow ? false : true,
    immediate: false 
  }
)

// 监听主题变化，清理缓存并刷新
watch(
  () => [props.theme, props.enableThemeAdaptation],
  () => {
    if (chartInstance.value && isReady.value) {
      // 清理主题相关缓存
      clearCache(cacheKeys.themeOptions)
      // 使用防抖的 refreshTheme 函数
      debouncedFunctions.refreshTheme?.()
    }
  },
  { immediate: false }
)

// 组件挂载
onMounted(async () => {
  // 初始化图表
  await initChart()
  
  // 设置自动调整大小
  if (props.autoResize) {
    // 监听窗口大小变化
    window.addEventListener('resize', handleWindowResize)
    
    // 使用 ResizeObserver 监听容器大小变化
    if (chartContainer.value && ResizeObserver) {
      resizeObserver.value = new ResizeObserver((entries) => {
        debouncedFunctions.resizeChart({ source: 'observer', entries })
      })
      resizeObserver.value.observe(chartContainer.value)
    }
  }
})

// 清理函数
onUnmounted(() => {
  if (resizeObserver.value) {
    resizeObserver.value.disconnect()
  }
  
  window.removeEventListener('resize', handleWindowResize)
  
  cleanup()
})

// 设置加载状态
const setLoading = (isLoading) => {
  loading.value = isLoading
  if (!chartInstance.value) return
  
  if (isLoading) {
    chartInstance.value.showLoading('default', {
      text: '加载中...',
      color: '#409EFF',
      textColor: '#000',
      maskColor: 'rgba(255, 255, 255, 0.8)',
      zlevel: 0
    })
  } else {
    chartInstance.value.hideLoading()
  }
}

// 获取图表实例
const getChart = () => {
  return chartInstance.value
}

// 获取图表数据URL
const getDataURL = (opts = {}) => {
  if (!chartInstance.value) return null
  return chartInstance.value.getDataURL(opts)
}

// 清空图表
const clear = () => {
  if (!chartInstance.value) return
  chartInstance.value.clear()
}

// 清理主题监听器
const cleanupThemeListeners = () => {
  if (themeCache.value && typeof themeCache.value === 'function') {
    themeCache.value()
    themeCache.value = null
  }
  
  if (themeObserver.value) {
    themeObserver.value.disconnect()
    themeObserver.value = null
  }
}

// 清理所有资源
const cleanup = () => {
  // 清理主题监听器
  cleanupThemeListeners()
  
  // 清理图表实例
  if (chartInstance.value) {
    chartInstance.value.dispose()
    chartInstance.value = null
  }
  
  // 清理缓存
  clearCache()
  
  isReady.value = false
}

// 销毁图表（保持向后兼容）
const dispose = () => {
  cleanup()
}

// 暴露方法
defineExpose({
  getChart,
  setLoading,
  getDataURL,
  clear,
  dispose,
  updateChart,
  resizeChart,
  refreshTheme,
  // 新增的优化方法
  clearCache,
  cleanup
})
</script>

<style lang="scss">
@import './index.scss';
</style>
