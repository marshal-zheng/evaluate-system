<template>
  <div class="pie-chart-container" :data-selector-position="selectorPosition">
    <!-- 数据选择器 -->
    <div v-if="showSelector && selectOptions.length > 1" class="chart-selector">
      <ZxSelect
        v-model="selectedIndex"
        class="chart-select"
        size="small"
        :options="selectOptions"
        :allow-search="false"
        :allow-clear="false"
        placeholder="选择图表"
        @change="handleSelectionChange"
      />
    </div>
    
    <!-- 图表组件 -->
    <ZxChart
      ref="chartRef"
      :options="currentOption"
      v-bind="chartAttrs"
      @ready="handleChartReady"
      @click="emit('click', $event)"
      @dblclick="emit('dblclick', $event)"
      @mouseover="emit('mouseover', $event)"
      @mouseout="emit('mouseout', $event)"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, readonly, useAttrs, nextTick, onBeforeUnmount } from 'vue'
import ZxChart from '@/components/ZXHL/comp/pure/ZxChart/index.vue'

const props = defineProps({
  // 支持单个option对象或options数组
  options: {
    type: [Object, Array],
    default: () => ({})
  },
  // 是否显示选择器（当有多个数据时）
  showSelector: {
    type: Boolean,
    default: true
  },
  // 选择器位置
  selectorPosition: {
    type: String,
    default: 'top-right', // top-right, top-left, top-center
    validator: (value) => ['top-right', 'top-left', 'top-center'].includes(value)
  }
})

const emit = defineEmits(['ready', 'click', 'dblclick', 'mouseover', 'mouseout', 'selection-change'])

const chartRef = ref(null)
const selectedIndex = ref(0)
const attrs = useAttrs()
const isChartReady = ref(false)

// 计算选择器选项
const selectOptions = computed(() => {
  console.log('options', props.options)
  if (Array.isArray(props.options)) {
    return props.options.map((opt, index) => ({
      label: opt.title?.text || `图表 ${index + 1}`,
      value: index
    }))
  }
  return []
})

// 计算当前显示的option
const currentOption = computed(() => {
  console.log('props.options', props.options)
  
  if (Array.isArray(props.options)) {
    const selectedOption = props.options[selectedIndex.value] || props.options[0] || {}
    console.log('selectedIndex.value', selectedOption)
    
    // 确保 legend 数据与 series 数据一致
    const processedOption = validateAndFixLegend(selectedOption)
    return processedOption
  }
  
  // 对单个 option 也进行 legend 验证和修复
  const processedOption = validateAndFixLegend(props.options || {})
  return processedOption
})

// 验证和修复 legend 配置的辅助函数
const deepClone = (value) => {
  if (value === null || typeof value !== 'object') {
    return value
  }

  if (typeof globalThis.structuredClone === 'function') {
    try {
      return globalThis.structuredClone(value)
    } catch (error) {
      console.warn('[PieChart] structuredClone failed, fallback to JSON clone:', error)
    }
  }

  try {
    return JSON.parse(JSON.stringify(value))
  } catch (error) {
    console.warn('[PieChart] JSON clone failed:', error)
    return value
  }
}

const normalizeLegendEntry = (legendEntry, legendData) => {
  if (legendEntry === false) {
    return legendEntry
  }

  const entry = legendEntry && typeof legendEntry === 'object' ? { ...legendEntry } : {}

  if (entry.show === false) {
    entry.show = true
  }

  const existingData = Array.isArray(entry.data) ? entry.data.slice() : []
  if (existingData.length === 0) {
    entry.data = legendData
  } else {
    const validLegendData = existingData.filter(name => legendData.includes(name))
    const missingNames = legendData.filter(name => !validLegendData.includes(name))
    entry.data = [...validLegendData, ...missingNames]
  }

  return entry
}

const validateAndFixLegend = (option) => {
  if (!option || typeof option !== 'object') {
    return option
  }

  const fixedOption = deepClone(option)
  const seriesList = Array.isArray(fixedOption.series) ? fixedOption.series : []
  const seriesNames = new Set()

  seriesList.forEach((series, index) => {
    if (!series || typeof series !== 'object') return

    // 让 ECharts 能感知是同一个系列，从而启用更新动画
    if (!series.id) {
      series.id = series.name || `pie-series-${index}`
    }

    if (!series.animation) {
      series.animation = true
    }

    series.animationTypeUpdate = series.animationTypeUpdate || 'expansion'
    series.animationDurationUpdate = series.animationDurationUpdate || 520
    series.animationEasingUpdate = series.animationEasingUpdate || 'cubicOut'

    if (!series.universalTransition) {
      series.universalTransition = {
        enabled: true,
        delay: (idx) => idx * 30,
        duration: 520
      }
    }

    if (series.name) {
      seriesNames.add(series.name)
    }

    if (Array.isArray(series.data)) {
      series.data.forEach(item => {
        if (!item || typeof item !== 'object') return
        const { name, label, title } = item
        if (name) {
          seriesNames.add(name)
        } else if (label) {
          seriesNames.add(label)
        } else if (title) {
          seriesNames.add(title)
        }
      })
    }
  })

  if (seriesNames.size === 0) {
    return fixedOption
  }

  const legendData = Array.from(seriesNames)
  const legendConfig = fixedOption.legend

  if (fixedOption.animation === false) {
    fixedOption.animation = true
  }

  if (Array.isArray(legendConfig)) {
    fixedOption.legend = legendConfig.map(entry => normalizeLegendEntry(entry, legendData))
  } else {
    fixedOption.legend = normalizeLegendEntry(legendConfig, legendData)
  }

  return fixedOption
}

// 过滤掉 option(s) 相关的 attrs，避免传递给 ZxChart 覆盖内部计算
const chartAttrs = computed(() => {
  const { option, options, showSelector, selectorPosition, ...restAttrs } = attrs
  return restAttrs
})

// 处理选择变化
const handleSelectionChange = (index) => {
  selectedIndex.value = index
  emit('selection-change', {
    index,
    option: props.options[index],
    title: selectOptions.value[index]?.label
  })
}

let previewFrame = 0
let hideTipTimer = 0
const PREVIEW_TIP_DURATION = 1200

const triggerSlicePreview = () => {
  if (previewFrame) {
    cancelAnimationFrame(previewFrame)
  }

  if (hideTipTimer) {
    clearTimeout(hideTipTimer)
    hideTipTimer = 0
  }

  previewFrame = requestAnimationFrame(async () => {
    previewFrame = 0

    if (!isChartReady.value) return

    await nextTick()

    const chart = chartRef.value?.getChart()
    const option = currentOption.value

    if (!chart || !option?.series || !Array.isArray(option.series) || option.series.length === 0) {
      return
    }

    const primarySeries = option.series[0]
    const seriesData = Array.isArray(primarySeries.data) ? primarySeries.data : []

    if (seriesData.length === 0) {
      chart.dispatchAction({ type: 'hideTip' })
      return
    }

    let targetIndex = 0
    if (seriesData.length > 1) {
      targetIndex = seriesData.reduce((maxIndex, item, idx) => {
        const currentValue = typeof item === 'object' ? Number(item?.value ?? 0) : Number(item)
        const maxValue = typeof seriesData[maxIndex] === 'object'
          ? Number(seriesData[maxIndex]?.value ?? 0)
          : Number(seriesData[maxIndex])
        return currentValue > maxValue ? idx : maxIndex
      }, 0)
    }

    chart.dispatchAction({ type: 'downplay', seriesIndex: 0 })
    chart.dispatchAction({ type: 'showTip', seriesIndex: 0, dataIndex: targetIndex })

    if (typeof window !== 'undefined') {
      hideTipTimer = window.setTimeout(() => {
        chart.dispatchAction({ type: 'hideTip' })
        chart.dispatchAction({ type: 'downplay', seriesIndex: 0 })
        hideTipTimer = 0
      }, PREVIEW_TIP_DURATION)
    }
  })
}

const handleChartReady = (chartInstance) => {
  isChartReady.value = true
  emit('ready', chartInstance)
  triggerSlicePreview()
}

// 监听option变化，重置选择
watch(() => props.options, (newOption) => {
  if (Array.isArray(newOption) && newOption.length > 0) {
    // 如果当前选择的索引超出范围，重置为0
    if (selectedIndex.value >= newOption.length) {
      selectedIndex.value = 0
    }
    triggerSlicePreview()
  }
}, { immediate: true, flush: 'post' })

watch(selectedIndex, () => {
  triggerSlicePreview()
}, { flush: 'post' })

watch(currentOption, () => {
  triggerSlicePreview()
}, { flush: 'post' })

onBeforeUnmount(() => {
  if (previewFrame) {
    cancelAnimationFrame(previewFrame)
    previewFrame = 0
  }

  if (hideTipTimer) {
    clearTimeout(hideTipTimer)
    hideTipTimer = 0
  }
})

// 暴露的方法
const getInstance = () => chartRef.value?.getChart()
const resize = () => chartRef.value?.resize()
const refresh = () => chartRef.value?.resize()
const clear = () => chartRef.value?.clear()

// 获取当前选中的数据信息
const getCurrentSelection = () => ({
  index: selectedIndex.value,
  option: currentOption.value,
  title: selectOptions.value[selectedIndex.value]?.label
})

// 设置选中项
const setSelection = (index) => {
  if (Array.isArray(props.options) && index >= 0 && index < props.options.length) {
    selectedIndex.value = index
  }
}

defineExpose({
  getInstance,
  resize,
  refresh,
  clear,
  chartRef,
  getCurrentSelection,
  setSelection,
  selectedIndex: readonly(selectedIndex)
})
</script>

<style scoped>
.pie-chart-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.chart-selector {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  /* background: rgba(255, 255, 255, 0.9); */
  border-radius: 4px;
  /* padding: 4px; */
  /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); */
  backdrop-filter: blur(4px);
}

.chart-select {
  min-width: 120px;
}

.chart-select :deep(.el-input__inner) {
  border: 1px solid #e4e7ed;
  background: rgba(255, 255, 255, 0.95);
}

.chart-select :deep(.el-input__inner):hover {
  border-color: #c0c4cc;
}

.chart-select :deep(.el-input__inner):focus {
  border-color: #409eff;
}

/* 选择器位置变体 */
.pie-chart-container[data-selector-position="top-left"] .chart-selector {
  left: 8px;
  right: auto;
}

.pie-chart-container[data-selector-position="top-center"] .chart-selector {
  left: 50%;
  right: auto;
  transform: translateX(-50%);
}
</style>
