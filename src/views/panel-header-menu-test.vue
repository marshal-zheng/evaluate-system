<template>
  <div class="panel-header-menu-test">
    <div class="test-header">
      <h1>PanelHeaderMenu 组件测试</h1>
      <p>验证下拉菜单功能是否正常工作</p>
    </div>

    <div class="test-section">
      <h2>基础功能测试</h2>
      
      <!-- 基础菜单测试 -->
      <div class="test-item">
        <h3>基础菜单项</h3>
        <div class="panel-mock">
          <div class="panel-header">
            <span>基础菜单测试</span>
            <PanelHeaderMenu 
              :menu-items="basicMenuItems"
              @menu-click="handleMenuClick"
            />
          </div>
        </div>
      </div>

      <!-- 带图标的菜单测试 -->
      <div class="test-item">
        <h3>带图标菜单</h3>
        <div class="panel-mock">
          <div class="panel-header">
            <span>图标菜单测试</span>
            <PanelHeaderMenu 
              :menu-items="iconMenuItems"
              @menu-click="handleMenuClick"
            />
          </div>
        </div>
      </div>

      <!-- 分组菜单测试 -->
      <div class="test-item">
        <h3>分组菜单</h3>
        <div class="panel-mock">
          <div class="panel-header">
            <span>分组菜单测试</span>
            <PanelHeaderMenu 
              :menu-items="groupMenuItems"
              @menu-click="handleMenuClick"
            />
          </div>
        </div>
      </div>

      <!-- 完整菜单测试 -->
      <div class="test-item">
        <h3>完整功能菜单</h3>
        <div class="panel-mock">
          <div class="panel-header">
            <span>完整功能测试</span>
            <PanelHeaderMenu 
              :menu-items="fullMenuItems"
              @menu-click="handleMenuClick"
            />
          </div>
        </div>
      </div>

      <!-- 空菜单测试 -->
      <div class="test-item">
        <h3>空菜单（应该不显示）</h3>
        <div class="panel-mock">
          <div class="panel-header">
            <span>空菜单测试</span>
            <PanelHeaderMenu 
              :menu-items="[]"
              @menu-click="handleMenuClick"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 事件日志 -->
    <div class="test-section">
      <h2>事件日志</h2>
      <div class="event-log">
        <div v-for="(log, index) in eventLogs" :key="index" class="log-item">
          {{ log }}
        </div>
        <div v-if="eventLogs.length === 0" class="log-item">
          暂无事件日志，请点击菜单项进行测试
        </div>
      </div>
      <div class="log-actions">
        <el-button size="small" @click="clearLogs">清空日志</el-button>
      </div>
    </div>

    <!-- 调试信息 -->
    <div class="test-section">
      <h2>调试信息</h2>
      <div class="debug-info">
        <h4>基础菜单项数据：</h4>
        <pre>{{ JSON.stringify(basicMenuItems, null, 2) }}</pre>
        
        <h4>图标菜单项数据：</h4>
        <pre>{{ JSON.stringify(iconMenuItems, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PanelHeaderMenu from '@/components/ZXHL/comp/business/DashboardGrid/PanelComponent/PanelHeader/PanelHeaderMenu.vue'

const eventLogs = ref([])

// 基础菜单项
const basicMenuItems = ref([
  {
    type: 'item',
    text: '编辑',
    onClick: () => addLog('点击了编辑')
  },
  {
    type: 'item',
    text: '复制',
    onClick: () => addLog('点击了复制')
  },
  {
    type: 'divider',
    text: 'divider-1'
  },
  {
    type: 'item',
    text: '删除',
    onClick: () => addLog('点击了删除')
  }
])

// 带图标的菜单项
const iconMenuItems = ref([
  {
    type: 'item',
    text: '编辑',
    iconClassName: 'Edit',
    onClick: () => addLog('点击了编辑（带图标）')
  },
  {
    type: 'item',
    text: '复制',
    iconClassName: 'CopyDocument',
    onClick: () => addLog('点击了复制（带图标）')
  },
  {
    type: 'item',
    text: '下载',
    iconClassName: 'Download',
    onClick: () => addLog('点击了下载（带图标）')
  },
  {
    type: 'divider',
    text: 'divider-1'
  },
  {
    type: 'item',
    text: '删除',
    iconClassName: 'Delete',
    onClick: () => addLog('点击了删除（带图标）')
  }
])

// 分组菜单项
const groupMenuItems = ref([
  {
    type: 'item',
    text: '编辑',
    iconClassName: 'Edit',
    onClick: () => addLog('点击了编辑')
  },
  {
    type: 'divider',
    text: 'divider-1'
  },
  {
    type: 'group',
    text: '导出选项',
    subMenu: [
      {
        type: 'item',
        text: '导出为PNG',
        iconClassName: 'Picture',
        onClick: () => addLog('点击了导出为PNG')
      },
      {
        type: 'item',
        text: '导出为PDF',
        iconClassName: 'Document',
        onClick: () => addLog('点击了导出为PDF')
      }
    ]
  }
])

// 完整功能菜单项
const fullMenuItems = ref([
  {
    type: 'item',
    text: '编辑',
    iconClassName: 'Edit',
    shortcut: 'Ctrl+E',
    onClick: () => addLog('点击了编辑（带快捷键）')
  },
  {
    type: 'item',
    text: '复制',
    iconClassName: 'CopyDocument',
    shortcut: 'Ctrl+C',
    onClick: () => addLog('点击了复制（带快捷键）')
  },
  {
    type: 'item',
    text: '禁用项',
    iconClassName: 'Lock',
    disabled: true,
    onClick: () => addLog('点击了禁用项（不应该触发）')
  },
  {
    type: 'divider',
    text: 'divider-1'
  },
  {
    type: 'group',
    text: '高级选项',
    subMenu: [
      {
        type: 'item',
        text: '全屏显示',
        iconClassName: 'FullScreen',
        shortcut: 'F11',
        onClick: () => addLog('点击了全屏显示')
      },
      {
        type: 'item',
        text: '设置',
        iconClassName: 'Setting',
        onClick: () => addLog('点击了设置')
      }
    ]
  },
  {
    type: 'divider',
    text: 'divider-2'
  },
  {
    type: 'item',
    text: '外部链接',
    iconClassName: 'Link',
    href: 'https://element-plus.org',
    onClick: () => addLog('点击了外部链接')
  },
  {
    type: 'item',
    text: '删除',
    iconClassName: 'Delete',
    onClick: () => addLog('点击了删除')
  }
])

const handleMenuClick = (item, event) => {
  addLog(`菜单点击事件: ${item.text} (类型: ${item.type || 'item'})`)
  console.log('Menu click:', item, event)
}

const addLog = (message) => {
  const timestamp = new Date().toLocaleTimeString()
  eventLogs.value.unshift(`[${timestamp}] ${message}`)
  if (eventLogs.value.length > 20) {
    eventLogs.value.pop()
  }
}

const clearLogs = () => {
  eventLogs.value = []
}

// 页面加载时添加初始日志
addLog('页面加载完成，请点击菜单项进行测试')
</script>

<style lang="scss" scoped>
.panel-header-menu-test {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.test-header {
  margin-bottom: 30px;
  text-align: center;
  
  h1 {
    color: var(--el-text-color-primary);
    margin-bottom: 10px;
  }
  
  p {
    color: var(--el-text-color-regular);
  }
}

.test-section {
  margin-bottom: 40px;
  
  h2 {
    color: var(--el-text-color-primary);
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid var(--el-border-color);
  }
}

.test-item {
  margin-bottom: 30px;
  
  h3 {
    color: var(--el-text-color-regular);
    margin-bottom: 15px;
    font-size: 16px;
  }
}

.panel-mock {
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  overflow: hidden;
  background: var(--el-bg-color);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--el-fill-color-light);
  border-bottom: 1px solid var(--el-border-color);
  min-height: 48px;
  
  span {
    font-weight: 500;
    color: var(--el-text-color-primary);
  }
}

.event-log {
  background: var(--el-fill-color-extra-light);
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  padding: 15px;
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 10px;
}

.log-item {
  padding: 5px 0;
  font-family: monospace;
  font-size: 12px;
  color: var(--el-text-color-regular);
  border-bottom: 1px solid var(--el-border-color-lighter);
  
  &:last-child {
    border-bottom: none;
  }
}

.log-actions {
  text-align: right;
}

.debug-info {
  background: var(--el-fill-color-extra-light);
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  padding: 15px;
  
  h4 {
    color: var(--el-text-color-primary);
    margin: 15px 0 10px 0;
    
    &:first-child {
      margin-top: 0;
    }
  }
  
  pre {
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-light);
    border-radius: 4px;
    padding: 10px;
    font-size: 12px;
    color: var(--el-text-color-regular);
    overflow-x: auto;
    white-space: pre-wrap;
  }
}
</style>