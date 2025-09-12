<template>
  <div class="evaluation-overview">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">
        <el-icon><DataBoard /></el-icon>
        评估概览
      </h1>
      <p class="page-description">综合效能分析评估工具 - 专业的数据分析平台</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stats-card stats-card--primary">
          <div class="stats-content">
            <div class="stats-icon">
              <el-icon><DataAnalysis /></el-icon>
            </div>
            <div class="stats-info">
              <h3 class="stats-number">{{ stats.totalEvaluations }}</h3>
              <p class="stats-label">总评估数</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stats-card stats-card--success">
          <div class="stats-content">
            <div class="stats-icon">
              <el-icon><PieChart /></el-icon>
            </div>
            <div class="stats-info">
              <h3 class="stats-number">{{ stats.completedEvaluations }}</h3>
              <p class="stats-label">已完成评估</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stats-card stats-card--warning">
          <div class="stats-content">
            <div class="stats-icon">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stats-info">
              <h3 class="stats-number">{{ stats.activeModels }}</h3>
              <p class="stats-label">活跃模型</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stats-card stats-card--info">
          <div class="stats-content">
            <div class="stats-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="stats-info">
              <h3 class="stats-number">{{ stats.activeUsers }}</h3>
              <p class="stats-label">活跃用户</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 功能快捷入口 -->
    <el-card class="feature-card">
      <template #header>
        <div class="card-header">
          <h2>快速开始</h2>
          <p>选择您需要的功能模块</p>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6" v-for="feature in features" :key="feature.key">
          <div class="feature-item" @click="navigateTo(feature.path)">
            <div class="feature-icon">
              <el-icon :size="32">
                <component :is="feature.icon" />
              </el-icon>
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
            <el-button type="primary" size="small" class="feature-button">
              立即使用
            </el-button>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 最近活动 -->
    <el-row :gutter="20">
      <el-col :xs="24" :md="12">
        <el-card class="activity-card">
          <template #header>
            <h3>最近评估任务</h3>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="activity in recentActivities"
              :key="activity.id"
              :timestamp="activity.timestamp"
              :type="activity.type"
            >
              <h4>{{ activity.title }}</h4>
              <p>{{ activity.description }}</p>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card class="chart-card">
          <template #header>
            <h3>评估趋势</h3>
          </template>
          <div class="chart-placeholder">
            <el-icon :size="64"><TrendCharts /></el-icon>
            <p>图表数据加载中...</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 测试长内容区域 -->
    <div class="test-long-content" style="margin-top: 20px;">
      <h2 style="color: var(--el-text-color-primary); margin-bottom: 20px;">测试滚动区域 (长内容)</h2>
      <div class="long-content-container">
        <div v-for="i in 50" :key="i" style="margin-bottom: 15px;">
          <el-card class="test-card">
            <h3>测试项目 #{{ i }}</h3>
            <p>这是第 {{ i }} 个测试项目的内容。这里有很多文字内容用来测试页面的滚动功能是否正常工作。</p>
            <p>当页面内容很长时，应该只有主内容区域可以滚动，而顶部导航栏和左侧边栏应该保持固定不动。</p>
            <p>这符合标准的中后台管理系统的布局模式，提供更好的用户体验。</p>
            <div style="margin-top: 10px;">
              <el-tag type="primary">项目 {{ i }}</el-tag>
              <el-tag type="success" style="margin-left: 10px;">正常</el-tag>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  DataBoard,
  DataAnalysis,
  PieChart,
  TrendCharts,
  User,
  Document,
  Grid,
  Operation,
  List,
  Tools
} from '@element-plus/icons-vue'
import { evaluationApi } from '@/components/ZXHL/api/modules/evaluation/index.js'

const router = useRouter()

// 统计数据
const stats = ref({
  totalEvaluations: 0,
  completedEvaluations: 0,
  activeModels: 0,
  activeUsers: 0
})

// 加载状态
const loading = ref(false)

// 功能模块
const features = ref([
  {
    key: 'data',
    title: '数据管理',
    description: '导入、导出和管理评估数据',
    icon: 'Document',
    path: '/data/import'
  },
  {
    key: 'indicators',
    title: '指标配置',
    description: '设置评估指标和权重',
    icon: 'Grid',
    path: '/indicators/config'
  },
  {
    key: 'models',
    title: '模型管理',
    description: '配置和管理评估模型',
    icon: 'Operation',
    path: '/models/config'
  },
  {
    key: 'execution',
    title: '执行评估',
    description: '创建和执行评估任务',
    icon: 'List',
    path: '/execution/tasks'
  }
])

// 最近活动
const recentActivities = ref([])

// 任务管理数据
const evaluationList = ref([])

// 加载统计数据 - 使用静态数据
const loadStats = async () => {
  try {
    loading.value = true
    // 使用静态统计数据
    stats.value = {
      totalEvaluations: 25,
      completedEvaluations: 15,
      activeModels: 3,
      activeUsers: 7
    }
    ElMessage.success('统计数据已更新')
  } catch (error) {
    console.error('加载统计数据失败:', error)
    ElMessage.error('加载统计数据失败')
  } finally {
    loading.value = false
  }
}

// 加载任务管理
const loadEvaluationList = async () => {
  try {
    const response = await evaluationApi.getEvaluationList({ page: 1, size: 5 })
    if (response.code === 200) {
      evaluationList.value = response.data.list
      // 转换为活动数据格式
      recentActivities.value = response.data.list.slice(0, 3).map(item => ({
        id: item.id,
        title: `评估任务: ${item.name}`,
        description: `状态: ${item.status} | 创建时间: ${item.createTime}`,
        timestamp: item.createTime,
        type: item.status === 'completed' ? 'success' : item.status === 'running' ? 'primary' : 'info'
      }))
      console.log('Mock任务管理数据:', response.data)
    }
  } catch (error) {
    console.error('加载任务管理失败:', error)
    ElMessage.error('加载任务管理失败，请检查mock配置')
  }
}

// 导航到指定页面
const navigateTo = (path) => {
  router.push(path)
}

// 页面初始化
onMounted(async () => {
  console.log('评估概览页面已加载，开始测试Mock数据...')
  await loadStats()
  await loadEvaluationList()
})
</script>

<style lang="scss" scoped>
.evaluation-overview {
  padding: 20px;
  
  .page-header {
    margin-bottom: 24px;
    
    .page-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 28px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin: 0 0 8px 0;
    }
    
    .page-description {
      color: var(--el-text-color-regular);
      font-size: 14px;
      margin: 0;
    }
  }
  
  .stats-row {
    margin-bottom: 24px;
  }
  
  .stats-card {
    border: none;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15);
    }
    
    .stats-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .stats-icon {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: white;
    }
    
    .stats-info {
      flex: 1;
    }
    
    .stats-number {
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 4px 0;
      color: var(--el-text-color-primary);
    }
    
    .stats-label {
      font-size: 14px;
      color: var(--el-text-color-regular);
      margin: 0;
    }
    
    &--primary .stats-icon {
      background: linear-gradient(135deg, #409eff 0%, #1890ff 100%);
    }
    
    &--success .stats-icon {
      background: linear-gradient(135deg, #67c23a 0%, #52c41a 100%);
    }
    
    &--warning .stats-icon {
      background: linear-gradient(135deg, #e6a23c 0%, #fa8c16 100%);
    }
    
    &--info .stats-icon {
      background: linear-gradient(135deg, #909399 0%, #8c8c8c 100%);
    }
  }
  
  .feature-card {
    margin-bottom: 24px;
    
    .card-header {
      h2 {
        margin: 0 0 4px 0;
        color: var(--el-text-color-primary);
      }
      
      p {
        margin: 0;
        color: var(--el-text-color-regular);
        font-size: 14px;
      }
    }
    
    .feature-item {
      text-align: center;
      padding: 24px 16px;
      border: 1px solid var(--el-border-color-light);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      height: 100%;
      
      &:hover {
        border-color: var(--el-color-primary);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px 0 rgba(64, 158, 255, 0.2);
      }
      
      .feature-icon {
        margin-bottom: 16px;
        color: var(--el-color-primary);
      }
      
      .feature-title {
        font-size: 16px;
        font-weight: 600;
        margin: 0 0 8px 0;
        color: var(--el-text-color-primary);
      }
      
      .feature-description {
        font-size: 14px;
        color: var(--el-text-color-regular);
        margin: 0 0 16px 0;
        line-height: 1.5;
      }
      
      .feature-button {
        width: 100%;
      }
    }
  }
  
  .activity-card,
  .chart-card {
    height: 400px;
    
    .chart-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 300px;
      color: var(--el-text-color-placeholder);
      
      p {
        margin-top: 16px;
        font-size: 14px;
      }
    }
  }
}

@media (max-width: 768px) {
  .evaluation-overview {
    padding: 16px;
    
    .page-header .page-title {
      font-size: 24px;
    }
    
    .stats-card .stats-content {
      gap: 12px;
    }
    
    .feature-item {
      padding: 20px 12px;
    }
  }
}
</style>