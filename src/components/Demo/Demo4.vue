<template>
  <div class="demo4-container">
    <h2>Demo 4 - 画布拖拽与小地图</h2>
    
    <!-- 控制面板 -->
    <div class="control-panel">
      <el-row :gutter="16">
        <el-col :span="8">
          <div class="control-group">
            <h4>画布拖拽</h4>
            <el-space direction="vertical" size="small">
              <el-switch 
                v-model="pannable" 
                active-text="拖拽画布" 
                @change="updatePannable"
              />
              <el-switch 
                v-model="zoomable" 
                active-text="鼠标滚轮缩放" 
                @change="updateZoomable"
              />
              <div>
                <span>缩放比例: {{ currentScale }}%</span>
                <el-button-group size="small" style="margin-left: 8px;">
                  <el-button @click="zoomIn" :icon="ZoomIn">放大</el-button>
                  <el-button @click="zoomOut" :icon="ZoomOut">缩小</el-button>
                  <el-button @click="zoomToFit" :icon="FullScreen">适应</el-button>
                  <el-button @click="zoomReset" :icon="Refresh">重置</el-button>
                </el-button-group>
              </div>
            </el-space>
          </div>
        </el-col>
        
        <el-col :span="8">
          <div class="control-group">
            <h4>小地图</h4>
            <el-space direction="vertical" size="small">
              <el-switch 
                v-model="minimapVisible" 
                active-text="显示小地图" 
                @change="updateMinimap"
              />
              <el-switch 
                v-model="minimapSimple" 
                active-text="简化模式" 
                :disabled="!minimapVisible"
              />
              <div>
                <span>位置:</span>
                <el-radio-group v-model="minimapPosition" size="small" @change="updateMinimapPosition">
                  <el-radio label="top-right">右上</el-radio>
                  <el-radio label="top-left">左上</el-radio>
                  <el-radio label="bottom-right">右下</el-radio>
                  <el-radio label="bottom-left">左下</el-radio>
                </el-radio-group>
              </div>
            </el-space>
          </div>
        </el-col>
        
        <el-col :span="8">
          <div class="control-group">
            <h4>画布背景</h4>
            <el-space direction="vertical" size="small">
              <div>
                <span>背景颜色:</span>
                <el-color-picker v-model="backgroundColor" @change="updateBackground" />
              </div>
              <div>
                <span>网格类型:</span>
                <el-select v-model="gridType" size="small" @change="updateGrid">
                  <el-option label="点状" value="dot" />
                  <el-option label="网格" value="mesh" />
                  <el-option label="无" value="none" />
                </el-select>
              </div>
              <div v-if="gridType !== 'none'">
                <span>网格大小:</span>
                <el-slider 
                  v-model="gridSize" 
                  :min="10" 
                  :max="50" 
                  :step="5"
                  style="width: 120px; margin-left: 8px;"
                  @change="updateGrid"
                />
              </div>
            </el-space>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 画布容器 -->
    <div class="canvas-container">
      <XFlow>
        <XFlowGraph
          ref="graphRef"
          :style="{ width: '100%', height: '500px' }"
          :zoomable="zoomable"
          :pannable="pannable"
          :scroller="false"
          @ready="onGraphReady"
        >
          <!-- 背景和网格 -->
          <XFlowBackground :color="backgroundColor" />
          <XFlowGrid 
            v-if="gridType !== 'none'"
            :size="gridSize" 
            :type="gridType" 
            :visible="true"
          />
          
          <!-- 小地图 -->
          <XFlowMinimap 
            v-if="minimapVisible"
            :width="180" 
            :height="120" 
            :simple="minimapSimple"
            :style="minimapStyle"
            :scalable="true"
            :min-scale="0.01"
            :max-scale="16"
          />
        </XFlowGraph>
      </XFlow>
    </div>

    <!-- 状态信息 -->
    <div class="status-bar">
      <el-space>
        <span>节点数量: {{ nodeCount }}</span>
        <span>当前缩放: {{ currentScale }}%</span>
        <span>画布位置: ({{ panPosition.x }}, {{ panPosition.y }})</span>
        <el-button size="small" @click="addRandomNodes" :icon="Plus">添加随机节点</el-button>
        <el-button size="small" @click="clearCanvas" :icon="Delete" type="danger">清空画布</el-button>
      </el-space>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { 
  ZoomIn, 
  ZoomOut, 
  FullScreen, 
  Refresh, 
  Plus, 
  Delete 
} from '@element-plus/icons-vue';

// 导入组件
import {
  XFlow,
  XFlowGraph,
  XFlowBackground,
  XFlowGrid,
  XFlowMinimap,
} from '../xflow-vue/src/components/index.js';

// 导入注册函数
import { registerBasicShapes } from '../xflow-vue/src/shapes/register.js';

// 响应式数据
const graphRef = ref(null);
const pannable = ref(true);
const zoomable = ref(true);
const currentScale = ref(100);
const panPosition = ref({ x: 0, y: 0 });

// 小地图相关
const minimapVisible = ref(true);
const minimapSimple = ref(false);
const minimapPosition = ref('top-right');

// 背景相关
const backgroundColor = ref('#f8f9fa');
const gridType = ref('dot');
const gridSize = ref(20);

// Graph 实例
let graph = null;

// 计算属性
const nodeCount = computed(() => {
  return graph ? graph.getCells().filter(cell => cell.isNode()).length : 0;
});

const minimapStyle = computed(() => {
  const positions = {
    'top-right': { position: 'absolute', top: '10px', right: '10px' },
    'top-left': { position: 'absolute', top: '10px', left: '10px' },
    'bottom-right': { position: 'absolute', top: 'auto', bottom: '10px', right: '10px' },
    'bottom-left': { position: 'absolute', top: 'auto', bottom: '10px', left: '10px' },
  };
  return positions[minimapPosition.value] || positions['top-right'];
});

// 图形准备就绪回调
const onGraphReady = (g) => {
  graph = g;
  
  setupGraphEvents();
  createInitialNodes();
  
  // 初始化状态
  updateScale();
  updatePanPosition();
};

// 设置图形事件
const setupGraphEvents = () => {
  if (!graph) return;
  
  // 监听缩放变化
  graph.on('scale', ({ sx }) => {
    currentScale.value = Math.round(sx * 100);
  });
  
  // 监听平移变化
  graph.on('translate', ({ tx, ty }) => {
    panPosition.value = { x: Math.round(tx), y: Math.round(ty) };
  });
  
  // 监听节点变化
  graph.on('cell:added', updateScale);
  graph.on('cell:removed', updateScale);
};

// 创建初始节点
const createInitialNodes = () => {
  // 创建一个大的分布，方便测试拖拽和小地图
  const nodes = [
    { x: 100, y: 100, label: '节点1', color: '#1890ff' },
    { x: 400, y: 150, label: '节点2', color: '#52c41a' },
    { x: 700, y: 200, label: '节点3', color: '#faad14' },
    { x: 200, y: 350, label: '节点4', color: '#f5222d' },
    { x: 500, y: 400, label: '节点5', color: '#722ed1' },
    { x: 800, y: 450, label: '节点6', color: '#fa8c16' },
    { x: 150, y: 600, label: '节点7', color: '#13c2c2' },
    { x: 450, y: 650, label: '节点8', color: '#eb2f96' },
    { x: 750, y: 700, label: '节点9', color: '#a0d911' },
  ];
  
  nodes.forEach((nodeData, index) => {
    const node = graph.addNode({
      shape: index % 3 === 0 ? 'rect-node' : index % 3 === 1 ? 'circle-node' : 'diamond-node',
      x: nodeData.x,
      y: nodeData.y,
      label: nodeData.label,
      attrs: {
        body: {
          fill: nodeData.color + '20',
          stroke: nodeData.color,
          strokeWidth: 2,
        },
        text: {
          fill: nodeData.color,
          fontWeight: 'bold',
        }
      }
    });
    
    // 添加一些连接
    if (index > 0 && index % 3 === 0) {
      const prevNode = graph.getCells()[index - 1];
      if (prevNode && prevNode.isNode()) {
        graph.addEdge({
          source: prevNode,
          target: node,
          shape: 'basic-edge',
          attrs: {
            line: {
              stroke: nodeData.color,
              strokeWidth: 2,
            }
          }
        });
      }
    }
  });
};

// 更新缩放比例
const updateScale = () => {
  if (graph) {
    const scale = graph.scale();
    currentScale.value = Math.round(scale.sx * 100);
  }
};

// 更新平移位置
const updatePanPosition = () => {
  if (graph) {
    const translate = graph.translate();
    panPosition.value = { x: Math.round(translate.tx), y: Math.round(translate.ty) };
  }
};

// 画布控制方法
const updatePannable = (value) => {
  if (graph) {
    if (value) {
      graph.enablePanning();
    } else {
      graph.disablePanning();
    }
  }
};

const updateZoomable = (value) => {
  if (graph) {
    if (value) {
      graph.enableMouseWheel();
    } else {
      graph.disableMouseWheel();
    }
  }
};

const zoomIn = () => {
  if (graph) {
    graph.zoom(0.2);
  }
};

const zoomOut = () => {
  if (graph) {
    graph.zoom(-0.2);
  }
};

const zoomToFit = () => {
  if (graph) {
    graph.scaleContentToFit({ padding: 20 });
  }
};

const zoomReset = () => {
  if (graph) {
    graph.scale(1);
    graph.centerContent();
  }
};

// 小地图控制
const updateMinimap = () => {
  // 小地图的显示/隐藏通过 v-if 控制
};

const updateMinimapPosition = () => {
  // 位置通过计算属性控制
};

// 背景控制
const updateBackground = () => {
  // 背景颜色通过 props 控制
};

const updateGrid = () => {
  // 网格通过 props 控制
};

// 添加随机节点
const addRandomNodes = () => {
  if (!graph) return;
  
  const shapes = ['rect-node', 'circle-node', 'diamond-node'];
  const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'];
  
  for (let i = 0; i < 3; i++) {
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    graph.addNode({
      shape,
      x: Math.random() * 600 + 100,
      y: Math.random() * 400 + 100,
      label: `随机${Date.now() % 1000}`,
      attrs: {
        body: {
          fill: color + '20',
          stroke: color,
          strokeWidth: 2,
        },
        text: {
          fill: color,
          fontWeight: 'bold',
        }
      }
    });
  }
};

// 清空画布
const clearCanvas = () => {
  if (graph && confirm('确定要清空画布吗？')) {
    graph.clearCells();
    nextTick(() => {
      createInitialNodes();
    });
  }
};

onMounted(() => {
  registerBasicShapes();
});
</script>

<style scoped>
.demo4-container {
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

.status-bar {
  margin-top: 12px;
  padding: 8px 12px;
  background: white;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* 深度选择器 - 自定义小地图样式 */
:deep(.x6-widget-minimap) {
  border: 2px solid #1890ff;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  background: white;
}

:deep(.x6-widget-minimap-viewport) {
  border: 2px solid #52c41a;
  background: rgba(82, 196, 26, 0.1);
}

/* 网格样式 */
:deep(.x6-graph-svg-grid) {
  opacity: 0.6;
}
</style>
