<template>
  <div class="vue-node-component">
    <div class="vue-node-header">
      <el-icon class="vue-icon"><component :is="'vue'" /></el-icon>
      <span class="vue-node-title">{{ nodeData.title || 'Vue 节点' }}</span>
      <el-badge :value="nodeData.count || 0" class="item">
        <el-button size="small" type="primary">数据</el-button>
      </el-badge>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

// Props
const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
});

// 从节点数据中获取属性
const nodeData = computed(() => {
  return props.node?.getData() || {};
});

// 事件处理
const handleStart = () => {
  props.node?.setData({
    ...nodeData.value,
    status: 'active',
    progress: Math.floor(Math.random() * 100),
  });
  console.log('节点启动:', props.node?.id);
};

const handleStop = () => {
  props.node?.setData({
    ...nodeData.value,
    status: 'stopped',
  });
  console.log('节点停止:', props.node?.id);
};

const handleReset = () => {
  props.node?.setData({
    ...nodeData.value,
    progress: 0,
    count: 0,
  });
  console.log('节点重置:', props.node?.id);
};
</script>

<style scoped>
.vue-node-component {
  width: 200px; /* 强制固定宽度 */
  height: 120px; /* 强制固定高度 */
  max-width: 200px; /* 防止撑开 */
  max-height: 120px; /* 防止撑开 */
  background: linear-gradient(135deg, #f9f0ff 0%, #f0f9ff 100%);
  border: 2px solid #722ed1;
  border-radius: 12px;
  padding: 8px;
  box-sizing: border-box;
  font-family: 'Arial, sans-serif';
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 避免内容溢出影响节点真实尺寸，保证选框贴合 */
  position: relative; /* 确保定位基准 */
}

.vue-node-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
  padding-bottom: 4px;
  border-bottom: 1px solid #d9d9d9;
  height: 28px;
  min-height: 28px;
  line-height: 28px;
  overflow: hidden;
}

/* 统一内部元素的盒模型与默认外边距，避免撑高 */
.vue-node-component *,
.vue-node-component *::before,
.vue-node-component *::after {
  box-sizing: border-box;
}

.vue-node-component p {
  margin: 0;
}

.vue-icon {
  color: #42b883;
  font-size: 16px;
}

.vue-node-title {
  font-size: 12px;
  font-weight: bold;
  color: #722ed1;
  flex: 1;
  margin-left: 4px;
}

.vue-node-content {
  font-size: 11px;
}

.status-indicator {
  text-align: center;
}

.progress-info {
  font-size: 10px;
  color: #666;
}

.actions {
  margin-top: 4px;
}

:deep(.el-button--small) {
  font-size: 10px;
  padding: 2px 6px;
  height: 20px;
}

:deep(.el-progress-bar__outer) {
  height: 4px;
}

:deep(.el-badge__content) {
  font-size: 10px;
  padding: 0 4px;
  height: 14px;
  line-height: 14px;
}
</style>
