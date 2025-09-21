<template>
  <div 
    ref="minimapRef"
    class="xflow-minimap"
    :style="{ 
      position: 'absolute',
      top: '10px',
      right: '10px',
      width: `${width}px`,
      height: `${height}px`,
      border: '1px solid #d9d9d9',
      backgroundColor: '#fff',
      zIndex: 10,
      ...style
    }"
  />
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, watchEffect, nextTick } from 'vue';
import { NodeView } from '@antv/x6';
import { MiniMap } from '@antv/x6-plugin-minimap';
import { useGraphInstance } from '../composables';

defineOptions({
  name: 'Minimap'
});

const props = defineProps({
  enabled: {
    type: Boolean,
    default: true
  },
  width: {
    type: Number,
    default: 200
  },
  height: {
    type: Number,
    default: 160
  },
  padding: {
    type: Number,
    default: 10
  },
  scalable: {
    type: Boolean,
    default: true
  },
  minScale: {
    type: Number,
    default: 0.01
  },
  maxScale: {
    type: Number,
    default: 16
  },
  style: {
    type: Object,
    default: () => ({})
  },
  simple: {
    type: Boolean,
    default: false
  },
  simpleNodeBackground: {
    type: String,
    default: '#8f8f8f'
  },
  graphOptions: {
    type: Object,
    default: () => ({})
  }
});

// SimpleNodeView 类定义，参考 React 版本
class SimpleNodeView extends NodeView {
  static nodeBackground = '#8f8f8f';

  renderMarkup() {
    const tag = this.cell.shape === 'circle' ? 'circle' : 'rect';
    return this.renderJSONMarkup({
      tagName: tag,
      selector: 'body',
    });
  }

  update() {
    super.update({
      body: {
        refWidth: '100%',
        refHeight: '100%',
        fill: SimpleNodeView.nodeBackground,
      },
    });
  }
}

const graph = useGraphInstance();
const minimapRef = ref(null);
const minimap = ref(null);

// 初始化小地图
const initMinimap = () => {
  if (!graph.value || !minimapRef.value) {
    return;
  }

  // 检查并移除已存在的 minimap 插件
  if (graph.value.getPlugin('minimap')) {
    graph.value.disposePlugins('minimap');
  }

  // 设置简化节点背景色
  SimpleNodeView.nodeBackground = props.simpleNodeBackground || SimpleNodeView.nodeBackground;

  minimap.value = new MiniMap({
    container: minimapRef.value,
    width: props.width,
    height: props.height,
    padding: props.padding,
    scalable: props.scalable,
    minScale: props.minScale,
    maxScale: props.maxScale,
    graphOptions: props.simple ? {
      createCellView(cell) {
        if (cell.isEdge()) {
          return null; // 不在小地图中显示边
        }
        if (cell.isNode()) {
          return SimpleNodeView;
        }
        return undefined;
      },
    } : undefined,
    ...props.graphOptions
  });

  if (props.enabled) {
    graph.value.use(minimap.value);
  }
};

// 启用小地图
const enable = () => {
  if (!minimap.value || !graph.value) return;
  
  graph.value.use(minimap.value);
};

// 禁用小地图
const disable = () => {
  if (!minimap.value || !graph.value) return;
  
  if (graph.value.getPlugin('minimap')) {
    graph.value.disposePlugins('minimap');
  }
};

// 更新小地图大小
const resize = (width, height) => {
  if (!minimap.value) return;
  
  minimap.value.resize(width, height);
};

// 使用 watchEffect 来响应图实例的变化
watchEffect(() => {
  if (graph.value && minimapRef.value) {
    // 延迟初始化，确保图实例完全就绪
    nextTick(() => {
      initMinimap();
    });
  }
});

// 监听属性变化
watch(() => props.enabled, (newVal) => {
  if (newVal) {
    enable();
  } else {
    disable();
  }
});

watch([() => props.width, () => props.height], ([newWidth, newHeight]) => {
  resize(newWidth, newHeight);
});

onUnmounted(() => {
  if (minimap.value) {
    if (graph.value && graph.value.getPlugin('minimap')) {
      graph.value.disposePlugins('minimap');
    }
    minimap.value.dispose();
    minimap.value = null;
  }
});

defineExpose({
  minimap,
  enable,
  disable,
  resize
});
</script>

<style scoped>
.xflow-minimap {
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  overflow: hidden;
  /* 确保小地图容器可以接收鼠标事件，覆盖父级的 pointer-events: none */
  pointer-events: auto;
}

/* 确保小地图内部的 X6 组件可以正常交互 */
.xflow-minimap :deep(.x6-widget-minimap) {
  pointer-events: auto;
}

.xflow-minimap :deep(.x6-widget-minimap .x6-graph) {
  pointer-events: auto;
}

/* 保持 SVG 元素不可交互，这是 X6 的默认行为 */
.xflow-minimap :deep(.x6-widget-minimap .x6-graph > svg) {
  pointer-events: none;
}

/* 确保视口可以拖拽 */
.xflow-minimap :deep(.x6-widget-minimap-viewport) {
  pointer-events: auto;
}

/* 确保缩放控制点可以交互 */
.xflow-minimap :deep(.x6-widget-minimap-viewport-zoom) {
  pointer-events: auto;
}
</style>