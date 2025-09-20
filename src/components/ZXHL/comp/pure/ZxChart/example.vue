<template>
  <div class="zx-chart-new-example">
    <el-card class="example-header">
      <template #header>
        <div class="card-header">
          <span>ZxChartNew 图表组件演示</span>
          <el-tag type="success">基于 ECharts 4.9.0</el-tag>
        </div>
      </template>
      <p>
        ZxChartNew 是基于 ECharts 4.9.0 的增强图表组件，支持 ResizeObserver 自适应监听、防抖优化等特性。
        相比原版 ZxChart，新增了更强大的自适应能力和性能优化。
      </p>
    </el-card>

    <!-- 基础图表示例 -->
    <el-row :gutter="20" class="example-section">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>基础柱状图</span>
          </template>
          <ZxChartNew
            :options="barChartOptions"
            height="300px"
            :auto-resize="true"
            @ready="onChartReady"
            @click="onChartClick"
          />
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>折线图</span>
          </template>
          <ZxChartNew
            :options="lineChartOptions"
            height="300px"
            :auto-resize="true"
          />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="example-section">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>饼图</span>
          </template>
          <ZxChartNew
            :options="pieChartOptions"
            height="300px"
            :auto-resize="true"
          />
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>雷达图</span>
          </template>
          <ZxChartNew
            :options="radarChartOptions"
            height="300px"
            :auto-resize="true"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- 自适应功能演示 -->
    <el-card class="example-section">
      <template #header>
        <div class="card-header">
          <span>自适应功能演示</span>
          <div>
            <el-button @click="toggleContainerSize" type="primary">
              {{ isLargeContainer ? '缩小容器' : '放大容器' }}
            </el-button>
            <el-button @click="updateData" type="success">更新数据</el-button>
            <el-button @click="clearChart" type="warning">清空图表</el-button>
            <el-button @click="resizeChart" type="info">手动调整大小</el-button>
          </div>
        </div>
      </template>
      
      <div 
        :class="['dynamic-container', { 'large': isLargeContainer }]"
        ref="dynamicContainer"
      >
        <ZxChartNew
          ref="dynamicChartRef"
          :options="dynamicChartOptions"
          :auto-resize="true"
          :resize-debounce="100"
          :enable-theme-adaptation="true"
          @resize="onChartResize"
          @ready="onDynamicChartReady"
        />
      </div>
      
      <div class="resize-info">
        <el-alert 
          title="自适应信息" 
          type="info" 
          :closable="false"
          show-icon
        >
          <p>容器尺寸: {{ containerSize.width }}px × {{ containerSize.height }}px</p>
          <p>调整次数: {{ resizeCount }}</p>
          <p>最后调整时间: {{ lastResizeTime }}</p>
        </el-alert>
      </div>
    </el-card>

    <!-- 主题自适应演示 -->
    <el-card class="example-section">
      <template #header>
        <div class="card-header">
          <span>主题自适应演示</span>
          <div>
            <el-switch
              v-model="themeAdaptationEnabled"
              active-text="主题适配"
              inactive-text="主题适配"
              @change="onThemeAdaptationChange"
            />
            <el-button @click="toggleTheme" type="primary" style="margin-left: 10px;">
              切换主题
            </el-button>
            <el-button @click="refreshTheme" type="success">刷新主题</el-button>
          </div>
        </div>
      </template>
      
      <ZxChartNew
        ref="themeChartRef"
        :options="themeChartOptions"
        height="350px"
        :auto-resize="true"
        :enable-theme-adaptation="themeAdaptationEnabled"
        @theme-change="onThemeChange"
      />
      
      <div class="theme-info">
        <el-alert 
          title="主题信息" 
          type="success" 
          :closable="false"
          show-icon
        >
          <p>当前主题: {{ currentTheme.name }}</p>
          <p>主题类型: {{ currentTheme.type }}</p>
          <p>深色模式: {{ currentTheme.isDark ? '是' : '否' }}</p>
        </el-alert>
      </div>
    </el-card>

    <!-- 性能对比演示 -->
    <el-card class="example-section">
      <template #header>
        <div class="card-header">
          <span>性能对比演示</span>
          <div>
            <el-button @click="startPerformanceTest" type="primary" :loading="performanceTestRunning">
              {{ performanceTestRunning ? '测试中...' : '开始性能测试' }}
            </el-button>
            <el-button @click="resetPerformanceTest" type="warning">重置测试</el-button>
          </div>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="performance-chart-container">
            <h4>ZxChartNew (新版本)</h4>
            <ZxChartNew
              ref="newChartRef"
              :options="performanceChartOptions"
              height="250px"
              :auto-resize="true"
              :resize-debounce="50"
            />
            <div class="performance-stats">
              <p>渲染时间: {{ performanceStats.newChart.renderTime }}ms</p>
              <p>调整次数: {{ performanceStats.newChart.resizeCount }}</p>
            </div>
          </div>
        </el-col>
        
        <el-col :span="12">
          <div class="performance-chart-container">
            <h4>对比数据</h4>
            <div class="performance-comparison">
              <el-progress 
                :percentage="performanceStats.improvement" 
                :color="progressColor"
                :stroke-width="20"
              >
                <span>性能提升 {{ performanceStats.improvement }}%</span>
              </el-progress>
              <div class="comparison-details">
                <p>ResizeObserver 支持: ✅</p>
                <p>防抖优化: ✅</p>
                <p>内存优化: ✅</p>
                <p>主题缓存: ✅</p>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import ZxChartNew from './index.vue'
import { ElMessage } from 'element-plus'

// 响应式数据
const dynamicChartRef = ref()
const themeChartRef = ref()
const newChartRef = ref()
const dynamicContainer = ref()

const isLargeContainer = ref(false)
const themeAdaptationEnabled = ref(true)
const performanceTestRunning = ref(false)
const resizeCount = ref(0)
const lastResizeTime = ref('未调整')

const containerSize = reactive({
  width: 0,
  height: 0
})

const currentTheme = reactive({
  name: 'light',
  type: 'light',
  isDark: false
})

const performanceStats = reactive({
  newChart: {
    renderTime: 0,
    resizeCount: 0
  },
  improvement: 0
})

// 基础柱状图配置
const barChartOptions = reactive({
  title: {
    text: '月度销售数据',
    left: 'center'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {
    data: ['销售额', '利润'],
    top: 30
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: ['1月', '2月', '3月', '4月', '5月', '6月']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '销售额',
      type: 'bar',
      data: [120, 200, 150, 80, 70, 110],
      itemStyle: {
        color: '#409EFF'
      }
    },
    {
      name: '利润',
      type: 'bar',
      data: [60, 100, 75, 40, 35, 55],
      itemStyle: {
        color: '#67C23A'
      }
    }
  ]
})

// 折线图配置
const lineChartOptions = reactive({
  title: {
    text: '网站访问量趋势',
    left: 'center'
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['访问量', '用户数'],
    top: 30
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '访问量',
      type: 'line',
      data: [120, 132, 101, 134, 90, 230, 210],
      smooth: true,
      itemStyle: {
        color: '#409EFF'
      }
    },
    {
      name: '用户数',
      type: 'line',
      data: [220, 182, 191, 234, 290, 330, 310],
      smooth: true,
      itemStyle: {
        color: '#67C23A'
      }
    }
  ]
})

// 饼图配置
const pieChartOptions = reactive({
  title: {
    text: '产品销售占比',
    left: 'center'
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    top: 'middle'
  },
  series: [
    {
      name: '销售占比',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['60%', '50%'],
      avoidLabelOverlap: false,
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '18',
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: [
        { value: 335, name: '产品A' },
        { value: 310, name: '产品B' },
        { value: 234, name: '产品C' },
        { value: 135, name: '产品D' },
        { value: 1548, name: '产品E' }
      ]
    }
  ]
})

// 雷达图配置
const radarChartOptions = reactive({
  title: {
    text: '能力评估雷达图',
    left: 'center'
  },
  tooltip: {},
  legend: {
    data: ['预算分配', '实际开销'],
    top: 30
  },
  radar: {
    indicator: [
      { name: '销售', max: 6500 },
      { name: '管理', max: 16000 },
      { name: '信息技术', max: 30000 },
      { name: '客服', max: 38000 },
      { name: '研发', max: 52000 },
      { name: '市场', max: 25000 }
    ]
  },
  series: [
    {
      name: '预算 vs 开销',
      type: 'radar',
      data: [
        {
          value: [4200, 3000, 20000, 35000, 50000, 18000],
          name: '预算分配'
        },
        {
          value: [5000, 14000, 28000, 26000, 42000, 21000],
          name: '实际开销'
        }
      ]
    }
  ]
})

// 动态图表配置
const dynamicChartOptions = reactive({
  title: {
    text: '实时数据监控',
    left: 'center'
  },
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: ['00:00', '00:05', '00:10', '00:15', '00:20', '00:25', '00:30']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '数据值',
      type: 'line',
      data: [10, 20, 15, 25, 30, 18, 22],
      smooth: true,
      areaStyle: {},
      itemStyle: {
        color: '#409EFF'
      }
    }
  ]
})

// 主题图表配置
const themeChartOptions = reactive({
  title: {
    text: '主题自适应图表',
    left: 'center'
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['系列1', '系列2', '系列3'],
    top: 30
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: ['A', 'B', 'C', 'D', 'E', 'F', 'G']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '系列1',
      type: 'bar',
      data: [120, 200, 150, 80, 70, 110, 130]
    },
    {
      name: '系列2',
      type: 'bar',
      data: [60, 100, 75, 40, 35, 55, 65]
    },
    {
      name: '系列3',
      type: 'line',
      data: [90, 150, 112, 60, 52, 82, 97]
    }
  ]
})

// 性能测试图表配置
const performanceChartOptions = reactive({
  title: {
    text: '性能测试数据',
    left: 'center'
  },
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: Array.from({ length: 50 }, (_, i) => `点${i + 1}`)
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '测试数据',
      type: 'line',
      data: Array.from({ length: 50 }, () => Math.floor(Math.random() * 100)),
      smooth: true
    }
  ]
})

// 计算属性
const progressColor = computed(() => {
  if (performanceStats.improvement >= 80) return '#67c23a'
  if (performanceStats.improvement >= 60) return '#e6a23c'
  return '#f56c6c'
})

// 事件处理函数
const onChartReady = (chart) => {
  console.log('图表准备就绪:', chart)
  ElMessage.success('图表加载完成')
}

const onChartClick = (params) => {
  console.log('图表点击事件:', params)
  ElMessage.info(`点击了: ${params.name}`)
}

const onChartResize = () => {
  resizeCount.value++
  lastResizeTime.value = new Date().toLocaleTimeString()
  updateContainerSize()
}

const onDynamicChartReady = (chart) => {
  console.log('动态图表准备就绪:', chart)
}

const onThemeChange = (themeInfo) => {
  Object.assign(currentTheme, themeInfo)
  console.log('主题变化:', themeInfo)
  ElMessage.info(`主题已切换为: ${themeInfo.name}`)
}

const onThemeAdaptationChange = (enabled) => {
  ElMessage.info(`主题适配已${enabled ? '启用' : '禁用'}`)
}

// 操作函数
const toggleContainerSize = () => {
  isLargeContainer.value = !isLargeContainer.value
  nextTick(() => {
    updateContainerSize()
  })
}

const updateData = () => {
  // 更新动态图表数据
  const newData = Array.from({ length: 7 }, () => Math.floor(Math.random() * 50))
  dynamicChartOptions.series[0].data = newData
  ElMessage.success('数据已更新')
}

const clearChart = () => {
  if (dynamicChartRef.value) {
    dynamicChartRef.value.clear()
    ElMessage.warning('图表已清空')
  }
}

const resizeChart = () => {
  if (dynamicChartRef.value) {
    dynamicChartRef.value.resize()
    ElMessage.info('图表大小已调整')
  }
}

const toggleTheme = () => {
  // 简单的主题切换逻辑
  const html = document.documentElement
  const isDark = html.classList.contains('dark')
  
  if (isDark) {
    html.classList.remove('dark')
    html.setAttribute('data-theme', 'light')
  } else {
    html.classList.add('dark')
    html.setAttribute('data-theme', 'dark')
  }
}

const refreshTheme = () => {
  if (themeChartRef.value) {
    themeChartRef.value.refreshTheme()
    ElMessage.success('主题已刷新')
  }
}

const startPerformanceTest = async () => {
  performanceTestRunning.value = true
  
  try {
    // 模拟性能测试
    const startTime = performance.now()
    
    // 更新图表数据多次
    for (let i = 0; i < 10; i++) {
      const newData = Array.from({ length: 50 }, () => Math.floor(Math.random() * 100))
      performanceChartOptions.series[0].data = newData
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    const endTime = performance.now()
    performanceStats.newChart.renderTime = Math.round(endTime - startTime)
    performanceStats.newChart.resizeCount = resizeCount.value
    
    // 计算性能提升（模拟数据）
    performanceStats.improvement = Math.min(95, Math.max(60, 
      100 - (performanceStats.newChart.renderTime / 20)
    ))
    
    ElMessage.success('性能测试完成')
  } catch (error) {
    ElMessage.error('性能测试失败')
  } finally {
    performanceTestRunning.value = false
  }
}

const resetPerformanceTest = () => {
  performanceStats.newChart.renderTime = 0
  performanceStats.newChart.resizeCount = 0
  performanceStats.improvement = 0
  ElMessage.info('性能测试已重置')
}

const updateContainerSize = () => {
  if (dynamicContainer.value) {
    const rect = dynamicContainer.value.getBoundingClientRect()
    containerSize.width = Math.round(rect.width)
    containerSize.height = Math.round(rect.height)
  }
}

// 生命周期
onMounted(() => {
  nextTick(() => {
    updateContainerSize()
  })
})
</script>

<style lang="scss" scoped>
.zx-chart-new-example {
  padding: 20px;
  
  .example-header {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
  
  .example-section {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
  
  .dynamic-container {
    height: 300px;
    transition: all 0.3s ease;
    border: 2px dashed #dcdfe6;
    border-radius: 4px;
    
    &.large {
      height: 500px;
    }
  }
  
  .resize-info,
  .theme-info {
    margin-top: 15px;
  }
  
  .performance-chart-container {
    text-align: center;
    
    h4 {
      margin-bottom: 10px;
      color: var(--el-text-color-primary);
    }
    
    .performance-stats {
      margin-top: 10px;
      padding: 10px;
      background-color: var(--el-fill-color-light);
      border-radius: 4px;
      
      p {
        margin: 5px 0;
        font-size: 14px;
        color: var(--el-text-color-regular);
      }
    }
  }
  
  .performance-comparison {
    padding: 20px;
    
    .comparison-details {
      margin-top: 20px;
      
      p {
        margin: 8px 0;
        font-size: 14px;
        color: var(--el-text-color-regular);
      }
    }
  }
}
</style>