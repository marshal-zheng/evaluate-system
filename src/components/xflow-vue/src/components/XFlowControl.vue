<template>
  <div class="xflow-control" :class="className" :style="style">
    <slot />
  </div>
</template>

<script setup>
// Props 定义
defineProps({
  className: {
    type: String,
    default: '',
  },
  style: {
    type: Object,
    default: () => ({}),
  },
});
</script>

<style scoped>
.xflow-control {
  position: absolute;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 8px;
}
</style>
