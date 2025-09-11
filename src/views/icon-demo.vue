<template>
  <div class="icon-demo">
    <div class="demo-container">
      <h1>ZxIcon 图标组件演示</h1>
      
      <div class="demo-section">
        <h2>基础用法</h2>
        <div class="icon-row">
          <ZxIcon icon="Search" :size="20" />
          <ZxIcon icon="Edit" :size="24" color="#409EFF" />
          <ZxIcon icon="Delete" :size="28" color="#F56C6C" />
          <ZxIcon icon="Plus" :size="32" color="#67C23A" />
        </div>
      </div>
      
      <div class="demo-section">
        <h2>不同尺寸</h2>
        <div class="icon-row">
          <ZxIcon icon="Star" :size="16" />
          <ZxIcon icon="Star" :size="20" />
          <ZxIcon icon="Star" :size="24" />
          <ZxIcon icon="Star" :size="32" />
          <ZxIcon icon="Star" :size="40" />
        </div>
      </div>
      
      <div class="demo-section">
        <h2>悬停效果</h2>
        <div class="icon-row">
          <ZxIcon icon="Star" :size="32" color="#909399" hover-color="#F56C6C" />
          <ZxIcon icon="StarFilled" :size="32" color="#909399" hover-color="#E6A23C" />
          <ZxIcon icon="Like" :size="32" color="#909399" hover-color="#409EFF" />
        </div>
      </div>
      
      <div class="demo-section">
        <h2>Element Plus 常用图标</h2>
        <div class="icon-grid">
          <div class="icon-item" v-for="iconName in commonIcons" :key="iconName">
            <ZxIcon :icon="iconName" :size="24" />
            <span>{{ iconName }}</span>
          </div>
        </div>
      </div>
      
      <div class="demo-section">
        <h2>iconfont 图标演示</h2>
        <p style="color: #666; margin-bottom: 20px;">使用 type="iconfont" 来显示 iconfont 图标</p>
        
        <div class="demo-section">
          <h3>基础用法</h3>
          <div class="icon-row">
            <ZxIcon type="iconfont" icon="icon_environment" :size="20" />
            <ZxIcon type="iconfont" icon="icon_task_center" :size="24" color="#409EFF" />
            <ZxIcon type="iconfont" icon="icon_file_ms" :size="28" color="#F56C6C" />
            <ZxIcon type="iconfont" icon="icon_download" :size="32" color="#67C23A" />
          </div>
        </div>
        
        <div class="demo-section">
          <h3>悬停效果</h3>
          <div class="icon-row">
            <ZxIcon type="iconfont" icon="icon_environment" :size="32" color="#909399" hover-color="#F56C6C" />
            <ZxIcon type="iconfont" icon="icon_task_center" :size="32" color="#909399" hover-color="#E6A23C" />
            <ZxIcon type="iconfont" icon="icon_download" :size="32" color="#909399" hover-color="#409EFF" />
          </div>
        </div>
        
        <div class="demo-section">
          <h3>常用 iconfont 图标</h3>
          <div class="icon-grid">
            <div class="icon-item" v-for="iconName in iconfontIcons" :key="iconName">
              <ZxIcon type="iconfont" :icon="iconName" :size="24" />
              <span>{{ iconName }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 组件名称
defineOptions({
  name: 'IconDemo'
})

// Element Plus 常用图标列表
const commonIcons = [
  'Search', 'Edit', 'Delete', 'Plus', 'Minus',
  'Star', 'StarFilled', 'Like', 'Share', 'Download',
  'Upload', 'Setting', 'User', 'Lock', 'Unlock',
  'House', 'Back', 'Right', 'Top', 'Bottom'
]

// iconfont 常用图标列表
const iconfontIcons = [
  'icon_environment', 'icon_task_center', 'icon_file_ms', 'icon_download',
  'icon_folder_outlined', 'icon_local_outlined', 'icon_Batch_outlined',
  'icon_logs_outlined', 'icon_new-item_outlined', 'icon_mindnote_outlined',
  'icon_pc_outlined', 'icon_text_outlined', 'icon_organization_outlined',
  'icon_visible_outlined', 'icon_time_outlined', 'icon_template_outlined',
  'icon_notification_outlined', 'icon_plugin_outlined', 'icon_switch_outlined',
  'icon-setting', 'icon_member_outlined', 'icon_shield_outlined',
  'icon_scan_outlined', 'icon_qr_outlined', 'icon_adjustment_outlined'
]
</script>

<style lang="scss" scoped>
.icon-demo {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-container {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

h1 {
  color: #303133;
  margin-bottom: 24px;
  text-align: center;
}

h2 {
  color: #606266;
  margin: 24px 0 16px 0;
  font-size: 18px;
}

.demo-section {
  margin-bottom: 32px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.icon-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 6px;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 6px;
}

.icon-item {
  
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: red;
  border-radius: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
  
  span {
    font-size: 12px;
    color: #606266;
    text-align: center;
  }
}
</style>