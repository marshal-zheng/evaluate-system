<template>
  <div class="chart-widget">
    <ZxChart 
      :options="chartOptions"
      height="100%"
      width="100%"
      class="zx-chart-rounded"
    />
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import ZxChart from '../../../comp/pure/ZxChart/index.vue'

// 示例图表配置
const chartOptions = reactive({
  title: {
    text: '示例图表',
    left: 'center',
    textStyle: {
      fontSize: 14
    }
  },
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '销量',
      type: 'line', 
      data: [120, 200, 150, 80, 70, 110],
      smooth: true,
      lineStyle: {
        color: '#409eff'
      },
      itemStyle: {
        color: '#409eff'
      }
    }
  ]
})
</script>

<style scoped>
.chart-widget {
  height: 100%;
  width: 100%;
  padding: 8px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>
