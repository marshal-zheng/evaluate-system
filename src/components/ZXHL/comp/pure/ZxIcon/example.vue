<template>
  <div class="zx-icon-example">
    <div class="example-header">
      <h2>ZxIcon 图标组件演示</h2>
      <p>基于 Element Plus Icons 和 iconfont 的图标组件</p>
    </div>

    <div class="demo-section">
      <h3>基础用法</h3>
      <div class="icon-row">
        <ZxIcon icon="Search" :size="20" />
        <ZxIcon icon="Edit" :size="24" color="#409EFF" />
        <ZxIcon icon="Delete" :size="28" color="#F56C6C" />
        <ZxIcon icon="Plus" :size="32" color="#67C23A" />
      </div>
    </div>

    <div class="demo-section">
      <h3>不同尺寸</h3>
      <div class="icon-row">
        <ZxIcon icon="Star" :size="16" />
        <ZxIcon icon="Star" :size="20" />
        <ZxIcon icon="Star" :size="24" />
        <ZxIcon icon="Star" :size="32" />
        <ZxIcon icon="Star" :size="40" />
      </div>
    </div>

    <div class="demo-section">
      <h3>悬停效果</h3>
      <div class="icon-row">
        <ZxIcon icon="Star" :size="32" color="#909399" hover-color="#F56C6C" />
        <ZxIcon icon="StarFilled" :size="32" color="#909399" hover-color="#E6A23C" />
        <ZxIcon icon="Like" :size="32" color="#909399" hover-color="#409EFF" />
      </div>
    </div>

    <div class="demo-section">
      <h3>Element Plus 常用图标</h3>
      <div class="icon-grid">
        <div class="icon-item" v-for="iconName in commonIcons" :key="iconName">
          <ZxIcon :icon="iconName" :size="24" />
          <span>{{ iconName }}</span>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h3>iconfont 图标演示</h3>
      <p style="color: #666; margin-bottom: 20px;">使用 type="iconfont" 来显示 iconfont 图标</p>
      
      <div class="demo-section">
        <h4>基础用法</h4>
        <div class="icon-row">
          <ZxIcon type="iconfont" icon="icon_environment" :size="20" />
          <ZxIcon type="iconfont" icon="icon_task_center" :size="24" color="#409EFF" />
          <ZxIcon type="iconfont" icon="icon_file_ms" :size="28" color="#F56C6C" />
          <ZxIcon type="iconfont" icon="icon_download" :size="32" color="#67C23A" />
        </div>
      </div>
      
      <div class="demo-section">
        <h4>悬停效果</h4>
        <div class="icon-row">
          <ZxIcon type="iconfont" icon="icon_environment" :size="32" color="#909399" hover-color="#F56C6C" />
          <ZxIcon type="iconfont" icon="icon_task_center" :size="32" color="#909399" hover-color="#E6A23C" />
          <ZxIcon type="iconfont" icon="icon_download" :size="32" color="#909399" hover-color="#409EFF" />
        </div>
      </div>
      
      <div class="demo-section">
        <h4>常用 iconfont 图标</h4>
        <div class="icon-grid">
          <div class="icon-item" v-for="iconName in iconfontIcons" :key="iconName">
            <ZxIcon type="iconfont" :icon="iconName" :size="24" />
            <span>{{ iconName }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'IconDemo',
  data() {
    return {
      // Element Plus 常用图标
      commonIcons: [
        'Search', 'Edit', 'Delete', 'Plus', 'Minus', 'Star', 'StarFilled',
        'Like', 'Share', 'Download', 'Upload', 'Setting', 'User', 'Home',
        'Document', 'Folder', 'FolderOpened', 'Picture', 'VideoCamera',
        'Headset', 'Phone', 'Message', 'ChatDotRound', 'Bell', 'Warning',
        'InfoFilled', 'SuccessFilled', 'CircleClose', 'Check', 'Close',
        'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Refresh',
        'More', 'MoreFilled', 'Grid', 'Menu', 'List'
      ],
      // iconfont 常用图标
      iconfontIcons: [
        'icon_environment', 'icon_task_center', 'icon_file_ms', 'icon_download',
        'icon_upload', 'icon_setting', 'icon_user', 'icon_home', 'icon_search',
        'icon_edit', 'icon_delete', 'icon_add', 'icon_minus', 'icon_star',
        'icon_like', 'icon_share', 'icon_folder', 'icon_document', 'icon_picture',
        'icon_video', 'icon_music', 'icon_phone', 'icon_message', 'icon_bell',
        'icon_warning', 'icon_info', 'icon_success', 'icon_error', 'icon_close',
        'icon_check', 'icon_arrow_left', 'icon_arrow_right', 'icon_arrow_up',
        'icon_arrow_down', 'icon_refresh', 'icon_more', 'icon_grid', 'icon_menu',
        'icon_list', 'icon_calendar', 'icon_clock', 'icon_location', 'icon_lock',
        'icon_unlock', 'icon_eye', 'icon_eye_close', 'icon_copy', 'icon_cut',
        'icon_paste', 'icon_save', 'icon_print', 'icon_export', 'icon_import'
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.zx-icon-example {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;

  .icon-item {
    background-color: red;
  }
  
  .example-header {
    text-align: center;
    margin-bottom: 40px;
    
    h2 {
      color: #303133;
      margin-bottom: 10px;
      font-size: 28px;
    }
    
    p {
      color: #606266;
      font-size: 16px;
    }
  }
  
  h3 {
    color: #606266;
    margin: 20px 0 15px;
    font-size: 18px;
    font-weight: 600;
  }
  
  h4 {
    color: #606266;
    margin: 15px 0 10px;
    font-size: 16px;
    font-weight: 500;
  }
  
  .demo-section {
    margin-bottom: 30px;
    padding: 25px;
    border: 1px solid #EBEEF5;
    border-radius: 8px;
    background-color: #FAFAFA;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .icon-row {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
    margin-bottom: 15px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .icon-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 15px;
    margin-top: 15px;
  }
  
  .icon-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 15px 10px;
    border: 1px solid #E4E7ED;
    border-radius: 6px;
    background-color: red;
    transition: all 0.3s ease;
    cursor: pointer;
    
    &:hover {
      border-color: #409EFF;
      box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
      transform: translateY(-2px);
    }
    
    span {
      margin-top: 8px;
      font-size: 12px;
      color: #606266;
      text-align: center;
      word-break: break-all;
      line-height: 1.2;
    }
  }
}
</style>