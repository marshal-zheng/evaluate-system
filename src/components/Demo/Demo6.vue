<template>
  <div class="demo6-container">
    <h2>Demo 6 - 内置标准交互功能测试</h2>
    
    <!-- 功能说明 -->
    <div class="feature-info">
      <el-alert 
        title="内置标准交互功能" 
        type="success" 
        :closable="false"
        show-icon
      >
        <div>
          <p><strong>🎯 本Demo展示了内置到XFlowGraph组件中的企业级标准交互功能：</strong></p>
          <ul>
            <li><strong>右键菜单</strong>：空白区域、节点、边的标准右键菜单</li>
            <li><strong>企业级快捷键</strong>：自动适配Mac/Windows的标准快捷键</li>
            <li><strong>标准选择交互</strong>：单选、多选(Cmd/Ctrl+点击)、框选(Shift+拖拽)</li>
            <li><strong>双击适应画布</strong>：双击空白区域自动适应内容</li>
            <li><strong>设备自适应</strong>：自动检测设备类型并适配交互方式</li>
          </ul>
        </div>
      </el-alert>
    </div>

    <!-- 控制面板 -->
    <div class="control-panel">
      <el-row :gutter="16">
        <el-col :span="12">
          <div class="control-group">
            <h4>标准交互控制</h4>
            <el-space direction="vertical" size="small">
              <el-switch 
                v-model="enableStandardInteractions" 
                active-text="启用标准交互" 
                @change="recreateGraph"
              />
              <el-switch 
                v-model="enableContextMenu" 
                active-text="启用右键菜单" 
                :disabled="!enableStandardInteractions"
                @change="recreateGraph"
              />
              <el-switch 
                v-model="enableDoubleClickFit" 
                active-text="双击适应画布" 
                :disabled="!enableStandardInteractions"
                @change="recreateGraph"
              />
            </el-space>
          </div>
        </el-col>
        
        <el-col :span="12">
          <div class="control-group">
            <h4>设备信息</h4>
            <el-space direction="vertical" size="small">
              <span>操作系统: {{ deviceInfo.isMacOs ? 'macOS' : 'Windows/Linux' }}</span>
              <span>触控设备: {{ deviceInfo.isTouchDevice ? '是' : '否' }}</span>
              <span>控制键: {{ deviceInfo.controlKeyCode }}</span>
              <span>移动设备: {{ deviceInfo.isMobileDevice ? '是' : '否' }}</span>
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
          :zoomable="true"
          :pannable="true"
          :scroller="false"
          :enable-standard-interactions="enableStandardInteractions"
          :enable-context-menu="enableContextMenu"
          :enable-double-click-fit="enableDoubleClickFit"
          @ready="onGraphReady"
        >
          <!-- 插件 -->
          <XFlowHistory />
          <XFlowClipboard />
          <XFlowSnapline />
          
          <!-- 背景和网格 -->
          <XFlowBackground color="#fafafa" />
          <XFlowGrid :size="20" type="dot" />
        </XFlowGraph>
      </XFlow>
    </div>

    <!-- 状态信息 -->
    <div class="status-bar">
      <el-space>
        <span>节点数量: {{ nodeCount }}</span>
        <span>已选中: {{ selectedCount }}</span>
        <el-button size="small" @click="addTestNodes" :icon="Plus">添加测试节点</el-button>
        <el-button size="small" @click="clearCanvas" :icon="Delete" type="danger">清空画布</el-button>
      </el-space>
    </div>

    <!-- 操作提示 -->
    <div class="tips">
      <el-alert 
        title="标准交互操作指南" 
        type="info" 
        :closable="false"
        show-icon
      >
        <div>
          <p><strong>🎮 快捷键操作（自动适配设备）：</strong></p>
          <ul>
            <li><strong>{{ deviceInfo.isMacOs ? 'Cmd' : 'Ctrl' }}+A</strong>：全选</li>
            <li><strong>{{ deviceInfo.isMacOs ? 'Cmd' : 'Ctrl' }}+C</strong>：复制</li>
            <li><strong>{{ deviceInfo.isMacOs ? 'Cmd' : 'Ctrl' }}+V</strong>：粘贴</li>
            <li><strong>{{ deviceInfo.isMacOs ? 'Cmd' : 'Ctrl' }}+Z</strong>：撤销</li>
            <li><strong>{{ deviceInfo.isMacOs ? 'Cmd+Shift+Z' : 'Ctrl+Y' }}</strong>：重做</li>
            <li><strong>Delete/Backspace</strong>：删除选中</li>
            <li><strong>{{ deviceInfo.isMacOs ? 'Cmd' : 'Ctrl' }}+0</strong>：适应画布</li>
            <li><strong>{{ deviceInfo.isMacOs ? 'Cmd' : 'Ctrl' }}+1</strong>：实际大小</li>
          </ul>
          <p><strong>🖱️ 鼠标操作：</strong></p>
          <ul>
            <li><strong>右键</strong>：打开上下文菜单（空白/节点/边不同菜单）</li>
            <li><strong>{{ deviceInfo.isMacOs ? 'Cmd' : 'Ctrl' }} + 点击</strong>：多选节点</li>
            <li><strong>双击空白</strong>：适应画布内容</li>
            <li><strong>空格 + 拖拽</strong>：临时拖拽画布</li>
          </ul>
        </div>
      </el-alert>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { Plus, Delete } from '@element-plus/icons-vue';

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

// 导入组合式函数
import { useDeviceSupport, useClipboard, useHistory } from '../xflow-vue/src/composables/index.js';

// 导入注册函数
import { registerBasicShapes } from '../xflow-vue/src/shapes/register.js';

// 设备支持检测
const deviceInfo = useDeviceSupport();

// 响应式数据
const graphRef = ref(null);
const enableStandardInteractions = ref(true);
const enableContextMenu = ref(true);
const enableDoubleClickFit = ref(true);

// Graph 实例和相关
let graph = null;
let standardInteractions = null;
let keyboardManager = null;

// 计算属性
const nodeCount = computed(() => {
  return graph ? graph.getCells().filter(cell => cell.isNode()).length : 0;
});

const selectedCount = computed(() => {
  return standardInteractions?.selectedCells?.length || 0;
});

// 图形准备就绪回调
const onGraphReady = (g, keyboardMgr, standardInter) => {
  graph = g;
  keyboardManager = keyboardMgr;
  standardInteractions = standardInter;
  
  // 设置剪贴板和历史处理器
  if (standardInteractions && keyboardManager) {
    const clipboardActions = useClipboard(g);
    const historyActions = useHistory(g);
    
    // 为键盘管理器设置处理器
    keyboardManager.setClipboardHandler((action) => {
      switch (action) {
        case 'copy':
          clipboardActions.copy();
          break;
        case 'paste':
          clipboardActions.paste();
          break;
        case 'cut':
          clipboardActions.cut();
          break;
      }
    });
    
    keyboardManager.setHistoryHandler((action) => {
      switch (action) {
        case 'undo':
          historyActions.undo();
          break;
        case 'redo':
          historyActions.redo();
          break;
      }
    });
    
    // 为标准交互设置处理器
    standardInteractions.setupHandlers(clipboardActions, historyActions);
  }
  
  createInitialNodes();
};

// 创建初始节点
const createInitialNodes = () => {
  if (!graph) return;
  
  const nodes = [
    { x: 100, y: 100, label: '节点A', shape: 'rect-node', color: '#1890ff' },
    { x: 300, y: 150, label: '节点B', shape: 'circle-node', color: '#52c41a' },
    { x: 500, y: 100, label: '节点C', shape: 'diamond-node', color: '#faad14' },
    { x: 200, y: 300, label: '节点D', shape: 'rect-node', color: '#f5222d' },
    { x: 400, y: 350, label: '节点E', shape: 'circle-node', color: '#722ed1' },
  ];
  
  nodes.forEach(nodeData => {
    const node = graph.addNode({
      shape: nodeData.shape,
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
    if (nodeData.label !== '节点A') {
      const prevNode = graph.getCells().find(cell => 
        cell.isNode() && cell.getLabel() === '节点A'
      );
      if (prevNode) {
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

// 添加测试节点
const addTestNodes = () => {
  if (!graph) return;
  
  const shapes = ['rect-node', 'circle-node', 'diamond-node'];
  const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'];
  
  for (let i = 0; i < 2; i++) {
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const label = `测试${Date.now() % 1000}`;
    
    graph.addNode({
      shape,
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100,
      label,
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

// 重新创建图形（当配置改变时）
const recreateGraph = () => {
  // 由于组件的响应式特性，配置改变会自动重新创建图形
  console.log('Graph configuration changed:', {
    enableStandardInteractions: enableStandardInteractions.value,
    enableContextMenu: enableContextMenu.value,
    enableDoubleClickFit: enableDoubleClickFit.value,
  });
};

onMounted(() => {
  registerBasicShapes();
});
</script>

<style scoped>
.demo6-container {
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin: 10px 0;
  background-color: #f9f9f9;
}

.feature-info {
  margin-bottom: 16px;
}

.feature-info ul {
  margin: 8px 0;
  padding-left: 20px;
}

.feature-info li {
  margin: 4px 0;
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

.tips {
  margin-top: 16px;
}

.tips ul {
  margin: 8px 0;
  padding-left: 20px;
}

.tips li {
  margin: 4px 0;
}

/* 右键菜单样式增强 */
:deep(.xflow-context-menu) {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 选择框样式 */
:deep(.x6-widget-selection-box) {
  fill: rgba(24, 144, 255, 0.1);
  stroke: #1890ff;
  stroke-width: 2;
  stroke-dasharray: 5,5;
}
</style>
