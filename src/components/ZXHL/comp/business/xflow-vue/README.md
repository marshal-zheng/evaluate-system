# XFlow Vue 3

基于 X6 图编辑引擎的 Vue 3 组件库，从 @antv/xflow React 版本完整转换而来。

## 特性

- 🚀 **Vue 3 + Composition API**: 使用最新的 Vue 3 语法和 setup 语法糖
- 🎯 **TypeScript 友好**: 虽然项目使用 JS，但保持了良好的类型提示
- 📦 **组件化设计**: 模块化的组件设计，按需使用
- 🔧 **丰富的功能**: 包含图编辑、缩放、小地图、对齐线等完整功能
- 🎨 **主题定制**: 支持样式定制和暗色主题
- 📱 **响应式**: 支持移动端适配

## 安装

```bash
# 项目已包含所有必要依赖
yarn install
```

## 核心依赖

- `@antv/x6`: 图编辑引擎核心
- `@antv/x6-plugin-*`: X6 官方插件（剪贴板、历史记录、小地图等）
- `@antv/x6-vue3-shape`: Vue 3 节点渲染支持
- `pinia`: 状态管理
- `immer`: 不可变数据处理

## 快速开始

### 基本使用

```vue
<template>
  <div style="width: 100%; height: 600px;">
    <XFlow>
      <XFlowGraph
        :zoomable="true"
        :pannable="true"
        :fit-view="true"
      >
        <!-- 网格 -->
        <Grid :enabled="true" />
        
        <!-- 小地图 -->
        <Minimap :enabled="true" />
        
        <!-- 控制面板 -->
        <Control :items="['zoomIn', 'zoomOut', 'zoomToFit']" />
        
        <!-- 历史记录 -->
        <History :enabled="true" />
        
        <!-- 剪贴板 -->
        <Clipboard :enabled="true" />
      </XFlowGraph>
    </XFlow>
  </div>
</template>

<script setup>
import {
  XFlow,
  XFlowGraph,
  Grid,
  Minimap,
  Control,
  History,
  Clipboard,
  useGraphInstance,
  useGraphStore
} from './xflow-vue';

const graph = useGraphInstance();
const { addNodes, addEdges } = useGraphStore();

// 添加节点
const addNode = () => {
  const node = {
    id: 'node1',
    shape: 'rect',
    x: 100,
    y: 100,
    width: 80,
    height: 40,
    attrs: {
      body: { fill: '#f5f5f5', stroke: '#d9d9d9' },
      text: { text: '节点', fill: '#262626' }
    }
  };
  
  addNodes([node]);
  graph.value?.addNode(node);
};
</script>
```

## 组件 API

### XFlow

根容器组件，提供图实例上下文。

**Props**: 无

**示例**:
```vue
<XFlow>
  <!-- 子组件 -->
</XFlow>
```

### XFlowGraph

图画布组件，核心的图编辑器。

**Props**:
- `readonly` (Boolean): 是否只读模式
- `zoomable` (Boolean): 是否允许缩放
- `pannable` (Boolean): 是否允许平移
- `scroller` (Boolean): 是否启用滚动
- `fitView` (Boolean): 是否自适应视图
- `centerView` (Boolean): 是否居中视图
- `minScale` (Number): 最小缩放比例，默认 0.01
- `maxScale` (Number): 最大缩放比例，默认 16

**示例**:
```vue
<XFlowGraph
  :readonly="false"
  :zoomable="true"
  :pannable="true"
  :fit-view="true"
  :min-scale="0.1"
  :max-scale="2"
/>
```

### Grid

网格组件，为画布添加网格背景。

**Props**:
- `enabled` (Boolean): 是否启用网格
- `size` (Number): 网格大小，默认 10
- `visible` (Boolean): 是否可见
- `type` (String): 网格类型，'dot' | 'mesh'
- `color` (String): 网格颜色

**示例**:
```vue
<Grid
  :enabled="true"
  :size="20"
  type="dot"
  color="#e5e5e5"
/>
```

### Minimap

小地图组件，提供画布缩略图导航。

**Props**:
- `enabled` (Boolean): 是否启用
- `width` (Number): 宽度，默认 200
- `height` (Number): 高度，默认 120
- `scalable` (Boolean): 是否可缩放

**示例**:
```vue
<Minimap
  :enabled="true"
  :width="200"
  :height="120"
  :scalable="true"
/>
```

### Control

控制面板组件，提供缩放等操作按钮。

**Props**:
- `items` (Array): 控制项列表
- `direction` (String): 布局方向，'horizontal' | 'vertical'
- `placement` (String): 工具提示位置

**可用的控制项**:
- `zoomIn`: 放大
- `zoomOut`: 缩小
- `zoomToFit`: 适应窗口
- `zoomToOrigin`: 重置缩放
- `zoomTo`: 缩放到指定比例

**示例**:
```vue
<Control
  :items="['zoomIn', 'zoomOut', 'zoomToFit', 'zoomTo']"
  direction="horizontal"
  placement="top"
/>
```

### History

历史记录组件，提供撤销/重做功能。

**Props**:
- `enabled` (Boolean): 是否启用
- `stackSize` (Number): 历史记录栈大小，默认 50

**示例**:
```vue
<History :enabled="true" :stack-size="100" />
```

### Clipboard

剪贴板组件，提供复制/粘贴功能。

**Props**:
- `enabled` (Boolean): 是否启用
- `useLocalStorage` (Boolean): 是否使用本地存储

**示例**:
```vue
<Clipboard :enabled="true" :use-local-storage="false" />
```

### Snapline

对齐线组件，提供元素对齐辅助线。

**Props**:
- `enabled` (Boolean): 是否启用
- `tolerance` (Number): 对齐容差，默认 10

**示例**:
```vue
<Snapline :enabled="true" :tolerance="10" />
```

### Transform

变换组件，提供元素缩放和旋转功能。

**Props**:
- `enabled` (Boolean): 是否启用
- `resizing` (Boolean): 是否允许缩放
- `rotating` (Boolean): 是否允许旋转

**示例**:
```vue
<Transform
  :enabled="true"
  :resizing="true"
  :rotating="true"
/>
```

## Composables API

### useGraphInstance

获取图实例。

```js
import { useGraphInstance } from './xflow-vue';

const graph = useGraphInstance();

// 使用图实例
graph.value?.addNode({ ... });
```

### useGraphStore

获取图数据状态管理。

```js
import { useGraphStore } from './xflow-vue';

const {
  nodes,
  edges,
  addNodes,
  addEdges,
  removeNodes,
  removeEdges,
  updateNode,
  updateEdge
} = useGraphStore();

// 添加节点
addNodes([{ id: 'node1', ... }]);
```

### useGraphEvent

图事件处理。

```js
import { useGraphEvent } from './xflow-vue';

const { addEventListener, removeEventListener } = useGraphEvent();

// 监听节点点击
addEventListener('node:click', ({ node }) => {
  console.log('节点被点击:', node.id);
});
```

### useClipboard

剪贴板功能。

```js
import { useClipboard } from './xflow-vue';

const { copy, cut, paste, isEmpty } = useClipboard();

// 复制选中元素
copy();

// 粘贴
paste();
```

### useHistory

历史记录功能。

```js
import { useHistory } from './xflow-vue';

const { undo, redo, canUndo, canRedo } = useHistory();

// 撤销
if (canUndo.value) {
  undo();
}

// 重做
if (canRedo.value) {
  redo();
}
```

### useExport

导出功能。

```js
import { useExport } from './xflow-vue';

const { exportPNG, exportSVG, exportJPEG } = useExport();

// 导出 PNG
const dataUri = await exportPNG('graph.png');

// 导出 SVG
const svgString = await exportSVG('graph.svg');
```

## 事件系统

### 节点事件
- `node:click` - 节点点击
- `node:dblclick` - 节点双击
- `node:mouseenter` - 鼠标进入节点
- `node:mouseleave` - 鼠标离开节点
- `node:contextmenu` - 节点右键菜单

### 边事件
- `edge:click` - 边点击
- `edge:dblclick` - 边双击
- `edge:mouseenter` - 鼠标进入边
- `edge:mouseleave` - 鼠标离开边

### 画布事件
- `blank:click` - 空白区域点击
- `blank:contextmenu` - 空白区域右键菜单

### 选择事件
- `selection:changed` - 选择改变

### 图事件
- `scale` - 缩放改变
- `translate` - 平移改变
- `resize` - 画布大小改变

## 快捷键

### 默认快捷键
- `Ctrl+C/Cmd+C` - 复制
- `Ctrl+X/Cmd+X` - 剪切
- `Ctrl+V/Cmd+V` - 粘贴
- `Ctrl+Z/Cmd+Z` - 撤销
- `Ctrl+Y/Cmd+Y` - 重做
- `Delete/Backspace` - 删除选中元素
- `Ctrl+A/Cmd+A` - 全选
- `Escape` - 取消选择
- `Arrow Keys` - 移动选中元素

## 样式定制

组件支持 CSS 变量定制和深度选择器。

```css
/* 定制控制面板样式 */
.xflow-control {
  --control-bg: #fff;
  --control-border: #d9d9d9;
  --control-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 深度选择器定制 X6 样式 */
:deep(.x6-widget-selection-inner) {
  border: 2px solid #1890ff;
}
```

## 最佳实践

### 1. 数据同步

使用 store 和图实例双向同步数据：

```js
// 添加节点时同时更新 store 和图实例
const addNodeToGraph = (nodeData) => {
  // 更新 store
  addNodes([nodeData]);
  
  // 更新图实例
  if (graph.value) {
    graph.value.addNode(nodeData);
  }
};
```

### 2. 性能优化

对于大量数据，使用虚拟渲染：

```vue
<XFlowGraph :virtual="true" />
```

### 3. 响应式处理

使用 watch 监听图实例变化：

```js
watch(graph, (newGraph) => {
  if (newGraph) {
    // 图实例初始化完成，执行相关操作
    setupGraphEvents();
  }
});
```

### 4. 错误处理

在操作前检查图实例是否存在：

```js
const someOperation = () => {
  if (!graph.value) {
    console.warn('图实例未初始化');
    return;
  }
  
  // 执行操作
  graph.value.doSomething();
};
```

## 迁移指南

从 React 版本迁移到 Vue 版本的主要变化：

### 1. 组件语法
```jsx
// React
<XFlow>
  <Graph />
</XFlow>

// Vue
<XFlow>
  <XFlowGraph />
</XFlow>
```

### 2. Hook 到 Composable
```js
// React
const graph = useGraphInstance();

// Vue (相同)
const graph = useGraphInstance();
```

### 3. 状态管理
```js
// React (Zustand)
const { nodes, addNodes } = useGraphStore(state => ({
  nodes: state.nodes,
  addNodes: state.addNodes
}));

// Vue (Pinia)
const { nodes, addNodes } = useGraphStore();
```

## 故障排除

### 1. 图实例为空

确保在 XFlow 组件内使用 composables：

```vue
<XFlow>
  <XFlowGraph>
    <!-- 在这里使用 composables -->
  </XFlowGraph>
</XFlow>
```

### 2. 样式问题

确保引入了样式文件：

```js
import './xflow-vue/styles/index.css';
```

### 3. 事件不触发

确保在图实例初始化后添加事件监听：

```js
watch(graph, (newGraph) => {
  if (newGraph) {
    addEventListener('node:click', handler);
  }
});
```

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！