<template>
  <div class="demo9-container">
    <h2>Demo 9 - 系统剪贴板与内部剪贴板联动</h2>

    <div class="toolbar">
      <el-button-group>
        <el-button size="small" type="primary" @click="copyInternal" :disabled="!hasSelection">复制（内部）</el-button>
        <el-button size="small" @click="pasteInternal">粘贴（内部）</el-button>
        <el-button size="small" @click="cutInternal" :disabled="!hasSelection">剪切（内部）</el-button>
      </el-button-group>

      <el-button-group>
        <el-button size="small" @click="copyToSystem" :disabled="!hasSelection">复制到系统剪贴板</el-button>
        <el-button size="small" @click="pasteFromSystem">从系统剪贴板粘贴</el-button>
      </el-button-group>

      <el-button-group>
        <el-button size="small" @click="clearSelection">清除选中</el-button>
        <el-button size="small" @click="centerContent">居中视图</el-button>
      </el-button-group>

      <el-button-group>
        <el-button size="small" type="success" @click="copyCorrectTestData">复制正确测试数据</el-button>
        <el-button size="small" type="warning" @click="copyErrorTestData">复制错误测试数据</el-button>
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
          <XFlowClipboard />
          <XFlowSnapline />
          <XFlowBackground color="#fafafa" />
          <XFlowGrid :size="20" type="mesh" />
        </XFlowGraph>
      </XFlow>
    </div>

    <div class="tips">
      <el-alert title="系统剪贴板使用说明" type="info" :closable="false" show-icon>
        <ul>
          <li>系统剪贴板需要安全上下文且通常需要用户手势（按钮点击）才能访问</li>
          <li>复制到系统剪贴板：会将当前选中子图导出为 JSON 文本</li>
          <li>从系统剪贴板粘贴：读取 JSON 并在当前视图粘贴，自动偏移</li>
          <li><strong>测试功能：</strong>点击"复制正确测试数据"获取有效的JSON数据，点击"复制错误测试数据"获取各种错误格式用于测试错误处理</li>
          <li><strong>调试信息：</strong>打开浏览器控制台（F12）可查看详细的粘贴过程日志</li>
        </ul>
      </el-alert>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  XFlow,
  XFlowGraph,
  XFlowHistory,
  XFlowClipboard,
  XFlowSnapline,
  XFlowBackground,
  XFlowGrid,
} from '../xflow-vue/src/components/index.js'

import { useClipboard } from '../xflow-vue/src/composables/index.js'
import { registerAllBusinessShapes } from '../../shapes/index.js'

const graphRef = ref(null)
const selectedCells = ref([])
const hasSelection = computed(() => selectedCells.value.length > 0)

const onGraphReady = (g) => {
  graphRef.value = g
  bindGraphEvents()
  seed()
}

const bindGraphEvents = () => {
  const graph = graphRef.value
  if (!graph) return
  graph.on('selection:changed', ({ selected }) => {
    selectedCells.value = selected || []
  })
}

const seed = () => {
  const graph = graphRef.value
  if (!graph) return
  // 简单三段流程
  const s = graph.addNode({ shape: 'port-node', x: 60, y: 180, label: '开始' })
  const p = graph.addNode({ shape: 'port-node', x: 300, y: 120, label: '处理' })
  const e = graph.addNode({ shape: 'port-node', x: 560, y: 180, label: '结束' })
  graph.addEdge({ source: { cell: s.id, port: 'output' }, target: { cell: p.id, port: 'input' } })
  graph.addEdge({ source: { cell: p.id, port: 'output' }, target: { cell: e.id, port: 'input' } })
  graph.centerContent()
}

// 内部剪贴板
const { copy, cut, paste } = useClipboard(graphRef)
const copyInternal = () => copy()
const cutInternal = () => cut()
const pasteInternal = () => {
  const cells = paste({ offset: 20 })
  if (cells?.length) {
    const graph = graphRef.value
    if (!graph) return
    graph.cleanSelection(); graph.select(cells)
  }
}

// 系统剪贴板工具
const buildSelectionJSON = () => {
  const graph = graphRef.value
  if (!graph) return JSON.stringify({ nodes: [], edges: [] })
  const cells = graph.getSelectedCells()
  const nodeSet = new Set(cells.filter(c => c.isNode()).map(n => n.id))
  const nodes = cells.filter(c => c.isNode()).map(n => n.toJSON())
  const edges = graph.getEdges()
    .filter(e => nodeSet.has(e.getSourceCellId()) && nodeSet.has(e.getTargetCellId()))
    .map(e => e.toJSON())
  return JSON.stringify({ nodes, edges }, null, 2)
}

const copyToSystem = async () => {
  try {
    const text = buildSelectionJSON()
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      console.log('已复制到系统剪贴板')
    } else {
      // 兜底：创建临时 textarea
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      console.log('已复制到系统剪贴板（降级）')
    }
  } catch (e) {
    console.warn(e); console.error('复制失败：浏览器未授权或不支持') 
  }
}

const pasteFromSystem = async () => {
  const graph = graphRef.value
  if (!graph) {
    console.error('图形实例不存在')
    return
  }
  
  try {
    let text = ''
    
    // 尝试从系统剪贴板读取
    if (navigator?.clipboard?.readText) {
      try {
        text = await navigator.clipboard.readText()
        console.log('成功从系统剪贴板读取内容')
      } catch (clipboardError) {
        console.warn('系统剪贴板读取失败:', clipboardError.message)
        text = window.prompt('无法访问系统剪贴板，请手动粘贴 JSON 内容：') || ''
      }
    } else {
      console.warn('浏览器不支持直接读取系统剪贴板，请手动粘贴到弹窗中')
      text = window.prompt('粘贴 JSON 内容：') || ''
    }
    
    if (!text || text.trim() === '') {
      console.log('没有获取到剪贴板内容')
      return
    }
    
    console.log('剪贴板原始内容:', text.substring(0, 200) + (text.length > 200 ? '...' : ''))
    
    // 尝试解析 JSON
    let data
    try {
      data = JSON.parse(text.trim())
      console.log('JSON 解析成功')
    } catch (parseError) {
      console.error('JSON 解析失败:', parseError.message)
      console.error('解析位置:', parseError.stack)
      alert(`JSON 格式错误: ${parseError.message}\n\n请确保剪贴板中的内容是有效的 JSON 格式。\n\n错误位置: ${parseError.stack?.split('\n')[0] || '未知'}`)
      return
    }
    
    // 验证数据结构
    if (!data || typeof data !== 'object') {
      console.error('数据格式错误: 不是有效的对象', data)
      alert('数据格式错误: 剪贴板内容不是有效的对象')
      return
    }
    
    // 确保 nodes 和 edges 是数组
    if (!data.nodes) {
      console.warn('数据中没有 nodes 字段，将使用空数组')
      data.nodes = []
    } else if (!Array.isArray(data.nodes)) {
      console.error('nodes 不是数组:', typeof data.nodes, data.nodes)
      alert('数据格式错误: nodes 必须是数组')
      return
    }
    
    if (!data.edges) {
      console.warn('数据中没有 edges 字段，将使用空数组')
      data.edges = []
    } else if (!Array.isArray(data.edges)) {
      console.error('edges 不是数组:', typeof data.edges, data.edges)
      alert('数据格式错误: edges 必须是数组')
      return
    }
    
    console.log(`准备粘贴 ${data.nodes.length} 个节点和 ${data.edges.length} 条边`)
    
    const idMap = new Map()
    const created = []
    const createdEdges = []

    // 粘贴节点（去 id，自动生成；同时整体偏移）
    const offset = 30
    for (let i = 0; i < data.nodes.length; i++) {
      const n = data.nodes[i]
      try {
        if (!n || typeof n !== 'object') {
          console.warn(`跳过无效节点 [${i}]:`, n)
          continue
        }
        
        const { id: _id, position, x, y, ...rest } = n
        
        // 获取坐标
        let nx = 0, ny = 0
        if (typeof x === 'number') {
          nx = x
        } else if (position && typeof position.x === 'number') {
          nx = position.x
        }
        
        if (typeof y === 'number') {
          ny = y
        } else if (position && typeof position.y === 'number') {
          ny = position.y
        }
        
        // 确保有基本的 shape 属性
        if (!rest.shape) {
          console.warn(`节点 [${i}] 缺少 shape 属性，使用默认值 'port-node'`)
          rest.shape = 'port-node'
        }
        
        const node = graph.addNode({ 
          ...rest, 
          x: nx + offset, 
          y: ny + offset 
        })
        
        if (_id) {
          idMap.set(_id, node.id)
        }
        created.push(node)
        console.log(`成功创建节点 [${i}]:`, node.id, `位置: (${nx + offset}, ${ny + offset})`)
      } catch (nodeError) {
        console.error(`创建节点 [${i}] 失败:`, nodeError.message, '节点数据:', n)
      }
    }

    // 粘贴边
    for (let i = 0; i < data.edges.length; i++) {
      const e = data.edges[i]
      try {
        if (!e || typeof e !== 'object') {
          console.warn(`跳过无效边 [${i}]:`, e)
          continue
        }
        
        // 获取源和目标节点 ID
        const sourceId = e.source?.cell || e.source
        const targetId = e.target?.cell || e.target
        
        if (!sourceId || !targetId) {
          console.warn(`边 [${i}] 缺少源或目标节点 ID:`, { sourceId, targetId })
          continue
        }
        
        const srcId = idMap.get(sourceId)
        const tgtId = idMap.get(targetId)
        
        if (!srcId || !tgtId) {
          console.warn(`跳过边 [${i}]: 源节点或目标节点不存在`, { 
            sourceId, targetId, srcId, tgtId,
            availableIds: Array.from(idMap.keys())
          })
          continue
        }
        
        const edge = graph.addEdge({
          source: { cell: srcId, port: e.source?.port || 'output' },
          target: { cell: tgtId, port: e.target?.port || 'input' },
        })
        
        createdEdges.push(edge)
        console.log(`成功创建边 [${i}]:`, edge.id, `${srcId} -> ${tgtId}`)
      } catch (edgeError) {
        console.error(`创建边 [${i}] 失败:`, edgeError.message, '边数据:', e)
      }
    }

    // 选中新创建的元素
    if (created.length > 0) {
      graph.cleanSelection()
      graph.select(created)
      console.log(`✅ 粘贴成功: ${created.length} 个节点, ${createdEdges.length} 条边`)
      
      // 可选：居中显示新粘贴的内容
      if (created.length > 0) {
        setTimeout(() => {
          graph.centerContent()
        }, 100)
      }
    } else {
      console.warn('⚠️ 没有成功创建任何节点')
      alert('粘贴完成，但没有创建任何节点。请检查数据格式。')
    }
    
  } catch (e) {
    console.error('粘贴过程中发生未知错误:', e)
    console.error('错误堆栈:', e.stack)
    alert(`粘贴失败: ${e.message}\n\n请查看控制台获取详细错误信息`)
  }
}

const clearSelection = () => {
  const graph = graphRef.value
  if (graph) graph.cleanSelection()
}
const centerContent = () => {
  const graph = graphRef.value
  if (graph) graph.centerContent()
}

// 测试数据函数
const copyCorrectTestData = async () => {
  const correctData = {
    nodes: [
      {
        id: "node1",
        shape: "port-node",
        x: 100,
        y: 100,
        label: "测试节点1"
      },
      {
        id: "node2", 
        shape: "port-node",
        x: 300,
        y: 100,
        label: "测试节点2"
      },
      {
        id: "node3",
        shape: "port-node", 
        x: 200,
        y: 200,
        label: "测试节点3"
      }
    ],
    edges: [
      {
        source: { cell: "node1", port: "output" },
        target: { cell: "node2", port: "input" }
      },
      {
        source: { cell: "node2", port: "output" },
        target: { cell: "node3", port: "input" }
      }
    ]
  }
  
  const jsonText = JSON.stringify(correctData, null, 2)
  
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(jsonText)
      console.log('✅ 正确测试数据已复制到剪贴板')
      alert('正确测试数据已复制到剪贴板！\n现在可以点击"从系统剪贴板粘贴"按钮进行测试。')
    } else {
      // 兜底方案
      const ta = document.createElement('textarea')
      ta.value = jsonText
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      console.log('✅ 正确测试数据已复制到剪贴板（降级）')
      alert('正确测试数据已复制到剪贴板！')
    }
  } catch (e) {
    console.error('复制失败:', e)
    // 显示数据让用户手动复制
    window.prompt('复制失败，请手动复制以下数据：', jsonText)
  }
}

const copyErrorTestData = async () => {
  // 提供多种错误数据示例
  const errorExamples = [
    '{ "nodes": [{ "id": "test", "invalid_json": }]', // JSON 语法错误
    '{ "nodes": "not_an_array", "edges": [] }', // nodes 不是数组
    '{ "nodes": [], "edges": "not_an_array" }', // edges 不是数组
    'not a json at all', // 完全不是 JSON
    '{ "wrong_structure": true }', // 缺少 nodes 和 edges
  ]
  
  const selectedError = errorExamples[Math.floor(Math.random() * errorExamples.length)]
  
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(selectedError)
      console.log('⚠️ 错误测试数据已复制到剪贴板:', selectedError)
      alert('错误测试数据已复制到剪贴板！\n现在可以点击"从系统剪贴板粘贴"按钮测试错误处理。\n\n错误类型: ' + getErrorDescription(selectedError))
    } else {
      // 兜底方案
      const ta = document.createElement('textarea')
      ta.value = selectedError
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      console.log('⚠️ 错误测试数据已复制到剪贴板（降级）')
      alert('错误测试数据已复制到剪贴板！')
    }
  } catch (e) {
    console.error('复制失败:', e)
    // 显示数据让用户手动复制
    window.prompt('复制失败，请手动复制以下错误数据：', selectedError)
  }
}

const getErrorDescription = (errorData) => {
  if (errorData.includes('invalid_json')) return 'JSON 语法错误'
  if (errorData.includes('"nodes": "not_an_array"')) return 'nodes 不是数组'
  if (errorData.includes('"edges": "not_an_array"')) return 'edges 不是数组'
  if (errorData === 'not a json at all') return '完全不是 JSON 格式'
  if (errorData.includes('wrong_structure')) return '缺少必要的数据结构'
  return '未知错误类型'
}

onMounted(() => {
  registerAllBusinessShapes()
})
</script>

<style scoped>
.demo9-container { padding: 16px; background: #f9f9f9; border-radius: 8px; }
.toolbar { margin-bottom: 12px; display: flex; gap: 12px; flex-wrap: wrap; }
.canvas-container { border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden; background: #fff; }
.tips { margin-top: 12px; }
</style>

