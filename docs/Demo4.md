## XFlow Vue 常见问题（FAQ）

面向项目中的 Demo3（`src/components/Demo/Demo3.vue`）整理的常见问题与解决方案，便于后续回归查阅。

---

### 1) 右键“全选”后看不出选中效果

- 症状：
  - 右键菜单点击“全选”后，图上没有明显视觉反馈。

- 原因：
  - X6 选择插件默认不显示节点/边的选中框，需显式开启。

- 解决：
  - 在 `XFlowGraph` 传入 `selectOptions`，打开选中框与橡皮筋框选（并保留 Shift 修饰键以避免误触）。

```vue
<!-- 片段：Demo3.vue 中的 XFlowGraph 配置 -->
<XFlowGraph
  :selectOptions="{
    multiple: true,
    rubberband: true,
    rubberbandModifiers: ['shift'],
    movable: true,
    showNodeSelectionBox: true,
    showEdgeSelectionBox: false
  }"
  @ready="onGraphReady"
/>
```

---

### 2) 选中节点或 label 出现大蓝框，拖拽成大片矩形（误触）

- 症状：
  - 单击节点或边的 label 后出现“大蓝框”，拖拽时像在拖拽一个大矩形选区。

- 原因：
  - 橡皮筋/选区拖拽与边的选中框共同作用，造成视觉与交互上的干扰。

- 解决：
  - 仅按住 Shift 时才启用橡皮筋：`rubberbandModifiers: ['shift']`。
  - 关闭边的选中框：`showEdgeSelectionBox: false`，避免对边/label 的“框选错觉”。
  - 是否允许拖拽选区：
    - 允许整体拖拽（当前方案）：`movable: true`。
    - 如需完全避免选区拖拽，可设为 `movable: false`。

```vue
:selectOptions="{
  rubberband: true,
  rubberbandModifiers: ['shift'],
  movable: true,
  showEdgeSelectionBox: false
}"
```

补充：若某节点被“锁定”，也会出现“拖不动”的错觉；右键节点切换锁定状态即可。

---

### 3) 右键“全选”后无法整体拖拽

- 症状：
  - 执行“全选”后，尝试拖拽整体无反应或选区消失。

- 原因：
  - 同时选中了边与节点，组拖拽时与选区/空白点击的行为冲突，导致拖拽未生效。

- 解决：
  - 将“全选”的实现改为只选择节点（不选择边），保持整体拖拽稳定。

```js
// Demo3.vue
const selectAllCells = () => {
  if (!graph) return;
  const nodes = graph.getNodes();
  if (nodes.length) {
    graph.cleanSelection();
    graph.select(nodes);
  }
};
```

---

### 4) 节点拖不动/交互异常排查清单

- 是否被锁定：右键节点切换“锁定/解锁”。
- 是否在只读模式：`XFlowGraph` 的 `:readonly` 是否为 `false`。
- 是否启用平移/缩放：检查 `:pannable`、`:zoomable` 配置。

---

### 关联文件

- `src/components/Demo/Demo3.vue`：示例场景与交互逻辑。
- `src/components/xflow-vue/src/components/XFlowGraph.vue`：X6 Graph 初始化与 Selection/Keyboard/Scroller 插件挂载。
- `src/components/xflow-vue/src/styles/index.scss`：选中框、吸附线、Transform 等部件样式。

如需调整选中框颜色/线宽，可在样式中覆盖：`.x6-widget-selection`、`.x6-widget-transform` 等选择器。


