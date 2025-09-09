<script setup>
import { ref } from 'vue'
import { useMessage } from './composables/useElementPlus.js'

const { showSuccess, showWarning, showError, showInfo } = useMessage()

const handleMessage = (type) => {
  const messages = {
    success: () => showSuccess('操作成功！'),
    warning: () => showWarning('请注意检查数据'),
    error: () => showError('操作失败，请稍后重试'),
    info: () => showInfo('这是一条提示信息')
  }
  messages[type]()
}
</script>

<template>
  <div class="app-container">
    <div class="app-header">
      <h1>Element Plus 扩展演示</h1>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background: var(--el-bg-color-page);
  padding: 20px;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 8px;
}

.app-header h1 {
  margin: 0;
  color: var(--el-text-color-primary);
  font-size: 28px;
  font-weight: 600;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.demo-card {
  height: fit-content;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.button-group:last-child {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .demo-grid {
    grid-template-columns: 1fr;
  }
  
  .app-container {
    padding: 12px;
  }
  
  .button-group {
    justify-content: center;
  }
}
</style>