# 评估数据处理工具完整解决方案

## 📋 概述

本解决方案为评估系统提供了一套完整的数据处理工具，能够将评估接口返回的原始数据转换为各种图表组件（基于ECharts）和表格组件所需的格式。

## 🎯 解决的问题

1. **数据格式不匹配**：评估接口返回的数据格式与图表组件需要的格式不一致
2. **重复转换逻辑**：避免在每个组件中重复编写数据转换代码
3. **动态列处理**：TableWidget需要根据数据动态生成列配置
4. **配置合并**：需要将基础配置与数据配置进行合并

## 📁 文件结构

```
src/components/ZXHL/utils/
├── index.js                           # 工具入口文件
├── evaluationDataProcessor.js         # 核心数据处理工具
├── evaluationDataProcessor.examples.js # 使用示例
├── evaluationDataProcessor.test.js    # 测试文件
├── dashboardDataHandler.js            # Dashboard集成方案
└── README.md                          # 详细文档
```

## 🔧 核心功能

### 1. 图表数据转换

支持以下图表类型：

| 图表类型 | 函数名 | 说明 |
|---------|--------|------|
| 柱状图 | `transformToBarChart()` | 适合对比不同系列的指标值 |
| 雷达图 | `transformToRadarChart()` | 适合多维度综合分析 |
| 折线图 | `transformToLineChart()` | 适合趋势分析 |
| 曲线图 | `transformToCurveChart()` | 平滑的折线图 |
| 面积图 | `transformToAreaChart()` | 带填充的折线图 |
| 饼图 | `transformToPieChart()` | 适合分布分析 |
| 散点图 | `transformToScatterChart()` | 适合相关性分析 |

### 2. 表格数据转换

- **动态列生成**：根据`titleList`动态创建列配置
- **数据转换**：将二维数组转换为对象数组
- **类型转换**：字符串数据自动转换为数字

### 3. 通用转换接口

- `transformByChartType()` - 根据类型字符串转换
- `batchTransformEvaluationData()` - 批量转换多种格式

## 📊 数据流程

```
评估接口数据
    ↓
evaluationDataProcessor.js
    ↓
┌─────────────┬─────────────┬─────────────┐
│  图表配置   │  表格配置   │  其他格式   │
│  (ECharts)  │ (TableWidget)│            │
└─────────────┴─────────────┴─────────────┘
    ↓               ↓               ↓
图表组件        表格组件        其他组件
```

## 🚀 快速开始

### 1. 基本使用

```javascript
import { transformToBarChart, transformToTableData } from '@/components/ZXHL/utils'

// 转换图表数据
const chartOptions = transformToBarChart(evaluationData, {
  title: { text: '评估结果' }
})

// 转换表格数据
const tableConfig = transformToTableData(evaluationData)
```

### 2. 在Vue组件中使用

```vue
<template>
  <div>
    <div ref="chartRef" style="height: 400px;"></div>
    <TableWidget :columns="tableConfig.columns" :data="tableConfig.data" />
  </div>
</template>

<script setup>
import { transformToBarChart, transformToTableData } from '@/components/ZXHL/utils'
// ... 其他代码
</script>
```

### 3. Dashboard集成

```javascript
import { DashboardDataHandler } from '@/components/ZXHL/utils/dashboardDataHandler'

// 处理数据并生成面板配置
const processedData = DashboardDataHandler.processEvaluationData(evaluationData)
const panels = DashboardDataHandler.createPanelConfigs(processedData)
```

## 🔍 支持的数据格式

### 输入格式（评估接口返回）

```javascript
{
  "success": true,
  "data": {
    "zhpgObjectResultList": [
      ["0.90888", "0.87", "0.8284", ...], // 系列1数据
      ["0.87364", "0.93", "0.8072", ...]  // 系列2数据
    ],
    "detailNames": [
      "作战任务效能评估",
      "火力打击能力", 
      "防御能力"
      // ...更多指标
    ],
    "titleList": [
      "有电池",
      "无电池"
    ],
    "type": "1"
  }
}
```

### 输出格式示例

#### ECharts柱状图配置
```javascript
{
  xAxis: { type: 'category', data: ['作战任务效能评估', ...] },
  yAxis: { type: 'value', min: 0, max: 1 },
  series: [
    { name: '有电池', type: 'bar', data: [0.90888, 0.87, ...] },
    { name: '无电池', type: 'bar', data: [0.87364, 0.93, ...] }
  ],
  legend: { data: ['有电池', '无电池'] }
}
```

#### TableWidget配置
```javascript
{
  columns: [
    { key: 'indicator', title: '评估指标', width: 200 },
    { key: 'series_0', title: '有电池', width: 120 },
    { key: 'series_1', title: '无电池', width: 120 }
  ],
  data: [
    { id: 'row_0', indicator: '作战任务效能评估', series_0: 0.90888, series_1: 0.87364 },
    // ...更多行
  ]
}
```

## ✅ 特性

- **🔧 灵活配置**：支持基础配置与数据配置的深度合并
- **🛡️ 错误处理**：完善的异常处理机制，保证系统稳定性
- **📊 多格式支持**：支持7种图表类型 + 表格数据
- **🔄 批量处理**：支持一次性转换多种格式
- **📱 响应式**：自动适配不同尺寸的容器
- **🎨 主题兼容**：与系统主题无缝集成

## 🧪 测试

运行测试验证功能：

```javascript
import { runTests } from '@/components/ZXHL/utils/evaluationDataProcessor.test.js'
runTests() // 在浏览器控制台查看测试结果
```

## 📖 详细文档

- [完整API文档](./README.md)
- [使用示例](./evaluationDataProcessor.examples.js)
- [测试用例](./evaluationDataProcessor.test.js)
- [Dashboard集成方案](./dashboardDataHandler.js)

## 🔮 扩展性

工具设计具有良好的扩展性：

1. **新增图表类型**：在`evaluationDataProcessor.js`中添加新的转换函数
2. **自定义数据处理**：继承基础转换函数，实现特定业务逻辑
3. **插件机制**：可以作为插件集成到其他系统中

## 💡 最佳实践

1. **配置复用**：将常用的图表配置提取为常量
2. **错误处理**：在组件中妥善处理转换失败的情况
3. **性能优化**：对于大数据量，考虑使用分页或虚拟滚动
4. **缓存策略**：对转换结果进行适当缓存，避免重复计算

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个工具！