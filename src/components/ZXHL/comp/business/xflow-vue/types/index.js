// XFlow Vue 3 组件类型定义

/**
 * 图选项配置
 */
export const GraphOptions = {
  className: String,
  style: Object,
  readonly: Boolean,
  virtual: Boolean,
  minScale: {
    type: Number,
    default: 0.01
  },
  maxScale: {
    type: Number,
    default: 16
  },
  zoomable: {
    type: Boolean,
    default: true
  },
  zoomOptions: Object,
  pannable: {
    type: Boolean,
    default: true
  },
  panOptions: Object,
  embedable: {
    type: Boolean,
    default: false
  },
  embedOptions: Object,
  restrict: [Boolean, Object],
  restrictOptions: Object,
  connectionOptions: Object,
  onPortRendered: Function,
  onEdgeLabelRendered: Function,
  createCellView: Function,
  selectOptions: Object,
  keyboardOptions: Object,
  scroller: {
    type: Boolean,
    default: false
  },
  scrollerOptions: Object,
  connectionEdgeOptions: Object,
  defaultHighlightOptions: Object,
  embedHighlightOptions: Object,
  nodeAvailableHighlightOptions: Object,
  magnetAvailableHighlightOptions: Object,
  magnetAdsorbedHighlightOptions: Object,
  centerView: Boolean,
  centerViewOptions: Object,
  fitView: Boolean,
  fitViewOptions: Object
};

/**
 * 节点选项类型
 */
export const NodeOptions = {
  id: String,
  shape: String,
  x: Number,
  y: Number,
  width: Number,
  height: Number,
  angle: Number,
  attrs: Object,
  markup: [String, Array],
  data: Object,
  tools: [String, Array, Object],
  parent: String,
  children: Array,
  zIndex: Number,
  visible: Boolean,
  ports: Object,
  portMarkup: [String, Array],
  portLabelMarkup: [String, Array],
  portContainerMarkup: [String, Array]
};

/**
 * 边选项类型
 */
export const EdgeOptions = {
  id: String,
  shape: String,
  source: [String, Object],
  target: [String, Object],
  attrs: Object,
  markup: [String, Array],
  data: Object,
  tools: [String, Array, Object],
  parent: String,
  children: Array,
  zIndex: Number,
  visible: Boolean,
  labels: Array,
  defaultLabel: Object,
  connector: [String, Object],
  router: [String, Object],
  vertices: Array,
  smooth: Boolean
};