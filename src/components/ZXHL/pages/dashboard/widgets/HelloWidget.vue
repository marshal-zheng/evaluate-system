<template>
  <div class="hello-widget">
    <h3>Hello Widget</h3>
    <p>Drag me into the grid to mount a real component.</p>
  </div>
</template>

<script setup>
// No props for now
</script>

<style scoped>
.hello-widget {
  display: grid;
  place-items: center;
  height: 100%;
  padding: 8px;
  background: white;
  border-radius: 6px;
  border: 1px dashed #c0c4cc;
  color: #303133;
}
</style>
