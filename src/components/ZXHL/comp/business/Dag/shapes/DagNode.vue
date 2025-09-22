<template>
  <div class="dag-node-root">
    <div class="zx-dag-node" :class="[nodeTypeClass, { 'has-model': hasModel, 'no-model': !hasModel }]">
      <!-- 左侧图标指示器，非叶子节点不显示图标 -->
      <div class="zx-dag-node__indicator">
        <ZxIcon 
          v-if="isLeafNode"
          :icon="modelIcon" 
          :size="16" 
          :color="modelIconColor"
          :popover-title="modelPopoverTitle"
          :tooltip="modelTooltip"
          tooltip-placement="left"
          :tooltip-offset="20"
        >
          <!-- Popover内容插槽 -->
          <template v-if="hasModel && modelData" #popoverContent>
            <div class="model-info">
              <div class="model-info__item">
                <strong>模型名称：</strong>{{ modelData.name }}
              </div>
              <div class="model-info__item">
                <strong>描述：</strong>{{ modelData.description }}
              </div>
              <div class="model-info__item">
                <strong>模型ID：</strong>{{ modelData.id }}
              </div>
            </div>
          </template>
        </ZxIcon>
      </div>
      
      <!-- <el-icon class="zx-dag-node__logo"><component :is="icons.logo" /></el-icon> -->
      <div class="zx-dag-node__label">{{ label }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, ref } from 'vue';
import ZxIcon from '@/components/ZXHL/comp/pure/ZxIcon';

const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
  graph: {
    type: Object,
    default: null,
  },
});

// 响应式数据版本号，用于强制重新计算
const dataVersion = ref(0);

const nodeData = computed(() => {
  // 依赖dataVersion来强制重新计算
  dataVersion.value;
  const data = props.node?.getData?.() || {};
  console.log('DagNode - nodeData computed:', {
    nodeId: props.node?.id,
    data,
    hasProperties: !!data.properties,
    hasLabel: !!data.label,
    version: dataVersion.value
  });
  return data;
});

// 支持两种数据结构：旧的直接结构和新的 properties 结构
const properties = computed(() => {
  const props = nodeData.value.properties || {};
  console.log('DagNode - properties computed:', {
    nodeId: props.node?.id,
    properties: props,
    hasContent: !!props.content,
    hasOtherData: !!props.otherData
  });
  return props;
});
const content = computed(() => {
  const contentData = properties.value.content || {};
  console.log('DagNode - content computed:', {
    nodeId: props.node?.id,
    content: contentData,
    label: contentData.label
  });
  return contentData;
});

const label = computed(() => {
  // 优先使用顶层 label，然后是 content.label，最后回退到空字符串
  const labelValue = nodeData.value.label || content.value.label || '';
  console.log('DagNode label computed:', {
    nodeId: props.node?.id,
    labelValue,
    version: dataVersion.value
  });
  return labelValue;
});

// 计算模型相关的计算属性
const nodeType = computed(() => {
  // 优先使用新结构，回退到旧结构
  return nodeData.value.type || (properties.value.level === 1 ? 'root-node' : 'leaf-node');
});

const isLeafNode = computed(() => nodeType.value === 'leaf-node');
const nodeTypeClass = computed(() => isLeafNode.value ? 'leaf-node' : 'non-leaf-node');
const modelData = computed(() => {
  console.log('properties', properties)
  // 优先使用新结构，回退到旧结构
  return properties.value.otherData || nodeData.value.otherData || {};
});
const hasModel = computed(() => isLeafNode.value && modelData.value && Object.keys(modelData.value).length > 0);

// 模型图标配置
const modelIcon = computed(() => {
  return hasModel.value ? 'Setting' : 'QuestionFilled';
});

const modelIconColor = computed(() => {
  if (!isLeafNode.value) {
    return '#d9d9d9'; // 非叶子节点置灰
  }
  return hasModel.value ? 'var(--el-color-primary)' : 'var(--el-color-danger)';
});

const modelPopoverTitle = computed(() => {
  if (!isLeafNode.value) {
    return '节点信息';
  }
  return hasModel.value ? '计算模型信息' : '未绑定计算模型';
});

const modelTooltip = computed(() => {
  if (!isLeafNode.value) {
    return '非叶子节点';
  }
  return hasModel.value ? '点击查看计算模型详情' : '该节点尚未绑定计算模型';
});

// 监听节点数据变化
watch(
  () => props.node,
  (newNode, oldNode) => {
    if (newNode && newNode !== oldNode) {
      console.log('DagNode - 节点对象变化，强制刷新数据');
      dataVersion.value++;
    }
  },
  { immediate: false }
);

// 监听X6节点的数据变化事件
if (props.node) {
  // 监听节点的change:data事件
  props.node.on('change:data', () => {
    console.log('DagNode - 检测到节点数据变化事件，强制刷新');
    dataVersion.value++;
  });
}
</script>

<style lang="scss">

.dag-page foreignObject > body {
  margin: 0;
  min-height: 100%;
  display: block;
  place-items: initial;
}
.z x-root {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.zx-dag-node {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 36px; /* 明确设置高度 */
  min-height: 36px;
  max-height: 36px;
  align-items: center;
  border: 1px solid #c2c8d5;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: 0 2px 5px 1px rgb(0 0 0 / 6%);
  cursor: default;
  box-sizing: border-box;
  position: relative;

  // 所有节点保持正常的白色背景
  &.no-model,
  &.has-model {
    background-color: #fff;
    
    .zx-dag-node__label {
      color: #666;
    }
  }

  &__indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 100%;
    flex-shrink: 0;
    border-right: 1px solid #e8e8e8;
  }

  // 叶子节点的 indicator 样式
  &.leaf-node &__indicator {
    background-color: rgba(95, 149, 255, 0.1);
    
    // 有模型时
    &.has-model {
      background-color: rgba(64, 158, 255, 0.1);
    }
    
    // 无模型时
    &.no-model {
      background-color: rgba(191, 191, 191, 0.1);
    }
  }

  // 非叶子节点的 indicator 样式 - 使用蓝色背景
  &.non-leaf-node &__indicator {
    background-color: #409eff;
  }

  &__logo {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    margin-left: 8px;
  }

  &__label {
    width: calc(100% - 24px - 1px); /* 减去指示器宽度24px和边框1px */
    text-align: center;
    padding-right: 8px;
    color: #666;
    font-size: 14px;
    line-height: 14px;
    font-weight: bold;
    vertical-align: middle;
    box-sizing: border-box;
  }



}

// Popover 内容样式
.model-info {
  max-width: 280px;
  padding: 4px 0;
  
  &__item {
    margin-bottom: 8px;
    font-size: 13px;
    line-height: 1.4;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    strong {
      color: #333;
      font-weight: 500;
    }
  }
}
</style>
