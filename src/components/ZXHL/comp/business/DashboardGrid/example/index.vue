<template>
  <div class="example-container">
    <h2>DashboardGrid 示例 - 拖拽画布</h2>
    <p>从下面的组件调色板拖拽组件到画布中</p>
    
    <!-- 拖拽组件调色板 -->
    <DraggableChartPalette />
    
    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button v-if="panels.length > 0" @click="clearAll" type="warning">清空全部</el-button>
      <el-button @click="exportLayout" type="primary">导出布局</el-button>
    </div>
    
    <!-- 空白画布 -->
    <div class="canvas-area">
      <DashboardGrid 
        :panels="panels"
        :isEditable="true"
        @panel-added="handlePanelAdded"
        @panel-removed="handlePanelRemoved"
        @layout-changed="handleLayoutChanged"
      />
      
      <!-- 空状态提示 -->
      <div v-if="panels.length === 0" class="empty-state">
        <div class="empty-content">
          <i class="el-icon-box"></i>
          <h3>空白画布</h3>
          <p>从上方组件调色板拖拽组件到此处开始布局</p>
        </div>
      </div>
    </div>
    
    <!-- 布局导出区域 -->
    <div v-if="exportedLayout" class="export-area">
      <h3>导出的布局配置：</h3>
      <textarea 
        v-model="exportedLayout" 
        readonly 
        @click="selectAll"
      ></textarea>
      <p v-if="copyHint" class="copy-hint">已复制到剪贴板</p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import DashboardGrid from '../index.vue'
import DraggableChartPalette from './DraggableChartPalette.vue'

export default {
  name: 'DashboardGridExample',
  components: {
    DashboardGrid,
    DraggableChartPalette
  },
  setup() {
    const panels = ref([])
    const exportedLayout = ref('')
    const copyHint = ref(false)

    // 处理面板添加（拖拽添加）
    const handlePanelAdded = (newPanel) => {
      console.log('Panel added:', newPanel)
      panels.value.push(newPanel)
    }

    // 处理面板移除
    const handlePanelRemoved = (panelId) => {
      const index = panels.value.findIndex(p => p.id === panelId)
      if (index !== -1) {
        panels.value.splice(index, 1)
      }
    }

    // 处理布局变化
    const handleLayoutChanged = (layout) => {
      console.log('Layout changed:', layout)
      // 可以在这里保存布局到本地存储或发送到服务器
    }

    // 清空所有面板
    const clearAll = () => {
      panels.value = []
      exportedLayout.value = ''
    }

    // 导出布局配置
    const exportLayout = async () => {
      const layoutConfig = {
        panels: panels.value.map(panel => ({
          id: panel.id,
          type: panel.type,
          title: panel.title,
          type: panel.type,
          gridPos: panel.gridPos
        }))
      }
      const text = JSON.stringify(layoutConfig, null, 2)
      exportedLayout.value = text
      
      try {
        await navigator.clipboard.writeText(text)
        copyHint.value = true
        setTimeout(() => (copyHint.value = false), 1500)
      } catch (err) {
        console.warn('Failed to copy to clipboard:', err)
        copyHint.value = false
      }
    }

    // 选中所有文本
    const selectAll = (event) => {
      event.target.select()
    }

    return {
      panels,
      exportedLayout,
      copyHint,
      handlePanelAdded,
      handlePanelRemoved,
      handleLayoutChanged,
      clearAll,
      exportLayout,
      selectAll
    }
  }
}
</script>

<style scoped>
/* import index.scss */
.example-container {
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.action-buttons {
  margin: 20px 0;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.canvas-area {
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  min-height: 500px;
  background: #fafbfc;
  position: relative;
}

.empty-state {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.empty-content {
  text-align: center;
  color: #909399;
}

.empty-content i {
  font-size: 48px;
  margin-bottom: 16px;
  display: block;
}

.empty-content h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 500;
}

.empty-content p {
  margin: 0;
  font-size: 14px;
}

.export-area {
  margin-top: 20px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
}

.export-area h3 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 16px;
}

.export-area textarea {
  width: 100%;
  height: 200px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 12px;
  resize: vertical;
}

.copy-hint {
  color: #67c23a;
  font-size: 12px;
  margin: 8px 0 0 0;
}

h2 {
  color: #303133;
  margin-bottom: 10px;
}

p {
  color: #606266;
  margin-bottom: 20px;
}
</style>