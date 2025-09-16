<template>
  <div class="layout-header">
    <!-- 左侧：系统标题 -->
    <div class="header-left">
      <!-- 可以在这里添加其他左侧内容 -->
    </div>

    <!-- 右侧：用户信息 -->
    <div class="header-right">
      <!-- 主题切换 -->
      <div class="theme-switcher">
        <el-dropdown @command="handleThemeCommand" trigger="click">
          <el-button text>
            <el-icon><Sunny v-if="currentTheme === 'light'" /><Moon v-else-if="currentTheme === 'dark'" /><Monitor v-else /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="light">
                <el-icon><Sunny /></el-icon>
                浅色主题
              </el-dropdown-item>
              <el-dropdown-item command="dark">
                <el-icon><Moon /></el-icon>
                深色主题
              </el-dropdown-item>
              <el-dropdown-item command="dark-blue">
                <el-icon><Monitor /></el-icon>
                深蓝主题
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      
      <!-- 用户信息 -->
      <div class="user-info">
        <el-dropdown @command="handleUserCommand">
          <div class="user-avatar">
            <el-avatar :size="32" :src="userInfo.avatar">
              <el-icon><User /></el-icon>
            </el-avatar>
            <span class="username">{{ userInfo.name }}</span>
            <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <el-icon><User /></el-icon>
                个人中心
              </el-dropdown-item>
              <el-dropdown-item command="settings">
                <el-icon><Setting /></el-icon>
                账户设置
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import {
  User,
  ArrowDown,
  SwitchButton,
  Setting,
  Sunny,
  Moon,
  Monitor
} from '@element-plus/icons-vue'
import { useTheme } from '@/composables/useTheme.js'

// Props
const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false
  }
})

// 主题管理
const { currentTheme, switchTheme, applyDarkBlue } = useTheme()

// 用户信息
const userInfo = reactive({
  name: '管理员',
  avatar: ''
})

// 主题切换处理
const handleThemeCommand = (theme) => {
  if (theme === 'dark-blue') {
    applyDarkBlue()
  } else {
    switchTheme(theme)
  }
  ElMessage.success(`已切换到${theme === 'light' ? '浅色' : theme === 'dark' ? '深色' : '深蓝'}主题`)
}

// 用户下拉菜单操作
const handleUserCommand = (command) => {
  switch (command) {
    case 'profile':
      ElMessage.info('个人中心功能开发中...')
      break
    case 'settings':
      ElMessage.info('账户设置功能开发中...')
      break
    case 'logout':
      ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        ElMessage.success('退出登录成功')
        // 这里可以添加退出登录的逻辑
      }).catch(() => {
        // 取消退出
      })
      break
  }
}
</script>

<style scoped>
.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 20px;
  background: var(--app-layout-header-bg);
  border-bottom: 1px solid var(--app-layout-header-border-bottom);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 1000;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.version {
  font-size: 12px;
  color: #cccccc;
  background: #404040;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.theme-switcher {
  display: flex;
  align-items: center;
}

.theme-switcher .el-button {
  color: #ffffff;
  font-size: 18px;
  padding: 8px;
  transition: all 0.3s;
}

.theme-switcher .el-button:hover {
  color: #409eff;
  background-color: rgba(64, 158, 255, 0.1);
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar .el-button {
  color: #606266;
  font-size: 16px;
  transition: all 0.3s;
}

.toolbar .el-button:hover {
  color: #409eff;
  background-color: #ecf5ff;
}

.user-info {
  cursor: pointer;
}

.user-avatar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.user-avatar:hover {
  background-color: #404040;
}

.username {
  font-size: 14px;
  color: #ffffff;
  font-weight: 500;
}

.dropdown-icon {
  font-size: 12px;
  color: #cccccc;
  transition: transform 0.3s;
}

.user-avatar:hover .dropdown-icon {
  transform: rotate(180deg);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .layout-header {
    padding: 0 12px;
  }
  
  .system-title h1 {
    font-size: 16px;
  }
  
  .version {
    display: none;
  }
  
  .toolbar {
    gap: 4px;
  }
  
  .username {
    display: none;
  }
}
</style>