<template>
  <div class="demo10-container">
    <h2>Demo 10 - 高级布局（@antv/layout）</h2>

    <div class="toolbar">
      <el-button-group>
        <el-button size="small" type="primary" @click="applyDagre">Dagre 层次布局</el-button>
        <el-button size="small" @click="applyForce">Force 力导布局</el-button>
        <el-button size="small" @click="applyCircular">Circular 环形布局</el-button>
        <el-button size="small" @click="resetSeed">重置示例</el-button>
      </el-button-group>
    </div>

    <div class="canvas-container">
      <XFlow>
        <XFlowGraph
          :style="{ width: '100%', height: '520px' }"
          :zoomable="true"
          :pannable="true"
          :scroller="false"
          @ready="onGraphReady"
        >
          <XFlowHistory />
          <XFlowSnapline />
          <XFlowBackground color="#fafafa" />
          <XFlowGrid :size="20" type="mesh" />
        </XFlowGraph>
      </XFlow>
    </div>

    <div class="tips">
      <el-alert title="布局说明" type="info" :closable="false" show-icon>
        <ul>
          <li>优先使用 @antv/layout；如果不可用，退化为内置简化算法</li>
          <li>布局仅变更节点坐标，边会自动跟随</li>
        </ul>
      </el-alert>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import {
  XFlow,
  XFlowGraph,
  XFlowHistory,
  XFlowSnapline,
  XFlowBackground,
  XFlowGrid,
} from '../xflow-vue/src/components/index.js'
import { registerAllBusinessShapes } from '../../shapes/index.js'

let graph = null

const onGraphReady = (g) => { graph = g; seed() }

const seed = () => {
  graph.clearCells()
  const s = graph.addNode({ shape: 'port-node', x: 80, y: 200, label: '开始' })
  const a = graph.addNode({ shape: 'port-node', x: 280, y: 120, label: '处理 A' })
  const b = graph.addNode({ shape: 'port-node', x: 280, y: 280, label: '处理 B' })
  const c = graph.addNode({ shape: 'port-node', x: 520, y: 120, label: '处理 C' })
  const d = graph.addNode({ shape: 'port-node', x: 520, y: 280, label: '处理 D' })
  const e = graph.addNode({ shape: 'port-node', x: 760, y: 200, label: '结束' })
  graph.addEdge({ source: { cell: s.id, port: 'output' }, target: { cell: a.id, port: 'input' } })
  graph.addEdge({ source: { cell: s.id, port: 'output' }, target: { cell: b.id, port: 'input' } })
  graph.addEdge({ source: { cell: a.id, port: 'output' }, target: { cell: c.id, port: 'input' } })
  graph.addEdge({ source: { cell: b.id, port: 'output' }, target: { cell: d.id, port: 'input' } })
  graph.addEdge({ source: { cell: c.id, port: 'output' }, target: { cell: e.id, port: 'input' } })
  graph.addEdge({ source: { cell: d.id, port: 'output' }, target: { cell: e.id, port: 'input' } })
  graph.centerContent()
}

const getLayoutData = () => {
  const nodes = graph.getNodes().map(n => ({ id: n.id, width: n.size().width, height: n.size().height }))
  const edges = graph.getEdges().map(e => ({ source: e.getSourceCellId(), target: e.getTargetCellId() }))
  return { nodes, edges }
}

const applyPositions = (nodesPositions) => {
  if (!nodesPositions?.length) return
  const minX = Math.min(...nodesPositions.map(n => n.x || 0))
  const minY = Math.min(...nodesPositions.map(n => n.y || 0))
  const offX = isFinite(minX) ? -minX + 60 : 0
  const offY = isFinite(minY) ? -minY + 60 : 0
  nodesPositions.forEach(p => {
    const node = graph.getCellById(p.id)
    if (node?.isNode?.()) node.position((p.x || 0) + offX, (p.y || 0) + offY)
  })
  graph.centerContent()
}

const applyDagre = async () => {
  try {
    const { DagreLayout } = await import('@antv/layout')
    const layout = new DagreLayout({ rankdir: 'LR', nodesep: 40, ranksep: 60 })
    const result = layout.layout(getLayoutData())
    applyPositions(result.nodes)
  } catch (e) {
    // 退化：按层次粗排
    const data = getLayoutData()
    const levelMap = new Map();
    const indeg = new Map(data.nodes.map(n => [n.id, 0]))
    data.edges.forEach(e => indeg.set(e.target, (indeg.get(e.target) || 0) + 1))
    const queue = data.nodes.filter(n => !indeg.get(n.id)).map(n => ({ id: n.id, level: 0 }))
    while (queue.length) {
      const { id, level } = queue.shift()
      levelMap.set(id, Math.max(levelMap.get(id) || 0, level))
      data.edges.filter(e => e.source === id).forEach(e => queue.push({ id: e.target, level: level + 1 }))
    }
    const grouped = {}
    data.nodes.forEach(n => { const lv = levelMap.get(n.id) || 0; (grouped[lv] ||= []).push(n) })
    const nodes = []
    Object.entries(grouped).forEach(([lv, arr]) => {
      arr.forEach((n, i) => nodes.push({ id: n.id, x: 160 * lv, y: 80 + i * 140 }))
    })
    applyPositions(nodes)
  }
}

const applyForce = async () => {
  try {
    const { ForceLayout } = await import('@antv/layout')
    const layout = new ForceLayout({ center: [400, 260], preventOverlap: true, nodeStrength: 30 })
    const result = layout.layout(getLayoutData())
    applyPositions(result.nodes)
  } catch (e) {
    // 退化：环形
    applyCircular()
  }
}

const applyCircular = async () => {
  try {
    const { CircularLayout } = await import('@antv/layout')
    const layout = new CircularLayout({ center: [400, 260], radius: 220 })
    const result = layout.layout(getLayoutData())
    applyPositions(result.nodes)
  } catch (e) {
    // 退化：手写环形
    const nodes = graph.getNodes()
    const center = { x: 400, y: 260 }; const r = 220
    const pos = nodes.map((n, i) => ({ id: n.id, x: center.x + r * Math.cos(2 * Math.PI * i / nodes.length), y: center.y + r * Math.sin(2 * Math.PI * i / nodes.length) }))
    applyPositions(pos)
  }
}

const resetSeed = () => seed()

onMounted(() => { registerAllBusinessShapes() })
</script>

<style scoped>
.demo10-container { padding: 16px; background: #f9f9f9; border-radius: 8px; }
.toolbar { margin-bottom: 12px; display: flex; gap: 12px; flex-wrap: wrap; }
.canvas-container { border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden; background: #fff; }
.tips { margin-top: 12px; }
</style>

