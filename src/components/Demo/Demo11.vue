<template>
  <div class="demo11-container">
    <h2>Demo 11 - 状态同步与边动画测试</h2>

    <div class="control-panel">
      <el-row :gutter="16">
        <el-col :span="8">
          <div class="control-group">
            <h4>状态管理测试</h4>
            <el-space direction="vertical" size="small">
              <div>
                <span>Pinia 节点数: {{ storeNodeCount }}</span>
                <span style="margin-left: 16px;">Graph 节点数: {{ graphNodeCount }}</span>
              </div>
              <div>
                <span>Pinia 边数: {{ storeEdgeCount }}</span>
                <span style="margin-left: 16px;">Graph 边数: {{ graphEdgeCount }}</span>
              </div>
              <el-button-group size="small">
                <el-button @click="addNodeToStore">向 Store 添加节点</el-button>
                <el-button @click="addNodeToGraph">向 Graph 添加节点</el-button>
              </el-button-group>
              <el-button-group size="small">
                <el-button @click="updateNodeInStore">更新 Store 中的节点</el-button>
                <el-button @click="updateNodeInGraph">更新 Graph 中的节点</el-button>
              </el-button-group>
            </el-space>
          </div>
        </el-col>
        
        <el-col :span="8">
          <div class="control-group">
            <h4>插件状态检测</h4>
            <el-space direction="vertical" size="small">
              <div v-for="plugin in pluginList" :key="plugin.name" class="plugin-status">
                <el-tag 
                  :type="plugin.loaded ? 'success' : 'danger'"
                  size="small"
                >
                  {{ plugin.name }}: {{ plugin.loaded ? '已加载' : '未加载' }}
                </el-tag>
                <el-button 
                  size="small" 
                  @click="testPlugin(plugin.name)"
                  :disabled="!plugin.loaded"
                  style="margin-left: 8px;"
                >
                  测试
                </el-button>
              </div>
            </el-space>
          </div>
        </el-col>

        <el-col :span="8">
          <div class="control-group">
            <h4>边动画测试</h4>
            <el-space direction="vertical" size="small">
              <div>
                <span>动画边数: </span>
                <el-tag size="small">{{ animatedEdgeCount }}</el-tag>
              </div>
              <div>
                <span>动画速度(秒)：</span>
                <el-input-number v-model="edgeAnimationDuration" :min="1" :max="120" size="small" />
              </div>
              <div>
                <el-button-group size="small">
                  <el-button @click="toggleEdgeAnimation">切换选中边动画</el-button>
                  <el-button @click="toggleAllEdgeAnimation">全部边动画</el-button>
                </el-button-group>
              </div>
            </el-space>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="canvas-container">
      <XFlow>
        <XFlowGraph
          :style="{ width: '100%', height: '400px' }"
          :zoomable="true"
          :pannable="true"
          :scroller="false"
          :center-view="true"
          :fit-view="false"
          @ready="onGraphReady"
        >
          <!-- 重要：添加 State 组件进行状态同步 -->
          <XFlowState 
            :center-view="true"
            :fit-view="false"
            :edge-animation-duration="edgeAnimationDuration"
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
        title="状态同步与边动画说明" 
        type="info" 
        :closable="false"
        show-icon
      >
        <div>
          <p><strong>XFlowState 组件功能：</strong></p>
          <ul>
            <li>自动同步 Pinia 状态与 X6 Graph 的数据</li>
            <li>监听图形变化并更新状态管理</li>
            <li>处理选中状态和动画状态</li>
            <li>支持初始化视图操作（centerView、fitView）</li>
          </ul>
          <p><strong>插件检测逻辑：</strong></p>
          <ul>
            <li>在 Graph 初始化后实时检测插件加载情况</li>
            <li>在调用具体插件功能前再次校验</li>
            <li>避免在插件未就绪时出错</li>
          </ul>
          <p><strong>边动画功能（与React版本一致）：</strong></p>
          <ul>
            <li><strong>实现方式：</strong>通过 cell.attr() 直接设置边的属性</li>
            <li><strong>虚线设置：</strong>line/strokeDasharray: 5</li>
            <li><strong>动画设置：</strong>line/style/animation: 'animated-line 30s infinite linear'</li>
            <li><strong>CSS动画：</strong>@keyframes animated-line 实现行进蚂蚁效果</li>
          </ul>
          <p><strong>使用说明：</strong></p>
          <ul>
            <li>点击"切换选中边动画"作用于当前选中的边</li>
            <li>点击"全部边动画"切换所有边的动画状态</li>
            <li>动画状态与Pinia状态管理同步</li>
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
  useGraphStore,
} from '../xflow-vue/src/composables/index.js';

// 导入业务图形
import { registerAllBusinessShapes } from '../../shapes/index.js';

// 响应式数据
let graph = null;
const graphStore = useGraphStore();

// 插件检测
const pluginList = ref([
  { name: 'history', loaded: false },
  { name: 'clipboard', loaded: false },
  { name: 'selection', loaded: false },
  { name: 'keyboard', loaded: false },
  { name: 'snapline', loaded: false },
]);

// 边动画计数
const animatedEdgeCount = ref(0);
const edgeAnimationDuration = ref(30);

// 计算属性
const storeNodeCount = computed(() => graphStore.nodes.length);
const storeEdgeCount = computed(() => graphStore.edges.length);
const graphNodeCount = computed(() => graph ? graph.getNodes().length : 0);
const graphEdgeCount = computed(() => graph ? graph.getEdges().length : 0);

// 图形准备就绪回调
const onGraphReady = (g) => {
  graph = g;
  
  // 检测插件加载状态
  updatePluginStatus();
  
  // 初始化一些数据
  initTestData();
  
  // 初始化动画计数
  updateAnimatedEdgeCount();
};

// 更新插件状态
const updatePluginStatus = () => {
  pluginList.value.forEach(plugin => {
    plugin.loaded = !!graph?.getPlugin(plugin.name);
  });
};

// 初始化测试数据
const initTestData = () => {
  // 通过状态管理初始化数据
  graphStore.initData({
    nodes: [
      {
        id: 'node1',
        shape: 'port-node',
        x: 100,
        y: 150,
        label: 'Store 节点1',
        selected: false,
      },
      {
        id: 'node2',
        shape: 'port-node',
        x: 350,
        y: 150,
        label: 'Store 节点2',
        selected: true, // 初始选中
      },
    ],
    edges: [
      {
        id: 'edge1',
        source: { cell: 'node1', port: 'output' },
        target: { cell: 'node2', port: 'input' },
        animated: true, // 初始动画
      },
    ],
  });
};

// 状态管理操作
const addNodeToStore = () => {
  graphStore.addNodes([{
    shape: 'port-node',
    x: Math.random() * 300 + 100,
    y: Math.random() * 200 + 100,
    label: `Store 节点 ${Date.now() % 1000}`,
    selected: false,
  }]);
};

const addNodeToGraph = () => {
  if (!graph) return;
  
  const node = graph.addNode({
    shape: 'port-node',
    x: Math.random() * 300 + 100,
    y: Math.random() * 200 + 100,
    label: `Graph 节点 ${Date.now() % 1000}`,
  });
  
  // 选中新节点
  graph.select(node);
};

const updateNodeInStore = () => {
  const nodes = graphStore.nodes;
  if (nodes.length > 0) {
    const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
    graphStore.updateNode(randomNode.id, {
      label: `更新自 Store ${Date.now() % 1000}`,
      selected: !randomNode.selected,
    });
  }
};

const updateNodeInGraph = () => {
  if (!graph) return;
  
  const nodes = graph.getNodes();
  if (nodes.length > 0) {
    const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
    randomNode.setLabel(`更新自 Graph ${Date.now() % 1000}`);
    
    // 切换选中状态
    if (graph.isSelected(randomNode)) {
      graph.unselect(randomNode);
    } else {
      graph.select(randomNode);
    }
  }
};

// 测试插件功能
const testPlugin = (pluginName) => {
  if (!graph) {
    console.warn('Graph instance not ready');
    return;
  }

  const plugin = graph.getPlugin(pluginName);
  if (!plugin) {
    console.warn(`插件 ${pluginName} 未加载`);
    return;
  }

  console.log(`测试插件 ${pluginName}`);

  switch (pluginName) {
    case 'history':
      console.log('History 插件测试 - 撤销功能');
      plugin.undo();
      break;

    case 'clipboard':
      console.log('Clipboard 插件测试 - 复制功能');
      plugin.copy(graph.getSelectedCells());
      break;

    case 'selection':
      console.log('Selection 插件测试 - 全选功能');
      if (typeof graph.selectAll === 'function') {
        graph.selectAll();
      } else {
        const cells = graph.getCells ? graph.getCells() : (graph.getNodes ? graph.getNodes() : []);
        if (cells && cells.length) {
          if (typeof graph.cleanSelection === 'function') {
            graph.cleanSelection();
          }
          graph.select(cells);
        }
      }
      break;

    case 'keyboard':
      console.log('Keyboard 插件测试 - 绑定测试键');
      graph.bindKey('t', () => console.log('测试键 T 被按下'));
      break;

    case 'snapline':
      console.log('Snapline 插件测试 - 插件已就绪');
      break;

    default:
      console.log(`插件 ${pluginName} 测试完成`);
  }
};

// ====== 边动画管理方法 ======

// 切换选中边的动画状态
const toggleEdgeAnimation = () => {
  if (!graph) return;
  
  const selectedEdges = graph.getSelectedCells().filter(cell => cell.isEdge());
  if (selectedEdges.length === 0) {
    console.log('请先选择一条边');
    return;
  }
  
  selectedEdges.forEach(edge => {
    const currentAnimated = graphStore.edges.find(e => e.id === edge.id)?.animated || false;
    graphStore.updateEdge(edge.id, { animated: !currentAnimated });
  });
  
  updateAnimatedEdgeCount();
};

// 切换所有边的动画状态
const toggleAllEdgeAnimation = () => {
  if (!graph) return;
  
  const edges = graph.getEdges();
  const hasAnimated = graphStore.edges.some(e => e.animated);
  
  edges.forEach(edge => {
    graphStore.updateEdge(edge.id, { animated: !hasAnimated });
  });
  
  updateAnimatedEdgeCount();
};

// 更新动画边计数
const updateAnimatedEdgeCount = () => {
  animatedEdgeCount.value = graphStore.edges.filter(e => e.animated).length;
};

onMounted(() => {
  registerAllBusinessShapes();
});
</script>

<style scoped>
.demo11-container {
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

.plugin-status {
  display: flex;
  align-items: center;
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