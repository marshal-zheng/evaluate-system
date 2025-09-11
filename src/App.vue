<script setup>
// App.vue - 应用根组件
// 布局和路由管理由 Vue Router 处理
import { onMounted } from 'vue'

// 应用深色主题
onMounted(() => {
  // 设置深色主题
  document.documentElement.setAttribute('data-theme', 'dark')
  document.documentElement.classList.add('dark')
})
</script>

<template>
  <div id="app" class="dark-theme">
    <!-- 路由视图，布局由路由系统管理 -->
    <router-view />
  </div>
</template>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  min-height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #0c1d30;
  color: #ffffff;
}

#app {
  min-height: 100vh;
  background-color: #0c1d30;
}

/* ZXHL Dark Theme Global Styles */
.dark-theme {
  background-color: #0c1d30;
  color: #ffffff;
}

/* 确保所有Element Plus组件使用深色主题 */
.dark-theme .el-card {
  background-color: #062846;
  border-color: #9cfff9;
}

.dark-theme .el-table {
  background-color: #062846;
  color: #ffffff;
}

.dark-theme .el-table th {
  background-color: #094d7b;
  color: #9cfff9;
}

.dark-theme .el-table td {
  border-color: #356a72;
}

.dark-theme .el-input__inner {
  background-color: #062846;
  border-color: #9cfff9;
  color: #ffffff;
}

.dark-theme .el-button {
  background-color: #094d7b;
  border-color: #9cfff9;
  color: #9cfff9;
}

.dark-theme .el-button:hover {
  background-color: #9cfff9;
  color: #0c1d30;
}

/* 演示组件样式（如果需要使用） */
.demo-container {
  padding: 24px;
}

.demo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.demo-header h2 {
  margin: 0;
  color: var(--el-text-color-primary);
  font-size: 24px;
  font-weight: 600;
}

.demo-tabs {
  display: flex;
  gap: 12px;
}

.demo-tabs .el-button.is-active {
  background: var(--el-color-primary);
  border-color: var(--el-color-primary);
  color: #fff;
}

.demo-content {
  min-height: 400px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .demo-container {
    padding: 16px;
  }
  
  .demo-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .demo-tabs {
    width: 100%;
    justify-content: center;
  }
}
</style>