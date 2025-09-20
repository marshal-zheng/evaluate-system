<template>
  <div class="demo2-container">
    <h2>XFlow Vue 基础功能演示</h2>
    
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-button-group>
        <el-button 
          size="small" 
          @click="addRectNode"
          :icon="Plus"
        >
          添加矩形
        </el-button>
        <el-button 
          size="small" 
          @click="addCircleNode"
          :icon="Plus"
        >
          添加圆形
        </el-button>
        <el-button 
          size="small" 
          @click="addDiamondNode"
          :icon="Plus"
        >
          添加菱形
        </el-button>
      </el-button-group>
      
      <el-button-group>
        <el-button 
          size="small" 
          @click="undo"
          :disabled="!canUndoValue"
          :icon="RefreshLeft"
        >
          撤销
        </el-button>
        <el-button 
          size="small" 
          @click="redo"
          :disabled="!canRedoValue"
          :icon="RefreshRight"
        >
          重做
        </el-button>
      </el-button-group>
      
      <el-button-group>
        <el-button 
          size="small" 
          @click="copy"
          :disabled="selectedCells.length === 0"
          :icon="CopyDocument"
        >
          复制
        </el-button>
        <el-button 
          size="small" 
          @click="paste"
          :disabled="clipboardEmpty"
          :icon="DocumentCopy"
        >
          粘贴
        </el-button>
        <el-button 
          size="small" 
          @click="deleteSelected"
          :disabled="selectedCells.length === 0"
          :icon="Delete"
          type="danger"
        >
          删除
        </el-button>
      </el-button-group>
      
      <el-button-group>
        <el-button 
          size="small" 
          @click="exportPNG"
          :icon="Download"
        >
          导出PNG
        </el-button>
        <el-button 
          size="small" 
          @click="centerContent"
          :icon="Aim"
        >
          居中
        </el-button>
        <el-button 
          size="small" 
          @click="fitContent"
          :icon="FullScreen"
        >
          适应
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
          @ready="onGraphReady"
        >
          <!-- 插件 -->
          <XFlowHistory />
          <XFlowClipboard />
          <XFlowSnapline />
          <XFlowTransform />
          <XFlowExport />
          <XFlowBackground color="#fafafa" />
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
        <span v-if="mousePosition">鼠标位置: ({{ mousePosition.x }}, {{ mousePosition.y }})</span>
      </el-space>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  Plus, 
  RefreshLeft, 
  RefreshRight, 
  CopyDocument, 
  DocumentCopy, 
  Delete, 
  Download, 
  Aim, 
  FullScreen 
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
  XFlowExport,
  XFlowMinimap,
} from '../xflow-vue/src/components/index.js';

// 导入组合式函数
import {
  useGraphStore,
  useHistory,
  useClipboard,
  useExport,
  useGraphEvent,
} from '../xflow-vue/src/composables/index.js';

// 导入节点注册
import { registerBasicShapes } from '../xflow-vue/src/shapes/register.js';

// 响应式数据
const selectedCells = ref([]);
const mousePosition = ref(null);
const clipboardEmpty = ref(true);

// 获取 Graph 实例
let graph = null;
let graphStore = null;
let historyActions = null;
let clipboardActions = null;
let exportActions = null;

// 计算属性
const nodeCount = computed(() => graphStore?.nodes?.length || 0);
const edgeCount = computed(() => graphStore?.edges?.length || 0);
const canUndoValue = computed(() => historyActions?.canUndo() || false);
const canRedoValue = computed(() => historyActions?.canRedo() || false);

// 图形事件监听
const setupGraphEvents = () => {
  if (!graph) return;
  
  // 监听选择变化
  graph.on('selection:changed', ({ selected }) => {
    selectedCells.value = selected;
  });
  
  // 监听鼠标移动
  graph.on('blank:mousemove', ({ x, y }) => {
    mousePosition.value = { x: Math.round(x), y: Math.round(y) };
  });
  
  // 监听节点添加/删除
  graph.on('node:added', () => {
    updateClipboardStatus();
  });
  
  graph.on('node:removed', () => {
    updateClipboardStatus();
  });
  
  // 监听键盘事件
  graph.bindKey(['ctrl+c', 'cmd+c'], () => {
    copy();
  });
  
  graph.bindKey(['ctrl+v', 'cmd+v'], () => {
    paste();
  });
  
  graph.bindKey(['ctrl+z', 'cmd+z'], () => {
    undo();
  });
  
  graph.bindKey(['ctrl+y', 'cmd+y', 'ctrl+shift+z', 'cmd+shift+z'], () => {
    redo();
  });
  
  graph.bindKey(['del', 'backspace'], () => {
    deleteSelected();
  });
  
  graph.bindKey(['ctrl+a', 'cmd+a'], () => {
    graph.selectAll();
  });
};

// 图形准备就绪回调（直接拿到实例）
const onGraphReady = (g) => {
  graph = g;
  
  // 初始化各种功能，传入 graph 实例
  graphStore = useGraphStore();
  historyActions = useHistory(g);
  clipboardActions = useClipboard(g);
  exportActions = useExport(g);
  
  setupGraphEvents();
  updateClipboardStatus();
};

// 添加节点方法
const addRectNode = () => {
  if (!graph) return;
  
  const node = graph.addNode({
    shape: 'rect-node',
    x: Math.random() * 400 + 50,
    y: Math.random() * 300 + 50,
    label: '矩形节点',
  });
  
  // 同步到状态管理
  graphStore.addNodes([{
    id: node.id,
    shape: 'rect-node',
    x: node.position().x,
    y: node.position().y,
    label: '矩形节点',
  }]);
};

const addCircleNode = () => {
  if (!graph) return;
  
  const node = graph.addNode({
    shape: 'circle-node',
    x: Math.random() * 400 + 50,
    y: Math.random() * 300 + 50,
    label: '圆形',
  });
  
  graphStore.addNodes([{
    id: node.id,
    shape: 'circle-node',
    x: node.position().x,
    y: node.position().y,
    label: '圆形',
  }]);
};

const addDiamondNode = () => {
  if (!graph) return;
  
  const node = graph.addNode({
    shape: 'diamond-node',
    x: Math.random() * 400 + 50,
    y: Math.random() * 300 + 50,
    label: '菱形',
  });
  
  graphStore.addNodes([{
    id: node.id,
    shape: 'diamond-node',
    x: node.position().x,
    y: node.position().y,
    label: '菱形',
  }]);
};

// 历史操作方法
const undo = () => {
  if (historyActions) {
    historyActions.undo();
  }
};

const redo = () => {
  if (historyActions) {
    historyActions.redo();
  }
};

// 复制粘贴操作
const copy = () => {
  if (clipboardActions) {
    clipboardActions.copy();
    updateClipboardStatus();
  }
};

const paste = () => {
  if (clipboardActions) {
    const cells = clipboardActions.paste({ offset: 20 });
    if (cells.length > 0) {
      graph.select(cells);
    }
  }
};

const updateClipboardStatus = () => {
  if (clipboardActions) {
    clipboardEmpty.value = clipboardActions.isEmpty();
  }
};

// 删除选中
const deleteSelected = () => {
  if (!graph) return;
  
  const cells = graph.getSelectedCells();
  if (cells.length > 0) {
    graph.removeCells(cells);
    
    // 同步到状态管理
    const nodeIds = cells.filter(cell => cell.isNode()).map(cell => cell.id);
    const edgeIds = cells.filter(cell => cell.isEdge()).map(cell => cell.id);
    
    if (nodeIds.length > 0) {
      graphStore.removeNodes(nodeIds);
    }
    if (edgeIds.length > 0) {
      graphStore.removeEdges(edgeIds);
    }
  }
};

// 导出操作
const exportPNG = () => {
  if (exportActions) {
    exportActions.exportPNG('xflow-demo.png');
  }
};

// 视图操作
const centerContent = () => {
  if (graph) {
    graph.centerContent();
  }
};

const fitContent = () => {
  if (graph) {
    graph.scaleContentToFit();
  }
};

onMounted(() => {
  // 注册基础图形
  registerBasicShapes();
});
</script>

<style scoped>
.demo2-container {
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
</style>
