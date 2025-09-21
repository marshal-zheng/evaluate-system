<template>
  <div class="demo11-container">
    <h2>Demo 11 - 状态同步与插件检测</h2>

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
                <span>边动画数: </span>
                <el-tag size="small">{{ animatedEdgeCount }}</el-tag>
              </div>
              <div>
                <el-button-group size="small">
                  <el-button @click="toggleEdgeAnimation">切换边动画</el-button>
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
        title="状态同步与动画管理说明" 
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
          <p><strong>动画管理功能：</strong></p>
          <ul>
            <li><strong>节点动画：</strong>脉冲、呼吸、旋转、摇摆、弹跳、闪烁、变色、缩放</li>
            <li><strong>边动画：</strong>行进蚂蚁、颜色流动、宽度脉冲、透明度闪烁</li>
            <li><strong>组合动画：</strong>高亮强调、警告效果、成功效果</li>
            <li><strong>动画控制：</strong>启用/暂停、速度调节（慢/正常/快）、清除所有动画</li>
            <li><strong>性能监控：</strong>实时监控活跃动画数量和帧率，支持性能测试</li>
          </ul>
          <p><strong>使用说明：</strong></p>
          <ul>
            <li>点击节点动画按钮作用于选中节点（未选中则随机选择）</li>
            <li>点击边动画按钮作用于选中边（未选中则作用于所有边）</li>
            <li>组合动画会覆盖之前的组合效果</li>
            <li>通过CSS类名控制动画，支持动态开启/关闭</li>
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

const hasCellClass = (cell, className) => {
  if (!cell || !className) return false;
  if (typeof cell.hasClass === 'function') {
    return cell.hasClass(className);
  }
  if (graph && typeof graph.findViewByCell === 'function') {
    const view = graph.findViewByCell(cell);
    if (view && typeof view.hasClass === 'function') {
      return view.hasClass(className);
    }
  }
  return false;
};

const addCellClass = (cell, className) => {
  if (!cell || !className) return false;
  if (typeof cell.addClass === 'function') {
    cell.addClass(className);
    return true;
  }
  if (graph && typeof graph.findViewByCell === 'function') {
    const view = graph.findViewByCell(cell);
    if (view && typeof view.addClass === 'function') {
      view.addClass(className);
      return true;
    }
  }
  return false;
};

const removeCellClass = (cell, className) => {
  if (!cell || !className) return false;
  if (typeof cell.removeClass === 'function') {
    cell.removeClass(className);
    return true;
  }
  if (graph && typeof graph.findViewByCell === 'function') {
    const view = graph.findViewByCell(cell);
    if (view && typeof view.removeClass === 'function') {
      view.removeClass(className);
      return true;
    }
  }
  return false;
};

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
  updateAnimationCount();
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

// ====== 动画管理方法 ======

// 切换动画启用状态
const toggleAnimations = () => {
  animationEnabled.value = !animationEnabled.value;
  
  if (!graph) return;
  
  const container = graph.container;
  if (animationEnabled.value) {
    container.classList.remove('xflow-animation-paused');
  } else {
    container.classList.add('xflow-animation-paused');
  }
};

// 设置动画速度
const setAnimationSpeed = (speed) => {
  animationSpeed.value = speed;
  
  if (!graph) return;
  
  const container = graph.container;
  // 清除之前的速度类
  container.classList.remove('xflow-animation-slow', 'xflow-animation-fast');
  
  // 添加新的速度类
  if (speed === 'slow') {
    container.classList.add('xflow-animation-slow');
  } else if (speed === 'fast') {
    container.classList.add('xflow-animation-fast');
  }
};

// 清除所有动画
const clearAllAnimations = () => {
  if (!graph) return;
  
  // 清除节点动画
  graph.getNodes().forEach(node => {
    nodeAnimations.value.forEach(anim => {
      removeCellClass(node, `xflow-node-${anim.key}`);
    });
    // 清除组合动画
    comboAnimations.value.forEach(combo => {
      removeCellClass(node, `xflow-node-${combo.key}`);
    });
  });
  
  // 清除边动画
  graph.getEdges().forEach(edge => {
    edgeAnimations.value.forEach(anim => {
      if (anim.key === 'animated') {
        removeCellClass(edge, 'xflow-edge-animated');
        // 同时更新状态管理
        graphStore.updateEdge(edge.id, { animated: false });
      } else {
        removeCellClass(edge, `xflow-edge-${anim.key}`);
      }
    });
  });
  
  // 重置活跃动画列表
  activeNodeAnimations.value = [];
  activeEdgeAnimations.value = [];
  updateAnimationCount();
};

// 应用节点动画
const applyNodeAnimation = (animationType) => {
  if (!graph) return;
  
  const selectedNodes = graph.getSelectedCells().filter(cell => cell.isNode());
  if (selectedNodes.length === 0) {
    // 如果没有选中节点，随机选择一个
    const nodes = graph.getNodes();
    if (nodes.length > 0) {
      selectedNodes.push(nodes[Math.floor(Math.random() * nodes.length)]);
    }
  }
  
  selectedNodes.forEach(node => {
    const className = `xflow-node-${animationType}`;
    
    if (hasCellClass(node, className)) {
      // 如果已有该动画，则移除
      removeCellClass(node, className);
      const index = activeNodeAnimations.value.indexOf(animationType);
      if (index > -1) {
        activeNodeAnimations.value.splice(index, 1);
      }
    } else {
      // 添加动画
      addCellClass(node, className);
      if (!activeNodeAnimations.value.includes(animationType)) {
        activeNodeAnimations.value.push(animationType);
      }
    }
  });
  
  updateAnimationCount();
};

// 应用边动画
const applyEdgeAnimation = (animationType) => {
  if (!graph) return;
  
  const selectedEdges = graph.getSelectedCells().filter(cell => cell.isEdge());
  let targetEdges = selectedEdges;
  
  if (targetEdges.length === 0) {
    // 如果没有选中边，使用所有边
    targetEdges = graph.getEdges();
  }
  
  targetEdges.forEach(edge => {
    if (animationType === 'animated') {
      // 特殊处理行进蚂蚁动画
      const isAnimated = hasCellClass(edge, 'xflow-edge-animated');
      if (isAnimated) {
        removeCellClass(edge, 'xflow-edge-animated');
        graphStore.updateEdge(edge.id, { animated: false });
        const index = activeEdgeAnimations.value.indexOf(animationType);
        if (index > -1) {
          activeEdgeAnimations.value.splice(index, 1);
        }
      } else {
        addCellClass(edge, 'xflow-edge-animated');
        graphStore.updateEdge(edge.id, { animated: true });
        if (!activeEdgeAnimations.value.includes(animationType)) {
          activeEdgeAnimations.value.push(animationType);
        }
      }
    } else {
      const className = `xflow-edge-${animationType}`;
      if (hasCellClass(edge, className)) {
        removeCellClass(edge, className);
        const index = activeEdgeAnimations.value.indexOf(animationType);
        if (index > -1) {
          activeEdgeAnimations.value.splice(index, 1);
        }
      } else {
        addCellClass(edge, className);
        if (!activeEdgeAnimations.value.includes(animationType)) {
          activeEdgeAnimations.value.push(animationType);
        }
      }
    }
  });
  
  updateAnimationCount();
};

// 应用组合动画
const applyComboAnimation = (comboType) => {
  if (!graph) return;
  
  const selectedNodes = graph.getSelectedCells().filter(cell => cell.isNode());
  if (selectedNodes.length === 0) {
    // 如果没有选中节点，随机选择一个
    const nodes = graph.getNodes();
    if (nodes.length > 0) {
      selectedNodes.push(nodes[Math.floor(Math.random() * nodes.length)]);
    }
  }
  
  selectedNodes.forEach(node => {
    // 先清除其他组合动画
    comboAnimations.value.forEach(combo => {
      removeCellClass(node, `xflow-node-${combo.key}`);
    });
    
    // 应用新的组合动画
    addCellClass(node, `xflow-node-${comboType}`);
  });
  
  updateAnimationCount();
};

// 更新活跃动画计数
const updateAnimationCount = () => {
  if (!graph) {
    activeAnimationCount.value = 0;
    return;
  }
  
  let count = 0;
  
  // 统计节点动画
  graph.getNodes().forEach(node => {
    nodeAnimations.value.forEach(anim => {
      if (hasCellClass(node, `xflow-node-${anim.key}`)) {
        count++;
      }
    });
    comboAnimations.value.forEach(combo => {
      if (hasCellClass(node, `xflow-node-${combo.key}`)) {
        count++;
      }
    });
  });
  
  // 统计边动画
  graph.getEdges().forEach(edge => {
    edgeAnimations.value.forEach(anim => {
      if (anim.key === 'animated' && hasCellClass(edge, 'xflow-edge-animated')) {
        count++;
      } else if (hasCellClass(edge, `xflow-edge-${anim.key}`)) {
        count++;
      }
    });
  });
  
  activeAnimationCount.value = count;
};

// 性能测试
const runPerformanceTest = () => {
  if (!graph) return;
  
  console.log('开始动画性能测试...');
  
  // 创建测试节点
  const testNodes = [];
  for (let i = 0; i < 20; i++) {
    const node = graph.addNode({
      shape: 'port-node',
      x: Math.random() * 600 + 50,
      y: Math.random() * 300 + 50,
      label: `测试节点${i + 1}`,
    });
    testNodes.push(node);
  }
  
  // 应用各种动画
  testNodes.forEach((node, index) => {
    const animType = nodeAnimations.value[index % nodeAnimations.value.length];
    addCellClass(node, `xflow-node-${animType.key}`);
  });
  
  // 开始性能监控
  startPerformanceMonitor();
  
  // 5秒后清理测试节点
  setTimeout(() => {
    testNodes.forEach(node => {
      graph.removeNode(node);
    });
    stopPerformanceMonitor();
    console.log('性能测试完成');
  }, 5000);
};

// 开始性能监控
const startPerformanceMonitor = () => {
  let frameCount = 0;
  let lastTime = performance.now();
  
  const monitor = () => {
    frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - lastTime >= 1000) {
      fps.value = Math.round(frameCount * 1000 / (currentTime - lastTime));
      frameCount = 0;
      lastTime = currentTime;
    }
    
    performanceMonitor = requestAnimationFrame(monitor);
  };
  
  performanceMonitor = requestAnimationFrame(monitor);
};

// 停止性能监控
const stopPerformanceMonitor = () => {
  if (performanceMonitor) {
    cancelAnimationFrame(performanceMonitor);
    performanceMonitor = null;
  }
};

onMounted(() => {
  registerAllBusinessShapes();
  // 开始性能监控
  startPerformanceMonitor();
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

.animation-test-panel {
  margin: 16px 0;
}

.animation-group {
  padding: 8px;
}

.animation-group h5 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 14px;
  font-weight: 600;
}
</style>
