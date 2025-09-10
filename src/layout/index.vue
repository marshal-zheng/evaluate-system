<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <Sidebar :collapsed="sidebarCollapsed" @toggle-sidebar="toggleSidebar" />
    
    <!-- 主体区域 -->
    <div class="layout-main" :class="{ 'is-collapsed': sidebarCollapsed }">
      <!-- 顶部导航栏 -->
      <Header 
        :collapsed="sidebarCollapsed"
      />
      
      <!-- 主内容区域 -->
      <MainContent 
        :collapsed="sidebarCollapsed"
        :show-breadcrumb="showBreadcrumb"
        :show-page-header="showPageHeader"
        :show-footer="showFooter"
        :page-title="pageTitle"
        :page-description="pageDescription"
        :breadcrumb-list="breadcrumbList"
      >
        <!-- 页面操作按钮插槽 -->
        <template #actions v-if="$slots.actions">
          <slot name="actions"></slot>
        </template>
        
        <!-- 主要内容插槽 -->
        <slot></slot>
      </MainContent>
    </div>
    
    <!-- 移动端遮罩层 -->
    <div 
      class="mobile-overlay" 
      :class="{ 'is-show': mobileOverlayShow }"
      @click="hideMobileSidebar"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Header from '@/components/layout/Header.vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import MainContent from '@/components/layout/MainContent.vue'

// Props
const props = defineProps({
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

// 响应式数据
const sidebarCollapsed = ref(false)
const isMobile = ref(false)
const mobileOverlayShow = ref(false)

// 计算属性
const layoutClass = computed(() => {
  return {
    'is-mobile': isMobile.value,
    'sidebar-collapsed': sidebarCollapsed.value
  }
})

// 切换侧边栏
const toggleSidebar = () => {
  if (isMobile.value) {
    mobileOverlayShow.value = !mobileOverlayShow.value
  } else {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
}

// 隐藏移动端侧边栏
const hideMobileSidebar = () => {
  mobileOverlayShow.value = false
}

// 检查是否为移动端
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
  if (isMobile.value) {
    sidebarCollapsed.value = false
    mobileOverlayShow.value = false
  }
}

// 窗口大小变化监听
const handleResize = () => {
  checkMobile()
}

// 生命周期
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 暴露方法给父组件
defineExpose({
  toggleSidebar,
  hideMobileSidebar
})
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: #1a1a1a;
}

.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 0;
  transition: margin-left 0.3s;
  min-width: 0;
}

.layout-main.is-collapsed {
  margin-left: 0;
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s;
}

.mobile-overlay.is-show {
  opacity: 1;
  visibility: visible;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .layout-main {
    margin-left: 0;
  }
  
  .layout-main.is-collapsed {
    margin-left: 0;
  }
}

/* 平板适配 */
@media (max-width: 1024px) and (min-width: 769px) {
  .layout-main {
    margin-left: 0;
  }
  
  .layout-main.is-collapsed {
    margin-left: 0;
  }
}

/* 大屏幕优化 */
@media (min-width: 1440px) {
  .layout-main {
    margin-left: 0;
  }
}

/* 打印样式 */
@media print {
  .admin-layout {
    display: block;
  }
  
  .layout-main {
    margin-left: 0;
  }
  
  .mobile-overlay {
    display: none;
  }
}
</style>