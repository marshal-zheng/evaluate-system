<template>
  <div 
    ref="containerRef" 
    class="xflow-minimap"
    :class="className" 
    :style="style"
  />
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { NodeView } from '@antv/x6';
import { MiniMap } from '@antv/x6-plugin-minimap';
import { useGraphInstance } from '../composables/useGraphInstance';

// 简单节点视图类
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

// Props 定义
const props = defineProps({
  className: {
    type: String,
    default: '',
  },
  style: {
    type: Object,
    default: () => ({}),
  },
  width: {
    type: Number,
    default: 200,
  },
  height: {
    type: Number,
    default: 160,
  },
  padding: {
    type: Number,
    default: 10,
  },
  simple: {
    type: Boolean,
    default: false,
  },
  simpleNodeBackground: {
    type: String,
    default: '#8f8f8f',
  },
  scalable: {
    type: Boolean,
    default: true,
  },
  minScale: {
    type: Number,
    default: 0.01,
  },
  maxScale: {
    type: Number,
    default: 16,
  },
});

const containerRef = ref(null);
const graph = useGraphInstance();

// 初始化 Minimap 插件
const initMinimap = () => {
  if (!graph || !graph.value || !containerRef.value) return;
  
  // 移除已存在的插件
  if (graph.value.getPlugin('minimap')) {
    graph.value.disposePlugins('minimap');
  }
  
  // 设置简单节点背景色
  SimpleNodeView.nodeBackground = props.simpleNodeBackground;
  
  // 添加新插件
  graph.value.use(
    new MiniMap({
      container: containerRef.value,
      width: props.width,
      height: props.height,
      padding: props.padding,
      scalable: props.scalable,
      minScale: props.minScale,
      maxScale: props.maxScale,
      graphOptions: props.simple ? {
        createCellView(cell) {
          if (cell.isEdge()) {
            return null;
          }
          if (cell.isNode()) {
            return SimpleNodeView;
          }
          return undefined;
        },
      } : undefined,
    })
  );
};

onMounted(() => {
  initMinimap();
});

// 监听属性变化重新初始化插件
watch(() => [
  props.width,
  props.height,
  props.padding,
  props.simple,
  props.simpleNodeBackground,
  props.scalable,
  props.minScale,
  props.maxScale,
], () => {
  initMinimap();
});
</script>

<style scoped>
.xflow-minimap {
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
}
</style>
