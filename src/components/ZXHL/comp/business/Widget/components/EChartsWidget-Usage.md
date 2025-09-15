# EChartsWidget 使用指南

重构后的 EChartsWidget 组件基于项目的 `ZxChart` 组件实现，完全支持 ECharts 的所有图表类型，无需硬编码的 switch 语句。

## 基本用法

### 1. 完整的 ECharts Option 配置（推荐）

```vue
<template>
  <EChartsWidget :option="chartOption" />
</template>

<script setup>
import { ref } from 'vue'

const chartOption = ref({
  title: {
    text: '用户增长趋势'
  },
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: ['1月', '2月', '3月', '4月', '5月', '6月']
  },
  yAxis: {
    type: 'value'
  },
  series: [{
    data: [120, 200, 150, 80, 70, 110],
    type: 'line'
  }]
})
</script>
```

### 2. 支持所有 ECharts 图表类型

```javascript
// 折线图
const lineOption = {
  xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  yAxis: { type: 'value' },
  series: [{ data: [120, 200, 150, 80, 70], type: 'line' }]
}

// 柱状图
const barOption = {
  xAxis: { type: 'category', data: ['A', 'B', 'C', 'D'] },
  yAxis: { type: 'value' },
  series: [{ data: [23, 24, 18, 25], type: 'bar' }]
}

// 饼图
const pieOption = {
  series: [{
    type: 'pie',
    data: [
      { value: 335, name: 'Direct' },
      { value: 310, name: 'Email' },
      { value: 234, name: 'Union Ads' }
    ]
  }]
}

// 散点图
const scatterOption = {
  xAxis: { type: 'value' },
  yAxis: { type: 'value' },
  series: [{
    type: 'scatter',
    data: [[10, 20], [15, 25], [20, 30]]
  }]
}

// 雷达图
const radarOption = {
  radar: {
    indicator: [
      { name: '销售' }, { name: '管理' }, { name: '技术' }
    ]
  },
  series: [{
    type: 'radar',
    data: [{ value: [4, 3, 2], name: '预算分配' }]
  }]
}

// 地图
const mapOption = {
  series: [{
    type: 'map',
    map: 'china',
    data: [
      { name: '北京', value: 177 },
      { name: '天津', value: 42 }
    ]
  }]
}

// K线图
const candlestickOption = {
  xAxis: { type: 'category', data: ['2017-10-24', '2017-10-25'] },
  yAxis: { type: 'value' },
  series: [{
    type: 'candlestick',
    data: [[20, 34, 10, 38], [40, 35, 30, 50]]
  }]
}

// 热力图
const heatmapOption = {
  xAxis: { type: 'category', data: ['12a', '1a', '2a'] },
  yAxis: { type: 'category', data: ['Saturday', 'Friday'] },
  series: [{
    type: 'heatmap',
    data: [[0, 0, 5], [0, 1, 1], [1, 0, 0]]
  }]
}
```

### 3. 实时数据更新

```vue
<template>
  <EChartsWidget :option="chartOption" :loading="loading" />
  <button @click="refreshData">刷新数据</button>
</template>

<script setup>
import { ref } from 'vue'

const loading = ref(false)
const chartOption = ref({
  xAxis: { type: 'category', data: ['A', 'B', 'C'] },
  yAxis: { type: 'value' },
  series: [{ data: [120, 200, 150], type: 'bar' }]
})

const refreshData = async () => {
  loading.value = true
  try {
    // 模拟 API 调用
    const response = await fetch('/api/chart-data')
    const data = await response.json()
    
    chartOption.value = {
      ...chartOption.value,
      series: [{ ...chartOption.value.series[0], data: data.values }]
    }
  } finally {
    loading.value = false
  }
}
</script>
```

### 4. 配色方案和主题

```vue
<template>
  <!-- 默认配色 -->
  <EChartsWidget :option="chartOption" />
  
  <!-- 蓝色系配色 -->
  <EChartsWidget :option="chartOption" colorScheme="blue" />
  
  <!-- 暖色系配色 -->
  <EChartsWidget :option="chartOption" colorScheme="warm" />
  
  <!-- 商务风格配色 -->
  <EChartsWidget :option="chartOption" colorScheme="business" />
  
  <!-- 暗色主题 -->
  <EChartsWidget :option="chartOption" :darkTheme="true" />
  
  <!-- 暗色主题 + 冷色系 -->
  <EChartsWidget :option="chartOption" colorScheme="cool" :darkTheme="true" />
</template>
```

### 5. 自定义颜色配置

通过 CSS 变量自定义图表颜色：

```css
/* 在你的组件或全局样式中 */
.my-custom-chart {
  --echarts-widget-color-1: #your-color-1;
  --echarts-widget-color-2: #your-color-2;
  --echarts-widget-color-3: #your-color-3;
  /* ... 更多颜色 */
  
  /* 自定义背景和边框 */
  --echarts-widget-background: #f5f5f5;
  --echarts-widget-border-color: #d9d9d9;
  --echarts-widget-border-radius: 12px;
  
  /* 自定义文本颜色 */
  --echarts-widget-text-color: #333333;
  --echarts-widget-text-color-secondary: #666666;
}
```

```vue
<template>
  <EChartsWidget 
    :option="chartOption" 
    class="my-custom-chart"
  />
</template>
```

### 5. 空状态和加载状态

```vue
<template>
  <!-- 加载状态 -->
  <EChartsWidget 
    :loading="loading" 
    loadingText="数据加载中..." 
  />
  
  <!-- 空数据状态 -->
  <EChartsWidget 
    :option="{}" 
    noDataText="当前没有图表数据"
    emptyImage="/path/to/empty-chart.svg"
  />
  
  <!-- 基于 ZxEmpty 的空状态，支持插槽 -->
  <EChartsWidget :option="{}">
    <template #empty-image>
      <i class="el-icon-chart" style="font-size: 60px; color: #ccc;" />
    </template>
    <template #empty-description>
      <span>请选择数据源来生成图表</span>
    </template>
  </EChartsWidget>
</template>

<script setup>
import { ref } from 'vue'

const loading = ref(true)

// 模拟加载完成后显示空状态
setTimeout(() => {
  loading.value = false
}, 2000)
</script>
```

### 6. 组件方法调用

```vue
<template>
  <EChartsWidget ref="chartRef" :option="chartOption" />
</template>

<script setup>
import { ref, onMounted } from 'vue'

const chartRef = ref(null)

onMounted(() => {
  // 获取 ECharts 实例
  const instance = chartRef.value.getInstance()
  
  // 手动触发 resize
  chartRef.value.resize()
  
  // 刷新图表
  chartRef.value.refresh()
})
</script>
```

## 属性说明

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| option | Object | {} | 完整的 ECharts 配置选项 |
| theme | String | 'default' | 主题名称（基于 ZxChart 的主题） |
| title | String | '' | 图表标题（当 option 中没有 title 时使用） |
| loading | Boolean | false | 加载状态 |
| loadingText | String | '加载中...' | 加载文本 |
| noDataText | String | '暂无图表数据' | 空数据文本 |
| emptyImage | String | '' | 空状态图片地址 |
| width | String | '100%' | 图表宽度 |
| height | String | '100%' | 图表高度 |
| autoResize | Boolean | true | 是否自动调整大小 |
| colorScheme | String | 'default' | 配色方案：'default', 'blue', 'green', 'warm', 'cool', 'business' |
| darkTheme | Boolean | false | 是否启用暗色主题 |
| data | Object | {} | 向下兼容的旧属性 |

## 暴露的方法

| 方法 | 说明 |
|------|------|
| getInstance() | 获取 ECharts 实例 |
| resize() | 手动触发图表 resize |
| refresh() | 刷新图表配置 |
| clear() | 清空图表内容 |
| chartRef | 获取内部 ZxChart 组件的引用 |

## 事件

| 事件名 | 说明 | 参数 |
|--------|------|------|
| ready | 图表准备完成 | chart: ECharts 实例 |
| click | 图表点击事件 | params: 点击参数 |
| dblclick | 图表双击事件 | params: 点击参数 |
| mouseover | 鼠标悬停事件 | params: 悬停参数 |
| mouseout | 鼠标离开事件 | params: 离开参数 |

## 最佳实践

1. **直接使用 ECharts Option**：不要通过组件抽象层，直接传递完整的 ECharts 配置
2. **数据驱动**：通过响应式数据驱动图表更新，而不是手动调用方法
3. **性能考虑**：大量数据时考虑使用 ECharts 的数据采样、渐进加载等特性
4. **主题一致性**：在应用中保持主题的一致性

## 迁移指南

从旧版本迁移：

```javascript
// 旧版本
<EChartsWidget type="line" :data="{ option: lineConfig }" />

// 新版本（推荐）
<EChartsWidget :option="lineConfig" />

// 或者保持兼容
<EChartsWidget :data="{ option: lineConfig }" />
```