<template>
  <div class="main-content" :class="{ 'is-collapsed': collapsed }">
    <!-- 面包屑导航 -->
    <!-- <div class="breadcrumb-container" v-if="showBreadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">
          <el-icon><HomeFilled /></el-icon>
          首页
        </el-breadcrumb-item>
        <el-breadcrumb-item
          v-for="item in breadcrumbList"
          :key="item.path"
          :to="item.path ? { path: item.path } : null"
        >
          {{ item.title }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div> -->

    <!-- 页面标题区域 -->
    <div class="page-header" v-if="showPageHeader">
      <div class="page-title">
        <h2>{{ pageTitle }}</h2>
        <p class="page-description" v-if="pageDescription">{{ pageDescription }}</p>
      </div>
      <div class="page-actions" v-if="$slots.actions">
        <slot name="actions"></slot>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="content-wrapper">
      <div class="content-body">
        <!-- 默认插槽：页面内容 -->
        <slot>
          <!-- 路由视图：显示当前路由对应的页面组件 -->
          <router-view />
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  HomeFilled,
  DataBoard,
  DataAnalysis,
  TrendCharts,
  Monitor,
  Document,
  EditPen,
  Setting
} from '@element-plus/icons-vue'

// Props
const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false
  },
  showBreadcrumb: {
    type: Boolean,
    default: true
  },
  showPageHeader: {
    type: Boolean,
    default: false
  },
  showFooter: {
    type: Boolean,
    default: true
  },
  pageTitle: {
    type: String,
    default: ''
  },
  pageDescription: {
    type: String,
    default: ''
  },
  breadcrumbList: {
    type: Array,
    default: () => []
  }
})

// 快速开始操作
const quickStart = (action) => {
  switch (action) {
    case 'data-input':
      ElMessage.success('跳转到数据录入页面')
      break
    case 'analysis':
      ElMessage.success('跳转到数据分析页面')
      break
    case 'report':
      ElMessage.success('跳转到报告查看页面')
      break
    case 'settings':
      ElMessage.success('跳转到系统设置页面')
      break
    default:
      ElMessage.info('功能开发中...')
  }
}

// 显示帮助
const showHelp = () => {
  ElMessage.info('帮助文档功能开发中...')
}

// 显示关于
const showAbout = () => {
  ElMessageBox.alert(
    '综合效能分析评估工具 v1.0\n\n一个专业的数据分析与评估平台，提供全面的效能分析解决方案。',
    '关于我们',
    {
      confirmButtonText: '确定',
      type: 'info'
    }
  )
}
</script>

<style scoped>
.main-content {
  overflow-y: scroll;
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  transition: all 0.3s;
}

.main-content.is-collapsed {
  margin-left: 0;
}

.breadcrumb-container {
  background: #fff;
  padding: 12px 24px;
  border-bottom: 1px solid #e8eaec;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.breadcrumb-container :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: #606266;
  font-weight: 500;
}

.page-header {
  background: #fff;
  padding: 20px 24px;
  border-bottom: 1px solid #e8eaec;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.page-title h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.page-description {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.page-actions {
  flex-shrink: 0;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.content-body {
  flex: 1;
  padding: 24px;
  overflow: auto;
}

.welcome-content {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-card {
  text-align: center;
  padding: 40px 20px;
}

.welcome-header {
  margin-bottom: 40px;
}

.welcome-icon {
  font-size: 64px;
  color: #409eff;
  margin-bottom: 20px;
}

.welcome-header h1 {
  margin: 0 0 16px 0;
  font-size: 32px;
  font-weight: 600;
  color: #303133;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-header p {
  margin: 0;
  font-size: 16px;
  color: #606266;
}

.feature-grid {
  margin-bottom: 40px;
}

.feature-item {
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  transition: all 0.3s;
  cursor: pointer;
}

.feature-item:hover {
  background: rgba(64, 158, 255, 0.05);
  transform: translateY(-2px);
}

.feature-icon {
  font-size: 32px;
  color: #409eff;
  margin-bottom: 12px;
}

.feature-item h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.feature-item p {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.quick-actions {
  padding-top: 20px;
  border-top: 1px solid #e8eaec;
}

.quick-actions h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.content-footer {
  background: #fff;
  border-top: 1px solid #e8eaec;
  padding: 16px 24px;
  margin-top: auto;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #909399;
}

.footer-links {
  display: flex;
  gap: 16px;
}

.footer-links a {
  color: #606266;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: #409eff;
}

 .content-body {
    margin: 20px;
  }

/* 响应式设计 */
@media (max-width: 768px) {
  .content-body {
    padding: 16px;
  }
  
  .breadcrumb-container {
    padding: 8px 16px;
  }
  
  .page-header {
    padding: 16px;
    flex-direction: column;
    gap: 16px;
  }
  
  .welcome-card {
    padding: 20px 16px;
  }
  
  .welcome-header h1 {
    font-size: 24px;
  }
  
  .feature-grid {
    margin-bottom: 20px;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .welcome-icon {
    font-size: 48px;
  }
  
  .welcome-header h1 {
    font-size: 20px;
  }
  
  .feature-item {
    padding: 16px 8px;
  }
}
</style>