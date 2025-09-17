<template>
  <div class="panel-edit-test-page">
    <div class="page-header">
      <h1>面板编辑组件测试</h1>
      <p class="page-description">测试 EditPane 组件的各项功能和交互效果</p>
    </div>

    <div class="test-controls">
      <el-card class="control-card">
        <template #header>
          <span>测试控制面板</span>
        </template>
        
        <el-row :gutter="16">
          <el-col :span="8">
            <el-button 
              type="primary" 
              @click="openEditPane('create')"
              :icon="Plus"
            >
              创建面板
            </el-button>
          </el-col>
          <el-col :span="8">
            <el-button 
              type="success" 
              @click="openEditPane('edit')"
              :icon="Edit"
            >
              编辑面板
            </el-button>
          </el-col>
          <el-col :span="8">
            <el-button 
              type="info" 
              @click="toggleLoading"
              :icon="Loading"
            >
              {{ loading ? '停止加载' : '模拟加载' }}
            </el-button>
          </el-col>
        </el-row>

        <el-divider />

        <div class="test-data-section">
          <h4>当前面板数据：</h4>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="标题">
              {{ currentPanelData.title || '未设置' }}
            </el-descriptions-item>
            <el-descriptions-item label="描述">
              {{ currentPanelData.description || '未设置' }}
            </el-descriptions-item>
            <el-descriptions-item label="背景透明">
              <el-tag :type="currentPanelData.transparentBackground ? 'success' : 'info'">
                {{ currentPanelData.transparentBackground ? '开启' : '关闭' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="尺寸">
              {{ currentPanelData.width }}px × {{ currentPanelData.height }}px
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-card>

      <el-card class="log-card">
        <template #header>
          <div class="log-header">
            <span>操作日志</span>
            <el-button type="text" size="small" @click="clearLogs">清空</el-button>
          </div>
        </template>
        
        <div class="log-content">
          <div 
            v-for="(log, index) in logs" 
            :key="index" 
            class="log-item"
            :class="`log-${log.type}`"
          >
            <span class="log-time">{{ log.time }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
          <div v-if="logs.length === 0" class="no-logs">
            暂无操作日志
          </div>
        </div>
      </el-card>
    </div>

    <!-- EditPane 组件 -->
    <EditPane
      v-model="showEditPane"
      :panel-data="currentPanelData"
      :mode="editMode"
      :loading="loading"
      @confirm="handleConfirm"
      @cancel="handleCancel"
      @reset="handleReset"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Loading } from '@element-plus/icons-vue'
import EditPane from '@/components/ZXHL/comp/business/DashboardGrid/EditPane/index.vue'

// 响应式数据
const showEditPane = ref(false)
const editMode = ref('edit')
const loading = ref(false)
const logs = ref([])

// 当前面板数据
const currentPanelData = reactive({
  title: '示例面板',
  description: '这是一个示例面板的描述信息',
  transparentBackground: false,
  width: 400,
  height: 300
})

// 方法
const openEditPane = (mode) => {
  editMode.value = mode
  showEditPane.value = true
  addLog('info', `打开${mode === 'create' ? '创建' : '编辑'}面板`)
}

const handleConfirm = async (formData) => {
  addLog('success', `提交表单数据: ${JSON.stringify(formData)}`)
  
  // 模拟API调用
  if (loading.value) {
    setTimeout(() => {
      updatePanelData(formData)
      showEditPane.value = false
      ElMessage.success(`${editMode.value === 'create' ? '创建' : '编辑'}成功！`)
      addLog('success', `${editMode.value === 'create' ? '创建' : '编辑'}面板成功`)
    }, 2000)
  } else {
    updatePanelData(formData)
    showEditPane.value = false
    ElMessage.success(`${editMode.value === 'create' ? '创建' : '编辑'}成功！`)
    addLog('success', `${editMode.value === 'create' ? '创建' : '编辑'}面板成功`)
  }
}

const handleCancel = () => {
  showEditPane.value = false
  addLog('warning', '取消编辑操作')
}

const handleReset = () => {
  addLog('info', '重置表单数据')
}

const updatePanelData = (formData) => {
  Object.assign(currentPanelData, {
    title: formData.title,
    description: formData.description,
    transparentBackground: formData.transparentBackground,
    width: formData.width,
    height: formData.height
  })
}

const toggleLoading = () => {
  loading.value = !loading.value
  addLog('info', `${loading.value ? '开启' : '关闭'}加载状态`)
}

const addLog = (type, message) => {
  const now = new Date()
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
  
  logs.value.unshift({
    type,
    message,
    time
  })
  
  // 限制日志数量
  if (logs.value.length > 50) {
    logs.value = logs.value.slice(0, 50)
  }
}

const clearLogs = () => {
  logs.value = []
  ElMessage.info('日志已清空')
}

// 初始化日志
addLog('info', '页面初始化完成')
</script>

<style lang="scss" scoped>
.panel-edit-test-page {
  padding: 24px;
  background-color: var(--el-bg-color-page);
  min-height: 100vh;

  .page-header {
    margin-bottom: 24px;
    text-align: center;

    h1 {
      font-size: 28px;
      color: var(--el-text-color-primary);
      margin-bottom: 8px;
      font-weight: 600;
    }

    .page-description {
      font-size: 14px;
      color: var(--el-text-color-secondary);
      margin: 0;
    }
  }

  .test-controls {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    max-width: 1200px;
    margin: 0 auto;

    .control-card {
      .test-data-section {
        margin-top: 16px;

        h4 {
          margin-bottom: 12px;
          color: var(--el-text-color-primary);
          font-size: 14px;
          font-weight: 600;
        }
      }
    }

    .log-card {
      .log-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .log-content {
        max-height: 300px;
        overflow-y: auto;

        .log-item {
          display: flex;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid var(--el-border-color-lighter);
          font-size: 13px;

          &:last-child {
            border-bottom: none;
          }

          .log-time {
            color: var(--el-text-color-secondary);
            margin-right: 12px;
            font-family: 'Monaco', 'Menlo', monospace;
            min-width: 60px;
          }

          .log-message {
            flex: 1;
            word-break: break-all;
          }

          &.log-info {
            .log-message {
              color: var(--el-color-info);
            }
          }

          &.log-success {
            .log-message {
              color: var(--el-color-success);
            }
          }

          &.log-warning {
            .log-message {
              color: var(--el-color-warning);
            }
          }

          &.log-error {
            .log-message {
              color: var(--el-color-danger);
            }
          }
        }

        .no-logs {
          text-align: center;
          color: var(--el-text-color-secondary);
          padding: 32px 0;
          font-size: 14px;
        }

        // 自定义滚动条
        &::-webkit-scrollbar {
          width: 6px;
        }

        &::-webkit-scrollbar-track {
          background: var(--el-fill-color-lighter);
          border-radius: 3px;
        }

        &::-webkit-scrollbar-thumb {
          background: var(--el-border-color-darker);
          border-radius: 3px;
          
          &:hover {
            background: var(--el-border-color-dark);
          }
        }
      }
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    padding: 16px;

    .test-controls {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .page-header {
      h1 {
        font-size: 24px;
      }
    }
  }
}

// 卡片样式增强
:deep(.el-card) {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  .el-card__header {
    background-color: var(--el-fill-color-lighter);
    border-bottom: 1px solid var(--el-border-color-light);
    font-weight: 600;
  }
}

// 按钮样式增强
:deep(.el-button) {
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }
}
</style>