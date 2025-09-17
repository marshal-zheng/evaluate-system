# 评估数据处理工具 (Evaluation Data Processor)

这个工具专门用于处理评估接口返回的数据，将其转换为各种图表组件（基于ECharts）和表格组件所需的格式。

## 数据结构

### 输入数据格式
评估接口返回的数据结构如下：
```javascript
{
  "success": true,
  "code": "200", 
  "msg": "SUCCESS",
  "data": {
    "zhpgObjectResultList": [
      ["0.90888", "0.87", "0.8284", ...], // 第一个系列的数据
      ["0.87364", "0.93", "0.8072", ...]  // 第二个系列的数据
    ],
    "detailNames": [
      "作战任务效能评估",
      "火力打击能力",
      "防御能力",
      // ... 更多指标名称
    ],
    "titleList": [
      "有电池",
      "无电池"
    ],
    "type": "1"
  }
}
```

## 主要功能

### 1. 图表数据转换

支持以下图表类型的数据转换：

- **柱状图 (Bar Chart)** - `transformToBarChart()`
- **雷达图 (Radar Chart)** - `transformToRadarChart()`
- **折线图 (Line Chart)** - `transformToLineChart()`
- **曲线图 (Curve Chart)** - `transformToCurveChart()`
- **面积图 (Area Chart)** - `transformToAreaChart()`
- **饼图 (Pie Chart)** - `transformToPieChart()`
- **散点图 (Scatter Chart)** - `transformToScatterChart()`

### 2. 表格数据转换

- **表格数据 (Table Data)** - `transformToTableData()`

### 3. 通用转换方法

- **按类型转换** - `transformByChartType()`
- **批量转换** - `batchTransformEvaluationData()`

## 使用方法

### 基本用法

```javascript
// 导入工具函数
import {
  transformToBarChart,
  transformToRadarChart,
  transformToTableData
} from '@/components/ZXHL/utils'

// 假设从API获取的数据
const evaluationData = response.data

// 转换为柱状图配置
const barChartOptions = transformToBarChart(evaluationData, {
  title: { text: '评估结果对比' },
  grid: { left: '10%', right: '10%' }
})

// 转换为雷达图配置
const radarChartOptions = transformToRadarChart(evaluationData, {
  title: { text: '综合能力分析' }
})

// 转换为表格数据
const tableConfig = transformToTableData(evaluationData)
```

### 在Vue组件中使用

```vue
<template>
  <div>
    <!-- ECharts图表 -->
    <div ref="chartRef" style="width: 100%; height: 400px;"></div>
    
    <!-- 表格组件 -->
    <TableWidget 
      :columns="tableConfig.columns"
      :data="tableConfig.data"
      :loading="loading"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { transformToBarChart, transformToTableData } from '@/components/ZXHL/utils'
import { getEvaluationResultData } from '@/api/modules/evaluation'
import TableWidget from '@/components/ZXHL/comp/business/Widget/components/TableWidget.vue'

const chartRef = ref()
const tableConfig = ref({ columns: [], data: [] })
const loading = ref(false)

async function loadData() {
  loading.value = true
  try {
    const response = await getEvaluationResultData()
    if (response.success) {
      const evaluationData = response.data
      
      // 转换并渲染图表
      const chartOptions = transformToBarChart(evaluationData, {
        title: { text: '评估结果' }
      })
      const chart = echarts.init(chartRef.value)
      chart.setOption(chartOptions)
      
      // 转换表格数据
      tableConfig.value = transformToTableData(evaluationData)
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>
```

### 批量转换

```javascript
import { batchTransformEvaluationData } from '@/components/ZXHL/utils'

const chartConfigs = [
  {
    type: 'bar',
    key: 'barChart',
    baseOptions: { title: { text: '柱状图' } }
  },
  {
    type: 'radar', 
    key: 'radarChart',
    baseOptions: { title: { text: '雷达图' } }
  },
  {
    type: 'table',
    key: 'tableData'
  }
]

const results = batchTransformEvaluationData(evaluationData, chartConfigs)
// results = { barChart: {...}, radarChart: {...}, tableData: {...} }
```

## API 参考

### transformToBarChart(evaluationData, baseOptions)
将评估数据转换为ECharts柱状图配置

**参数：**
- `evaluationData` - 评估数据对象
- `baseOptions` - 基础ECharts配置对象（可选）

**返回值：** ECharts柱状图配置对象

### transformToRadarChart(evaluationData, baseOptions)  
将评估数据转换为ECharts雷达图配置

**参数：**
- `evaluationData` - 评估数据对象
- `baseOptions` - 基础ECharts配置对象（可选）

**返回值：** ECharts雷达图配置对象

### transformToTableData(evaluationData)
将评估数据转换为表格数据

**参数：**
- `evaluationData` - 评估数据对象

**返回值：** 
```javascript
{
  columns: [
    { key: 'indicator', title: '评估指标', width: 200 },
    { key: 'series_0', title: '有电池', width: 120 },
    { key: 'series_1', title: '无电池', width: 120 }
  ],
  data: [
    { id: 'row_0', indicator: '作战任务效能评估', series_0: 0.90888, series_1: 0.87364 },
    // ...更多行数据
  ]
}
```

### transformByChartType(chartType, evaluationData, baseOptions, extraParams)
根据图表类型转换数据

**参数：**
- `chartType` - 图表类型字符串
- `evaluationData` - 评估数据对象  
- `baseOptions` - 基础配置对象（可选）
- `extraParams` - 额外参数对象（可选）

**支持的图表类型：**
- `'bar'` | `'barchart'` - 柱状图
- `'radar'` | `'radarchart'` - 雷达图
- `'line'` | `'linechart'` - 折线图
- `'curve'` | `'curvechart'` - 曲线图
- `'area'` | `'areachart'` - 面积图
- `'pie'` | `'piechart'` - 饼图
- `'scatter'` | `'scatterchart'` - 散点图
- `'table'` - 表格数据

### batchTransformEvaluationData(evaluationData, chartConfigs)
批量转换评估数据为多种格式

**参数：**
- `evaluationData` - 评估数据对象
- `chartConfigs` - 图表配置数组

**chartConfigs 格式：**
```javascript
[
  {
    type: 'bar',           // 图表类型
    key: 'barChart',       // 结果对象的键名
    baseOptions: {...},    // 基础配置（可选）
    extraParams: {...}     // 额外参数（可选）
  }
]
```

## 注意事项

1. **数据格式验证**：工具会检查输入数据的完整性，如果缺少必要字段会返回基础配置
2. **数字转换**：字符串数据会自动转换为数字类型
3. **错误处理**：转换过程中的错误会被捕获并记录到控制台
4. **配置合并**：基础配置会与生成的配置进行深度合并

## 测试

运行测试文件来验证功能：
```javascript
import { runTests } from '@/components/ZXHL/utils/evaluationDataProcessor.test.js'
runTests()
```