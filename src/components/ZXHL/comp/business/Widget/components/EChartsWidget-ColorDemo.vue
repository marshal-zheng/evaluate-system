<!-- EChartsWidget 配色方案演示 -->
<template>
  <div class="color-schemes-demo">
    <h2>EChartsWidget 配色方案演示</h2>
    
    <!-- 配色方案切换器 -->
    <div class="scheme-selector">
      <el-radio-group v-model="currentScheme" @change="handleSchemeChange">
        <el-radio-button 
          v-for="scheme in colorSchemes" 
          :key="scheme.value" 
          :label="scheme.value"
        >
          {{ scheme.label }}
        </el-radio-button>
      </el-radio-group>
      
      <el-switch 
        v-model="darkMode" 
        active-text="暗色模式" 
        inactive-text="亮色模式"
        style="margin-left: 20px;"
      />
    </div>

    <!-- 图表展示区域 -->
    <div class="charts-grid">
      <!-- 折线图 -->
      <div class="chart-card">
        <h3>折线图</h3>
                <EChartsWidget
          :option="{}"
          noDataText="当前没有数据，请配置数据源"
          emptyImage=""
          height="300px"
        />
      </div>

      <!-- 柱状图 -->
      <div class="chart-card">
        <h3>柱状图</h3>
        <EChartsWidget
          :option="barOption"
          :colorScheme="currentScheme"
          :darkTheme="darkMode"
          height="280px"
        />
      </div>

      <!-- 饼图 -->
      <div class="chart-card">
        <h3>饼图</h3>
        <EChartsWidget
          :option="pieOption"
          :colorScheme="currentScheme"
          :darkTheme="darkMode"
          height="280px"
        />
      </div>

      <!-- 雷达图 -->
      <div class="chart-card">
        <h3>雷达图</h3>
        <EChartsWidget
          :option="radarOption"
          :colorScheme="currentScheme"
          :darkTheme="darkMode"
          height="280px"
        />
      </div>

      <!-- 散点图 -->
      <div class="chart-card">
        <h3>散点图</h3>
        <EChartsWidget
          :option="scatterOption"
          :colorScheme="currentScheme"
          :darkTheme="darkMode"
          height="280px"
        />
      </div>

      <!-- 面积图 -->
      <div class="chart-card">
        <h3>面积图</h3>
        <EChartsWidget
          :option="areaOption"
          :colorScheme="currentScheme"
          :darkTheme="darkMode"
          height="280px"
        />
      </div>
    </div>

    <!-- 自定义配色示例 -->
    <div class="custom-colors-section">
      <h3>自定义配色示例</h3>
      <div class="charts-grid">
        <div class="chart-card custom-purple">
          <h4>紫色主题</h4>
          <EChartsWidget
            :option="lineOption"
            height="200px"
            class="purple-theme"
          />
        </div>
        
        <div class="chart-card custom-orange">
          <h4>橙色主题</h4>
          <EChartsWidget
            :option="barOption"
            height="200px"
            class="orange-theme"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import EChartsWidget from './EChartsWidget.vue'

// 配色方案选项
const colorSchemes = [
  { label: '默认', value: 'default' },
  { label: '蓝色系', value: 'blue' },
  { label: '绿色系', value: 'green' },
  { label: '暖色系', value: 'warm' },
  { label: '冷色系', value: 'cool' },
  { label: '商务风格', value: 'business' }
]

const currentScheme = ref('default')
const darkMode = ref(false)

// 图表配置
const lineOption = reactive({
  title: { text: '月度销售趋势' },
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: ['1月', '2月', '3月', '4月', '5月', '6月']
  },
  yAxis: { type: 'value' },
  series: [
    {
      name: '销量',
      type: 'line',
      data: [120, 200, 150, 80, 70, 110],
      smooth: true
    },
    {
      name: '利润',
      type: 'line',
      data: [60, 120, 100, 40, 30, 80],
      smooth: true
    }
  ]
})

const barOption = reactive({
  title: { text: '产品销量对比' },
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: ['产品A', '产品B', '产品C', '产品D', '产品E']
  },
  yAxis: { type: 'value' },
  series: [{
    name: '销量',
    type: 'bar',
    data: [120, 200, 150, 80, 70]
  }]
})

const pieOption = reactive({
  title: { text: '市场份额分布' },
  tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
  series: [{
    type: 'pie',
    radius: ['40%', '70%'],
    data: [
      { value: 335, name: '直接访问' },
      { value: 310, name: '邮件营销' },
      { value: 234, name: '联盟广告' },
      { value: 135, name: '视频广告' },
      { value: 1548, name: '搜索引擎' }
    ]
  }]
})

const radarOption = reactive({
  title: { text: '能力雷达图' },
  radar: {
    indicator: [
      { name: '技术', max: 100 },
      { name: '设计', max: 100 },
      { name: '营销', max: 100 },
      { name: '管理', max: 100 },
      { name: '沟通', max: 100 }
    ]
  },
  series: [{
    type: 'radar',
    data: [
      { value: [80, 70, 60, 85, 75], name: '团队A' },
      { value: [70, 85, 80, 65, 70], name: '团队B' }
    ]
  }]
})

const scatterOption = reactive({
  title: { text: '身高体重分布' },
  tooltip: { trigger: 'item' },
  xAxis: { type: 'value', name: '身高(cm)' },
  yAxis: { type: 'value', name: '体重(kg)' },
  series: [{
    type: 'scatter',
    symbolSize: 8,
    data: [
      [161.2, 51.6], [167.5, 59.0], [159.5, 49.2], [157.0, 63.0], [155.8, 53.6],
      [170.0, 59.0], [159.1, 47.6], [166.0, 69.8], [176.2, 66.8], [160.2, 75.2],
      [172.5, 55.2], [170.9, 54.2], [172.9, 62.5], [153.4, 42.0], [160.0, 50.0]
    ]
  }]
})

const areaOption = reactive({
  title: { text: '网站访问量' },
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
  yAxis: { type: 'value' },
  series: [{
    name: '访问量',
    type: 'line',
    areaStyle: {},
    data: [820, 932, 901, 934, 1290, 1330, 1320]
  }]
})

const handleSchemeChange = (value) => {
  console.log('配色方案切换到:', value)
}
</script>

<style scoped>
.color-schemes-demo {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.scheme-selector {
  margin: 20px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.chart-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transform: translateY(-4px);
}

.chart-card h3,
.chart-card h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #333;
  text-align: center;
}

.custom-colors-section {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 2px solid #e4e7ed;
}

/* 自定义紫色主题 */
.purple-theme {
  --echarts-widget-color-1: #8b5cf6;
  --echarts-widget-color-2: #a855f7;
  --echarts-widget-color-3: #c084fc;
  --echarts-widget-color-4: #d8b4fe;
  --echarts-widget-color-5: #e9d5ff;
  --echarts-widget-background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --echarts-widget-border-radius: 16px;
}

/* 自定义橙色主题 */
.orange-theme {
  --echarts-widget-color-1: #f97316;
  --echarts-widget-color-2: #fb923c;
  --echarts-widget-color-3: #fdba74;
  --echarts-widget-color-4: #fed7aa;
  --echarts-widget-color-5: #ffedd5;
  --echarts-widget-background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  --echarts-widget-border-radius: 16px;
}
</style>