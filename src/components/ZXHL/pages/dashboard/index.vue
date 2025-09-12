<template>
  <div class="grid-layout-demo">
    <div class="demo-header">
      <h1>Vue Grid Layout 演示</h1>
      <p class="demo-description">
        这是一个基于 @marsio/vue-grid-layout 的响应式网格布局演示，支持拖拽、调整大小和从外部拖入元素。
      </p>
    </div>
    
    <!-- 布局信息显示 -->
    <div class="layout-info">
      <h3>当前布局信息</h3>
      <div class="layout-json">
        <p>显示格式: <code>[x, y, w, h]</code></p>
        <div class="layout-items">
          <div v-for="l in state.layout" :key="l.i" class="layout-item">
            <strong>{{ l.i === '__dropping-elem__' ? 'drop' : l.i }}</strong>
            : [{{ l.x }}, {{ l.y }}, {{ l.w }}, {{ l.h }}]
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="demo-controls">
      <el-button type="primary" @click="newLayout">
        <el-icon><Refresh /></el-icon>
        生成新布局
      </el-button>
      <el-button type="success" @click="addItem">
        <el-icon><Plus /></el-icon>
        添加项目
      </el-button>
    </div>

    <!-- 可拖拽元素 -->
    <div class="draggable-section">
      <div 
        class="droppable-element"
        draggable="true"
        unselectable="on"
        @dragstart="onDragStart"
      >
        <el-icon><Grid /></el-icon>
        可拖拽元素 (拖我到网格中!)
      </div>
    </div>

    <!-- 网格布局容器 -->
    <div class="grid-container">
      <ResponsiveVueGridLayout
        class="layout"
        :rowHeight="30"
        :cols="{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }"
        :layouts="state.layouts"
        @breakpointChange="onBreakpointChange"
        @layoutChange="onLayoutChange"
        @dropDragOver="onDropDragOver"
        @drop="onDrop"
        @dragStop="onDragStop"
        :measureBeforeMount="false"
        :useCSSTransforms="state.mounted"
        :containerPadding="[16, 16]"
        :isDroppable="true"
        :margin="[10, 10]"
      >
        <div 
          v-for="l in state.layouts.lg" 
          :key="l.i" 
          :class="{ 
            'grid-item': true,
            'static-item': l.static,
            'normal-item': !l.static
          }"
        >
          <div class="grid-item-content">
            <div class="item-header">
              <span v-if="l.static" class="static-label">
                <el-icon><Lock /></el-icon>
                静态项目
              </span>
              <span v-else class="item-id">项目 {{ l.i }}</span>
              <el-button 
                v-if="!l.static" 
                type="danger" 
                size="small" 
                circle
                @click="removeItem(l.i)"
                class="remove-btn"
              >
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
            <div class="item-info">
              <p>位置: ({{ l.x }}, {{ l.y }})</p>
              <p>大小: {{ l.w }} × {{ l.h }}</p>
            </div>
          </div>
        </div>
      </ResponsiveVueGridLayout>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { VueGridLayout as VGL, WidthProvider, Responsive } from '@marsio/vue-grid-layout'
import { Refresh, Plus, Grid, Lock, Close } from '@element-plus/icons-vue'

const ResponsiveVueGridLayout = WidthProvider(Responsive)

const len = 6

// 生成随机布局
const generateLayout = () => {
  return Array.from({ length: len }, (item, i) => {
    const y = Math.ceil(Math.random() * 4) + 1
    return {
      x: (Math.round(Math.random() * 5) * 2) % 12,
      y: Math.floor(i / 6) * y,
      w: 2,
      h: y,
      i: (i + 1).toString(),
      static: Math.random() < 0.1, // 10% 概率为静态元素
    }
  })
}

// 响应式状态
const state = reactive({
  currentBreakpoint: 'lg',
  compactType: 'vertical',
  mounted: false,
  layout: [],
  layouts: { lg: generateLayout() },
  nextId: len + 1
})

// 组件挂载后设置状态
onMounted(() => {
  state.mounted = true
  state.layout = state.layouts.lg
})

// 生成新布局
const newLayout = () => {
  state.layouts = { lg: generateLayout() }
  state.layout = state.layouts.lg
  state.nextId = len + 1
}

// 添加新项目
const addItem = () => {
  const newItem = {
    x: 0,
    y: 0,
    w: 2,
    h: 2,
    i: state.nextId.toString(),
    static: false
  }
  state.layouts.lg.push(newItem)
  state.nextId++
}

// 移除项目
const removeItem = (itemId) => {
  state.layouts.lg = state.layouts.lg.filter(item => item.i !== itemId)
}

// 断点变化回调
const onBreakpointChange = ({ breakpoint }) => {
  state.currentBreakpoint = breakpoint
}

// 布局变化回调
const onLayoutChange = (layout, layouts) => {
  state.layout = layout
}

// 拖拽开始
const onDragStart = (e) => {
  e.dataTransfer.setData('text/plain', '')
}

// 拖拽放置回调
const onDrop = (layout, event, layoutItem) => {
  const newItem = {
    ...layoutItem,
    i: state.nextId.toString(),
  }
  state.layouts.lg.push(newItem)
  state.nextId++
}

// 拖拽悬停回调
const onDropDragOver = (e) => {
  return { w: 2, h: 2 }
}

// 拖拽停止回调
const onDragStop = (layout, oldItem, newItem) => {
  console.log('拖拽停止:', { oldItem, newItem })
}
</script>

<style scoped>
.grid-layout-demo {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-header {
  text-align: center;
  margin-bottom: 30px;
}

.demo-header h1 {
  color: var(--el-color-primary);
  margin-bottom: 10px;
}

.demo-description {
  color: var(--el-text-color-regular);
  font-size: 14px;
  margin: 0;
}

.layout-info {
  background: var(--el-bg-color-page);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.layout-info h3 {
  margin: 0 0 15px 0;
  color: var(--el-text-color-primary);
}

.layout-json {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.layout-items {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.layout-item {
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-7);
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 12px;
  color: var(--el-color-primary);
}

.demo-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.draggable-section {
  margin-bottom: 20px;
}

.droppable-element {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--el-color-success-light-9);
  border: 2px dashed var(--el-color-success);
  border-radius: 8px;
  padding: 12px 20px;
  cursor: grab;
  user-select: none;
  color: var(--el-color-success);
  font-weight: 500;
  transition: all 0.3s ease;
}

.droppable-element:hover {
  background: var(--el-color-success-light-8);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.droppable-element:active {
  cursor: grabbing;
}

.grid-container {
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: 10px;
  background: var(--el-bg-color);
  min-height: 400px;
}

.layout {
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
}

.grid-item {
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.grid-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.normal-item {
  background: linear-gradient(135deg, var(--el-color-primary-light-9), var(--el-color-primary-light-8));
  border: 1px solid var(--el-color-primary-light-7);
}

.static-item {
  background: linear-gradient(135deg, var(--el-color-warning-light-9), var(--el-color-warning-light-8));
  border: 1px solid var(--el-color-warning-light-7);
}

.grid-item-content {
  height: 100%;
  padding: 12px;
  display: flex;
  flex-direction: column;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.static-label {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--el-color-warning);
  font-size: 12px;
  font-weight: 500;
}

.item-id {
  color: var(--el-color-primary);
  font-weight: 600;
  font-size: 14px;
}

.remove-btn {
  width: 20px;
  height: 20px;
  padding: 0;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.item-info p {
  margin: 2px 0;
  font-size: 12px;
  color: var(--el-text-color-regular);
}

/* 响应式样式 */
@media (max-width: 768px) {
  .grid-layout-demo {
    padding: 10px;
  }
  
  .demo-controls {
    flex-direction: column;
  }
  
  .layout-items {
    flex-direction: column;
  }
}
</style>