# ZxChartNew 增强图表组件

基于 ECharts 4.9.0 的增强图表组件，提供更强大的自适应能力和性能优化。

## 特性

- 🚀 **基于 ECharts 4.9.0**：使用稳定版本的 ECharts 图表库
- 📱 **增强自适应**：支持 ResizeObserver API，实现更精准的容器尺寸监听
- 🎨 **主题自适应**：支持明暗主题自动切换，与系统主题联动
- ⚡ **性能优化**：防抖处理、内存优化等多重性能优化
- 🔧 **高度可配置**：丰富的配置选项，满足各种使用场景
- 💪 **TypeScript 支持**：完整的类型定义和智能提示
- 🌐 **兼容性强**：支持 resize-observer-polyfill，兼容旧版浏览器

## 与 ZxChart 的区别

| 特性 | ZxChart | ZxChartNew |
|------|---------|------------|
| ECharts 版本 | 5.4.2 | 4.9.0 |
| 自适应监听 | window.resize | ResizeObserver + window.resize |
| 主题自适应 | 无 | 支持明暗主题自动切换 |
| 防抖优化 | 基础防抖 | 可配置防抖延迟 |
| 内存管理 | 基础清理 | 增强内存管理 |
| 性能监控 | 无 | 内置性能监控 |
| 兼容性 | 现代浏览器 | 支持旧版浏览器 |

## 安装

组件已集成在项目中，无需额外安装。

## 基础用法

```vue
<template>
  <ZxChartNew
    :options="chartOptions"
    height="400px"
    :auto-resize="true"
  />
</template>

<script setup>
import { reactive } from 'vue'

const chartOptions = reactive({
  title: {
    text: '示例图表'
  },
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxis: {
    type: 'value'
  },
  series: [{
    data: [120, 200, 150, 80, 70, 110, 130],
    type: 'bar'
  }]
})
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| options | ECharts 配置选项 | `Object` | `{}` |
| width | 图表宽度 | `String` | `'100%'` |
| height | 图表高度 | `String` | `'400px'` |
| autoResize | 是否启用自动调整大小 | `Boolean` | `true` |
| loading | 是否显示加载状态 | `Boolean` | `false` |
| loadingOptions | 加载状态配置 | `Object` | `{}` |
| initOptions | 初始化选项 | `Object` | `{}` |
| group | 图表分组 | `String` | `undefined` |
| manualUpdate | 是否手动更新 | `Boolean` | `false` |
| watchShallow | 是否浅层监听 options | `Boolean` | `false` |
| theme | 主题配置 | `String \| Object` | `'auto'` |
| enableThemeAdaptation | 是否启用主题自适应 | `Boolean` | `true` |
| resizeDebounce | 调整大小防抖延迟 | `Number` | `100` |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| ready | 图表初始化完成 | `(chart: ECharts)` |
| resize | 图表尺寸调整 | `(size: {width: number, height: number})` |
| theme-change | 主题变化事件 | `(theme: Object)` |
| click | 图表点击事件 | `(params: Object)` |
| dblclick | 图表双击事件 | `(params: Object)` |
| mousedown | 鼠标按下事件 | `(params: Object)` |
| mousemove | 鼠标移动事件 | `(params: Object)` |
| mouseup | 鼠标释放事件 | `(params: Object)` |
| mouseover | 鼠标悬停事件 | `(params: Object)` |
| mouseout | 鼠标离开事件 | `(params: Object)` |
| globalout | 全局鼠标离开事件 | `(params: Object)` |
| contextmenu | 右键菜单事件 | `(params: Object)` |

### 方法

通过 ref 可以访问以下方法：

| 方法名 | 说明 | 参数 |
|--------|------|------|
| getChart | 获取 ECharts 实例 | - |
| setOption | 设置图表配置 | `(option: Object, opts?: Object)` |
| resize | 手动调整图表大小 | `(opts?: Object)` |
| clear | 清空图表 | - |
| dispose | 销毁图表实例 | - |
| showLoading | 显示加载动画 | `(type?: string, opts?: Object)` |
| hideLoading | 隐藏加载动画 | - |
| getDataURL | 获取图表图片 | `(opts?: Object)` |
| getConnectedDataURL | 获取联动图表图片 | `(opts?: Object)` |
| convertToPixel | 转换为像素坐标 | `(finder: Object, value: Array)` |
| convertFromPixel | 从像素坐标转换 | `(finder: Object, value: Array)` |
| containPixel | 判断像素点是否在指定坐标系或者系列上 | `(finder: Object, value: Array)` |
| refreshTheme | 刷新主题配置 | - |

## 高级用法

### 自适应配置

```vue
<template>
  <ZxChartNew
    ref="chartRef"
    :options="chartOptions"
    :auto-resize="true"
    @resize="onChartResize"
  />
</template>

<script setup>
const onChartResize = (size) => {
  console.log('图表尺寸变化:', size)
}
</script>
```

### 主题自适应

```vue
<template>
  <ZxChartNew
    ref="chartRef"
    :options="chartOptions"
    :enable-theme-adaptation="true"
    theme="auto"
    @theme-change="onThemeChange"
  />
</template>

<script setup>
const onThemeChange = (theme) => {
  console.log('主题变化:', theme)
}

// 手动刷新主题
const refreshTheme = () => {
  chartRef.value?.refreshTheme()
}
</script>
```

### 自定义主题

```vue
<template>
  <ZxChartNew
    :options="chartOptions"
    :theme="customTheme"
    :enable-theme-adaptation="false"
  />
</template>

<script setup>
const customTheme = {
  backgroundColor: '#1e1e1e',
  textStyle: {
    color: '#ffffff'
  },
  color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de']
}
</script>
```

### 性能优化

```vue
<template>
  <ZxChartNew
    :options="chartOptions"
    :manual-update="true"
    :watch-shallow="true"
  />
</template>
```

### 事件处理

```vue
<template>
  <ZxChartNew
    :options="chartOptions"
    @click="onChartClick"
    @ready="onChartReady"
  />
</template>

<script setup>
const onChartClick = (params) => {
  console.log('点击事件:', params)
}

const onChartReady = (chart) => {
  console.log('图表准备就绪:', chart)
  // 可以在这里进行额外的配置
}
</script>
```

### 动态更新数据

```vue
<template>
  <div>
    <el-button @click="updateData">更新数据</el-button>
    <ZxChartNew ref="chartRef" :options="chartOptions" />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const chartRef = ref()
const chartOptions = reactive({
  // 图表配置
})

const updateData = () => {
  // 更新数据
  chartOptions.series[0].data = generateNewData()
  
  // 或者使用 setOption 方法
  // chartRef.value.setOption({
  //   series: [{ data: generateNewData() }]
  // })
}
</script>
```

## 样式定制

组件支持通过 CSS 变量进行样式定制：

```scss
.zx-chart-new-wrapper {
  // 基础样式
  --zx-chart-new-bg-color: var(--el-bg-color);
  --zx-chart-new-border-color: var(--el-border-color);
  --zx-chart-new-border-radius: var(--el-border-radius-base);
  
  // 加载状态
  --zx-chart-new-loading-bg: rgba(255, 255, 255, 0.8);
  --zx-chart-new-loading-color: var(--el-color-primary);
  
  // 响应式断点
  --zx-chart-new-mobile-breakpoint: 768px;
  --zx-chart-new-tablet-breakpoint: 1024px;
}
```

## 兼容性

- **现代浏览器**：Chrome 50+, Firefox 50+, Safari 10+, Edge 50+
- **旧版浏览器**：通过 resize-observer-polyfill 支持 IE 11+
- **移动端**：iOS Safari 10+, Android Chrome 50+

## 注意事项

1. **ECharts 版本**：本组件基于 ECharts 4.9.0，与使用 ECharts 5.x 的组件可能存在 API 差异
2. **内存管理**：组件会自动清理资源，但在大量动态创建图表时建议手动调用 `dispose()` 方法
3. **主题适配**：主题自适应功能依赖于项目的主题系统，确保正确配置了主题变量
4. **性能优化**：在数据频繁更新的场景下，建议启用 `manualUpdate` 模式并合理控制更新频率

## 示例

完整的使用示例请参考 `example.vue` 文件，包含：

- 基础图表类型（柱状图、折线图、饼图、雷达图）
- 自适应功能演示
- 主题自适应演示
- 性能对比测试
- 事件处理示例

## 更新日志

### v1.0.0
- 基于 ECharts 4.9.0 创建组件
- 支持 ResizeObserver 自适应监听
- 增强主题自适应功能
- 添加性能优化特性
- 完善类型定义和文档

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个组件。

## 许可证

MIT License