<template>
  <div class="theme-example">
    <div class="controls">
      <el-card>
        <template #header>
          <span>主题控制</span>
        </template>
        <el-space direction="vertical" style="width: 100%">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-switch
                v-model="enableThemeAdaptation"
                active-text="启用主题自适应"
                inactive-text="禁用主题自适应"
              />
            </el-col>
            <el-col :span="12">
              <el-button @click="refreshTheme" :disabled="!enableThemeAdaptation">
                刷新主题
              </el-button>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-select v-model="selectedTheme" placeholder="选择主题" style="width: 100%">
                <el-option label="自动主题" value="auto" />
                <el-option label="明亮主题" value="light" />
                <el-option label="深色主题" value="dark" />
                <el-option label="自定义主题" value="custom" />
              </el-select>
            </el-col>
            <el-col :span="12">
              <el-button @click="toggleSystemTheme">
                切换系统主题
              </el-button>
            </el-col>
          </el-row>
        </el-space>
      </el-card>
    </div>

    <div class="charts-container">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>柱状图 - 主题自适应</span>
            </template>
            <ZxChartNews
              ref="barChartRef"
              :options="barChartOptions"
              :theme="currentTheme"
              :enable-theme-adaptation="enableThemeAdaptation"
              height="300px"
              @theme-change="onThemeChange"
            />
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>折线图 - 主题自适应</span>
            </template>
            <ZxChartNews
              ref="lineChartRef"
              :options="lineChartOptions"
              :theme="currentTheme"
              :enable-theme-adaptation="enableThemeAdaptation"
              height="300px"
              @theme-change="onThemeChange"
            />
          </el-card>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" style="margin-top: 20px">
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>饼图 - 主题自适应</span>
            </template>
            <ZxChartNews
              ref="pieChartRef"
              :options="pieChartOptions"
              :theme="currentTheme"
              :enable-theme-adaptation="enableThemeAdaptation"
              height="300px"
              @theme-change="onThemeChange"
            />
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>雷达图 - 主题自适应</span>
            </template>
            <ZxChartNews
              ref="radarChartRef"
              :options="radarChartOptions"
              :theme="currentTheme"
              :enable-theme-adaptation="enableThemeAdaptation"
              height="300px"
              @theme-change="onThemeChange"
            />
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="theme-info">
      <el-card>
        <template #header>
          <span>主题信息</span>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="当前主题">
            {{ themeInfo.isDark ? '深色主题' : '明亮主题' }}
          </el-descriptions-item>
          <el-descriptions-item label="主题来源">
            {{ themeInfo.source }}
          </el-descriptions-item>
          <el-descriptions-item label="背景色">
            <el-tag :color="themeInfo.backgroundColor">
              {{ themeInfo.backgroundColor }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="文字颜色">
            <el-tag :color="themeInfo.textColor">
              {{ themeInfo.textColor }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

// 组件引用
const barChartRef = ref()
const lineChartRef = ref()
const pieChartRef = ref()
const radarChartRef = ref()

// 控制状态
const enableThemeAdaptation = ref(true)
const selectedTheme = ref('auto')

// 主题信息
const themeInfo = reactive({
  isDark: false,
  source: '系统主题',
  backgroundColor: '#ffffff',
  textColor: '#333333'
})

// 当前主题
const currentTheme = computed(() => {
  switch (selectedTheme.value) {
    case 'light':
      return 'light'
    case 'dark':
      return 'dark'
    case 'custom':
      return customTheme
    default:
      return 'auto'
  }
})

// 自定义主题
const customTheme = {
  backgroundColor: '#2c3e50',
  textStyle: {
    color: '#ecf0f1'
  },
  color: [
    '#e74c3c', '#3498db', '#2ecc71', '#f39c12', 
    '#9b59b6', '#1abc9c', '#34495e', '#e67e22'
  ]
}

// 图表配置
const barChartOptions = reactive({
  title: {
    text: '销售数据统计'
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
    name: '销售额',
    type: 'bar',
    data: [120, 200, 150, 80, 70, 110]
  }]
})

const lineChartOptions = reactive({
  title: {
    text: '用户增长趋势'
  },
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
  yAxis: {
    type: 'value'
  },
  series: [{
    name: '新增用户',
    type: 'line',
    data: [820, 932, 901, 934, 1290, 1330, 1320],
    smooth: true
  }]
})

const pieChartOptions = reactive({
  title: {
    text: '市场份额分布'
  },
  tooltip: {
    trigger: 'item'
  },
  series: [{
    name: '市场份额',
    type: 'pie',
    radius: '50%',
    data: [
      { value: 1048, name: '产品A' },
      { value: 735, name: '产品B' },
      { value: 580, name: '产品C' },
      { value: 484, name: '产品D' },
      { value: 300, name: '产品E' }
    ]
  }]
})

const radarChartOptions = reactive({
  title: {
    text: '能力评估雷达图'
  },
  tooltip: {},
  radar: {
    indicator: [
      { name: '技术能力', max: 100 },
      { name: '沟通能力', max: 100 },
      { name: '学习能力', max: 100 },
      { name: '团队协作', max: 100 },
      { name: '创新能力', max: 100 },
      { name: '执行能力', max: 100 }
    ]
  },
  series: [{
    name: '能力评估',
    type: 'radar',
    data: [
      {
        value: [80, 90, 85, 88, 75, 92],
        name: '员工A'
      },
      {
        value: [70, 85, 90, 80, 85, 88],
        name: '员工B'
      }
    ]
  }]
})

// 方法
const refreshTheme = () => {
  if (barChartRef.value) barChartRef.value.refreshTheme()
  if (lineChartRef.value) lineChartRef.value.refreshTheme()
  if (pieChartRef.value) pieChartRef.value.refreshTheme()
  if (radarChartRef.value) radarChartRef.value.refreshTheme()
  
  ElMessage.success('主题已刷新')
}

const toggleSystemTheme = () => {
  // 模拟切换系统主题
  const isDark = document.documentElement.classList.contains('dark')
  if (isDark) {
    document.documentElement.classList.remove('dark')
    ElMessage.info('已切换到明亮主题')
  } else {
    document.documentElement.classList.add('dark')
    ElMessage.info('已切换到深色主题')
  }
}

const onThemeChange = (theme) => {
  console.log('主题变化:', theme)
  
  // 更新主题信息
  themeInfo.isDark = theme.isDark || false
  themeInfo.source = theme.source || '未知'
  themeInfo.backgroundColor = theme.backgroundColor || '#ffffff'
  themeInfo.textColor = theme.textStyle?.color || '#333333'
  
  ElMessage.success(`主题已切换: ${themeInfo.isDark ? '深色' : '明亮'}`)
}

// 监听主题变化
watch(() => selectedTheme.value, (newTheme) => {
  ElMessage.info(`已选择主题: ${newTheme}`)
})

watch(() => enableThemeAdaptation.value, (enabled) => {
  ElMessage.info(`主题自适应已${enabled ? '启用' : '禁用'}`)
})
</script>

<style scoped>
.theme-example {
  padding: 20px;
}

.controls {
  margin-bottom: 20px;
}

.charts-container {
  margin-bottom: 20px;
}

.theme-info {
  margin-top: 20px;
}

:deep(.el-card__header) {
  background-color: var(--el-bg-color-page);
  border-bottom: 1px solid var(--el-border-color-light);
}

:deep(.el-descriptions__label) {
  font-weight: 600;
}
</style>