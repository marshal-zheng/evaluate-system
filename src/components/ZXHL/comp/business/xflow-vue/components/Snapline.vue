<template>
  <!-- 对齐线组件不需要渲染可见内容，只提供对齐线功能 -->
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { Snapline } from '@antv/x6-plugin-snapline';
import { useGraphInstance } from '../composables';

defineOptions({
  name: 'Snapline'
});

const props = defineProps({
  enabled: {
    type: Boolean,
    default: true
  },
  className: {
    type: String,
    default: 'x6-widget-snapline'
  },
  tolerance: {
    type: Number,
    default: 10
  },
  sharp: {
    type: Boolean,
    default: false
  },
  resizing: {
    type: Boolean,
    default: false
  },
  clean: {
    type: Boolean,
    default: true
  },
  filter: {
    type: [Function, Array, String],
    default: null
  }
});

const graph = useGraphInstance();
const snapline = ref(null);

const getOptions = () => ({
  className: props.className,
  tolerance: props.tolerance,
  sharp: props.sharp,
  resizing: props.resizing,
  clean: props.clean,
  filter: props.filter
});

const mountSnapline = () => {
  if (!graph.value) {
    return;
  }

  // 如果已经存在旧的插件，先清理
  if (snapline.value) {
    if (graph.value.getPlugin('snapline')) {
      graph.value.disposePlugins('snapline');
    }
    snapline.value.dispose();
    snapline.value = null;
  }

  snapline.value = new Snapline(getOptions());
  graph.value.use(snapline.value);

  if (!props.enabled) {
    snapline.value.disable();
  }
};

// 启用对齐线
const enable = () => {
  if (!graph.value) return;

  if (!snapline.value || !graph.value.getPlugin('snapline')) {
    mountSnapline();
  }
  snapline.value?.enable();
};

// 禁用对齐线
const disable = () => {
  if (!snapline.value) return;
  
  snapline.value.disable();
};

// 切换对齐线状态
const toggle = () => {
  if (!snapline.value) return;
  
  if (snapline.value.disabled) {
    enable();
  } else {
    disable();
  }
};

// 检查是否启用
const isEnabled = () => {
  return snapline.value ? !snapline.value.disabled : false;
};

// 隐藏对齐线
const hide = () => {
  if (!snapline.value) return;
  
  snapline.value.hide();
};

// 显示对齐线
const show = () => {
  if (!snapline.value) return;
  
  snapline.value.show();
};

onMounted(() => {
  if (graph.value) {
    mountSnapline();
  }
});

watch(
  () => graph.value,
  (val) => {
    if (val) {
      mountSnapline();
    }
  }
);

watch(
  () => ({
    enabled: props.enabled,
    className: props.className,
    tolerance: props.tolerance,
    sharp: props.sharp,
    resizing: props.resizing,
    clean: props.clean,
    filter: props.filter
  }),
  (next, prev = {}) => {
    if (!graph.value) return;

    const configKeys = ['className', 'tolerance', 'sharp', 'resizing', 'clean', 'filter'];
    const configChanged = configKeys.some((key) => next[key] !== prev[key]);

    if (configChanged) {
      mountSnapline();
      return;
    }

    if (next.enabled !== prev.enabled) {
      if (next.enabled) {
        enable();
      } else {
        disable();
      }
    }
  },
  { deep: false }
);

onUnmounted(() => {
  if (snapline.value) {
    if (graph.value && graph.value.getPlugin('snapline')) {
      graph.value.disposePlugins('snapline');
    }
    snapline.value.dispose();
    snapline.value = null;
  }
});

defineExpose({
  snapline,
  enable,
  disable,
  toggle,
  isEnabled,
  hide,
  show
});
</script>
