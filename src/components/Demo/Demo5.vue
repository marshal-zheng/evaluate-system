<template>
  <div class="demo5-container">
    <h2>Demo 5 - 对齐吸附与框选多选</h2>
    
    <!-- 控制面板 -->
    <div class="control-panel">
      <el-row :gutter="16">
        <el-col :span="8">
          <div class="control-group">
            <h4>对齐吸附</h4>
            <el-space direction="vertical" size="small">
              <el-switch 
                v-model="snaplineEnabled" 
                active-text="启用对齐线" 
                @change="updateSnapline"
              />
              <div v-if="snaplineEnabled">
                <span>容差:</span>
                <el-slider 
                  v-model="snaplineTolerance" 
                  :min="5" 
                  :max="20" 
                  :step="1"
                  style="width: 120px; margin-left: 8px;"
                  @change="updateSnapline"
                />
                <span style="margin-left: 8px;">{{ snaplineTolerance }}px</span>
              </div>
              <el-switch 
                v-model="snaplineSharp" 
                active-text="锐化对齐线" 
                :disabled="!snaplineEnabled"
                @change="updateSnapline"
              />
            </el-space>
          </div>
        </el-col>
        
        <el-col :span="8">
          <div class="control-group">
            <h4>交互模式</h4>
            <el-space direction="vertical" size="small">
              <el-radio-group v-model="interactionMode" @change="updateInteractionMode">
                <el-radio label="pan">画布拖拽模式</el-radio>
                <el-radio label="select">框选模式</el-radio>
              </el-radio-group>
              <div v-if="interactionMode === 'select'">
                <el-switch 
                  v-model="multipleSelection" 
                  active-text="多选模式" 
                  @change="updateSelection"
                />
                <br style="margin: 8px 0;" />
                <el-switch 
                  v-model="strictSelection" 
                  active-text="严格模式" 
                  @change="updateSelection"
                />
              </div>
              <div v-if="interactionMode === 'pan'" class="mode-tip">
                <el-text type="info" size="small">左键可拖拽画布</el-text>
              </div>
              <div v-if="interactionMode === 'select'" class="mode-tip">
                <el-text type="warning" size="small">左键拖拽进行框选</el-text>
              </div>
            </el-space>
          </div>
        </el-col>
        
        <el-col :span="8">
          <div class="control-group">
            <h4>选择操作</h4>
            <el-space direction="vertical" size="small">
              <el-button-group size="small">
                <el-button @click="selectAll" :icon="Select">全选</el-button>
                <el-button @click="clearSelection" :icon="Close">清选</el-button>
              </el-button-group>
              <el-button-group size="small">
                <el-button @click="alignLeft" :disabled="selectedCells.length < 2">左对齐</el-button>
                <el-button @click="alignCenter" :disabled="selectedCells.length < 2">居中</el-button>
                <el-button @click="alignRight" :disabled="selectedCells.length < 2">右对齐</el-button>
              </el-button-group>
              <el-button-group size="small">
                <el-button @click="alignTop" :disabled="selectedCells.length < 2" :icon="Top">顶对齐</el-button>
                <el-button @click="alignMiddle" :disabled="selectedCells.length < 2" :icon="Minus">中对齐</el-button>
                <el-button @click="alignBottom" :disabled="selectedCells.length < 2" :icon="Bottom">底对齐</el-button>
              </el-button-group>
              <el-button-group size="small">
                <el-button @click="distributeHorizontally" :disabled="selectedCells.length < 3" :icon="Remove">水平分布</el-button>
                <el-button @click="distributeVertically" :disabled="selectedCells.length < 3" :icon="Minus">垂直分布</el-button>
              </el-button-group>
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
          :pannable="interactionMode === 'pan'"
          :scroller="false"
          @ready="onGraphReady"
        >
          <!-- 插件 -->
          <XFlowSnapline 
            :enabled="snaplineEnabled"
            :tolerance="snaplineTolerance"
            :sharp="snaplineSharp"
          />
          
          <!-- 背景和网格 -->
          <XFlowBackground color="#fafafa" />
          <XFlowGrid :size="20" type="dot" />
        </XFlowGraph>
      </XFlow>
    </div>

    <!-- 状态信息 -->
    <div class="status-bar">
      <el-space>
        <span>总节点: {{ nodeCount }}</span>
        <span>已选中: {{ selectedCells.length }}</span>
        <span v-if="selectedCells.length > 0">
          选中节点: {{ selectedCells.map(cell => cell.getLabel()).join(', ') }}
        </span>
        <el-button size="small" @click="addTestNodes" :icon="Plus">添加测试节点</el-button>
        <el-button size="small" @click="resetLayout" :icon="Refresh">重置布局</el-button>
        <el-button size="small" @click="clearCanvas" :icon="Delete" type="danger">清空画布</el-button>
      </el-space>
    </div>

    <!-- 操作提示 -->
    <div class="tips">
      <el-alert 
        title="操作提示" 
        type="info" 
        :closable="false"
        show-icon
      >
        <div>
          <p><strong>交互模式：</strong></p>
          <ul>
            <li><strong>画布拖拽模式</strong>：左键可拖拽画布，点击节点进行单选</li>
            <li><strong>框选模式</strong>：左键拖拽进行框选，画布不可拖拽</li>
            <li><strong>空格 + 拖拽</strong>：任何模式下按住空格键都可临时拖拽画布</li>
            <li><strong>Cmd + 点击</strong>：多选节点（Mac 标准操作）</li>
          </ul>
          <p><strong>快捷键（企业级标准）：</strong></p>
          <ul>
            <li><strong>Cmd+A</strong>：全选 | <strong>Cmd+Z</strong>：撤销 | <strong>Cmd+Shift+Z</strong>：重做</li>
            <li><strong>Cmd+C</strong>：复制 | <strong>Cmd+V</strong>：粘贴 | <strong>Delete</strong>：删除</li>
            <li><strong>Cmd+0</strong>：适应画布 | <strong>Cmd+1</strong>：实际大小</li>
          </ul>
          <p><strong>对齐吸附：</strong></p>
          <ul>
            <li>拖拽节点时会显示绿色对齐线，帮助精确定位</li>
            <li>调整容差值控制对齐的敏感度（5-20px）</li>
            <li>选中多个节点后可使用对齐和分布功能</li>
          </ul>
        </div>
      </el-alert>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { 
  Plus, 
  Delete,
  Refresh,
  Select,
  Close,
  Top,
  Minus,
  Bottom,
  Remove
} from '@element-plus/icons-vue';

// 导入组件
import {
  XFlow,
  XFlowGraph,
  XFlowSnapline,
  XFlowBackground,
  XFlowGrid,
} from '../xflow-vue/src/components/index.js';

// 导入插件
import { Selection } from '@antv/x6-plugin-selection';

// 导入注册函数
import { registerBasicShapes } from '../xflow-vue/src/shapes/register.js';

// 导入组合式函数
import { useClipboard, useHistory } from '../xflow-vue/src/composables/index.js';

// 响应式数据
const graphRef = ref(null);
const selectedCells = ref([]);

// 对齐吸附相关
const snaplineEnabled = ref(true);
const snaplineTolerance = ref(10);
const snaplineSharp = ref(false);

// 交互模式
const interactionMode = ref('pan'); // 'pan' | 'select'

// 框选相关
const multipleSelection = ref(true);
const strictSelection = ref(false);

// 空格键状态
const spacePressed = ref(false);

// Graph 实例
let graph = null;

// 计算属性
const nodeCount = computed(() => {
  return graph ? graph.getCells().filter(cell => cell.isNode()).length : 0;
});

// 图形准备就绪回调
const onGraphReady = (g, keyboardMgr) => {
  graph = g;
  
  // 使用新的键盘管理器
  if (keyboardMgr) {
    // 设置剪贴板处理器
    const clipboardActions = useClipboard(g);
    keyboardMgr.setClipboardHandler((action) => {
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
    
    // 设置历史处理器
    const historyActions = useHistory(g);
    keyboardMgr.setHistoryHandler((action) => {
      switch (action) {
        case 'undo':
          historyActions.undo();
          break;
        case 'redo':
          historyActions.redo();
          break;
      }
    });
    
    // 设置初始交互模式
    keyboardMgr.setInteractionMode(interactionMode.value);
    
    // 保存引用以便后续使用
    window.__demo5_keyboard_manager__ = keyboardMgr;
  }
  
  setupGraphEvents();
  createInitialNodes();
};

// 设置图形事件
const setupGraphEvents = () => {
  if (!graph) return;
  
  // 监听选择变化
  graph.on('selection:changed', ({ selected }) => {
    selectedCells.value = selected;
  });
  
  // 监听节点移动完成（用于演示对齐效果）
  graph.on('node:moved', ({ node }) => {
    console.log(`节点 ${node.getLabel()} 移动到:`, node.position());
  });
  
  // 键盘事件现在由 KeyboardManager 统一管理
};

// 创建初始节点
const createInitialNodes = () => {
  const nodes = [
    { x: 100, y: 100, label: 'A', shape: 'rect-node', color: '#1890ff' },
    { x: 250, y: 150, label: 'B', shape: 'circle-node', color: '#52c41a' },
    { x: 400, y: 200, label: 'C', shape: 'diamond-node', color: '#faad14' },
    { x: 150, y: 300, label: 'D', shape: 'rect-node', color: '#f5222d' },
    { x: 300, y: 350, label: 'E', shape: 'circle-node', color: '#722ed1' },
    { x: 450, y: 120, label: 'F', shape: 'rect-node', color: '#fa8c16' },
  ];
  
  nodes.forEach(nodeData => {
    graph.addNode({
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
  });
};

// 更新对齐线设置
const updateSnapline = () => {
  // 对齐线的设置通过 XFlowSnapline 组件的 props 控制
  console.log('Snapline settings updated:', {
    enabled: snaplineEnabled.value,
    tolerance: snaplineTolerance.value,
    sharp: snaplineSharp.value
  });
};

// 更新交互模式
const updateInteractionMode = () => {
  const keyboardMgr = window.__demo5_keyboard_manager__;
  if (keyboardMgr) {
    // 使用键盘管理器来切换模式，它会正确处理Selection插件
    keyboardMgr.setInteractionMode(interactionMode.value);
  } else {
    // 降级处理：直接操作 graph
    if (!graph) return;
    
    if (interactionMode.value === 'pan') {
      graph.enablePanning();
      updateSelectionPlugin({ rubberband: false });
    } else {
      graph.disablePanning();
      updateSelectionPlugin({ rubberband: true });
    }
  }
  
  console.log('Interaction mode updated:', interactionMode.value);
};

// 辅助方法：更新选择插件
const updateSelectionPlugin = (options) => {
  if (!graph) return;
  
  if (graph.getPlugin('selection')) {
    graph.disposePlugins('selection');
  }
  
  graph.use(
    new Selection({
      enabled: true,
      multiple: multipleSelection.value,
      strict: strictSelection.value,
      showNodeSelectionBox: true,
      showEdgeSelectionBox: true,
      modifiers: ['meta', 'ctrl'], // 支持 Cmd/Ctrl 修饰键
      ...options,
    })
  );
};

// 更新选择设置
const updateSelection = () => {
  const keyboardMgr = window.__demo5_keyboard_manager__;
  if (keyboardMgr && interactionMode.value === 'select') {
    // 通过键盘管理器更新选择插件配置
    keyboardMgr.updateSelectionPlugin({
      enabled: true,
      multiple: multipleSelection.value,
      rubberband: true,
      strict: strictSelection.value,
      showNodeSelectionBox: true,
      showEdgeSelectionBox: true,
      modifiers: ['meta', 'ctrl'],
    });
  } else if (!keyboardMgr && graph && interactionMode.value === 'select') {
    // 降级处理：直接操作 graph
    if (graph.getPlugin('selection')) {
      graph.disposePlugins('selection');
    }
    
    graph.use(
      new Selection({
        enabled: true,
        multiple: multipleSelection.value,
        rubberband: true,
        strict: strictSelection.value,
        showNodeSelectionBox: true,
        showEdgeSelectionBox: true,
        modifiers: ['meta', 'ctrl'],
      })
    );
  }
  
  console.log('Selection settings updated:', {
    multiple: multipleSelection.value,
    strict: strictSelection.value
  });
};

// 选择操作
const selectAll = () => {
  if (graph) {
    graph.selectAll();
  }
};

const clearSelection = () => {
  if (graph) {
    graph.cleanSelection();
  }
};

// 对齐操作
const alignLeft = () => {
  if (!graph || selectedCells.value.length < 2) return;
  
  const nodes = selectedCells.value.filter(cell => cell.isNode());
  if (nodes.length < 2) return;
  
  const leftmost = Math.min(...nodes.map(node => node.position().x));
  nodes.forEach(node => {
    node.position(leftmost, node.position().y);
  });
};

const alignCenter = () => {
  if (!graph || selectedCells.value.length < 2) return;
  
  const nodes = selectedCells.value.filter(cell => cell.isNode());
  if (nodes.length < 2) return;
  
  const positions = nodes.map(node => ({
    node,
    x: node.position().x,
    width: node.size().width
  }));
  
  const leftmost = Math.min(...positions.map(p => p.x));
  const rightmost = Math.max(...positions.map(p => p.x + p.width));
  const centerX = (leftmost + rightmost) / 2;
  
  nodes.forEach(node => {
    const nodeWidth = node.size().width;
    node.position(centerX - nodeWidth / 2, node.position().y);
  });
};

const alignRight = () => {
  if (!graph || selectedCells.value.length < 2) return;
  
  const nodes = selectedCells.value.filter(cell => cell.isNode());
  if (nodes.length < 2) return;
  
  const rightmost = Math.max(...nodes.map(node => node.position().x + node.size().width));
  nodes.forEach(node => {
    node.position(rightmost - node.size().width, node.position().y);
  });
};

const alignTop = () => {
  if (!graph || selectedCells.value.length < 2) return;
  
  const nodes = selectedCells.value.filter(cell => cell.isNode());
  if (nodes.length < 2) return;
  
  const topmost = Math.min(...nodes.map(node => node.position().y));
  nodes.forEach(node => {
    node.position(node.position().x, topmost);
  });
};

const alignMiddle = () => {
  if (!graph || selectedCells.value.length < 2) return;
  
  const nodes = selectedCells.value.filter(cell => cell.isNode());
  if (nodes.length < 2) return;
  
  const positions = nodes.map(node => ({
    node,
    y: node.position().y,
    height: node.size().height
  }));
  
  const topmost = Math.min(...positions.map(p => p.y));
  const bottommost = Math.max(...positions.map(p => p.y + p.height));
  const centerY = (topmost + bottommost) / 2;
  
  nodes.forEach(node => {
    const nodeHeight = node.size().height;
    node.position(node.position().x, centerY - nodeHeight / 2);
  });
};

const alignBottom = () => {
  if (!graph || selectedCells.value.length < 2) return;
  
  const nodes = selectedCells.value.filter(cell => cell.isNode());
  if (nodes.length < 2) return;
  
  const bottommost = Math.max(...nodes.map(node => node.position().y + node.size().height));
  nodes.forEach(node => {
    node.position(node.position().x, bottommost - node.size().height);
  });
};

// 分布操作
const distributeHorizontally = () => {
  if (!graph || selectedCells.value.length < 3) return;
  
  const nodes = selectedCells.value.filter(cell => cell.isNode());
  if (nodes.length < 3) return;
  
  // 按 x 坐标排序
  nodes.sort((a, b) => a.position().x - b.position().x);
  
  const leftmost = nodes[0].position().x;
  const rightmost = nodes[nodes.length - 1].position().x + nodes[nodes.length - 1].size().width;
  const totalWidth = rightmost - leftmost;
  const spacing = totalWidth / (nodes.length - 1);
  
  nodes.forEach((node, index) => {
    if (index > 0 && index < nodes.length - 1) {
      const newX = leftmost + spacing * index - node.size().width / 2;
      node.position(newX, node.position().y);
    }
  });
};

const distributeVertically = () => {
  if (!graph || selectedCells.value.length < 3) return;
  
  const nodes = selectedCells.value.filter(cell => cell.isNode());
  if (nodes.length < 3) return;
  
  // 按 y 坐标排序
  nodes.sort((a, b) => a.position().y - b.position().y);
  
  const topmost = nodes[0].position().y;
  const bottommost = nodes[nodes.length - 1].position().y + nodes[nodes.length - 1].size().height;
  const totalHeight = bottommost - topmost;
  const spacing = totalHeight / (nodes.length - 1);
  
  nodes.forEach((node, index) => {
    if (index > 0 && index < nodes.length - 1) {
      const newY = topmost + spacing * index - node.size().height / 2;
      node.position(node.position().x, newY);
    }
  });
};

// 添加测试节点
const addTestNodes = () => {
  if (!graph) return;
  
  const shapes = ['rect-node', 'circle-node', 'diamond-node'];
  const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'];
  
  for (let i = 0; i < 3; i++) {
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const label = String.fromCharCode(65 + nodeCount.value + i); // A, B, C...
    
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

// 重置布局
const resetLayout = () => {
  if (!graph) return;
  
  graph.clearCells();
  nextTick(() => {
    createInitialNodes();
  });
};

// 清空画布
const clearCanvas = () => {
  if (graph && confirm('确定要清空画布吗？')) {
    graph.clearCells();
  }
};

onMounted(() => {
  registerBasicShapes();
});
</script>

<style scoped>
.demo5-container {
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

.mode-tip {
  margin-top: 8px;
  padding: 4px 8px;
  background: #f0f9ff;
  border-radius: 4px;
  border: 1px solid #e6f7ff;
}

/* 深度选择器 - 自定义选择框样式 */
:deep(.x6-widget-selection) {
  pointer-events: none;
}

:deep(.x6-widget-selection-box) {
  fill: rgba(24, 144, 255, 0.1);
  stroke: #1890ff;
  stroke-width: 2;
  stroke-dasharray: 5,5;
}

:deep(.x6-widget-selection-inner) {
  fill: none;
  stroke: #1890ff;
  stroke-width: 1;
}

/* 对齐线样式 */
:deep(.x6-widget-snapline) {
  opacity: 0.8;
}

:deep(.x6-widget-snapline-horizontal) {
  stroke: #52c41a;
  stroke-width: 1;
  stroke-dasharray: 5,5;
}

:deep(.x6-widget-snapline-vertical) {
  stroke: #52c41a;
  stroke-width: 1;
  stroke-dasharray: 5,5;
}
</style>
