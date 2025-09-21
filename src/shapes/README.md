# 业务图形定义指南

这里是项目特定的图形定义，展示了如何扩展和自定义 XFlow Vue 的图形。

## 📁 目录结构

```
src/shapes/
├── index.js              # 主要的图形注册文件
├── VueNodeComponent.vue   # Vue 组件节点示例
└── README.md             # 本文档
```

## 🎯 设计原则

1. **分离关注点**：业务图形与基础库分离
2. **可扩展性**：方便添加新的图形类型
3. **可维护性**：清晰的注册和管理机制
4. **类型安全**：提供完整的配置选项

## 🚀 快速开始

### 1. 注册所有业务图形

```javascript
import { registerAllBusinessShapes } from '@/shapes';

// 在组件挂载时注册
onMounted(() => {
  registerAllBusinessShapes();
});
```

### 2. 获取可用图形列表

```javascript
import { getAvailableShapes } from '@/shapes';

const shapes = getAvailableShapes();
console.log(shapes);
// {
//   basic: [{ shape: 'rect-node', name: '矩形', icon: '□' }],
//   flow: [{ shape: 'port-node', name: '端口节点', icon: '⚡' }],
//   advanced: [{ shape: 'vue-node', name: 'Vue 组件', icon: 'V' }]
// }
```

### 3. 单独注册特定类型

```javascript
import { 
  registerBasicBusinessShapes,
  registerPortNodes,
  registerVueNodes 
} from '@/shapes';

// 只注册基础图形
registerBasicBusinessShapes();

// 只注册端口节点
registerPortNodes();

// 只注册 Vue 组件节点
registerVueNodes();
```

## 🎨 自定义图形

### 1. 添加新的基础图形

```javascript
// 在 index.js 中添加
Graph.registerNode('my-custom-node', {
  inherit: 'rect',
  width: 120,
  height: 60,
  attrs: {
    body: {
      stroke: '#ff4d4f',
      strokeWidth: 2,
      fill: '#fff2f0',
      rx: 8,
      ry: 8,
    },
    text: {
      fontSize: 12,
      fill: '#cf1322',
      textAnchor: 'middle',
      textVerticalAnchor: 'middle',
    },
  },
});
```

### 2. 创建 Vue 组件节点

```javascript
// 1. 创建 Vue 组件文件
// MyCustomComponent.vue

// 2. 在 index.js 中注册
import MyCustomComponent from './MyCustomComponent.vue';

register({
  shape: 'my-vue-node',
  component: MyCustomComponent,
  effect: ['data'],
});
```

### 3. 使用基础库的工具

```javascript
import { 
  ShapeRegistry,
  BaseShapeStyles,
  PortPresets,
  createPortedNodeConfig,
  mergeShapeStyles 
} from '@/components/xflow-vue/src/shapes';

// 使用注册工具
ShapeRegistry.registerNode('my-node', config);

// 使用预设样式
const nodeConfig = mergeShapeStyles(
  BaseShapeStyles.rect,
  { attrs: { body: { fill: '#f0f0f0' } } }
);

// 使用端口预设
const portedConfig = createPortedNodeConfig(
  nodeConfig,
  PortPresets.fourWay
);
```

## 📋 图形类型

### 基础图形
- `rect-node`: 矩形节点
- `circle-node`: 圆形节点（带端口）
- `diamond-node`: 菱形节点

### 流程图形
- `port-node`: 带输入输出端口的流程节点

### 高级图形
- `vue-node`: Vue 组件节点，支持完整的 Vue 功能

## 🔧 配置选项

### 节点配置
```javascript
{
  inherit: 'rect',           // 继承的基础形状
  width: 120,                // 宽度
  height: 60,                // 高度
  attrs: {                   // 样式属性
    body: { /* 主体样式 */ },
    text: { /* 文字样式 */ },
  },
  ports: { /* 端口配置 */ }, // 可选
  markup: [ /* 自定义标记 */ ], // 可选
}
```

### Vue 组件配置
```javascript
{
  shape: 'my-vue-node',      // 图形名称
  component: MyComponent,     // Vue 组件
  effect: ['data'],          // 响应的数据变化
}
```

## 🎯 最佳实践

1. **命名规范**：使用 `kebab-case` 命名图形
2. **防重复注册**：使用 `ShapeRegistry` 避免重复注册
3. **样式一致性**：使用 `BaseShapeStyles` 保持视觉一致
4. **端口标准化**：使用 `PortPresets` 统一端口配置
5. **错误处理**：始终包含 try-catch 和降级方案

## 🔗 相关文档

- [XFlow Vue 组件文档](../components/xflow-vue/README.md)
- [X6 官方文档](https://x6.antv.vision/)
- [@antv/x6-vue-shape 文档](https://x6.antv.vision/zh/docs/tutorial/plugins/vue-shape)

