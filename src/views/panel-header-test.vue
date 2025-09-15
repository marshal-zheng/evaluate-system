<template>
  <div class="panel-header-test">
    <div class="test-header">
      <h1>PanelHeaderTitleItems 组件测试</h1>
      <p>验证组件替换后的功能是否正常</p>
    </div>

    <div class="test-section">
      <h2>基础功能测试</h2>
      
      <!-- 状态指示器测试 -->
      <div class="test-item">
        <h3>状态指示器</h3>
        <div class="panel-mock">
          <div class="panel-header">
            <span>面板标题</span>
            <PanelHeaderTitleItems 
              :alert-state="'success'"
            />
          </div>
        </div>
      </div>

      <!-- 时间信息测试 -->
      <div class="test-item">
        <h3>时间信息</h3>
        <div class="panel-mock">
          <div class="panel-header">
            <span>面板标题</span>
            <PanelHeaderTitleItems 
              :time-info="'5分钟前'"
            />
          </div>
        </div>
      </div>

      <!-- 链接测试 -->
      <div class="test-item">
        <h3>链接功能</h3>
        <div class="panel-mock">
          <div class="panel-header">
            <span>面板标题</span>
            <PanelHeaderTitleItems 
              :panel-links="testLinks"
              @link-click="handleLinkClick"
            />
          </div>
        </div>
      </div>

      <!-- 自定义项测试 -->
      <div class="test-item">
        <h3>自定义项</h3>
        <div class="panel-mock">
          <div class="panel-header">
            <span>面板标题</span>
            <PanelHeaderTitleItems 
              :title-items="customItems"
              @title-item-click="handleItemClick"
            />
          </div>
        </div>
      </div>

      <!-- 综合测试 -->
      <div class="test-item">
        <h3>综合功能</h3>
        <div class="panel-mock">
          <div class="panel-header">
            <span>面板标题</span>
            <PanelHeaderTitleItems 
              :alert-state="'warning'"
              :time-info="'2小时前'"
              :panel-links="testLinks"
              :title-items="customItems"
              @link-click="handleLinkClick"
              @title-item-click="handleItemClick"
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PanelHeaderTitleItems from '@/components/ZXHL/comp/business/DashboardGrid/PanelComponent/PanelHeader/PanelHeaderTitleItems.vue'

const eventLogs = ref([])

const testLinks = ref([
  {
    title: '查看详情',
    url: 'https://example.com/detail',
    icon: 'View'
  },
  {
    title: '编辑配置',
    url: 'https://example.com/edit',
    icon: 'Edit'
  },
  {
    title: '下载报告',
    url: 'https://example.com/download',
    icon: 'Download'
  }
])

const customItems = ref([
  {
    type: 'custom',
    icon: 'Star',
    content: '收藏',
    tooltip: '点击收藏此面板',
    onClick: (event) => {
      addLog('自定义项点击: 收藏')
    }
  },
  {
    type: 'custom',
    icon: 'Share',
    content: '分享',
    tooltip: '分享此面板',
    onClick: (event) => {
      addLog('自定义项点击: 分享')
    }
  }
])

const handleLinkClick = (link, event) => {
  addLog(`链接点击: ${link.title} - ${link.url}`)
}

const handleItemClick = (item, event) => {
  addLog(`标题项点击: ${item.type} - ${item.content || item.icon}`)
}

const addLog = (message) => {
  const timestamp = new Date().toLocaleTimeString()
  eventLogs.value.unshift(`[${timestamp}] ${message}`)
  if (eventLogs.value.length > 10) {
    eventLogs.value.pop()
  }
}
</script>

<style lang="scss" scoped>
.panel-header-test {
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
</style>