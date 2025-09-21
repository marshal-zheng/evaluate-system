<template>
  <div class="xflow-example">
    <!-- 节点面板 -->
    <div class="node-panel">
      <div class="panel-header">
        <h3>节点面板</h3>
        <span class="panel-subtitle">拖拽节点到画布</span>
      </div>
      
      <div class="node-list">
        <div
          v-for="nodeType in nodeTypes"
          :key="nodeType.shape"
          class="node-item"
          :draggable="true"
          @dragstart="handleDragStart($event, nodeType)"
          @dragend="handleDragEnd"
        >
          <div class="node-preview" :style="getNodePreviewStyle(nodeType)">
            <span class="node-text">{{ nodeType.label }}</span>
          </div>
          <div class="node-label">{{ nodeType.label }}</div>
        </div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="xflow-main-area">
      <!-- 工具栏 -->
      <div class="toolbar">
        <el-space>
          <el-button @click="deleteSelected">删除选中</el-button>
          <el-button @click="clearGraph">清空画布</el-button>
          <el-button @click="addSampleNodes">添加示例节点</el-button>
          <el-button @click="handleExportPNG">导出PNG</el-button>
          <el-divider direction="vertical" />
          <el-checkbox v-model="readonly">只读模式</el-checkbox>
          <el-checkbox v-model="showGrid">显示网格</el-checkbox>
          <el-checkbox v-model="showMinimap">显示小地图</el-checkbox>
          <el-checkbox v-model="showSnapline">显示对齐线</el-checkbox>
          <el-divider direction="vertical" />
          <span style="margin-right: 8px;">连线样式：</span>
          <el-select v-model="connectionType" @change="updateConnectionType" style="width: 120px;">
            <el-option label="直线" value="normal" />
            <el-option label="圆角" value="rounded" />
            <el-option label="贝塞尔曲线" value="smooth" />
            <el-option label="折线" value="manhattan" />
            <el-option label="地铁图" value="metro" />
          </el-select>
        </el-space>
      </div>

      <!-- XFlow 容器 -->
      <XFlow>
        <!-- 图画布 -->
        <XFlowGraph
          :readonly="readonly"
          :zoomable="true"
          :pannable="true"
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
      
      <!-- 状态信息 -->
      <div class="status-bar">
        <el-space>
          <span>节点数量: {{ nodes.length }}</span>
          <span>边数量: {{ edges.length }}</span>
          <span>选中数量: {{ selectedCount }}</span>
          <span>缩放比例: {{ Math.floor(zoom * 100) }}%</span>
          <el-divider direction="vertical" />
          <span class="drag-hint">
            {{ isDragging ? '正在拖拽节点...' : '从左侧面板拖拽节点到画布' }}
          </span>
        </el-space>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ElButton, ElCheckbox, ElSpace, ElDivider, ElMessage, ElSelect, ElOption } from 'element-plus';
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
  useExport,
  useDnd
} from '../index.js';

defineOptions({
  name: 'XFlowDragExample'
});

// 响应式状态
const readonly = ref(false);
const showGrid = ref(true);
const showMinimap = ref(true);
const showSnapline = ref(true);
const selectedCount = ref(0);
const zoom = ref(1);
const connectionType = ref('rounded'); // 连线类型

// 获取图实例和store
const graph = useGraphInstance();
const { nodes, edges, addNodes, addEdges, removeNodes } = useGraphStore();
const { addEventListener } = useGraphEvent();
const { exportPNG } = useExport();
const { isDragging, startDrag, stopDrag } = useDnd();

// 连接桩配置
const portsConfig = {
  groups: {
    top: {
      position: 'top',
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: '#31d0c6',
          strokeWidth: 2,
          fill: '#fff',
          style: {
            visibility: 'hidden',
          },
        },
      },
    },
    right: {
      position: 'right',
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: '#31d0c6',
          strokeWidth: 2,
          fill: '#fff',
          style: {
            visibility: 'hidden',
          },
        },
      },
    },
    bottom: {
      position: 'bottom',
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: '#31d0c6',
          strokeWidth: 2,
          fill: '#fff',
          style: {
            visibility: 'hidden',
          },
        },
      },
    },
    left: {
      position: 'left',
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: '#31d0c6',
          strokeWidth: 2,
          fill: '#fff',
          style: {
            visibility: 'hidden',
          },
        },
      },
    },
  },
  items: [
    {
      group: 'top',
    },
    {
      group: 'right',
    },
    {
      group: 'bottom',
    },
    {
      group: 'left',
    },
  ],
};

// 节点类型定义
const nodeTypes = ref([
  {
    shape: 'rect',
    label: '矩形',
    width: 100,
    height: 40,
    ports: portsConfig,
    attrs: {
      body: {
        fill: '#f5f5f5',
        stroke: '#d9d9d9',
        strokeWidth: 1,
        rx: 4,
        ry: 4
      },
      text: {
        fill: '#262626',
        fontSize: 12,
        fontFamily: 'Arial, sans-serif'
      }
    }
  },
  {
    shape: 'circle',
    label: '圆形',
    width: 60,
    height: 60,
    ports: portsConfig,
    attrs: {
      body: {
        fill: '#e6f7ff',
        stroke: '#1890ff',
        strokeWidth: 2
      },
      text: {
        fill: '#1890ff',
        fontSize: 12,
        fontFamily: 'Arial, sans-serif'
      }
    }
  },
  {
    shape: 'ellipse',
    label: '椭圆',
    width: 80,
    height: 50,
    ports: portsConfig,
    attrs: {
      body: {
        fill: '#f6ffed',
        stroke: '#52c41a',
        strokeWidth: 2
      },
      text: {
        fill: '#52c41a',
        fontSize: 12,
        fontFamily: 'Arial, sans-serif'
      }
    }
  },
  {
    shape: 'polygon',
    label: '菱形',
    width: 80,
    height: 80,
    ports: portsConfig,
    attrs: {
      body: {
        fill: '#fff2e8',
        stroke: '#fa8c16',
        strokeWidth: 2,
        refPoints: '0,10 10,0 20,10 10,20'
      },
      text: {
        fill: '#fa8c16',
        fontSize: 12,
        fontFamily: 'Arial, sans-serif'
      }
    }
  },
  {
    shape: 'rect',
    label: '开始',
    width: 80,
    height: 40,
    ports: portsConfig,
    attrs: {
      body: {
        fill: '#f0f9ff',
        stroke: '#1677ff',
        strokeWidth: 2,
        rx: 20,
        ry: 20
      },
      text: {
        fill: '#1677ff',
        fontSize: 12,
        fontFamily: 'Arial, sans-serif'
      }
    }
  },
  {
    shape: 'rect',
    label: '结束',
    width: 80,
    height: 40,
    ports: portsConfig,
    attrs: {
      body: {
        fill: '#fff1f0',
        stroke: '#ff4d4f',
        strokeWidth: 2,
        rx: 20,
        ry: 20
      },
      text: {
        fill: '#ff4d4f',
        fontSize: 12,
        fontFamily: 'Arial, sans-serif'
      }
    }
  }
]);

// 连线样式配置
const getConnectionConfig = (type) => {
  const baseConfig = {
    shape: 'edge',
    attrs: {
      line: {
        stroke: '#1890ff',
        connector: { name: 'smooth' },
        strokeWidth: 2,
        targetMarker: {
          name: 'block',
          width: 12,
          height: 8,
        },
      },
    },
  };

  switch (type) {
    case 'normal':
      return {
        ...baseConfig,
        router: { name: 'normal' },
        connector: { name: 'normal' },
      };
    case 'rounded':
      return {
        ...baseConfig,
        router: { name: 'manhattan', args: { padding: 1 } },
        connector: { name: 'rounded', args: { radius: 8 } },
      };
    case 'smooth':
      return {
        ...baseConfig,
        router: { name: 'normal' },
        connector: { name: 'smooth', args: { direction: 'H' } },
      };
    case 'manhattan':
      return {
        ...baseConfig,
        router: { name: 'manhattan', args: { padding: 1 } },
        connector: { name: 'normal' },
      };
    case 'metro':
      return {
        ...baseConfig,
        router: { name: 'metro' },
        connector: { name: 'rounded', args: { radius: 4 } },
      };
    default:
      return baseConfig;
  }
};

// 图配置
const connectionOptions = computed(() => ({
  snap: true,
  allowBlank: false,
  allowLoop: false,
  allowMulti: false,
  highlight: true,
  createEdge() {
    return this.createEdge(getConnectionConfig(connectionType.value));
  },
}));

// 选择配置
const selectOptions = {
  enabled: true,
  multiple: true,
  rubberband: false,
  movable: true,
  strict: false,
  modifiers: ['ctrl', 'meta']
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

// 获取节点预览样式
const getNodePreviewStyle = (nodeType) => {
  const baseStyle = {
    width: `${Math.min(nodeType.width, 60)}px`,
    height: `${Math.min(nodeType.height, 40)}px`,
    backgroundColor: nodeType.attrs.body.fill,
    border: `${nodeType.attrs.body.strokeWidth || 1}px solid ${nodeType.attrs.body.stroke}`,
    borderRadius: nodeType.shape === 'circle' ? '50%' : 
                  nodeType.shape === 'ellipse' ? '50%' :
                  `${nodeType.attrs.body.rx || 0}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'grab'
  };

  // 特殊形状处理
  if (nodeType.shape === 'polygon') {
    baseStyle.transform = 'rotate(45deg)';
    baseStyle.borderRadius = '0';
  }

  return baseStyle;
};

// 拖拽开始处理
const handleDragStart = (event, nodeType) => {
  if (!graph.value) {
    console.warn('图实例未初始化，无法开始拖拽');
    return;
  }

  // 创建节点数据 - 确保包含ports配置
  const nodeData = {
    id: `node_${Date.now()}`,
    shape: nodeType.shape,
    width: nodeType.width,
    height: nodeType.height,
    ports: nodeType.ports, // 确保包含ports配置
    attrs: {
      ...nodeType.attrs,
      text: {
        ...nodeType.attrs.text,
        text: nodeType.label
      }
    }
  };

  // 设置拖拽数据
  event.dataTransfer.setData('application/json', JSON.stringify(nodeData));
  event.dataTransfer.effectAllowed = 'copy';

  // 创建临时节点用于拖拽
  const tempNode = graph.value.createNode(nodeData);
  
  // 开始拖拽
  startDrag(event.target, tempNode, event);
};

// 拖拽结束处理
const handleDragEnd = () => {
  stopDrag();
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
  ElMessage.success('画布已清空');
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

// 更新连线类型
const updateConnectionType = (type) => {
  if (!graph.value) return;
  
  // 更新现有边的样式
  const edges = graph.value.getEdges();
  edges.forEach(edge => {
    const config = getConnectionConfig(type);
    edge.setRouter(config.router);
    edge.setConnector(config.connector);
  });
  
  ElMessage.success(`连线样式已更新为: ${getConnectionTypeName(type)}`);
};

// 获取连线类型名称
const getConnectionTypeName = (type) => {
  const names = {
    normal: '直线',
    rounded: '圆角',
    smooth: '贝塞尔曲线',
    manhattan: '折线',
    metro: '地铁图'
  };
  return names[type] || type;
};

// 添加示例节点
const addSampleNodes = () => {
  if (!graph.value) return;
  
  // 清空现有内容
  graph.value.clearCells();
  
  // 创建示例节点
  const node1 = graph.value.addNode({
    id: 'sample-node-1',
    shape: 'rect',
    x: 100,
    y: 100,
    width: 100,
    height: 40,
    ports: portsConfig,
    attrs: {
      body: {
        fill: '#f5f5f5',
        stroke: '#d9d9d9',
        strokeWidth: 1,
        rx: 4,
        ry: 4
      },
      text: {
        text: '开始节点',
        fill: '#262626',
        fontSize: 12,
        fontFamily: 'Arial, sans-serif'
      }
    }
  });
  
  const node2 = graph.value.addNode({
    id: 'sample-node-2',
    shape: 'rect',
    x: 300,
    y: 200,
    width: 100,
    height: 40,
    ports: portsConfig,
    attrs: {
      body: {
        fill: '#e6f7ff',
        stroke: '#1890ff',
        strokeWidth: 2,
        rx: 4,
        ry: 4
      },
      text: {
        text: '处理节点',
        fill: '#1890ff',
        fontSize: 12,
        fontFamily: 'Arial, sans-serif'
      }
    }
  });
  
  const node3 = graph.value.addNode({
    id: 'sample-node-3',
    shape: 'rect',
    x: 500,
    y: 100,
    width: 100,
    height: 40,
    ports: portsConfig,
    attrs: {
      body: {
        fill: '#f6ffed',
        stroke: '#52c41a',
        strokeWidth: 2,
        rx: 4,
        ry: 4
      },
      text: {
        text: '结束节点',
        fill: '#52c41a',
        fontSize: 12,
        fontFamily: 'Arial, sans-serif'
      }
    }
  });
  
  // 添加连线
  setTimeout(() => {
    graph.value.addEdge({
      id: 'sample-edge-1',
      source: { cell: node1.id, port: 'right' },
      target: { cell: node2.id, port: 'left' },
        connector: { name: 'smooth' },
      ...getConnectionConfig(connectionType.value)
    });
    
    graph.value.addEdge({
      id: 'sample-edge-2', 
      source: { cell: node2.id, port: 'right' },
      target: { cell: node3.id, port: 'left' },
      ...getConnectionConfig(connectionType.value)
    });
  }, 100);
  
  ElMessage.success('示例节点已添加');
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
  
  // 监听节点添加事件（拖拽完成）
  addEventListener('node:added', ({ node }) => {
    console.log('节点已添加:', node.id);
    ElMessage.success(`成功添加节点: ${node.getAttrByPath('text/text')}`);
  });
  
  // 连接桩鼠标悬停事件 - 显示并高亮连接桩
    graph.value.on('node:mouseenter', ({ node }) => {
      const ports = node.getPorts();
      ports.forEach(port => {
        node.setPortProp(port.id, 'attrs/circle/style/visibility', 'visible');
        node.setPortProp(port.id, 'attrs/circle/stroke', '#ff4d4f');
        node.setPortProp(port.id, 'attrs/circle/strokeWidth', 3);
        node.setPortProp(port.id, 'attrs/circle/r', 5);
      });
    });
    
    // 连接桩鼠标离开事件 - 隐藏连接桩
    graph.value.on('node:mouseleave', ({ node }) => {
      const ports = node.getPorts();
      ports.forEach(port => {
        node.setPortProp(port.id, 'attrs/circle/style/visibility', 'hidden');
        node.setPortProp(port.id, 'attrs/circle/stroke', '#31d0c6');
        node.setPortProp(port.id, 'attrs/circle/strokeWidth', 2);
        node.setPortProp(port.id, 'attrs/circle/r', 4);
      });
    });
    
    // 连接开始时显示所有相关连接桩
    graph.value.on('edge:connecting', ({ edge }) => {
      const nodes = graph.value.getNodes();
      nodes.forEach(node => {
        const ports = node.getPorts();
        ports.forEach(port => {
          node.setPortProp(port.id, 'attrs/circle/style/visibility', 'visible');
        });
      });
    });
    
    // 连接结束时隐藏连接桩并记录连接
    graph.value.on('edge:connected', ({ edge }) => {
      console.log('连线创建:', edge.id);
      
      // 隐藏所有连接桩
      const nodes = graph.value.getNodes();
      nodes.forEach(node => {
        const ports = node.getPorts();
        ports.forEach(port => {
          node.setPortProp(port.id, 'attrs/circle/style/visibility', 'hidden');
        });
      });
    });
};

onMounted(() => {
  // 初始化事件监听
  initEvents();
});

onUnmounted(() => {
  // 组件卸载时的清理工作会由各个 composable 自动处理
});
</script>

<style scoped>
.xflow-example {
  display: flex;
  height: 100vh;
  background: #f0f2f5;
  overflow: hidden;
  position: relative;
}

/* 节点面板样式 */
.node-panel {
  width: 240px;
  background: #fff;
  border-right: 1px solid #d9d9d9;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.06);
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.panel-header h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.panel-subtitle {
  font-size: 12px;
  color: #8c8c8c;
}

.node-list {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.node-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  cursor: grab;
  transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
  background: #fafafa;
}

.node-item:hover {
  border-color: #1890ff;
  background: #f0f8ff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
}

.node-item:active {
  cursor: grabbing;
  transform: translateY(0);
}

.node-preview {
  margin-bottom: 8px;
  transition: transform 0.2s;
}

.node-item:hover .node-preview {
  transform: scale(1.05);
}

.node-text {
  font-size: 10px;
  color: inherit;
  font-weight: 500;
}

.node-label {
  font-size: 12px;
  color: #595959;
  font-weight: 500;
  text-align: center;
}

/* 主内容区域 */
.xflow-main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
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
  min-height: 0;
  position: relative;
}

.drag-hint {
  color: #1890ff;
  font-weight: 500;
}

/* 拖拽时的样式 */
.node-item.dragging {
  opacity: 0.5;
  transform: rotate(5deg);
}

/* 连接桩样式 */
:deep(.x6-port-body) {
  transition: all 0.2s ease-in-out;
}

:deep(.x6-port-body:hover) {
  transform: scale(1.2);
  filter: drop-shadow(0 0 4px rgba(49, 208, 198, 0.6));
}

:deep(.x6-port) {
  cursor: crosshair;
}

/* 连线时的视觉反馈 */
:deep(.x6-edge-tool-button) {
  fill: #31d0c6;
}

:deep(.x6-edge:hover .x6-edge-path) {
  stroke: #31d0c6;
  stroke-width: 2;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .node-panel {
    width: 200px;
  }
  
  .panel-header {
    padding: 12px;
  }
  
  .node-list {
    padding: 12px;
  }
  
  .node-item {
    padding: 8px;
    margin-bottom: 8px;
  }
}

@media (max-width: 768px) {
  .xflow-example {
    flex-direction: column;
  }
  
  .node-panel {
    width: 100%;
    height: 120px;
    border-right: none;
    border-bottom: 1px solid #d9d9d9;
  }
  
  .node-list {
    display: flex;
    flex-direction: row;
    gap: 8px;
    padding: 8px 16px;
    overflow-x: auto;
  }
  
  .node-item {
    min-width: 80px;
    margin-bottom: 0;
  }
}
</style>