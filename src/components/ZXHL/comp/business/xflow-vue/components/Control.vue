<template>
  <div 
    :class="[
      'xflow-control',
      direction === 'vertical' ? 'xflow-control-vertical' : 'xflow-control-horizontal'
    ]"
  >
    <template v-for="tool in items" :key="tool">
      <!-- 缩放百分比下拉按钮 -->
      <ZxTooltipOrPopover
        v-if="tool === 'zoomTo'"
        trigger="click"
        :placement="placement"
        :title="controlToolMap[tool].label"
      >
        <button class="xflow-control-btn xflow-control-dropdown">
          {{ Math.floor(zoom * 100) }}%
        </button>
        
        <template #content>
          <div class="xflow-control-dropdown-content">
            <button
              v-for="item in dropDownItems"
              :key="item.key"
              class="xflow-control-dropdown-item"
              @click="changeZoom(tool, item.key)"
            >
              {{ item.label }}
            </button>
          </div>
        </template>
      </ZxTooltipOrPopover>
      
      <!-- 其他控制按钮 -->
      <ZxTooltipOrPopover
        v-else-if="isValidControlAction(tool)"
        :content="controlToolMap[tool].label"
        :placement="placement"
      >
        <button
          class="xflow-control-btn"
          :disabled="!isToolButtonEnabled(tool)"
          @click="changeZoom(tool)"
        >
          <ZxIcon 
            :icon="controlToolMap[tool].icon"
            type="element"
            :size="20"
            color="#545456"
          />
        </button>
      </ZxTooltipOrPopover>
    </template>
  </div>
</template>

<script>
// 有效的控制动作列表 - 在模块作用域定义，供 defineProps validator 使用
const controlActionList = [
  'zoomTo',
  'zoomIn',
  'zoomOut',
  'zoomToFit',
  'zoomToOrigin'
];
</script>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useGraphInstance, useGraphEvent } from '../composables';
import ZxTooltipOrPopover from '../../../pure/ZxTooltipOrPopover/index.vue';
import ZxIcon from '../../../pure/ZxIcon/index.vue';

defineOptions({
  name: 'Control'
});

// 控制类型枚举
const ControlEnum = {
  ZoomTo: 'zoomTo',
  ZoomIn: 'zoomIn',
  ZoomOut: 'zoomOut',
  ZoomToFit: 'zoomToFit',
  ZoomToOrigin: 'zoomToOrigin'
};

// 下拉菜单选项
const dropDownItems = [
  { key: '1', label: '50%' },
  { key: '2', label: '75%' },
  { key: '3', label: '100%' },
  { key: '4', label: '125%' },
  { key: '5', label: '150%' }
];

// 控制工具映射 - 使用 Element Plus 图标
const controlToolMap = {
  [ControlEnum.ZoomIn]: {
    label: '放大',
    icon: 'Plus'
  },
  [ControlEnum.ZoomOut]: {
    label: '缩小',
    icon: 'Minus'
  },
  [ControlEnum.ZoomTo]: {
    label: '缩放至',
    icon: 'Plus'
  },
  [ControlEnum.ZoomToFit]: {
    label: '自适应窗口大小',
    icon: 'FullScreen'
  },
  [ControlEnum.ZoomToOrigin]: {
    label: '实际像素展示',
    icon: 'Crop'
  }
};

const props = defineProps({
  items: {
    type: Array,
    default: () => ['zoomIn', 'zoomOut', 'zoomToFit', 'zoomToOrigin', 'zoomTo'],
    validator: (items) => items.every(item => controlActionList.includes(item))
  },
  direction: {
    type: String,
    default: 'horizontal',
    validator: (value) => ['horizontal', 'vertical'].includes(value)
  },
  placement: {
    type: String,
    default: 'top',
    validator: (value) => ['top', 'right', 'bottom', 'left'].includes(value)
  }
});

const graph = useGraphInstance();
const { addEventListener } = useGraphEvent();
const zoom = ref(1);

// 检查是否为有效的控制动作
const isValidControlAction = (tool) => {
  return controlActionList.includes(tool);
};

// 更改缩放
const changeZoom = (type, args) => {
  if (!graph.value) return;
  
  const key = parseInt(args || '1', 10);
  const zoomNum = 0.25 * (key + 1);
  
  switch (type) {
    case ControlEnum.ZoomIn:
      if (zoom.value < 1.5) {
        graph.value.zoom(0.25);
      }
      break;
      
    case ControlEnum.ZoomOut:
      if (zoom.value > 0.5) {
        graph.value.zoom(-0.25);
      }
      break;
      
    case ControlEnum.ZoomToFit:
      graph.value.zoomToFit({ maxScale: 1 });
      break;
      
    case ControlEnum.ZoomToOrigin:
      graph.value.zoomTo(1);
      break;
      
    case ControlEnum.ZoomTo:
      graph.value.zoomTo(zoomNum);
      break;
      
    default:
      break;
  }
  
  updateZoom();
};

// 检查工具按钮是否启用
const isToolButtonEnabled = (type) => {
  if (type === ControlEnum.ZoomIn) {
    return zoom.value < 1.5;
  } else if (type === ControlEnum.ZoomOut) {
    return zoom.value > 0.51;
  }
  return true;
};

// 更新缩放值
const updateZoom = () => {
  if (graph.value) {
    zoom.value = graph.value.zoom();
  }
};

// 初始化
const init = () => {
  if (!graph.value) return;
  
  // 设置初始缩放值
  updateZoom();
  
  // 监听缩放事件
  addEventListener('scale', ({ sx }) => {
    zoom.value = sx;
  });
};

// 监听图实例变化
watch(graph, (newGraph) => {
  if (newGraph) {
    init();
  }
}, { immediate: true });

onMounted(() => {
  if (graph.value) {
    init();
  }
});

// 暴露给父组件
defineExpose({
  zoom,
  changeZoom,
  updateZoom
});
</script>

<style scoped>
.xflow-control {
  display: flex;
  gap: 4px;
  padding: 8px;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 10;
  /* 确保控制面板可以接收鼠标事件，覆盖父级的 pointer-events: none */
  pointer-events: auto;
}

.xflow-control-vertical {
  flex-direction: column;
}

.xflow-control-horizontal {
  flex-direction: row;
}

.xflow-control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
}

.xflow-control-btn:hover:not(:disabled) {
  border-color: #4096ff;
  background: #f0f8ff;
}

.xflow-control-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
  background: #f5f5f5;
}

.xflow-control-dropdown {
  min-width: 48px;
  font-size: 12px;
  font-weight: 500;
}

.xflow-control-dropdown-content {
  display: flex;
  flex-direction: column;
  padding: 4px;
  gap: 2px;
}

.xflow-control-dropdown-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  padding: 0 12px;
  border: none;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s;
}

.xflow-control-dropdown-item:hover {
  background: #f0f8ff;
}
</style>