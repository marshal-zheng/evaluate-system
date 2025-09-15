<template>
  <div
    class="droppable-element"
    draggable="true"
    unselectable="on"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
  >
    图表组件 (拖我到网格里)
  </div>
</template>

<script setup>
import { setDragPayload, clearDragPayload } from '../../comp/business/DashboardGrid/dragPayloadStore'
// We set a small payload to let drop handler know which component to instantiate
const onDragStart = (e) => {
  // Standard mime type; the grid listens for any text value
  const payload = { type: 'ChartWidget', title: '图表组件', w: 8, h: 6 };
  e.dataTransfer?.setData('text/plain', JSON.stringify(payload));
  setDragPayload(payload)
};

const onDragEnd = () => {
  clearDragPayload()
}
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
