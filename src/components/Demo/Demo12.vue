<template>
  <div class="demo12-container">
    <h2>Demo 12 - 右键菜单完整规范测试</h2>

    <div class="control-panel">
      <el-row :gutter="16">
        <el-col :span="12">
          <div class="control-group">
            <h4>菜单状态监控</h4>
            <el-space direction="vertical" size="small">
              <div>
                <span>菜单可见: </span>
                <el-tag :type="contextMenu?.visible ? 'success' : 'info'" size="small">
                  {{ contextMenu?.visible ? '显示中' : '隐藏' }}
                </el-tag>
              </div>
              <div>
                <span>菜单类型: </span>
                <el-tag size="small" v-if="contextMenu?.visible">{{ contextMenu?.type }}</el-tag>
                <span v-else>-</span>
              </div>
              <div>
                <span>菜单项数: </span>
                <el-tag size="small" v-if="contextMenu?.visible">{{ contextMenu?.items?.length || 0 }}</el-tag>
                <span v-else>-</span>
              </div>
              <div>
                <span>选中元素: </span>
                <el-tag size="small">{{ selectedCells.length }}</el-tag>
              </div>
            </el-space>
          </div>
        </el-col>
        
        <el-col :span="12">
          <div class="control-group">
            <h4>测试操作</h4>
            <el-space direction="vertical" size="small">
              <el-button-group size="small">
                <el-button @click="addTestNodes">添加测试节点</el-button>
                <el-button @click="addTestEdges">添加测试边</el-button>
              </el-button-group>
              <el-button-group size="small">
                <el-button @click="selectAllNodes">选中所有节点</el-button>
                <el-button @click="clearSelection">清空选择</el-button>
              </el-button-group>
              <el-button-group size="small">
                <el-button @click="testLockNodes">锁定/解锁节点</el-button>
                <el-button @click="inspectData">检查数据</el-button>
              </el-button-group>
            </el-space>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="canvas-container">
      <XFlow>
        <XFlowGraph
          :style="{ width: '100%', height: '450px' }"
          :zoomable="true"
          :pannable="true"
          :scroller="false"
          :center-view="true"
          :fit-view="false"
          :enable-standard-interactions="true"
          :enable-context-menu="true"
          @ready="onGraphReady"
        >
          <XFlowState 
            :center-view="true"
            :fit-view="false"
          />
          
          <XFlowHistory />
          <XFlowClipboard />
          <XFlowSnapline />
          <XFlowBackground color="#fafafa" />
          <XFlowGrid :size="20" type="dot" />
        </XFlowGraph>
      </XFlow>
    </div>

    <div class="status-info">
      <el-alert 
        title="右键菜单规范说明" 
        type="info" 
        :closable="false"
        show-icon
      >
        <div>
          <p><strong>右键菜单规范（强约束）：</strong></p>
          <ul>
            <li><strong>节点右键菜单：</strong>复制、删除、锁定/解锁、检查数据</li>
            <li><strong>边右键菜单：</strong>编辑标签、删除连接</li>
            <li><strong>空白右键菜单：</strong>全选、粘贴、适应画布、实际大小、清空画布</li>
            <li><strong>菜单位置：</strong>使用 `v-contextmenu`，从事件的 `e.clientX/Y` 获取坐标</li>
            <li><strong>快捷键显示：</strong>Mac 显示 Cmd+，Windows 显示 Ctrl+</li>
          </ul>
          <p><strong>测试方法：</strong></p>
          <ul>
            <li>在节点上右键：显示节点专属菜单（复制、删除、锁定、检查数据）</li>
            <li>在边上右键：显示边专属菜单（编辑标签、删除连接）</li>
            <li>在空白区域右键：显示画布菜单（全选、粘贴、视图操作、清空画布）</li>
            <li>锁定的节点会显示虚线边框和半透明效果</li>
            <li>菜单项会根据当前状态动态禁用（如剪贴板为空时粘贴禁用）</li>
          </ul>
        </div>
      </el-alert>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// 导入组件
import {
  XFlow,
  XFlowGraph,
  XFlowState,
  XFlowHistory,
  XFlowClipboard,
  XFlowSnapline,
  XFlowBackground,
  XFlowGrid,
} from '../xflow-vue/src/components/index.js';

// 导入组合式函数
import {
  useClipboard,
  useHistory,
} from '../xflow-vue/src/composables/index.js';

// 导入业务图形
import { registerAllBusinessShapes } from '../../shapes/index.js';

// 响应式数据
let graph = null;
let standardInteractions = null;
const selectedCells = ref([]);

// 图形准备就绪回调
const onGraphReady = (g, keyboardMgr, interactions) => {
  graph = g;
  standardInteractions = interactions;
  
  // 设置剪贴板和历史处理器
  const clipboardActions = useClipboard(g);
  const historyActions = useHistory(g);
  
  // 将处理器传递给标准交互管理器
  if (standardInteractions && standardInteractions.setupHandlers) {
    standardInteractions.setupHandlers(clipboardActions, historyActions);
  }
  
  // 监听选择变化
  g.on('selection:changed', ({ selected }) => {
    selectedCells.value = selected || [];
  });
  
  // 初始化测试数据
  initTestData();
};

// 获取右键菜单状态
const contextMenu = computed(() => {
  return standardInteractions?.contextMenu || null;
});

// 初始化测试数据
const initTestData = () => {
  if (!graph) return;
  
  // 添加一些测试节点
  const node1 = graph.addNode({
    shape: 'port-node',
    x: 150,
    y: 120,
    label: '节点1（可拖拽）',
  });
  
  const node2 = graph.addNode({
    shape: 'port-node',
    x: 400,
    y: 120,
    label: '节点2（可拖拽）',
  });
  
  const node3 = graph.addNode({
    shape: 'port-node',
    x: 275,
    y: 250,
    label: '节点3（锁定）',
    draggable: false, // 锁定节点
  });
  
  // 设置锁定节点的视觉效果
  node3.attr('body/strokeDasharray', '5,5');
  node3.attr('body/opacity', 0.7);
  node3.prop('locked', true);
  
  // 添加连接边
  const edge1 = graph.addEdge({
    source: { cell: node1.id, port: 'output' },
    target: { cell: node2.id, port: 'input' },
    labels: [{
      attrs: {
        label: { text: '连接1' },
      },
    }],
  });
  
  const edge2 = graph.addEdge({
    source: { cell: node2.id, port: 'output' },
    target: { cell: node3.id, port: 'input' },
    labels: [{
      attrs: {
        label: { text: '连接2' },
      },
    }],
  });
  
  console.log('Demo12 测试数据初始化完成');
};

// 测试操作方法
const addTestNodes = () => {
  if (!graph) return;
  
  const x = Math.random() * 400 + 100;
  const y = Math.random() * 300 + 100;
  
  const node = graph.addNode({
    shape: 'port-node',
    x,
    y,
    label: `节点${Date.now() % 1000}`,
  });
  
  graph.select(node);
};

const addTestEdges = () => {
  if (!graph) return;
  
  const nodes = graph.getNodes();
  if (nodes.length < 2) {
    console.log('需要至少2个节点才能添加边');
    return;
  }
  
  const source = nodes[Math.floor(Math.random() * nodes.length)];
  let target = nodes[Math.floor(Math.random() * nodes.length)];
  
  // 确保源和目标不同
  while (target === source && nodes.length > 1) {
    target = nodes[Math.floor(Math.random() * nodes.length)];
  }
  
  const edge = graph.addEdge({
    source: { cell: source.id, port: 'output' },
    target: { cell: target.id, port: 'input' },
    labels: [{
      attrs: {
        label: { text: `边${Date.now() % 1000}` },
      },
    }],
  });
  
  graph.select(edge);
};

const selectAllNodes = () => {
  if (!graph) return;
  graph.selectAll();
};

const clearSelection = () => {
  if (!graph) return;
  graph.cleanSelection();
};

const testLockNodes = () => {
  if (!graph) return;
  
  const selected = graph.getSelectedCells().filter(cell => cell.isNode());
  if (selected.length === 0) {
    console.log('请先选择节点');
    return;
  }
  
  selected.forEach(node => {
    const locked = node.prop('locked');
    node.prop('locked', !locked);
    node.prop('draggable', locked); // 锁定时不可拖拽
    
    // 视觉反馈
    if (!locked) {
      node.attr('body/strokeDasharray', '5,5');
      node.attr('body/opacity', 0.7);
    } else {
      node.attr('body/strokeDasharray', '');
      node.attr('body/opacity', 1);
    }
  });
};

const inspectData = () => {
  if (!graph) return;
  
  const selected = graph.getSelectedCells();
  if (selected.length === 0) {
    console.log('请先选择元素');
    return;
  }
  
  selected.forEach(cell => {
    const data = cell.toJSON();
    console.log(`${cell.isNode() ? '节点' : '边'} 数据:`, data);
  });
  
  alert(`已在控制台输出 ${selected.length} 个元素的数据，请按 F12 查看`);
};

onMounted(() => {
  registerAllBusinessShapes();
});
</script>

<style scoped>
.demo12-container {
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin: 10px 0;
  background-color: #f9f9f9;
}

.control-panel {
  margin-bottom: 16px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.control-group {
  padding: 8px;
}

.control-group h4 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 14px;
  font-weight: 600;
}

.canvas-container {
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.status-info {
  margin-top: 16px;
}

.status-info ul {
  margin: 8px 0;
  padding-left: 20px;
}

.status-info li {
  margin: 4px 0;
}
</style>
