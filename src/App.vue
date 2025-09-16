<script setup>
// App.vue - 应用根组件
// 布局和路由管理由 Vue Router 处理
</script>

<template>
  <div id="app">
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
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

#app {
  height: 100%;
}

/* ZXHL Dark Theme Global Styles */
/* 深色主题下的基础背景与文字色，仅在暗色系时生效 */
html[data-theme="dark"],
html[data-theme="dark-blue"] {
  background-color: #0c1d30;
  color: #ffffff;
}

html[data-theme="dark"] #app,
html[data-theme="dark-blue"] #app {
  background-color: #0c1d30;
}

/* 确保所有Element Plus组件使用深色主题 */
[data-theme="dark"] .el-card,
[data-theme="dark-blue"] .el-card {
  background-color: #062846;
  border-color: #9cfff9;
}
/* 
.dark-theme .el-table {
  background-color: #062846;
  color: #ffffff;
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
} */

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