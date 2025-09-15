<template>
  <div 
    class="echarts-widget" 
    :class="{
      'dark-theme': darkTheme,
      [`color-scheme-${colorScheme}`]: true
    }"
  >
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <span class="loading-text">{{ loadingText }}</span>
    </div>
    <ZxEmpty 
      v-else-if="isEmpty" 
      :description="noDataText"
      :image="emptyImage"
      :imageSize="emptyImageSize"
      class="chart-empty-state"
    />
    <ZxChart
      v-else
      ref="chartRef"
      :options="finalOptions"
      :theme="theme"
      :width="width"
      :height="height"
      :autoResize="autoResize"
      @ready="handleReady"
      @click="handleClick"
      @dblclick="handleDblclick"
      @mouseover="handleMouseover"
      @mouseout="handleMouseout"
      class="zx-chart-rounded"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import ZxChart from '@/components/ZXHL/comp/pure/ZxChart/index.vue'
import ZxEmpty from '@/components/ZXHL/comp/pure/ZxEmpty/index.vue'

const props = defineProps({
  // ECharts 完整配置选项
  option: {
    type: Object,
    default: () => ({})
  },
  // 可选：主题名称
  theme: {
    type: String,
    default: 'default'
  },
  // 可选：图表标题（当 option 中没有 title 时使用）
  title: {
    type: String,
    default: ''
  },
  // 可选：加载状态
  loading: {
    type: Boolean,
    default: false
  },
  // 可选：加载文本
  loadingText: {
    type: String,
    default: '加载中...'
  },
  // 可选：空数据文本
  noDataText: {
    type: String,
    default: '暂无图表数据'
  },
  // 可选：空状态图片
  emptyImage: {
    type: String,
    default: ''
  },
  // 可选：空状态图片尺寸
  emptyImageSize: {
    type: [String, Number],
    default: 130
  },
  // 图表宽度
  width: {
    type: String,
    default: '100%'
  },
  // 图表高度
  height: {
    type: String,
    default: '100%'
  },
  // 是否自动调整大小
  autoResize: {
    type: Boolean,
    default: true
  },
  // 配色方案
  colorScheme: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'blue', 'green', 'warm', 'cool', 'business'].includes(value)
  },
  // 是否启用暗色主题
  darkTheme: {
    type: Boolean,
    default: false
  },
  // 向下兼容：旧的 data 属性
  data: {
    type: Object,
    default: () => ({})
  }
})

// 定义 emits
const emit = defineEmits(['ready', 'click', 'dblclick', 'mouseover', 'mouseout'])

// 响应式引用
const chartRef = ref(null)

// 计算属性：判断是否为空数据
const isEmpty = computed(() => {
  if (props.loading) return false
  
  const hasOption = props.option && Object.keys(props.option).length > 0
  const hasDataOption = props.data?.option && Object.keys(props.data.option).length > 0
  const hasData = props.data && Object.keys(props.data).length > 0
  
  return !hasOption && !hasDataOption && !hasData
})

// 获取 CSS 变量值的辅助函数
const getCSSVariable = (varName) => {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
  }
  return ''
}

// 预定义配色方案
const colorSchemes = {
  default: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
  blue: ['#1890ff', '#13c2c2', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#eb2f96', '#fa8c16', '#a0d911'],
  green: ['#52c41a', '#13c2c2', '#1890ff', '#722ed1', '#eb2f96', '#faad14', '#f5222d', '#fa8c16', '#a0d911'],
  warm: ['#ff7875', '#ffa940', '#ffec3d', '#ff9c6e', '#ffadd2', '#d3adf7', '#b7eb8f', '#87e8de', '#91d5ff'],
  cool: ['#1890ff', '#13c2c2', '#722ed1', '#2f54eb', '#1890ff', '#096dd9', '#0050b3', '#003a8c', '#002766'],
  business: ['#304156', '#5c7cfa', '#4ecdc4', '#44d9e8', '#f78fb3', '#ced6e0', '#a4b0be', '#57606f', '#2f3542']
}

// 计算属性：基于 CSS 变量的主题配置
const themeConfig = computed(() => {
  // 优先使用 CSS 变量，如果没有则使用预定义配色
  const colors = []
  for (let i = 1; i <= 9; i++) {
    const cssColor = getCSSVariable(`--echarts-widget-color-${i}`)
    if (cssColor) {
      colors.push(cssColor)
    } else {
      const schemeColors = colorSchemes[props.colorScheme] || colorSchemes.default
      colors.push(schemeColors[i - 1] || schemeColors[0])
    }
  }
  
  const textColor = getCSSVariable('--echarts-widget-text-color') || '#303133'
  const textColorSecondary = getCSSVariable('--echarts-widget-text-color-secondary') || '#606266'
  const backgroundColor = getCSSVariable('--echarts-widget-background') || '#ffffff'
  
  return {
    color: colors,
    backgroundColor: 'transparent',
    textStyle: {
      color: textColor
    },
    title: {
      textStyle: {
        color: textColor,
        fontSize: 16,
        fontWeight: 'normal'
      }
    },
    legend: {
      textStyle: {
        color: textColor
      }
    },
    tooltip: {
      backgroundColor: backgroundColor,
      borderColor: getCSSVariable('--echarts-widget-border-color') || '#e4e7ed',
      textStyle: {
        color: textColor
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    categoryAxis: {
      axisLine: {
        lineStyle: {
          color: getCSSVariable('--echarts-widget-border-color') || '#e4e7ed'
        }
      },
      axisLabel: {
        color: textColorSecondary
      },
      splitLine: {
        lineStyle: {
          color: getCSSVariable('--echarts-widget-border-color') || '#e4e7ed',
          type: 'solid'
        }
      }
    },
    valueAxis: {
      axisLine: {
        lineStyle: {
          color: getCSSVariable('--echarts-widget-border-color') || '#e4e7ed'
        }
      },
      axisLabel: {
        color: textColorSecondary
      },
      splitLine: {
        lineStyle: {
          color: getCSSVariable('--echarts-widget-border-color') || '#e4e7ed',
          type: 'solid'
        }
      }
    }
  }
})

// 计算属性：最终的图表配置
const finalOptions = computed(() => {
  let chartOption = null
  
  // 优先级：props.option > props.data.option > 演示数据
  if (props.option && Object.keys(props.option).length > 0) {
    chartOption = { ...props.option }
  } else if (props.data?.option && Object.keys(props.data.option).length > 0) {
    chartOption = { ...props.data.option }
  } else if (props.data && Object.keys(props.data).length > 0) {
    // 如果 data 不是空对象但没有 option，可能是简化格式的数据
    console.warn('EChartsWidget: 检测到 data 属性，但建议使用 option 属性传递完整的 ECharts 配置')
    chartOption = generateDemoOption()
  } else {
    chartOption = generateDemoOption()
  }
  
  // 如果传入了 title 但 option 中没有 title，则添加
  if (props.title && (!chartOption.title || !chartOption.title.text)) {
    chartOption = {
      ...chartOption,
      title: {
        ...(chartOption.title || {}),
        text: props.title
      }
    }
  }
  
  // 合并主题配置
  const merged = {
    ...themeConfig.value,
    ...chartOption
  }
  
  // 如果没有指定颜色，使用主题颜色
  if (!chartOption.color && themeConfig.value.color) {
    merged.color = themeConfig.value.color
  }
  
  return merged
})

// 生成演示数据的辅助函数（仅在没有真实数据时使用）
const generateDemoOption = () => {
  const categories = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const values = Array.from({ length: 7 }, () => Math.floor(Math.random() * 1000) + 100)
  
  return {
    title: { text: props.title || '演示图表' },
    xAxis: { type: 'category', data: categories },
    yAxis: { type: 'value' },
    series: [{
      name: '演示数据',
      type: 'line',
      data: values,
      smooth: true
    }]
  }
}

// 事件处理函数
const handleReady = (chart) => {
  emit('ready', chart)
}

const handleClick = (params) => {
  emit('click', params)
}

const handleDblclick = (params) => {
  emit('dblclick', params)
}

const handleMouseover = (params) => {
  emit('mouseover', params)
}

const handleMouseout = (params) => {
  emit('mouseout', params)
}

// 对外暴露方法，便于父组件直接操作
const getInstance = () => chartRef.value?.getChart()
const resize = () => chartRef.value?.resize()
const refresh = () => chartRef.value?.resize() // ZxChart 没有 refresh 方法，用 resize 代替
const clear = () => chartRef.value?.clear()

defineExpose({
  getInstance,
  resize, 
  refresh,
  clear,
  chartRef
})
</script>

<style scoped>
:root {
  /* EChartsWidget 图表颜色配置 */
  --echarts-widget-primary-color: #409eff;
  --echarts-widget-success-color: #67c23a;
  --echarts-widget-warning-color: #e6a23c;
  --echarts-widget-danger-color: #f56c6c;
  --echarts-widget-info-color: #909399;
  
  /* 图表配色方案 */
  --echarts-widget-color-1: #5470c6;
  --echarts-widget-color-2: #91cc75;
  --echarts-widget-color-3: #fac858;
  --echarts-widget-color-4: #ee6666;
  --echarts-widget-color-5: #73c0de;
  --echarts-widget-color-6: #3ba272;
  --echarts-widget-color-7: #fc8452;
  --echarts-widget-color-8: #9a60b4;
  --echarts-widget-color-9: #ea7ccc;
  
  /* 图表背景和边框 */
  --echarts-widget-background: #ffffff;
  --echarts-widget-border-color: #e4e7ed;
  --echarts-widget-border-radius: 8px;
  --echarts-widget-box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  
  /* 文本颜色 */
  --echarts-widget-text-color: #303133;
  --echarts-widget-text-color-secondary: #606266;
  --echarts-widget-text-color-placeholder: #c0c4cc;
  
  /* 加载状态 */
  --echarts-widget-loading-color: var(--echarts-widget-primary-color);
  --echarts-widget-loading-text-color: var(--echarts-widget-text-color-secondary);
  --echarts-widget-loading-bg: #f3f3f3;
  
  /* 暗色主题 */
  --echarts-widget-dark-background: #1e1e1e;
  --echarts-widget-dark-border-color: #414243;
  --echarts-widget-dark-text-color: #e5eaf3;
  --echarts-widget-dark-text-secondary: #a3a6ad;
}

/* 配色方案 - 蓝色系 */
.color-scheme-blue {
  --echarts-widget-color-1: #1890ff;
  --echarts-widget-color-2: #13c2c2;
  --echarts-widget-color-3: #52c41a;
  --echarts-widget-color-4: #faad14;
  --echarts-widget-color-5: #f5222d;
  --echarts-widget-color-6: #722ed1;
  --echarts-widget-color-7: #eb2f96;
  --echarts-widget-color-8: #fa8c16;
  --echarts-widget-color-9: #a0d911;
}

/* 配色方案 - 绿色系 */
.color-scheme-green {
  --echarts-widget-color-1: #52c41a;
  --echarts-widget-color-2: #13c2c2;
  --echarts-widget-color-3: #1890ff;
  --echarts-widget-color-4: #722ed1;
  --echarts-widget-color-5: #eb2f96;
  --echarts-widget-color-6: #faad14;
  --echarts-widget-color-7: #f5222d;
  --echarts-widget-color-8: #fa8c16;
  --echarts-widget-color-9: #a0d911;
}

/* 配色方案 - 暖色系 */
.color-scheme-warm {
  --echarts-widget-color-1: #ff7875;
  --echarts-widget-color-2: #ffa940;
  --echarts-widget-color-3: #ffec3d;
  --echarts-widget-color-4: #ff9c6e;
  --echarts-widget-color-5: #ffadd2;
  --echarts-widget-color-6: #d3adf7;
  --echarts-widget-color-7: #b7eb8f;
  --echarts-widget-color-8: #87e8de;
  --echarts-widget-color-9: #91d5ff;
}

/* 配色方案 - 冷色系 */
.color-scheme-cool {
  --echarts-widget-color-1: #1890ff;
  --echarts-widget-color-2: #13c2c2;
  --echarts-widget-color-3: #722ed1;
  --echarts-widget-color-4: #2f54eb;
  --echarts-widget-color-5: #1890ff;
  --echarts-widget-color-6: #096dd9;
  --echarts-widget-color-7: #0050b3;
  --echarts-widget-color-8: #003a8c;
  --echarts-widget-color-9: #002766;
}

/* 配色方案 - 商务风格 */
.color-scheme-business {
  --echarts-widget-color-1: #304156;
  --echarts-widget-color-2: #5c7cfa;
  --echarts-widget-color-3: #4ecdc4;
  --echarts-widget-color-4: #44d9e8;
  --echarts-widget-color-5: #f78fb3;
  --echarts-widget-color-6: #ced6e0;
  --echarts-widget-color-7: #a4b0be;
  --echarts-widget-color-8: #57606f;
  --echarts-widget-color-9: #2f3542;
}

.echarts-widget {
  width: 100%;
  height: 100%;
  min-height: 240px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--echarts-widget-background);
  border-radius: var(--echarts-widget-border-radius);
  box-shadow: var(--echarts-widget-box-shadow);
  overflow: hidden;
  
  /* 暗色主题支持 */
  &.dark-theme {
    --echarts-widget-background: var(--echarts-widget-dark-background);
    --echarts-widget-border-color: var(--echarts-widget-dark-border-color);
    --echarts-widget-text-color: var(--echarts-widget-dark-text-color);
    --echarts-widget-text-color-secondary: var(--echarts-widget-dark-text-secondary);
    --echarts-widget-box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3);
  }
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--echarts-widget-loading-text-color);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--echarts-widget-loading-bg);
  border-top: 3px solid var(--echarts-widget-loading-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 14px;
  color: var(--echarts-widget-loading-text-color);
}

.chart-empty-state {
  width: 100%;
  height: 100%;
  min-height: 240px;
}

.zx-chart-rounded {
  border-radius: var(--echarts-widget-border-radius);
  width: 100%;
  height: 100%;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 为 ZxChart 内部的 ECharts 提供 CSS 变量 */
.echarts-widget :deep(.zx-chart) {
  border: none;
  box-shadow: none;
  background: transparent;
}
</style>
