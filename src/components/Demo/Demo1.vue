<template>
  <div class="demo1-container">
    <h2>Demo 1 - 基础画布与常用操作</h2>

    <div class="toolbar">
      <el-button-group>
        <el-button size="small" :icon="RefreshLeft" @click="undo" :disabled="!canUndoValue">撤销</el-button>
        <el-button size="small" :icon="RefreshRight" @click="redo" :disabled="!canRedoValue">重做</el-button>
      </el-button-group>
      <el-button-group>
        <el-button size="small" :icon="CopyDocument" @click="copy" :disabled="selectedCells.length === 0">复制</el-button>
        <el-button size="small" :icon="DocumentCopy" @click="paste" :disabled="clipboardEmpty">黏贴</el-button>
      </el-button-group>
    </div>

    <div class="canvas-container">
      <XFlow>
        <XFlowGraph
          :style="{ width: '100%', height: '360px' }"
          :zoomable="true"
          :pannable="true"
          :scroller="false"
          @ready="onGraphReady"
        >
          <XFlowHistory />
          <XFlowClipboard />
          <XFlowBackground color="#fafafa" />
          <XFlowGrid :size="20" type="dot" />
        </XFlowGraph>
      </XFlow>
    </div>

    <div class="status-bar">
      <el-space>
        <span>选中: {{ selectedCells.length }}</span>
        <span>可撤销: {{ canUndoValue ? '是' : '否' }}</span>
        <span>可重做: {{ canRedoValue ? '是' : '否' }}</span>
      </el-space>
    </div>
  </div>
  
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RefreshLeft, RefreshRight, CopyDocument, DocumentCopy } from '@element-plus/icons-vue'

// 组件
import {
  XFlow,
  XFlowGraph,
  XFlowHistory,
  XFlowClipboard,
  XFlowBackground,
  XFlowGrid,
} from '../xflow-vue/src/components/index.js'

// 组合式
import { useGraphStore, useHistory, useClipboard } from '../xflow-vue/src/composables/index.js'
import { registerBasicShapes } from '../xflow-vue/src/shapes/register.js'

// 状态
const selectedCells = ref([])
const clipboardEmpty = ref(true)

let graph = null
let graphStore = null
let historyActions = null
let clipboardActions = null

// 通过 historyVersion 驱动 computed 重新计算（X6 History 不具备响应式依赖）
const historyVersion = ref(0)
const canUndoValue = computed(() => {
  // 依赖版本号以触发更新
  historyVersion.value
  return historyActions?.canUndo() || false
})
const canRedoValue = computed(() => {
  historyVersion.value
  return historyActions?.canRedo() || false
})

// 事件绑定
const setupGraphEvents = () => {
  if (!graph) return
  graph.on('selection:changed', ({ selected }) => {
    selectedCells.value = selected
  })
  // 监听历史变化，推动撤销/重做按钮刷新
  const bumpHistory = () => {
    historyVersion.value += 1
  }
  graph.on('history:undo', bumpHistory)
  graph.on('history:redo', bumpHistory)
  graph.on('history:change', bumpHistory)
  // 兜底：节点/边增删改也刷新一次
  graph.on('cell:added', bumpHistory)
  graph.on('cell:removed', bumpHistory)
  graph.on('cell:changed', bumpHistory)
}

// ready 回调
const onGraphReady = (g) => {
  graph = g
  graphStore = useGraphStore()
  historyActions = useHistory(g)
  clipboardActions = useClipboard(g)
  setupGraphEvents()
  updateClipboardStatus()

  // 初始化放入两个节点用于试用
  const a = graph.addNode({ shape: 'rect-node', x: 80, y: 80, label: 'A' })
  const b = graph.addNode({ shape: 'rect-node', x: 240, y: 160, label: 'B' })
  graph.addEdge({ source: a, target: b, shape: 'basic-edge' })
}

// 操作
const undo = () => historyActions && historyActions.undo()
const redo = () => historyActions && historyActions.redo()
const copy = () => {
  clipboardActions && clipboardActions.copy()
  updateClipboardStatus()
  historyVersion.value += 1
}
const paste = () => {
  if (!clipboardActions) return
  const cells = clipboardActions.paste({ offset: 20 })
  if (cells?.length) graph.select(cells)
  // 粘贴会新增单元，推动历史状态刷新
  historyVersion.value += 1
}
const updateClipboardStatus = () => {
  clipboardEmpty.value = clipboardActions ? clipboardActions.isEmpty() : true
}

onMounted(() => {
  registerBasicShapes()
})
</script>

<style scoped>
.demo1-container {
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin: 10px 0;
  background-color: #f9f9f9;
}

.toolbar {
  margin-bottom: 12px;
  display: flex;
  gap: 12px;
  align-items: center;
}

.canvas-container {
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  overflow: hidden;
}

.status-bar {
  margin-top: 12px;
  font-size: 12px;
  color: #666;
}
</style>