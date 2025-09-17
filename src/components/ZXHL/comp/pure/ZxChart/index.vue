<template>
  <div v-if="chartId" ref="chartContainer" class="zx-chart-wrapper" :style="{ width, height }">
    <VCharts 
      ref="chartRef" 
      :option="themedOptions" 
      :autoresize="autoResize" 
      :style="{ width: '100%', height: '100%' }" 
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { getGenerateId } from '../../../utils'
import { applyThemeToOption, createThemeWatcher } from './theme.js'

import { BarChart, CustomChart, LineChart, PieChart, RadarChart } from 'echarts/charts'
import {
  DataZoomComponent,
  GraphicComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import VCharts from 'vue-echarts'

use([
  CanvasRenderer,
  BarChart,
  CustomChart,
  LineChart,
  PieChart,
  RadarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  GraphicComponent,
  TitleComponent,
])

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
  // 是否启用主题自动适配
  enableThemeAdaptation: {
    type: Boolean,
    default: true,
  },
})

// 定义事件
const emit = defineEmits(['ready', 'click', 'dblclick', 'mouseover', 'mouseout', 'theme-change'])

// 响应式数据
const chartRef = ref()
const chartContainer = ref()
const chartId = ref('')
const currentTheme = ref({ name: 'light', type: 'light', isDark: false })
const themeWatcherDispose = ref(null)

// 计算属性：应用主题的配置
const themedOptions = computed(() => {
  if (!props.enableThemeAdaptation) {
    return props.options
  }
  
  return applyThemeToOption(props.options, chartContainer.value)
})

// 监听配置变化，重新应用主题
watch(
  () => props.options,
  () => {
    if (props.enableThemeAdaptation && chartRef.value) {
      // 延迟更新，确保 DOM 已更新
      nextTick(() => {
        chartRef.value.setOption(themedOptions.value, true)
      })
    }
  },
  { deep: true }
)

// 主题变化处理函数
const handleThemeChange = (themeInfo) => {
  currentTheme.value = themeInfo
  emit('theme-change', themeInfo)
  
  // 重新应用主题配置
  if (props.enableThemeAdaptation && chartRef.value) {
    nextTick(() => {
      const newOptions = applyThemeToOption(props.options, chartContainer.value)
      chartRef.value.setOption(newOptions, true)
    })
  }
}

// 生命周期
onMounted(() => {
  chartId.value = getGenerateId()
  
  // 启用主题监听
  if (props.enableThemeAdaptation) {
    themeWatcherDispose.value = createThemeWatcher(handleThemeChange)
  }
  
  // 监听图表事件
  nextTick(() => {
    if (chartRef.value) {
      const chart = chartRef.value
      
      chart.on('ready', () => {
        emit('ready', chart)
      })
      
      chart.on('click', (params) => {
        emit('click', params)
      })
      
      chart.on('dblclick', (params) => {
        emit('dblclick', params)
      })
      
      chart.on('mouseover', (params) => {
        emit('mouseover', params)
      })
      
      chart.on('mouseout', (params) => {
        emit('mouseout', params)
      })
    }
  })
})

onUnmounted(() => {
  // 清理主题监听器
  if (themeWatcherDispose.value) {
    themeWatcherDispose.value()
    themeWatcherDispose.value = null
  }
  
  chartId.value = ''
})

// 暴露方法
defineExpose({
  chartRef,
  chartContainer,
  currentTheme,
  getChart: () => chartRef.value,
  resize: () => {
    if (chartRef.value) {
      chartRef.value.resize()
    }
  },
  clear: () => {
    if (chartRef.value) {
      chartRef.value.clear()
    }
  },
  // 手动刷新主题
  refreshTheme: () => {
    if (props.enableThemeAdaptation && chartRef.value) {
      const newOptions = applyThemeToOption(props.options, chartContainer.value)
      chartRef.value.setOption(newOptions, true)
    }
  },
  // 获取当前应用的主题配置
  getThemedOptions: () => themedOptions.value,
})
</script>

<style lang="scss">
@import './index.scss';
</style>
