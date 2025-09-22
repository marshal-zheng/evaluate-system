<template>
  <div class="zx-dag-node" :class="[nodeTypeClass, { 'has-model': hasModel, 'no-model': !hasModel }]">
    <!-- 左侧状态指示器 -->
    <div class="zx-dag-node__indicator">
      <ZxIcon 
        v-if="isLeafNode"
        :icon="modelIcon" 
        :size="14" 
        :color="modelIconColor"
        :popover-title="modelPopoverTitle"
        :tooltip="modelTooltip"
        tooltip-placement="left"
        :tooltip-offset="12"
        :popover-width="400"
      >
        <!-- 紧凑型模型信息展示 -->
        <template v-if="hasModel && modelData" #popoverContent>
          <div class="model-info">
            <div class="info-row">
              <span class="label">名称</span>
              <span class="value">{{ modelDisplayName }}</span>
            </div>
            <div v-if="modelData.oprModelDesc || modelData.description" class="info-row">
              <span class="label">描述</span>
              <span class="value">{{ modelData.oprModelDesc || modelData.description }}</span>
            </div>
            <div class="info-row">
              <span class="label">ID</span>
              <span class="value code">{{ modelData.id }}</span>
            </div>
            <div v-if="modelData.oprModelPath" class="info-row">
              <span class="label">路径</span>
              <span class="value code">{{ modelData.oprModelPath }}</span>
            </div>
            <div v-if="modelData.index !== undefined" class="info-row">
              <span class="label">顺序</span>
              <span class="value">{{ modelData.index }}</span>
            </div>
            <div class="info-row">
              <span class="label">状态</span>
              <span class="value" :class="modelStatusClass">{{ modelStatusText }}</span>
            </div>
            <div v-if="modelData.createTime" class="info-row">
              <span class="label">创建</span>
              <span class="value">{{ formatTime(modelData.createTime) }}</span>
            </div>
          </div>
        </template>
      </ZxIcon>
    </div>
    
    <div class="zx-dag-node__label">{{ label }}</div>
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

// 新增的模型信息展示相关计算属性
const modelDisplayName = computed(() => {
  return modelData.value.oprModelName || modelData.value.title || modelData.value.label || modelData.value.name || '未命名模型';
});

const modelStatusText = computed(() => {
  const state = modelData.value.state;
  if (state === null || state === undefined) return '未知状态';
  if (state === 0) return '未启用';
  if (state === 1) return '已启用';
  return `状态${state}`;
});

const modelStatusClass = computed(() => {
  const state = modelData.value.state;
  if (state === 1) return 'status-active';
  if (state === 0) return 'status-inactive';
  return 'status-unknown';
});

// 时间格式化方法
const formatTime = (timeStr) => {
  if (!timeStr) return '';
  try {
    // 如果是标准时间格式，直接返回
    if (timeStr.includes('-') && timeStr.includes(':')) {
      return timeStr;
    }
    // 如果是时间戳，转换为可读格式
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return timeStr;
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (error) {
    return timeStr;
  }
};

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

.zx-dag-node {
  display: flex;
  align-items: center;
  width: 100%;
  height: 32px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: default;
  box-sizing: border-box;

  &__indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 100%;
    flex-shrink: 0;
    border-right: 1px solid #e8e8e8;
  }

  &.leaf-node &__indicator {
    background: rgba(64, 158, 255, 0.1);
  }

  &.non-leaf-node &__indicator {
    background: #409eff;
  }

  &__label {
    flex: 1;
    text-align: center;
    padding: 0 8px;
    color: #606266;
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

// 紧凑型模型信息展示
.model-info {
  padding: 12px;
  min-width: 280px;
  max-width: 380px;
  
  .info-row {
    display: flex;
    margin-bottom: 8px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .label {
      width: 60px;
      color: #909399;
      font-size: 12px;
      flex-shrink: 0;
    }
    
    .value {
      flex: 1;
      color: #606266;
      font-size: 12px;
      word-break: break-all;
      
      &.code {
        font-family: monospace;
        background: #f5f7fa;
        padding: 2px 4px;
        border-radius: 2px;
        font-size: 11px;
      }
      
      &.status-active {
        color: #67c23a;
        font-weight: 500;
      }
      
      &.status-inactive {
        color: #e6a23c;
        font-weight: 500;
      }
      
      &.status-unknown {
        color: #f56c6c;
        font-weight: 500;
      }
    }
  }
}
</style>
