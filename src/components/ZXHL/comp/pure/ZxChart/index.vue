<template>
  <div v-if="chartId" ref="chartContainer" class="zx-chart" :style="{ width, height }">
    <VCharts 
      ref="chartRef" 
      :option="options" 
      :autoresize="autoResize" 
      :style="{ width: '100%', height: '100%' }" 
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getGenerateId } from '../../../utils'

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
  theme: {
    type: String,
    default: 'default',
  },
})

// 定义事件
const emit = defineEmits(['ready', 'click', 'dblclick', 'mouseover', 'mouseout'])

// 响应式数据
const chartRef = ref()
const chartContainer = ref()
const chartId = ref('')

// 生命周期
onMounted(() => {
  chartId.value = getGenerateId()
  
  // 监听图表事件
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

onUnmounted(() => {
  chartId.value = ''
})

// 暴露方法
defineExpose({
  chartRef,
  chartContainer,
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
})
</script>

<style lang="scss">
@import './index.scss';
</style>
