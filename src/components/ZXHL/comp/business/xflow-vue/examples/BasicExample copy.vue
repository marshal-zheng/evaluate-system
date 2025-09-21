<template>
  <div class="xflow-example">
    <!-- XFlow 容器 -->
    <XFlow>
      <!-- 图画布 -->
      <XFlowGraph
        :readonly="readonly"
        :zoomable="true"
        :pannable="!selectionBoxEnabled"
        :scroller="true"
        :fit-view="true"
        :center-view="false"
        :connection-options="connectionOptions"
        :select-options="selectOptions"
        :keyboard-options="keyboardOptions"
        :scroller-options="scrollerOptions"
        style="width: 100%; height: 100%;"
      >
        <!-- 网格 -->
        <Grid
          :enabled="showGrid"
          :size="10"
          :visible="true"
          type="dot"
          color="#e5e5e5"
        />
        
        <!-- 背景 -->
        <Background
          color="#fafafa"
          :opacity="1"
        />
        
        <!-- 小地图 -->
        <Minimap
          v-if="showMinimap"
          :enabled="true"
          :width="200"
          :height="120"
          :scalable="true"
          :simple="true"
          simple-node-background="#8f8f8f"
        />
        
        <!-- 对齐线 -->
        <Snapline
          :enabled="showSnapline"
          :tolerance="10"
        />
        
        <!-- 变换 -->
        <Transform
          :enabled="true"
          :resizing="true"
          :rotating="true"
        />
        
        <!-- 剪贴板 -->
        <Clipboard :enabled="true" />
        
        <!-- 历史记录 -->
        <History
          :enabled="true"
          :stack-size="50"
        />
        
        <!-- 控制面板 -->
        <Control
          :items="['zoomIn', 'zoomOut', 'zoomToFit', 'zoomToOrigin', 'zoomTo']"
          direction="horizontal"
          placement="top"
        />
      </XFlowGraph>
    </XFlow>
    
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-space>
        <el-button @click="addNode">添加节点</el-button>
        <el-button @click="addEdge">添加边</el-button>
        <el-button @click="deleteSelected">删除选中</el-button>
        <el-button @click="clearGraph">清空画布</el-button>
        <el-button @click="handleExportPNG">导出PNG</el-button>
        <el-divider direction="vertical" />
        <el-button 
          :type="selectionBoxEnabled ? 'primary' : 'default'"
          @click="toggleSelectionBox"
          title="快捷键: S"
        >
          {{ selectionBoxEnabled ? '关闭框选 (S)' : '开启框选 (S)' }}
        </el-button>
        <el-divider direction="vertical" />
        <el-checkbox v-model="readonly">只读模式</el-checkbox>
        <el-checkbox v-model="showGrid">显示网格</el-checkbox>
        <el-checkbox v-model="showMinimap">显示小地图</el-checkbox>
        <el-checkbox v-model="showSnapline">显示对齐线</el-checkbox>
      </el-space>
    </div>
    
    <!-- 状态信息 -->
    <div class="status-bar">
      <el-space>
        <span>节点数量: {{ nodes.length }}</span>
        <span>边数量: {{ edges.length }}</span>
        <span>选中数量: {{ selectedCount }}</span>
        <span>缩放比例: {{ Math.floor(zoom * 100) }}%</span>
        <el-divider direction="vertical" />
        <span :class="selectionBoxEnabled ? 'selection-mode-active' : 'selection-mode-inactive'">
          交互模式: {{ selectionBoxEnabled ? '框选模式 (画布拖拽已禁用)' : '画布拖拽模式 (Ctrl+点击多选)' }}
        </span>
      </el-space>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ElButton, ElCheckbox, ElSpace, ElDivider, ElMessage } from 'element-plus';
import {
  XFlow,
  XFlowGraph,
  Grid,
  Background,
  Minimap,
  Snapline,
  Transform,
  Clipboard,
  History,
  Control,
  useGraphInstance,
  useGraphStore,
  useGraphEvent,
  useExport
} from '../index.js';

defineOptions({
  name: 'XFlowExample'
});

// 响应式状态
const readonly = ref(false);
const showGrid = ref(true);
const showMinimap = ref(true);
const showSnapline = ref(true);
const selectionBoxEnabled = ref(false);
const selectedCount = ref(0);
const zoom = ref(1);

// 获取图实例和store
const graph = useGraphInstance();
const { nodes, edges, addNodes, addEdges, removeNodes } = useGraphStore();
const { addEventListener } = useGraphEvent();
const { exportPNG } = useExport();

// 图配置
const connectionOptions = {
  snap: true,
  allowBlank: false,
  allowLoop: false,
  allowMulti: false,
  highlight: true
};

// 选择配置 - 使用最佳实践
const selectOptions = {
  enabled: true,
  multiple: true,
  rubberband: false, // 默认关闭框选，避免与拖拽冲突
  movable: true,
  strict: false,
  modifiers: ['ctrl', 'meta'], // 需要按住 Ctrl/Cmd 键才能多选
};

const keyboardOptions = {
  enabled: true,
  global: true
};

const scrollerOptions = {
  enabled: true,
  pannable: true,
  pageVisible: false,
  pageBreak: false
};

// 添加节点
const addNode = () => {
  const node = {
    id: `node_${Date.now()}`,
    shape: 'rect',
    x: Math.random() * 400 + 100,
    y: Math.random() * 300 + 100,
    width: 100,
    height: 40,
    attrs: {
      body: {
        fill: '#f5f5f5',
        stroke: '#d9d9d9',
        strokeWidth: 1
      },
      text: {
        text: `节点 ${nodes.value.length + 1}`,
        fill: '#262626'
      }
    }
  };
  
  addNodes([node]);
  
  if (graph.value) {
    graph.value.addNode(node);
  }
};

// 添加边
const addEdge = () => {
  if (nodes.value.length < 2) {
    ElMessage.warning('至少需要两个节点才能添加边');
    return;
  }
  
  const sourceNode = nodes.value[Math.floor(Math.random() * nodes.value.length)];
  const targetNode = nodes.value[Math.floor(Math.random() * nodes.value.length)];
  
  if (sourceNode.id === targetNode.id) {
    addEdge(); // 递归重试
    return;
  }
  
  const edge = {
    id: `edge_${Date.now()}`,
    shape: 'edge',
    source: sourceNode.id,
    target: targetNode.id,
    attrs: {
      line: {
        stroke: '#a0a0a0',
        strokeWidth: 1
      }
    }
  };
  
  addEdges([edge]);
  
  if (graph.value) {
    graph.value.addEdge(edge);
  }
};

// 删除选中元素
const deleteSelected = () => {
  if (!graph.value) return;
  
  const selectedCells = graph.value.getSelectedCells();
  if (selectedCells.length === 0) {
    ElMessage.warning('请先选择要删除的元素');
    return;
  }
  
  const nodeIds = selectedCells.filter(cell => cell.isNode()).map(cell => cell.id);
  const edgeIds = selectedCells.filter(cell => cell.isEdge()).map(cell => cell.id);
  
  if (nodeIds.length > 0) {
    removeNodes(nodeIds);
  }
  
  graph.value.removeCells(selectedCells);
  ElMessage.success(`删除了 ${selectedCells.length} 个元素`);
};

// 清空画布
const clearGraph = () => {
  if (!graph.value) return;
  
  graph.value.clearCells();
  // 同时清空store中的数据
  // store会自动通过图事件同步
};

// 导出PNG
const handleExportPNG = async () => {
  try {
    const dataUri = await exportPNG('graph.png', {
      backgroundColor: '#ffffff',
      padding: 20
    });
    
    // 创建下载链接
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = 'graph.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    ElMessage.success('导出成功');
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error('导出失败');
  }
};

// 切换选框功能
const toggleSelectionBox = () => {
  if (!graph.value) return;
  
  selectionBoxEnabled.value = !selectionBoxEnabled.value;
  
  // 获取选择插件实例
  const selection = graph.value.getPlugin('selection');
  if (selection) {
    // 动态更新选择插件配置
    selection.options.rubberband = selectionBoxEnabled.value;
    // 注意：当开启选框时，将 modifiers 设为 undefined，避免严格匹配始终为真导致与平移同时触发
    selection.options.modifiers = selectionBoxEnabled.value ? undefined : ['ctrl', 'meta'];
  }
  
  // 动态更新画布拖拽功能
  if (selectionBoxEnabled.value) {
    // 开启选框模式：禁用画布拖拽，启用框选
    graph.value.disablePanning();
    
    ElMessage.success('框选模式已开启 - 画布拖拽已禁用，可直接拖拽选择元素');
  } else {
    // 关闭选框模式：启用画布拖拽，需要按键多选
    graph.value.enablePanning();
    
    ElMessage.info('框选模式已关闭 - 画布拖拽已启用，按住 Ctrl/Cmd 键多选');
  }
};

// 初始化事件监听
const initEvents = () => {
  // 监听选择变化
  addEventListener('selection:changed', ({ selected }) => {
    selectedCount.value = selected.length;
  });
  
  // 监听缩放变化
  addEventListener('scale', ({ sx }) => {
    zoom.value = sx;
  });
  
  // 监听节点点击
  addEventListener('node:click', ({ node }) => {
    console.log('节点被点击:', node.id);
  });
  
  // 监听边点击
  addEventListener('edge:click', ({ edge }) => {
    console.log('边被点击:', edge.id);
  });
  
  // 添加键盘快捷键支持
  const handleKeydown = (e) => {
    // 按 S 键切换选框模式
    if (e.key.toLowerCase() === 's' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // 确保不在输入框中
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        toggleSelectionBox();
      }
    }
  };
  
  document.addEventListener('keydown', handleKeydown);
  
  // 返回清理函数
  return () => {
    document.removeEventListener('keydown', handleKeydown);
  };
};

// 存储事件清理函数
let cleanupEvents = null;

onMounted(() => {
  // 初始化一些示例数据
  setTimeout(() => {
    addNode();
    addNode();
    setTimeout(() => {
      addEdge();
    }, 500);
  }, 1000);
  
  // 初始化事件并保存清理函数
  cleanupEvents = initEvents();
});

onUnmounted(() => {
  // 清理事件监听
  if (cleanupEvents) {
    cleanupEvents();
  }
});
</script>

<style scoped>
.xflow-example {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f0f2f5;
}

.toolbar {
  padding: 16px;
  background: #fff;
  border-bottom: 1px solid #d9d9d9;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.status-bar {
  padding: 8px 16px;
  background: #fafafa;
  border-top: 1px solid #d9d9d9;
  font-size: 12px;
  color: #666;
}

:deep(.xflow-vue) {
  flex: 1;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  margin: 0 16px 16px 16px;
  background: #fff;
  overflow: hidden;
}

.selection-mode-active {
  color: #52c41a;
  font-weight: 500;
}

.selection-mode-inactive {
  color: #8c8c8c;
}
</style>