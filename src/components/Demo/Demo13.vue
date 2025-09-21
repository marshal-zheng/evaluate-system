<template>
  <div class="demo13-container">
    <h2>Demo 13 - 贝塞尔曲线连接器测试</h2>

    <div class="control-panel">
      <el-row :gutter="16">
        <el-col :span="8">
          <div class="control-group">
            <h4>连接器类型 (Connector)</h4>
            <el-space direction="vertical" size="small">
              <el-radio-group v-model="selectedConnector" @change="updateConnectorType">
                <el-radio label="normal">直线 (normal)</el-radio>
                <el-radio label="smooth">平滑 (smooth)</el-radio>
                <el-radio label="rounded">圆角 (rounded)</el-radio>
                <el-radio label="curve">曲线 (curve)</el-radio>
                <el-radio label="jumpover">跳跃 (jumpover)</el-radio>
              </el-radio-group>
            </el-space>
          </div>
        </el-col>
        
        <el-col :span="8">
          <div class="control-group">
            <h4>路由器类型 (Router)</h4>
            <el-space direction="vertical" size="small">
              <el-radio-group v-model="selectedRouter" @change="updateRouterType">
                <el-radio label="normal">直接 (normal)</el-radio>
                <el-radio label="orth">正交 (orth)</el-radio>
                <el-radio label="manhattan">曼哈顿 (manhattan)</el-radio>
                <el-radio label="metro">地铁 (metro)</el-radio>
                <el-radio label="er">实体关系 (er)</el-radio>
              </el-radio-group>
            </el-space>
          </div>
        </el-col>
        
        <el-col :span="8">
          <div class="control-group">
            <h4>样式参数</h4>
            <el-space direction="vertical" size="small">
              <div>
                <span>圆角半径: </span>
                <el-input-number v-model="radius" :min="0" :max="50" size="small" @change="updateConnectorType" />
              </div>
              <div>
                <span>线条宽度: </span>
                <el-input-number v-model="strokeWidth" :min="1" :max="10" size="small" @change="updateConnectorType" />
              </div>
              <div>
                <span>跳跃大小: </span>
                <el-input-number v-model="jumpSize" :min="5" :max="30" size="small" @change="updateConnectorType" />
              </div>
            </el-space>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="canvas-container">
      <XFlow>
        <XFlowGraph
          :style="{ width: '100%', height: '500px' }"
          :zoomable="true"
          :pannable="true"
          :scroller="false"
          :center-view="true"
          :fit-view="false"
          :connection-options="connectionOptions"
          @ready="onGraphReady"
        >
          <XFlowHistory />
          <XFlowClipboard />
          <XFlowSnapline />
          <XFlowBackground color="#fafafa" />
          <XFlowGrid :size="20" type="dot" />
        </XFlowGraph>
      </XFlow>
    </div>

    <div class="test-controls">
      <el-row :gutter="16">
        <el-col :span="12">
          <div class="control-group">
            <h4>测试操作</h4>
            <el-space>
              <el-button size="small" @click="createTestScenario1">场景1: 基础连接</el-button>
              <el-button size="small" @click="createTestScenario2">场景2: 复杂网络</el-button>
              <el-button size="small" @click="createTestScenario3">场景3: 交叉连接</el-button>
              <el-button size="small" @click="clearCanvas">清空画布</el-button>
            </el-space>
          </div>
        </el-col>
        
        <el-col :span="12">
          <div class="control-group">
            <h4>连接统计</h4>
            <el-space>
              <span>节点数: {{ nodeCount }}</span>
              <span>连接数: {{ edgeCount }}</span>
              <span>当前连接器: {{ selectedConnector }}</span>
              <span>当前路由器: {{ selectedRouter }}</span>
            </el-space>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="status-info">
      <el-alert 
        title="贝塞尔曲线连接器说明" 
        type="info" 
        :closable="false"
        show-icon
      >
        <div>
          <p><strong>连接器类型 (Connector)：</strong></p>
          <ul>
            <li><strong>normal</strong>: 直线连接，最简单的连接方式</li>
            <li><strong>smooth</strong>: 平滑贝塞尔曲线，自动计算控制点</li>
            <li><strong>rounded</strong>: 圆角连接，在转角处使用圆弧</li>
            <li><strong>curve</strong>: 自定义曲线，可控制曲率</li>
            <li><strong>jumpover</strong>: 跳跃连接，在交叉处显示跳跃效果</li>
          </ul>
          <p><strong>路由器类型 (Router)：</strong></p>
          <ul>
            <li><strong>normal</strong>: 直接连接，不进行路径计算</li>
            <li><strong>orth</strong>: 正交路由，只允许水平和垂直线段</li>
            <li><strong>manhattan</strong>: 曼哈顿路由，避开障碍物的正交路径</li>
            <li><strong>metro</strong>: 地铁路由，类似地铁线路图的连接方式</li>
            <li><strong>er</strong>: 实体关系路由，适合 ER 图的连接</li>
          </ul>
          <p><strong>测试方法：</strong></p>
          <ul>
            <li>选择不同的连接器和路由器组合</li>
            <li>调整样式参数观察效果变化</li>
            <li>使用测试场景查看不同布局下的表现</li>
            <li>手动连接节点测试实时效果</li>
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
  XFlowHistory,
  XFlowClipboard,
  XFlowSnapline,
  XFlowBackground,
  XFlowGrid,
} from '../xflow-vue/src/components/index.js';

// 导入业务图形
import { registerAllBusinessShapes } from '../../shapes/index.js';

// 响应式数据
let graph = null;
const selectedConnector = ref('smooth');
const selectedRouter = ref('manhattan');
const radius = ref(8);
const strokeWidth = ref(2);
const jumpSize = ref(10);

// 计算属性
const nodeCount = computed(() => graph ? graph.getNodes().length : 0);
const edgeCount = computed(() => graph ? graph.getEdges().length : 0);

// 连接选项
const connectionOptions = computed(() => ({
  snap: true,
  allowBlank: false,
  allowLoop: false,
  allowEdge: false,
  highlight: true,
  connector: {
    name: selectedConnector.value,
    args: getConnectorArgs(),
  },
  router: {
    name: selectedRouter.value,
    args: getRouterArgs(),
  },
  createEdge() {
    return {
      shape: 'basic-edge',
      attrs: {
        line: {
          stroke: '#1890ff',
          strokeWidth: strokeWidth.value,
          targetMarker: {
            name: 'block',
            width: 12,
            height: 8,
          },
        },
      },
      connector: {
        name: selectedConnector.value,
        args: getConnectorArgs(),
      },
      router: {
        name: selectedRouter.value,
        args: getRouterArgs(),
      },
    };
  },
}));

// 获取连接器参数
function getConnectorArgs() {
  const args = {};
  
  switch (selectedConnector.value) {
    case 'rounded':
      args.radius = radius.value;
      break;
    case 'smooth':
      args.direction = 'H'; // 水平方向
      break;
    case 'curve':
      args.direction = 'T'; // 顶部方向
      break;
    case 'jumpover':
      args.size = jumpSize.value;
      break;
  }
  
  return args;
}

// 获取路由器参数
function getRouterArgs() {
  const args = {};
  
  switch (selectedRouter.value) {
    case 'orth':
      args.padding = 20;
      break;
    case 'manhattan':
      args.padding = 10;
      args.maxAllowedDirectionChange = 90;
      break;
    case 'metro':
      args.maxAllowedDirectionChange = 45;
      break;
    case 'er':
      args.offset = 24;
      args.direction = 'T';
      break;
  }
  
  return args;
}

// 图形准备就绪回调
const onGraphReady = (g) => {
  graph = g;
  
  // 创建初始测试场景
  createTestScenario1();
  
  console.log('Demo13 贝塞尔曲线测试准备完成');
};

// 更新连接器类型
const updateConnectorType = () => {
  if (!graph) return;
  
  // 更新现有边的连接器
  const edges = graph.getEdges();
  edges.forEach(edge => {
    edge.setConnector(selectedConnector.value, getConnectorArgs());
    edge.setRouter(selectedRouter.value, getRouterArgs());
    
    // 更新样式
    edge.attr('line/strokeWidth', strokeWidth.value);
  });
};

// 更新路由器类型
const updateRouterType = () => {
  updateConnectorType(); // 路由器更新时也更新连接器
};

// 测试场景1: 基础连接
const createTestScenario1 = () => {
  if (!graph) return;
  
  graph.clearCells();
  
  // 创建基础节点布局
  const nodes = [
    { id: 'node1', x: 100, y: 100, label: '开始' },
    { id: 'node2', x: 300, y: 150, label: '处理1' },
    { id: 'node3', x: 500, y: 100, label: '处理2' },
    { id: 'node4', x: 350, y: 300, label: '结束' },
  ];
  
  const createdNodes = {};
  nodes.forEach(nodeData => {
    const node = graph.addNode({
      id: nodeData.id,
      shape: 'port-node',
      x: nodeData.x,
      y: nodeData.y,
      label: nodeData.label,
      attrs: {
        body: {
          fill: '#e6f7ff',
          stroke: '#1890ff',
          strokeWidth: 2,
        },
        text: {
          fill: '#1890ff',
          fontWeight: 'bold',
        }
      }
    });
    createdNodes[nodeData.id] = node;
  });
  
  // 创建连接
  const connections = [
    { source: 'node1', target: 'node2' },
    { source: 'node2', target: 'node3' },
    { source: 'node2', target: 'node4' },
    { source: 'node3', target: 'node4' },
  ];
  
  connections.forEach(conn => {
    graph.addEdge({
      source: { cell: createdNodes[conn.source], port: 'output' },
      target: { cell: createdNodes[conn.target], port: 'input' },
      ...connectionOptions.value.createEdge(),
    });
  });
};

// 测试场景2: 复杂网络
const createTestScenario2 = () => {
  if (!graph) return;
  
  graph.clearCells();
  
  // 创建网格状节点布局
  const rows = 3;
  const cols = 4;
  const spacing = 150;
  const startX = 100;
  const startY = 80;
  
  const createdNodes = [];
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const node = graph.addNode({
        shape: 'port-node',
        x: startX + col * spacing,
        y: startY + row * spacing,
        label: `N${row}${col}`,
        attrs: {
          body: {
            fill: '#fff2e8',
            stroke: '#fa8c16',
            strokeWidth: 2,
          },
          text: {
            fill: '#fa8c16',
            fontWeight: 'bold',
          }
        }
      });
      createdNodes.push(node);
    }
  }
  
  // 创建复杂连接网络
  for (let i = 0; i < createdNodes.length; i++) {
    const currentNode = createdNodes[i];
    
    // 连接右侧节点
    if ((i + 1) % cols !== 0 && i + 1 < createdNodes.length) {
      graph.addEdge({
        source: { cell: currentNode, port: 'output' },
        target: { cell: createdNodes[i + 1], port: 'input' },
        ...connectionOptions.value.createEdge(),
      });
    }
    
    // 连接下方节点
    if (i + cols < createdNodes.length) {
      graph.addEdge({
        source: { cell: currentNode, port: 'output' },
        target: { cell: createdNodes[i + cols], port: 'input' },
        ...connectionOptions.value.createEdge(),
      });
    }
    
    // 添加一些对角线连接
    if (i + cols + 1 < createdNodes.length && (i + 1) % cols !== 0) {
      graph.addEdge({
        source: { cell: currentNode, port: 'output' },
        target: { cell: createdNodes[i + cols + 1], port: 'input' },
        ...connectionOptions.value.createEdge(),
        attrs: {
          line: {
            stroke: '#52c41a',
            strokeWidth: strokeWidth.value,
            strokeDasharray: '5,5',
            targetMarker: {
              name: 'block',
              width: 12,
              height: 8,
            },
          },
        },
      });
    }
  }
};

// 测试场景3: 交叉连接
const createTestScenario3 = () => {
  if (!graph) return;
  
  graph.clearCells();
  
  // 创建交叉布局
  const centerX = 350;
  const centerY = 250;
  const radius = 120;
  
  const nodePositions = [
    { x: centerX, y: centerY - radius, label: '北' },
    { x: centerX + radius, y: centerY, label: '东' },
    { x: centerX, y: centerY + radius, label: '南' },
    { x: centerX - radius, y: centerY, label: '西' },
    { x: centerX, y: centerY, label: '中心' },
  ];
  
  const createdNodes = [];
  nodePositions.forEach((pos, index) => {
    const node = graph.addNode({
      shape: 'port-node',
      x: pos.x,
      y: pos.y,
      label: pos.label,
      attrs: {
        body: {
          fill: index === 4 ? '#f6ffed' : '#fff1f0',
          stroke: index === 4 ? '#52c41a' : '#ff4d4f',
          strokeWidth: 2,
        },
        text: {
          fill: index === 4 ? '#52c41a' : '#ff4d4f',
          fontWeight: 'bold',
        }
      }
    });
    createdNodes.push(node);
  });
  
  // 创建交叉连接
  const connections = [
    // 所有外围节点连接到中心
    { source: 0, target: 4 },
    { source: 1, target: 4 },
    { source: 2, target: 4 },
    { source: 3, target: 4 },
    // 对角交叉连接
    { source: 0, target: 2 },
    { source: 1, target: 3 },
    // 相邻连接
    { source: 0, target: 1 },
    { source: 1, target: 2 },
    { source: 2, target: 3 },
    { source: 3, target: 0 },
  ];
  
  connections.forEach(conn => {
    graph.addEdge({
      source: { cell: createdNodes[conn.source], port: 'output' },
      target: { cell: createdNodes[conn.target], port: 'input' },
      ...connectionOptions.value.createEdge(),
    });
  });
};

// 清空画布
const clearCanvas = () => {
  if (graph) {
    graph.clearCells();
  }
};

onMounted(() => {
  registerAllBusinessShapes();
});
</script>

<style scoped>
.demo13-container {
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

.test-controls {
  margin: 16px 0;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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

/* 自定义样式 */
:deep(.el-radio) {
  margin-right: 8px;
  margin-bottom: 8px;
}

:deep(.el-input-number) {
  width: 80px;
}
</style>
