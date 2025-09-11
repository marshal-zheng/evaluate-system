<template>
  <div class="layout-sidebar" :class="{ 'is-collapsed': collapsed }">
    <!-- 侧边栏头部 -->
    <div class="sidebar-header">
      <div class="logo" v-show="!collapsed">
        <span class="logo-text">综合效能评估工具</span>
      </div>
      <div class="logo-mini" v-show="collapsed">
        <span class="logo-text-mini">综合</span>
      </div>
    </div>

    <!-- 导航菜单 -->
    <div class="sidebar-content">
      <el-menu
        :default-active="activeMenu"
        :default-opened-keys="defaultOpenedKeys"
        :collapse="collapsed"
        :unique-opened="true"
        :collapse-transition="false"
        class="sidebar-menu"
        @select="handleMenuSelect"
      >
        <!-- 动态生成菜单 -->
        <template v-for="route in menuRoutes" :key="route.path">
          <!-- 单级菜单 -->
          <el-menu-item 
            v-if="!route.children || route.children.length === 0"
            :index="route.path"
          >
            <el-icon v-if="route.meta?.icon">
              <component :is="route.meta?.icon" />
            </el-icon>
            <span>{{ route.meta?.title || route.name }}</span>
          </el-menu-item>
          
          <!-- 多级菜单 -->
          <el-sub-menu 
            v-else
            :index="route.path"
          >
            <template #title>
              <el-icon v-if="route.meta?.icon">
                <component :is="route.meta?.icon" />
              </el-icon>
              <span>{{ route.meta?.title || route.name }}</span>
            </template>
            
            <el-menu-item 
              v-for="child in route.children"
              :key="child.path"
              :index="resolveMenuIndex(route.path, child.path)"
            >
              <el-icon v-if="child.meta?.icon">
                <component :is="child.meta?.icon" />
              </el-icon>
              <span>{{ child.meta?.title || child.name }}</span>
            </el-menu-item>
          </el-sub-menu>
        </template>
      </el-menu>
    </div>

    <!-- 侧边栏底部 -->
    <div class="sidebar-footer">
      <div class="footer-info" v-show="!collapsed">
        <ZxIcon icon="InfoFilled" :size="16" />
        <span>系统版本 v1.0</span>
        <ZxIcon 
          icon="Fold" 
          :size="30" 
          class="menu-toggle"
          @click="toggleSidebar"
        />
      </div>
      <div class="footer-collapsed" v-show="collapsed">
        <ZxIcon 
          icon="Expand" 
          :size="30" 
          class="menu-toggle"
          @click="toggleSidebar"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import ZxIcon from '../ZXHL/comp/pure/ZxIcon/index.vue'
import {
  DataBoard,
  DataAnalysis,
  PieChart,
  EditPen,
  TrendCharts,
  Document,
  Grid,
  Setting,
  ScaleToOriginal,
  Files,
  Operation,
  List,
  Plus,
  MagicStick,
  CircleCheck,
  Monitor,
  Histogram,
  Download,
  Tools,
  User,
  UserFilled,
  Notebook
} from '@element-plus/icons-vue'

// Props
const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['toggle-sidebar'])

// 切换侧边栏函数
const toggleSidebar = () => {
  emit('toggle-sidebar')
}

// Router
const router = useRouter()
const route = useRoute()

// 菜单路由配置 - 从路由配置中动态生成
const menuRoutes = computed(() => {
  // 从router实例中获取路由配置，避免循环依赖
  const allRoutes = router.getRoutes()
  
  // 过滤出需要在侧边栏显示的路由
  const filteredRoutes = allRoutes.filter(route => {
    // 只显示有children且meta中没有hidden标记且showInMenu不为false的路由
    return route.children && route.children.length > 0 && !route.meta?.hidden && route.meta?.showInMenu !== false && route.path !== '/'
  })
  
  // 去重处理 - 根据path去重
  const uniqueRoutes = []
  const seenPaths = new Set()
  
  filteredRoutes.forEach(route => {
    if (!seenPaths.has(route.path)) {
      seenPaths.add(route.path)
      // 过滤子路由，只显示没有hidden标记且showInMenu不为false的
      const visibleChildren = route.children.filter(child => !child.meta?.hidden && child.meta?.showInMenu !== false)
      uniqueRoutes.push({
        ...route,
        children: visibleChildren
      })
    }
  })
  
  return uniqueRoutes
})

// 当前激活的菜单项
const activeMenu = computed(() => {
  console.log('route', route)
  return route?.path
})

// 默认展开的菜单项
const defaultOpenedKeys = computed(() => {
  const currentPath = route?.path
  if (!currentPath) return []
  
  const openedKeys = []
  
  // 遍历菜单路由，找到包含当前路径的父级菜单
  menuRoutes.value.forEach(menuRoute => {
    if (menuRoute.children && menuRoute.children.length > 0) {
      // 检查当前路径是否在这个菜单的子路由中
      const hasActiveChild = menuRoute.children.some(child => {
        const childPath = resolveMenuIndex(menuRoute.path, child.path)
        return currentPath.startsWith(childPath) || currentPath === childPath
      })
      
      if (hasActiveChild) {
        openedKeys.push(menuRoute.path)
      }
    }
  })
  
  console.log('defaultOpenedKeys', openedKeys)
  return openedKeys
})

// 解析并拼接菜单项 index 路径（将相对子路径转换为绝对路径）
const resolveMenuIndex = (parentPath, childPath) => {
  if (!childPath) return parentPath
  // 若已是绝对路径，直接返回
  if (childPath.startsWith('/')) return childPath
  // 确保父路径以 / 开头
  const base = parentPath.startsWith('/') ? parentPath : `/${parentPath}`
  // 规范化父路径，去除末尾的 /
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base
  return `${normalizedBase}/${childPath}`
}

// 菜单选择处理
const handleMenuSelect = (index) => {
  // 根据菜单项跳转到对应的路由
  console.log('Selected menu:', index)
  
  try {
    router.push({ path: index })
  } catch (error) {
    console.error('路由跳转失败:', error)
    ElMessage.error('页面跳转失败')
  }
}
</script>

<style scoped>
.layout-sidebar {
  width: 240px;
  height: 100vh;
  background: #001529;
  transition: width 0.3s;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 999;
}

.layout-sidebar.is-collapsed {
  width: 64px;
}

.sidebar-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #1f2937;
  padding: 0 16px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
}

.logo-icon {
  font-size: 24px;
  color: #1890ff;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
}

.logo-text-mini {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}

.logo-mini {
  color: #1890ff;
  font-size: 24px;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-menu {
  border: none;
  background: transparent;
}

.sidebar-menu :deep(.el-menu-item),
.sidebar-menu :deep(.el-sub-menu__title) {
  color: #bfbfbf;
  border-bottom: none;
  height: 48px;
  line-height: 48px;
}

.sidebar-menu :deep(.el-menu-item:hover),
.sidebar-menu :deep(.el-sub-menu__title:hover) {
  background-color: #1f2937;
  color: #fff;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: #1890ff;
  color: #fff;
}

.sidebar-menu :deep(.el-sub-menu.is-active > .el-sub-menu__title) {
  color: #1890ff;
}

.sidebar-menu :deep(.el-sub-menu .el-menu-item) {
  background-color: #0c1116;
  height: 44px;
  line-height: 44px;
  padding-left: 60px !important;
}

.sidebar-menu :deep(.el-sub-menu .el-menu-item:hover) {
  background-color: #1f2937;
}

.sidebar-menu :deep(.el-sub-menu .el-menu-item.is-active) {
  background-color: #1890ff;
  color: #fff;
}

.sidebar-menu :deep(.el-menu--collapse .el-sub-menu .el-menu-item) {
  padding-left: 20px !important;
}

.sidebar-menu :deep(.el-menu-item .el-icon),
.sidebar-menu :deep(.el-sub-menu__title .el-icon) {
  margin-right: 8px;
  font-size: 16px;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #1f2937;
}

.footer-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: #8c8c8c;
  font-size: 12px;
}

.footer-info .el-icon {
  font-size: 14px;
}

.footer-collapsed {
  display: flex;
  justify-content: center;
  align-items: center;
}

.menu-toggle {
  color: #ffffff;
  font-size: 18px;
  transition: color 0.3s;
  padding: 4px;
  min-height: auto;
}

.menu-toggle:hover {
  color: #409eff;
  background: transparent;
}

/* 滚动条样式 */
.sidebar-content::-webkit-scrollbar {
  width: 4px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: #001529;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: #1f2937;
  border-radius: 2px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: #374151;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .layout-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1001;
    transform: translateX(-100%);
    transition: transform 0.3s;
  }
  
  .layout-sidebar.is-mobile-show {
    transform: translateX(0);
  }
}
</style>