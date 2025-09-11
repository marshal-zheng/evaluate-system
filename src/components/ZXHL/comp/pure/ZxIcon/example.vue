<template>
  <div class="zx-icon-example">
    <h2>ZxIcon 组件示例</h2>
    
    <div class="example-section">
      <h3>基础用法</h3>
      <div class="icon-row">
        <ZxIcon icon="icon-home" :size="20" />
        <ZxIcon icon="icon-user" :size="24" color="#409eff" />
        <ZxIcon icon="icon-setting" :size="18" color="#67c23a" />
      </div>
    </div>
    
    <div class="example-section">
      <h3>不同尺寸</h3>
      <div class="icon-row">
        <ZxIcon icon="icon-star" :size="12" />
        <ZxIcon icon="icon-star" :size="16" />
        <ZxIcon icon="icon-star" :size="20" />
        <ZxIcon icon="icon-star" :size="24" />
        <ZxIcon icon="icon-star" :size="32" />
      </div>
    </div>
    
    <div class="example-section">
      <h3>悬停效果</h3>
      <div class="icon-row">
        <ZxIcon 
          icon="icon-heart" 
          :size="24" 
          color="#909399" 
          hover-color="#f56c6c" 
        />
        <ZxIcon 
          icon="icon-like" 
          :size="24" 
          color="#909399" 
          hover-color="#409eff" 
        />
        <ZxIcon 
          icon="icon-thumb" 
          :size="24" 
          color="#909399" 
          hover-color="#67c23a" 
        />
      </div>
    </div>
    
    <div class="example-section">
      <h3>本地 SVG 图标</h3>
      <div class="icon-row">
        <ZxIcon icon="svg-icon:user" :size="24" />
        <ZxIcon icon="svg-icon:home" :size="24" color="#409eff" />
        <ZxIcon icon="svg-icon:setting" :size="24" color="#67c23a" />
      </div>
      <p class="note">注意：本地 SVG 需要配置 svg-sprite</p>
    </div>
    
    <div class="example-section">
      <h3>自定义类名</h3>
      <div class="icon-row">
        <ZxIcon 
          icon="icon-custom" 
          :size="24" 
          class-name="custom-icon-1" 
        />
        <ZxIcon 
          icon="icon-custom" 
          :size="24" 
          class-name="custom-icon-2" 
        />
      </div>
    </div>
    
    <div class="example-section">
      <h3>动态图标</h3>
      <div class="icon-row">
        <ZxIcon 
          :icon="currentIcon" 
          :size="iconSize" 
          :color="iconColor"
        />
        <div class="controls">
          <button @click="changeIcon">切换图标</button>
          <button @click="changeSize">切换大小</button>
          <button @click="changeColor">切换颜色</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ZxIcon from './index.js'

export default {
  name: 'ZxIconExample',
  components: {
    ZxIcon
  },
  data() {
    return {
      currentIcon: 'icon-home',
      iconSize: 24,
      iconColor: '#409eff',
      icons: ['icon-home', 'icon-user', 'icon-setting', 'icon-star'],
      sizes: [16, 20, 24, 32],
      colors: ['#409eff', '#67c23a', '#e6a23c', '#f56c6c']
    }
  },
  methods: {
    changeIcon() {
      const currentIndex = this.icons.indexOf(this.currentIcon)
      const nextIndex = (currentIndex + 1) % this.icons.length
      this.currentIcon = this.icons[nextIndex]
    },
    changeSize() {
      const currentIndex = this.sizes.indexOf(this.iconSize)
      const nextIndex = (currentIndex + 1) % this.sizes.length
      this.iconSize = this.sizes[nextIndex]
    },
    changeColor() {
      const currentIndex = this.colors.indexOf(this.iconColor)
      const nextIndex = (currentIndex + 1) % this.colors.length
      this.iconColor = this.colors[nextIndex]
    }
  }
}
</script>

<style lang="scss" scoped>
.zx-icon-example {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  
  h2 {
    color: #303133;
    margin-bottom: 20px;
  }
  
  h3 {
    color: #606266;
    margin: 20px 0 10px;
    font-size: 16px;
  }
  
  .example-section {
    margin-bottom: 30px;
    padding: 20px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    background-color: #fafafa;
  }
  
  .icon-row {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
  }
  
  .controls {
    display: flex;
    gap: 10px;
    margin-left: 20px;
    
    button {
      padding: 5px 10px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      background-color: #fff;
      cursor: pointer;
      font-size: 12px;
      
      &:hover {
        border-color: #409eff;
        color: #409eff;
      }
    }
  }
  
  .note {
    margin-top: 10px;
    font-size: 12px;
    color: #909399;
  }
}

// 自定义图标样式示例
.custom-icon-1 {
  background: linear-gradient(45deg, #409eff, #67c23a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.custom-icon-2 {
  color: #f56c6c;
  text-shadow: 2px 2px 4px rgba(245, 108, 108, 0.3);
  
  &:hover {
    transform: rotate(360deg);
    transition: transform 0.5s ease;
  }
}
</style>