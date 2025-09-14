<template>
  <div
    class="droppable-element"
    draggable="true"
    unselectable="on"
    @dragstart="onDragStart"
  >
    图表组件 (拖我到网格里)
  </div>
</template>

<script setup>
// We set a small payload to let drop handler know which component to instantiate
const onDragStart = (e) => {
  // Standard mime type; the grid listens for any text value
  e.dataTransfer?.setData('text/plain', JSON.stringify({ type: 'ChartWidget' }));
};
</script>

<style scoped>
.droppable-element {
  width: 180px;
  text-align: center;
  background: #fdd;
  border: 1px solid #000;
  margin: 10px 0;
  padding: 10px;
  cursor: grab;
}
</style>
