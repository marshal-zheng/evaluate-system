<template>
  <div class="dag-node-root">
    <div class="zx-dag-node" :class="statusClass">
      <img class="zx-dag-node__logo" :src="icons.logo" alt="logo" />
      <span class="zx-dag-node__label">{{ label }}</span>
      <span class="zx-dag-node__status">
        <img v-if="statusClass === 'success'" :src="icons.success" alt="success" />
        <img v-else-if="statusClass === 'failed'" :src="icons.failed" alt="failed" />
        <img v-else-if="statusClass === 'running'" :src="icons.running" alt="running" />
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

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

const icons = {
  logo: 'https://gw.alipayobjects.com/mdn/rms_43231b/afts/img/A*evDjT5vjkX0AAAAAAAAAAAAAARQnAQ',
  success: 'https://gw.alipayobjects.com/mdn/rms_43231b/afts/img/A*6l60T6h8TTQAAAAAAAAAAAAAARQnAQ',
  failed: 'https://gw.alipayobjects.com/mdn/rms_43231b/afts/img/A*SEISQ6My-HoAAAAAAAAAAAAAARQnAQ',
  running: 'https://gw.alipayobjects.com/mdn/rms_43231b/afts/img/A*t8fURKfgSOgAAAAAAAAAAAAAARQnAQ',
};

const nodeData = computed(() => props.node?.getData?.() || {});
const statusClass = computed(() => nodeData.value.status || 'default');
const label = computed(() => nodeData.value.label || '');
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
  width: 100%;
  height: 36px; /* 明确设置高度 */
  min-height: 36px;
  max-height: 36px;
  align-items: center;
  border: 1px solid #c2c8d5;
  border-radius: 4px;
  border-left: 10px solid #5f95ff;
  background-color: #fff;
  box-shadow: 0 2px 5px 1px rgb(0 0 0 / 6%);
  cursor: default;
  box-sizing: border-box;

  &__logo {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    margin-left: 8px;
  }

  &__label {
    display: inline-block;
    width: 104px;
    flex-shrink: 0;
    margin-left: 8px;
    color: #666;
    font-size: 12px;
  }

  &__status {
    height: 20px;
    flex-shrink: 0;

    img {
      width: 20px;
      height: 20px;
    }
  }

  &.success {
    border-left-color: #52c41a;
  }

  &.failed {
    border-left-color: #ff4d4f;
  }
}

.zx-dag-node.running .zx-dag-node__status img {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
