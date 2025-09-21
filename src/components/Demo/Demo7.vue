<template>
  <div class="demo7-container">
    <h2>Demo 7 - DnD 拖拽入画/分组/导出/布局/变换</h2>

    <div class="demo7-layout">
      <!-- 左侧面板：可拖拽的节点模板 -->
      <aside class="palette">
        <h4>节点库（拖拽到画布）</h4>
        <div class="palette-list">
          <div class="palette-item rect" @mousedown="(e) => startDragNode('rect-node', e)" draggable="false">矩形</div>
          <div class="palette-item circle" @mousedown="(e) => startDragNode('circle-node', e)" draggable="false">圆形</div>
          <div class="palette-item diamond" @mousedown="(e) => startDragNode('diamond-node', e)" draggable="false">菱形</div>
        </div>
      </aside>

      <section class="main">
        <!-- 工具栏 -->
        <div class="toolbar">
          <el-button-group>
            <el-button size="small" @click="groupSelected">分组</el-button>
            <el-button size="small" @click="ungroupSelected">取消分组</el-button>
            <el-button size="small" @click="toggleTransform">切换变换</el-button>
          </el-button-group>
          <el-button-group>
            <el-button size="small" @click="exportPNG">导出 PNG</el-button>
            <el-button size="small" @click="exportSVG">导出 SVG</el-button>
          </el-button-group>
          <el-button-group>
            <el-button size="small" @click="layoutCircular">圆形布局</el-button>
          </el-button-group>
        </div>

        <!-- 画布 -->
        <div class="canvas">
          <XFlow>
            <XFlowGraph
              :style="{ width: '100%', height: '560px' }"
              :zoomable="true"
              :pannable="true"
              :scroller="false"
              :embedable="true"
              @ready="onGraphReady"
            >
              <XFlowHistory />
              <XFlowClipboard />
              <XFlowSnapline />
              <XFlowBackground :color="'#fafafa'" />
              <XFlowGrid :size="20" type="dot" />
              <XFlowTransform v-if="transformEnabled" :resizing="true" :rotating="true" />
            </XFlowGraph>
          </XFlow>
        </div>

        <!-- 状态栏 -->
        <div class="status">
          <el-space>
            <span>节点数：{{ nodeCount }}</span>
            <span>选中：{{ selectedCount }}</span>
          </el-space>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 组件
import {
  XFlow,
  XFlowGraph,
  XFlowHistory,
  XFlowClipboard,
  XFlowBackground,
  XFlowGrid,
  XFlowSnapline,
  XFlowTransform,
} from '../xflow-vue/src/components/index.js'

// 组合式
import { useDnd, useExport } from '../xflow-vue/src/composables/index.js'
import { registerBasicShapes } from '../xflow-vue/src/shapes/register.js'

// 画布与选择
let graph = null
const selectedCells = ref([])
const transformEnabled = ref(true)

// DnD：延迟初始化，在 graph 就绪后再创建
let dndInstance = null
const initDndWhenReady = () => {
  if (graph && !dndInstance) {
    const { startDrag: createStartDrag } = useDnd(() => graph)
    dndInstance = { startDrag: createStartDrag }
  }
  return dndInstance
}

const startDragNode = (shape, e) => {
  e.preventDefault();
  console.log('startDragNode called:', { shape, event: e, graph });
  
  if (!graph) {
    console.error('Graph not ready for drag operation');
    return;
  }
  
  const dnd = initDndWhenReady();
  if (!dnd) {
    console.error('Failed to initialize DnD');
    return;
  }
  
  const data = {
    shape,
    width: 120,
    height: 60,
    label: shape,
    attrs: {
      body: { 
        stroke: shape === 'rect-node' ? '#1890ff' : shape === 'circle-node' ? '#52c41a' : '#faad14',
        strokeWidth: 2,
        fill: 'rgba(255,255,255,0.8)'
      },
      text: { 
        fill: shape === 'rect-node' ? '#1890ff' : shape === 'circle-node' ? '#52c41a' : '#faad14',
        fontWeight: 'bold'
      }
    }
  }
  dnd.startDrag(data, e)
}

// 导出：同样传入函数，避免上下文未就绪
const { exportPNG: doExportPNG, exportSVG: doExportSVG } = useExport(() => graph)
const exportPNG = () => doExportPNG({ filename: 'demo7.png' })
const exportSVG = () => doExportSVG({ filename: 'demo7.svg' })

// 统计
const nodeCount = computed(() => {
  if (!graph) return 0
  try {
    const nodes = graph.getNodes()
    return nodes ? nodes.length : 0
  } catch (e) {
    console.warn('获取节点数量失败:', e)
    return 0
  }
})
const selectedCount = computed(() => {
  try {
    return selectedCells.value ? selectedCells.value.length : 0
  } catch (e) {
    console.warn('获取选中数量失败:', e)
    return 0
  }
})

// ready
const onGraphReady = (g) => {
  graph = g
  bindGraphEvents()
  seedNodes()
}

const fallbackMoveGroupedChildren = (groupNode, deltaX, deltaY) => {
  if (!groupNode || (!deltaX && !deltaY) || !graph || typeof graph.getCellById !== 'function') return

  const data = groupNode.getData?.() || {}
  const childIds = Array.isArray(data.children) ? data.children : []

  if (!childIds.length) return

  childIds.forEach((childId) => {
    const child = graph.getCellById(childId)
    if (!child || !child.isNode?.()) return

    // 如果已经存在父子关系，优先让 X6 原生处理
    if (child.getParent?.()?.id === groupNode.id) return

    child.translate(deltaX, deltaY)
  })
}

const bindGraphEvents = () => {
  graph.on('selection:changed', ({ selected }) => {
    try {
      selectedCells.value = selected || []
      console.log('选择变化:', selectedCells.value.length)
    } catch (e) {
      console.warn('处理选择变化事件失败:', e)
      selectedCells.value = []
    }
  })

  graph.on('node:change:position', ({ node, previous = {}, current = {} }) => {
    if (!node || node.getData?.()?.type !== 'group') return

    const deltaX = (current.x ?? 0) - (previous.x ?? 0)
    const deltaY = (current.y ?? 0) - (previous.y ?? 0)

    if (!deltaX && !deltaY) return

    const embeddedChildren = node.getChildren?.() || []
    if (embeddedChildren.length) {
      // 当 X6 已经建立父子关系时，让其自身机制负责同步位置
      return
    }

    fallbackMoveGroupedChildren(node, deltaX, deltaY)
  })
}

const seedNodes = () => {
  // 初始撒一些节点
  const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d']
  for (let i = 0; i < 6; i++) {
    const shape = i % 3 === 0 ? 'rect-node' : i % 3 === 1 ? 'circle-node' : 'diamond-node'
    const color = colors[i % colors.length]
    graph.addNode({
      shape,
      x: 140 + (i % 3) * 180,
      y: 120 + Math.floor(i / 3) * 160,
      label: shape,
      attrs: {
        body: { stroke: color, strokeWidth: 2, fill: color + '20' },
        text: { fill: color, fontWeight: 'bold' },
      },
    })
  }
}

// 分组/取消分组
const groupSelected = () => {
  const selectedCells = graph.getSelectedCells()
  const nodes = selectedCells.filter((c) => c.isNode())
  
  console.log('分组操作:', { selectedCells: selectedCells.length, nodes: nodes.length })
  
  if (nodes.length < 2) {
    console.warn('需要选择至少2个节点才能分组')
    return
  }
  
  // 计算边界框
  const bbox = nodes.reduce(
    (acc, n) => {
      const b = n.getBBox()
      console.log('节点边界框:', n.id, b)
      return {
        x: Math.min(acc.x, b.x),
        y: Math.min(acc.y, b.y),
        x2: Math.max(acc.x2, b.x + b.width),
        y2: Math.max(acc.y2, b.y + b.height),
      }
    },
    { x: Infinity, y: Infinity, x2: -Infinity, y2: -Infinity },
  )
  const width = bbox.x2 - bbox.x
  const height = bbox.y2 - bbox.y
  
  console.log('计算的分组边界框:', { bbox, width, height })

  // 创建分组容器
  const group = graph.addNode({
    shape: 'rect',
    x: bbox.x - 20,
    y: bbox.y - 20,
    width: width + 40,
    height: height + 40,
    zIndex: -1, // 确保分组在背景层
    // 确保分组可拖拽
    movable: true,
    resizable: false,
    rotatable: false,
    attrs: {
      body: { 
        fill: 'rgba(245,245,245,0.3)', 
        stroke: '#bfbfbf', 
        strokeWidth: 2,
        strokeDasharray: '8 4',
        rx: 8,
        ry: 8
      },
      text: { 
        text: '分组', 
        fill: '#8c8c8c',
        fontSize: 14,
        fontWeight: 'bold',
        refX: 0.5,
        refY: 0,
        refY2: -12,
        textAnchor: 'middle',
        textVerticalAnchor: 'bottom'
      },
    },
    // 标记为分组容器
    data: {
      type: 'group',
      children: nodes.map(n => n.id)
    }
  })
  
  console.log('创建分组容器:', group.id)
  
  // 建立父子关系（使用 addChild 更稳妥）
  nodes.forEach((node, index) => {
    try {
      console.log(`设置节点 ${node.id} 的父节点为 ${group.id}`)
      // 先清理旧父子关系
      const oldParent = node.getParent?.()
      if (oldParent && oldParent !== group) {
        oldParent.removeChild?.(node)
      } else if (!oldParent) {
        node.setParent?.(null)
      }
      // 使用 addChild 建立嵌入关系
      group.addChild?.(node)
      // 确保子节点层级在分组之上
      node.setZIndex?.(index + 1)
      // 验证
      const parent = node.getParent?.()
      console.log(`节点 ${node.id} 的父节点:`, parent ? parent.id : 'null')
    } catch (e) {
      console.warn('建立父子关系失败，降级为平移跟随:', e)
    }
  })
  
  // 选中分组
  graph.cleanSelection()
  graph.select(group)
  
  // 验证分组结构
  console.log('分组完成，分组结构验证:')
  console.log('- 分组容器ID:', group.id)
  const children = group.getChildren() || []
  console.log('- 分组子节点数量:', children.length)
  console.log('- 子节点详情:', children.map(child => ({
    id: child.id,
    parent: child.getParent()?.id || 'null'
  })))
  
  console.log('分组完成，选中分组容器')
}

const detachGroupChildren = (groupNode) => {
  if (!groupNode || typeof groupNode.getChildren !== 'function') return

  const children = groupNode.getChildren() || []
  if (!children.length) return

  children.forEach((child) => {
    try {
      if (typeof groupNode.removeChild === 'function') {
        groupNode.removeChild(child)
      }
      if (typeof child.setParent === 'function') {
        child.setParent(null)
      }
      const childData = child.getData?.() || {}
      if (Array.isArray(childData.parents)) {
        child.setData({ ...childData, parents: [] })
      }
    } catch (e) {
      console.warn('解除分组子节点关系失败:', child?.id, e)
    }
  })

  const data = groupNode.getData?.()
  if (data) {
    groupNode.setData({ ...data, children: [] })
  }
}

const ungroupSelected = () => {
  const selectedCells = graph.getSelectedCells()
  console.log('取消分组操作:', selectedCells.length)
  
  selectedCells.forEach((cell) => {
    if (cell.isNode()) {
      const children = cell.getChildren() || []
      console.log(`节点 ${cell.id} 的子节点:`, children.length)
      
      if (children.length > 0) {
        // 检查是否是分组容器
        const isGroup = cell.getData()?.type === 'group'
        console.log(`节点 ${cell.id} 是否为分组:`, isGroup)
        
        // 将所有子节点从分组中移出
        detachGroupChildren(cell)
        children.forEach((child) => {
          console.log(`移除子节点 ${child.id} 的父子关系`)
          child.setZIndex(0) // 重置层级
        })
        
        // 如果是分组容器，删除分组节点
        if (isGroup) {
          console.log(`删除分组容器 ${cell.id}`)
          graph.removeNode(cell)
        }
      }
    }
  })
  
  // 清除选择
  graph.cleanSelection()
  console.log('取消分组完成')
}

// 变换开关
const toggleTransform = () => {
  transformEnabled.value = !transformEnabled.value
}

// 简单圆形布局
const layoutCircular = () => {
  const nodes = graph.getNodes()
  if (!nodes.length) return
  const center = { x: 480, y: 280 }
  const radius = 220
  const n = nodes.length
  nodes.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / n
    const x = center.x + radius * Math.cos(angle)
    const y = center.y + radius * Math.sin(angle)
    node.position(x, y)
  })
}

onMounted(() => {
  registerBasicShapes()
})
</script>

<style scoped>
.demo7-container {
  padding: 16px;
}
.demo7-layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 12px;
}
.palette {
  background: #fff;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  padding: 12px;
}
.palette-list {
  display: grid;
  gap: 8px;
}
.palette-item {
  user-select: none;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #e5e6eb;
  background: #fafafa;
  cursor: grab;
}
.palette-item.rect { border-left: 4px solid #1890ff; }
.palette-item.circle { border-left: 4px solid #52c41a; }
.palette-item.diamond { border-left: 4px solid #faad14; }

.main { display: flex; flex-direction: column; gap: 10px; }
.toolbar { display: flex; gap: 12px; align-items: center; }
.canvas { border: 1px solid #e5e6eb; border-radius: 8px; overflow: hidden; background: #fff; }
.status { font-size: 12px; color: #666; }
</style>
