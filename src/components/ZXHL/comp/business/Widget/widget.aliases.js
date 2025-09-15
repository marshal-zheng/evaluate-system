// Widget 组件别名映射
export default {
  // 颜色卡片别名
  red: 'components/ColorCard.vue',
  orange: 'components/ColorCard.vue',
  green: 'components/ColorCard.vue',
  blue: 'components/ColorCard.vue',
  purple: 'components/ColorCard.vue',
  
  // 组件类型别名
  ColorCard: 'components/ColorCard.vue',
  ChartWidget: 'components/EChartsWidget.vue',
  // 常见图表类型别名，容错处理（允许直接传 'line' 等）
  line: 'components/EChartsWidget.vue',
  bar: 'components/EChartsWidget.vue',
  pie: 'components/EChartsWidget.vue',
  scatter: 'components/EChartsWidget.vue',
  area: 'components/EChartsWidget.vue',
  
  // 其他组件别名
  chart: 'components/ChartWidget.vue',
  echarts: 'components/EChartsWidget.vue'
}
