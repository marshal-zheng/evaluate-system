<template>
  <div class="modal-demo-container">
    <el-card class="demo-card">
      <template #header>
        <div class="card-header">
          <span>useModal Hook 使用演示</span>
        </div>
      </template>
      
      <div class="demo-section">
        <h3>基础模态框</h3>
        <div class="button-group">
          <el-button type="primary" @click="showInfoModal">信息提示</el-button>
          <el-button type="success" @click="showSuccessModal">成功提示</el-button>
          <el-button type="warning" @click="showWarningModal">警告提示</el-button>
          <el-button type="danger" @click="showErrorModal">错误提示</el-button>
        </div>
      </div>

      <div class="demo-section">
        <h3>不同尺寸</h3>
        <div class="button-group">
          <el-button @click="showSmallModal">小尺寸</el-button>
          <el-button @click="showMediumModal">中等尺寸</el-button>
          <el-button @click="showLargeModal">大尺寸</el-button>
          <el-button @click="showFullModal">全屏尺寸</el-button>
        </div>
      </div>

      <div class="demo-section">
        <h3>不同模式</h3>
        <div class="button-group">
          <el-button @click="showDefaultModeModal">默认模式</el-button>
          <el-button @click="showWeakModeModal">弱化模式</el-button>
        </div>
      </div>

      <div class="demo-section">
        <h3>异步确认</h3>
        <div class="button-group">
          <el-button type="primary" @click="showAsyncModal">异步确认模态框</el-button>
          <el-button type="danger" @click="showDeleteModal">删除确认</el-button>
        </div>
      </div>

      <div class="demo-section">
        <h3>操作结果</h3>
        <el-alert 
          v-if="lastResult" 
          :title="lastResult" 
          :type="lastResultType"
          style="margin-top: 10px"
          show-icon
          closable
          @close="clearResult"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import useModal from '@/components/ZXHL/hooks/useModal'

const { openModal, openDeleteModal } = useModal()

const lastResult = ref('')
const lastResultType = ref('success')

const setResult = (message, type = 'success') => {
  lastResult.value = message
  lastResultType.value = type
}

const clearResult = () => {
  lastResult.value = ''
}

// 基础模态框示例
const showInfoModal = async () => {
  try {
    await openModal({
      type: 'info',
      title: '信息提示',
      message: '这是一个信息提示模态框'
    })
    setResult('用户点击了确认按钮')
  } catch {
    setResult('用户取消了操作', 'warning')
  }
}

const showSuccessModal = async () => {
  try {
    await openModal({
      type: 'success',
      title: '成功提示',
      message: '操作已成功完成！'
    })
    setResult('用户确认了成功提示')
  } catch {
    setResult('用户取消了操作', 'warning')
  }
}

const showWarningModal = async () => {
  try {
    await openModal({
      type: 'warning',
      title: '警告提示',
      message: '请注意，此操作可能存在风险。'
    })
    setResult('用户确认了警告提示')
  } catch {
    setResult('用户取消了操作', 'warning')
  }
}

const showErrorModal = async () => {
  try {
    await openModal({
      type: 'error',
      title: '错误提示',
      message: '操作失败，请检查后重试。'
    })
    setResult('用户确认了错误提示')
  } catch {
    setResult('用户取消了操作', 'warning')
  }
}

// 不同尺寸示例
const showSmallModal = async () => {
  try {
    await openModal({
      type: 'info',
      title: '小尺寸模态框',
      message: '这是一个小尺寸的模态框，适合简单的提示信息。',
      size: 'small'
    })
    setResult('小尺寸模态框操作完成')
  } catch {
    setResult('用户取消了操作', 'warning')
  }
}

const showMediumModal = async () => {
  try {
    await openModal({
      type: 'info',
      title: '中等尺寸模态框',
      message: '这是一个中等尺寸的模态框，适合包含更多内容的对话框。可以显示更详细的信息和说明。',
      size: 'medium'
    })
    setResult('中等尺寸模态框操作完成')
  } catch {
    setResult('用户取消了操作', 'warning')
  }
}

const showLargeModal = async () => {
  try {
    await openModal({
      type: 'info',
      title: '大尺寸模态框',
      message: '这是一个大尺寸的模态框，适合显示复杂的内容或表单。可以包含大量的文本信息、表格数据或复杂的交互元素。适用于需要用户进行详细操作的场景。',
      size: 'large'
    })
    setResult('大尺寸模态框操作完成')
  } catch {
    setResult('用户取消了操作', 'warning')
  }
}

const showFullModal = async () => {
  try {
    await openModal({
      type: 'info',
      title: '全屏尺寸模态框',
      message: '这是一个全屏尺寸的模态框，占据屏幕的大部分空间。适合需要展示大量信息或复杂界面的场景，比如详细的数据报表、复杂的配置页面等。',
      size: 'full'
    })
    setResult('全屏尺寸模态框操作完成')
  } catch {
    setResult('用户取消了操作', 'warning')
  }
}

// 不同模式示例
const showDefaultModeModal = async () => {
  try {
    await openModal({
      type: 'info',
      title: '默认模式',
      message: '这是默认模式的模态框，按钮使用标准样式。',
      mode: 'default'
    })
    setResult('默认模式模态框操作完成')
  } catch {
    setResult('用户取消了操作', 'warning')
  }
}

const showWeakModeModal = async () => {
  try {
    await openModal({
      type: 'info',
      title: '弱化模式',
      message: '这是弱化模式的模态框，按钮使用文本样式，视觉冲击较小。',
      mode: 'weak'
    })
    setResult('弱化模式模态框操作完成')
  } catch {
    setResult('用户取消了操作', 'warning')
  }
}

// 异步确认示例
const showAsyncModal = async () => {
  try {
    await openModal({
      type: 'warning',
      title: '异步操作确认',
      message: '点击确认后将执行异步操作，请稍等...',
      onBeforeOk: async () => {
        // 模拟异步操作
        await new Promise(resolve => setTimeout(resolve, 2000))
        console.log('异步操作完成')
      }
    })
    setResult('异步操作已完成')
  } catch {
    setResult('用户取消了异步操作', 'warning')
  }
}

const showDeleteModal = async () => {
  try {
    await openDeleteModal({
      title: '删除确认',
      message: '确定要删除这个项目吗？删除后无法恢复。',
      onBeforeOk: async () => {
        // 模拟删除操作
        await new Promise(resolve => setTimeout(resolve, 1500))
        console.log('删除操作完成')
      }
    })
    setResult('删除操作已完成', 'success')
  } catch {
    setResult('用户取消了删除操作', 'warning')
  }
}
</script>

<style scoped>
.modal-demo-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.demo-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
}

.demo-section {
  margin-bottom: 30px;
}

.demo-section h3 {
  margin-bottom: 15px;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.button-group .el-button {
  margin: 0;
}
</style>