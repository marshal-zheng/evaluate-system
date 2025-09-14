<template>
  <div class="dashboard-grid-demo">
    <h2>DashboardGrid 组件演示</h2>
    
    <div class="controls">
      <el-button @click="toggleEdit" :type="isEditable ? 'success' : 'primary'">
        {{ isEditable ? '退出编辑' : '进入编辑' }}
      </el-button>
      <el-button @click="addPanel" type="primary">添加面板</el-button>
      <el-button @click="resetDashboard" type="warning">重置</el-button>
    </div>

    <DashboardGrid
      :dashboard="dashboard"
      :isEditable="isEditable"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import DashboardGrid from '../../comp/business/DashboardGrid/index.vue'
import { DashboardModel } from '../../comp/business/DashboardGrid/model/DashboardModel'
import { PanelModel } from '../../comp/business/DashboardGrid/model/PanelModel'

// 响应式数据
const isEditable = ref(false)

// 创建示例面板数据
const createSamplePanels = () => {
  return [
    {
      id: 1,
      title: '图表面板 1',
      type: 'chart',
      path: 'ChartWidget',
      gridPos: { x: 0, y: 0, w: 6, h: 4 },
      params: { chartType: 'line' },
      props: {},
      contentNoPadding: false
    },
    {
      id: 2,
      title: '数据面板 2',
      type: 'data',
      path: 'DataWidget',
      gridPos: { x: 6, y: 0, w: 6, h: 4 },
      params: { dataSource: 'api' },
      props: {},
      contentNoPadding: false
    },
    {
      id: 3,
      title: '统计面板 3',
      type: 'stats',
      path: 'StatsWidget',
      gridPos: { x: 0, y: 4, w: 12, h: 3 },
      params: { statType: 'summary' },
      props: {},
      contentNoPadding: true
    }
  ]
}

// 创建仪表板实例
const dashboard = reactive(new DashboardModel({
  panels: createSamplePanels()
}))

// 方法定义
const toggleEdit = () => {
  isEditable.value = !isEditable.value
}

const addPanel = () => {
  const newPanel = {
    id: dashboard.getNextPanelId(),
    title: `新面板 ${dashboard.panels.length + 1}`,
    type: 'generic',
    path: 'GenericWidget',
    gridPos: { x: 0, y: dashboard.panels.length * 2, w: 6, h: 3 },
    params: {},
    props: {},
    contentNoPadding: false
  }
  
  dashboard.addPanel(newPanel)
}

const resetDashboard = () => {
  dashboard.updatePanels(createSamplePanels())
}
</script>

<style lang="scss" scoped>
.dashboard-grid-demo {
  padding: 20px;
  
  h2 {
    margin-bottom: 20px;
    color: #303133;
  }
  
  .controls {
    margin-bottom: 20px;
    
    .el-button {
      margin-right: 10px;
    }
  }
}
</style>