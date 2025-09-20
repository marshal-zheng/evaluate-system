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
      @ready="emit('ready', $event)"
      @click="emit('click', $event)"
      @dblclick="emit('dblclick', $event)"
      @mouseover="emit('mouseover', $event)"
      @mouseout="emit('mouseout', $event)"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, readonly, useAttrs } from 'vue'
import ZxChart from '@/components/ZXHL/comp/pure/ZxChart/index.vue'
import ZxSelect from '@/components/ZXHL/comp/pure/ZxSelect/index.vue'

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
const deepClone = (value, cache = new WeakMap()) => {
  if (value === null || typeof value !== 'object') {
    return value
  }

  if (cache.has(value)) {
    return cache.get(value)
  }

  if (Array.isArray(value)) {
    const clonedArray = value.map(item => deepClone(item, cache))
    cache.set(value, clonedArray)
    return clonedArray
  }

  if (value instanceof Date) {
    return new Date(value.getTime())
  }

  const clonedObject = {}
  cache.set(value, clonedObject)

  Object.keys(value).forEach((key) => {
    const item = value[key]
    clonedObject[key] = typeof item === 'function' ? item : deepClone(item, cache)
  })

  return clonedObject
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

  seriesList.forEach(series => {
    if (!series || typeof series !== 'object') return

    if (series.name) {
      seriesNames.add(series.name)
    }

    if (series.type === 'pie') {
      if (!series.label) series.label = {}
      series.label.show = true
      series.label.position = 'outside'
      series.label.formatter = '{b}: {c} ({d}%)'
      series.label.fontSize = series.label.fontSize || 12
      series.label.align = series.label.align || 'left'

      if (!series.labelLine) series.labelLine = {}
      series.labelLine.show = true
      series.labelLine.length = series.labelLine.length ?? 18
      series.labelLine.length2 = series.labelLine.length2 ?? 12
      series.labelLine.smooth = series.labelLine.smooth ?? true

      if (!series.emphasis) series.emphasis = {}
      if (!series.emphasis.label) series.emphasis.label = {}
      series.emphasis.label.show = true
      series.emphasis.label.fontWeight = series.emphasis.label.fontWeight || 'bold'
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

// 监听option变化，重置选择
watch(() => props.options, (newOption) => {
  if (Array.isArray(newOption) && newOption.length > 0) {
    // 如果当前选择的索引超出范围，重置为0
    if (selectedIndex.value >= newOption.length) {
      selectedIndex.value = 0
    }
  }
}, { immediate: true })

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
