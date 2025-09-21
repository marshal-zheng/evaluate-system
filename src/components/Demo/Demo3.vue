<template>
  <div class="demo3-container">
    <h2>XFlow Vue 高级功能演示</h2>
    
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-button-group>
        <el-button 
          size="small" 
          @click="addCustomNode"
          :icon="Plus"
        >
          添加自定义节点
        </el-button>
        <el-button 
          size="small" 
          @click="connectMode = !connectMode"
          :type="connectMode ? 'primary' : 'default'"
          :icon="Connection"
        >
          {{ connectMode ? '退出连接' : '连接模式' }}
        </el-button>
        <el-button 
          size="small" 
          @click="togglePorts"
          :icon="View"
        >
          {{ showPorts ? '隐藏端口' : '显示端口' }}
        </el-button>
      </el-button-group>
      
      <el-button-group>
        <el-button 
          size="small" 
          @click="autoLayout('dagre')"
          :icon="Grid"
        >
          层次布局
        </el-button>
        <el-button 
          size="small" 
          @click="autoLayout('force')"
          :icon="Refresh"
        >
          力导向布局
        </el-button>
        <el-button 
          size="small" 
          @click="clearGraph"
          :icon="Delete"
          type="danger"
        >
          清空画布
        </el-button>
      </el-button-group>
    </div>

    <!-- 画布容器 -->
    <div class="canvas-container">
      <XFlow>
        <XFlowGraph
          :style="{ width: '100%', height: '600px' }"
          :zoomable="true"
          :pannable="true"
          :scroller="false"
          :readonly="false"
          :selectOptions="{ 
            multiple: true, 
            rubberband: true, 
            rubberbandModifiers: ['shift'],
            movable: true,
            showNodeSelectionBox: true, 
            showEdgeSelectionBox: false 
          }"
          @ready="onGraphReady"
        >
          <!-- 插件 -->
          <XFlowHistory />
          <XFlowClipboard />
          <XFlowSnapline />
          <XFlowTransform />
          <XFlowBackground color="#f8f9fa" />
          <XFlowGrid :size="20" type="dot" />
          
          <!-- 小地图 -->
          <XFlowMinimap 
            :width="200" 
            :height="150" 
            :simple="true"
            :style="{ position: 'absolute', top: '10px', right: '10px' }"
          />
        </XFlowGraph>
      </XFlow>
    </div>

    <!-- 状态信息 -->
    <div class="status-bar">
      <el-space>
        <span>节点数量: {{ nodeCount }}</span>
        <span>边数量: {{ edgeCount }}</span>
        <span>选中: {{ selectedCells.length }}</span>
        <span v-if="connectMode" class="connect-tip">🔗 连接模式：点击两个节点进行连接</span>
      </el-space>
    </div>

    <!-- 右键菜单 -->
    <div v-show="contextMenu.visible" class="context-menu" :style="contextMenu.style">
      <div 
        v-for="(item, index) in contextMenu.items" 
        :key="index"
        class="menu-item"
        :class="{ disabled: item.disabled, divider: item.divider }"
        @click="handleMenuClick(item)"
      >
        <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
        <span>{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, markRaw } from 'vue';
import { 
  Plus, 
  Connection,
  View,
  Grid,
  Refresh,
  Delete,
  Edit,
  DocumentCopy,
  Lock,
  Unlock,
  InfoFilled
} from '@element-plus/icons-vue';

// 导入 XFlow Vue 组件
import {
  XFlow,
  XFlowGraph,
  XFlowHistory,
  XFlowClipboard,
  XFlowSnapline,
  XFlowTransform,
  XFlowBackground,
  XFlowGrid,
  XFlowMinimap,
} from '../xflow-vue/src/components/index.js';

// 导入组合式函数
import {
  useGraphStore,
  useHistory,
  useClipboard,
} from '../xflow-vue/src/composables/index.js';

// 导入节点注册
import { registerBasicShapes, registerVueShapes } from '../../shapes';

// 响应式数据
const selectedCells = ref([]);
const connectMode = ref(false);
const showPorts = ref(false);
const contextMenu = ref({
  visible: false,
  style: {},
  items: [],
  target: null,
});

// 连接相关
const connectingNode = ref(null);

// 获取 Graph 实例
let graph = null;
let graphStore = null;
let historyActions = null;
let clipboardActions = null;

// 计算属性
const nodeCount = computed(() => graph?.getCells().filter(cell => cell.isNode()).length || 0);
const edgeCount = computed(() => graph?.getCells().filter(cell => cell.isEdge()).length || 0);

const getEdgeLabelText = (edge) => {
  if (!edge) return '';
  if (typeof edge.getLabelAt === 'function') {
    const label = edge.getLabelAt(0);
    if (!label) return '';
    if (typeof label === 'string') return label;
    if (label?.attrs?.label?.text != null) return label.attrs.label.text;
    if (label?.attrs?.text?.text != null) return label.attrs.text.text;
    if (typeof label?.text === 'string') return label.text;
  }
  const direct = edge?.prop?.('labels/0/attrs/label/text');
  return typeof direct === 'string' ? direct : '';
};

const selectAllCells = () => {
  if (!graph) return;
  const nodes = graph.getNodes();
  if (nodes.length) {
    graph.cleanSelection();
    graph.select(nodes);
  }
};

// 图形准备就绪回调
const onGraphReady = (g) => {
  graph = g;
  
  // 初始化各种功能
  graphStore = useGraphStore();
  historyActions = useHistory(g);
  clipboardActions = useClipboard(g);
  
  setupGraphEvents();
  
  // 添加一些示例节点
  addInitialNodes();
};

// 辅助：显示/隐藏某个节点的端口（连接桩）
const setNodePortsVisible = (node, visible) => {
  if (!graph || !node) return;
  const view = graph.findViewByCell(node);
  if (!view) return;
  const ports = view.container.querySelectorAll('.x6-port-body, .x6-port');
  ports.forEach((el) => {
    el.style.visibility = visible ? 'visible' : 'hidden';
  });
};

// 设置图形事件
const setupGraphEvents = () => {
  if (!graph) return;
  
  // 监听选择变化
  graph.on('selection:changed', ({ selected }) => {
    selectedCells.value = selected;
  });
  
  // 监听节点点击（连接模式）
  graph.on('node:click', ({ node }) => {
    if (connectMode.value) {
      handleNodeConnect(node);
    }
  });
  
  // 右键菜单事件
  graph.on('node:contextmenu', ({ e, node }) => {
    e.preventDefault();
    showContextMenu(e.clientX, e.clientY, 'node', node);
  });
  
  graph.on('edge:contextmenu', ({ e, edge }) => {
    e.preventDefault();
    showContextMenu(e.clientX, e.clientY, 'edge', edge);
  });
  
  graph.on('blank:contextmenu', ({ e }) => {
    e.preventDefault();
    showContextMenu(e.clientX, e.clientY, 'blank');
  });
  
  // 点击空白处隐藏菜单
  graph.on('blank:click', () => {
    hideContextMenu();
  });
  
  // 端口显示/隐藏（基于节点视图 DOM）
  graph.on('node:mouseenter', ({ node }) => {
    if (showPorts.value || connectMode.value) {
      setNodePortsVisible(node, true);
    }
  });
  
  graph.on('node:mouseleave', ({ node }) => {
    if (!connectMode.value && !showPorts.value) {
      setNodePortsVisible(node, false);
    }
  });
};

// 添加初始节点
const addInitialNodes = () => {
  const nodes = [
    {
      id: 'start',
      shape: 'rect-node',
      x: 100,
      y: 100,
      label: '开始',
      attrs: {
        body: { fill: '#e8f5e8', stroke: '#52c41a' }
      }
    },
    {
      id: 'process1',
      shape: 'rect-node',
      x: 300,
      y: 100,
      label: '处理1',
      attrs: {
        body: { fill: '#e6f7ff', stroke: '#1890ff' }
      }
    },
    {
      id: 'decision',
      shape: 'diamond-node',
      x: 500,
      y: 80,
      label: '判断',
      attrs: {
        body: { fill: '#fff7e6', stroke: '#faad14' }
      }
    },
    {
      id: 'end',
      shape: 'circle-node',
      x: 700,
      y: 110,
      label: '结束',
      attrs: {
        body: { fill: '#fff2f0', stroke: '#f5222d' }
      }
    }
  ];
  
  nodes.forEach(nodeData => {
    graph.addNode(nodeData);
  });
  
  // 添加一些连接
  graph.addEdge({
    source: 'start',
    target: 'process1',
    shape: 'basic-edge'
  });
  
  graph.addEdge({
    source: 'process1',
    target: 'decision',
    shape: 'basic-edge'
  });
  
  graph.addEdge({
    source: 'decision',
    target: 'end',
    shape: 'basic-edge',
    label: '是'
  });
};

// 添加自定义节点
const addCustomNode = () => {
  if (!graph) return;
  
  const node = graph.addNode({
    shape: 'rect-node',
    x: Math.random() * 400 + 50,
    y: Math.random() * 300 + 50,
    label: '自定义节点',
    attrs: {
      body: { 
        fill: '#f6ffed', 
        stroke: '#52c41a',
        strokeWidth: 2,
        rx: 8,
        ry: 8
      },
      text: {
        fill: '#52c41a',
        fontWeight: 'bold'
      }
    }
  });
  
  // 选中新添加的节点
  graph.select(node);
  // 根据当前状态设置端口显隐
  setNodePortsVisible(node, showPorts.value || connectMode.value);
};

// 处理节点连接
const handleNodeConnect = (node) => {
  if (!connectingNode.value) {
    // 第一个节点
    connectingNode.value = node;
    node.attr('body/strokeWidth', 3);
    node.attr('body/stroke', '#1890ff');
  } else {
    // 第二个节点，创建连接
    if (connectingNode.value.id !== node.id) {
      graph.addEdge({
        source: connectingNode.value,
        target: node,
        shape: 'basic-edge'
      });
    }
    
    // 重置第一个节点样式
    connectingNode.value.attr('body/strokeWidth', 2);
    connectingNode.value.attr('body/stroke', '#1890ff');
    connectingNode.value = null;
  }
};

// 显示右键菜单
const showContextMenu = (x, y, type, target = null) => {
  let items = [];
  
  if (type === 'node') {
    items = [
      { label: '编辑', icon: markRaw(Edit), action: 'edit', target },
      { label: '复制', icon: markRaw(DocumentCopy), action: 'copy', target },
      { divider: true },
      { label: target?.prop('locked') ? '解锁' : '锁定', icon: markRaw(target?.prop('locked') ? Unlock : Lock), action: 'toggle-lock', target },
      { label: '查看数据', icon: markRaw(InfoFilled), action: 'inspect', target },
      { divider: true },
      { label: '删除', icon: markRaw(Delete), action: 'delete', target, style: 'color: #f5222d' }
    ];
  } else if (type === 'edge') {
    items = [
      { label: '编辑标签', icon: markRaw(Edit), action: 'edit-label', target },
      { label: '删除连接', icon: markRaw(Delete), action: 'delete', target, style: 'color: #f5222d' }
    ];
  } else {
    items = [
      { label: '添加节点', icon: markRaw(Plus), action: 'add-node' },
      { label: '粘贴', icon: markRaw(DocumentCopy), action: 'paste', disabled: clipboardActions?.isEmpty() },
      { divider: true },
      { label: '全选', action: 'select-all' },
      { label: '清空画布', icon: markRaw(Delete), action: 'clear', style: 'color: #f5222d' }
    ];
  }
  
  contextMenu.value = {
    visible: true,
    style: {
      left: x + 'px',
      top: y + 'px'
    },
    items,
    target
  };
};

// 隐藏右键菜单
const hideContextMenu = () => {
  contextMenu.value.visible = false;
};

// 处理菜单点击
const handleMenuClick = (item) => {
  if (item.disabled || item.divider) return;
  
  hideContextMenu();
  
  switch (item.action) {
    case 'edit':
      editNode(item.target);
      break;
    case 'copy':
      clipboardActions?.copy([item.target]);
      break;
    case 'toggle-lock':
      toggleLock(item.target);
      break;
    case 'inspect':
      inspectData(item.target);
      break;
    case 'delete':
      graph.removeCell(item.target);
      break;
    case 'edit-label':
      editEdgeLabel(item.target);
      break;
    case 'add-node':
      addCustomNode();
      break;
    case 'paste':
      {
        const cells = clipboardActions?.paste();
        if (cells?.length) {
          graph.cleanSelection();
          graph.select(cells);
        }
      }
      break;
    case 'select-all':
      selectAllCells();
      break;
    case 'clear':
      clearGraph();
      break;
  }
};

// 编辑节点
const editNode = (node) => {
  const newLabel = prompt('请输入新的标签:', node.getLabel());
  if (newLabel !== null) {
    node.setLabel(newLabel);
  }
};

// 编辑边标签
const editEdgeLabel = (edge) => {
  const currentLabel = getEdgeLabelText(edge);
  const newLabel = prompt('请输入边的标签:', currentLabel);
  if (newLabel !== null) {
    if (newLabel === '') {
      edge.setLabels([]);
    } else {
      edge.setLabels([
        {
          attrs: {
            label: { text: newLabel },
          },
        },
      ]);
    }
  }
};

// 切换锁定状态
const toggleLock = (node) => {
  const locked = node.prop('locked');
  node.prop('locked', !locked);
  node.prop('draggable', locked);
  
  if (!locked) {
    node.attr('body/strokeDasharray', '5,5');
  } else {
    node.attr('body/strokeDasharray', '');
  }
};

// 查看数据
const inspectData = (cell) => {
  const data = {
    id: cell.id,
    shape: cell.shape,
    position: cell.isNode() ? cell.position() : null,
    size: cell.isNode() ? cell.size() : null,
    attrs: cell.getAttrs(),
    data: cell.getData(),
  };
  
  console.log('Cell Data:', data);
  alert('数据已输出到控制台，请按 F12 查看');
};

// 切换端口显示
const togglePorts = () => {
  showPorts.value = !showPorts.value;
  graph.getNodes().forEach(node => setNodePortsVisible(node, showPorts.value));
};

// 自动布局
const autoLayout = (type) => {
  if (!graph) return;
  
  // 这里可以集成 @antv/layout 或其他布局算法
  // 简单示例：重新排列节点
  const nodes = graph.getNodes();
  
  if (type === 'dagre') {
    // 简单的层次布局
    nodes.forEach((node, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      node.position(100 + col * 200, 100 + row * 150);
    });
  } else if (type === 'force') {
    // 简单的圆形布局
    const center = { x: 400, y: 300 };
    const radius = 150;
    nodes.forEach((node, index) => {
      const angle = (index / nodes.length) * 2 * Math.PI;
      const x = center.x + radius * Math.cos(angle);
      const y = center.y + radius * Math.sin(angle);
      node.position(x, y);
    });
  }
};

// 清空画布
const clearGraph = () => {
  if (confirm('确定要清空画布吗？')) {
    graph.clearCells();
    connectingNode.value = null;
  }
};

onMounted(() => {
  // 注册基础图形
  registerBasicShapes();
  registerVueShapes();
});
</script>

<style scoped>
.demo3-container {
  padding: 20px;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.toolbar {
  margin-bottom: 16px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.canvas-container {
  flex: 1;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.status-bar {
  margin-top: 12px;
  padding: 8px 12px;
  background: #fafafa;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}

.connect-tip {
  color: #1890ff;
  font-weight: bold;
}

.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 120px;
  padding: 4px 0;
}

.menu-item {
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: background-color 0.2s;
}

.menu-item:hover:not(.disabled):not(.divider) {
  background-color: #f5f5f5;
}

.menu-item.disabled {
  color: #bbb;
  cursor: not-allowed;
}

.menu-item.divider {
  height: 1px;
  background-color: #e8e8e8;
  margin: 4px 0;
  padding: 0;
  cursor: default;
}

.menu-item.divider:hover {
  background-color: #e8e8e8;
}
</style>
