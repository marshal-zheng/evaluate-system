<template>
  <div class="draggable-palette">
    <h3>拖拽组件到画布</h3>
    <div class="palette-items">
      <!-- 颜色卡片组 -->
      <div class="palette-group">
        <h4>颜色卡片</h4>
        <div class="palette-row">
          <div
            v-for="color in colors"
            :key="color.type"
            class="palette-item color-card"
            :style="{ backgroundColor: color.color }"
            draggable="true"
            @dragstart="onDragStart($event, { type: 'ColorCard', chartType: color.type, title: color.name, w: 2, h: 2 })"
            @dragend="onDragEnd"
          >
            <span>{{ color.name }}</span>
          </div>
        </div>
      </div>

      <!-- ECharts 图表组 -->
      <div class="palette-group">
        <h4>ECharts 图表</h4>
        <div class="palette-row">
          <div
            v-for="chart in chartTypes"
            :key="chart.type"
            class="palette-item chart-item"
            draggable="true"
            @dragstart="onDragStart($event, { type: 'echarts', chartType: chart.type, title: chart.name, w: 10, h: 8 })"
            @dragend="onDragEnd"
          >
            <i :class="chart.icon"></i>
            <span>{{ chart.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { setDragPayload, clearDragPayload } from '../dragPayloadStore'

// 颜色卡片配置（使用系统主题变量）
const colors = [
  { type: 'red', name: '红色卡片', color: 'var(--dg-color-danger)' },
  { type: 'orange', name: '橙色卡片', color: 'var(--dg-color-warning)' },
  { type: 'green', name: '绿色卡片', color: 'var(--dg-color-success)' },
  { type: 'blue', name: '蓝色卡片', color: 'var(--dg-color-primary)' },
  { type: 'purple', name: '紫色卡片', color: 'var(--dg-color-purple, var(--dg-color-info))' }
]

// ECharts 图表类型配置
const chartTypes = [
  { type: 'line', name: '折线图', icon: 'el-icon-data-line' },
  { type: 'bar', name: '柱状图', icon: 'el-icon-data-board' },
  { type: 'pie', name: '饼图', icon: 'el-icon-pie-chart' },
  { type: 'scatter', name: '散点图', icon: 'el-icon-data-analysis' },
  { type: 'area', name: '面积图', icon: 'el-icon-trend-charts' }
]

const isDragging = ref(false)

const onDragStart = (event, payload) => {
  isDragging.value = true
  // 设置拖拽数据
  event.dataTransfer.setData('text/plain', JSON.stringify(payload))
  event.dataTransfer.effectAllowed = 'copy'
  // 记录到共享 store，便于 grid 在 dragover 阶段读取 w/h
  setDragPayload(payload)
  
  // 设置拖拽时的样式
  event.target.style.opacity = '0.5'
}

const onDragEnd = (event) => {
  isDragging.value = false
  clearDragPayload()
  event.target.style.opacity = '1'
}
</script>

<style scoped>
.draggable-palette {
  background: var(--dg-palette-bg);
  border: 1px solid var(--dg-palette-border-color);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.draggable-palette h3 {
  margin: 0 0 16px 0;
  color: var(--dg-heading-color);
  font-size: 16px;
  font-weight: 600;
}

.palette-group {
  margin-bottom: 16px;
}

.palette-group:last-child {
  margin-bottom: 0;
}

.palette-group h4 {
  margin: 0 0 8px 0;
  color: var(--dg-subheading-color);
  font-size: 14px;
  font-weight: 500;
}

.palette-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.palette-item {
  padding: 8px 12px;
  border-radius: 6px;
  cursor: grab;
  user-select: none;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 80px;
  justify-content: center;
}

.palette-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--el-box-shadow-light, 0 4px 8px rgba(0, 0, 0, 0.15));
}

.palette-item:active {
  cursor: grabbing;
}

.color-card {
  color: var(--dg-text-on-accent);
  text-shadow: var(--dg-text-shadow-on-accent);
}

.chart-item {
  background: var(--dg-card-bg);
  border: 1px solid var(--dg-card-border);
  color: var(--dg-text-primary);
}

.chart-item:hover {
  background: var(--dg-card-bg-hover);
  border-color: var(--dg-card-border-hover);
}

.chart-item i {
  font-size: 14px;
}
</style>
