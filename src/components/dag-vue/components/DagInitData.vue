<template></template>

<script setup>
import { onMounted } from 'vue';
import { useGraphInstance } from '@/components/xflow-vue/src/composables/useGraphInstance';
import { useGraphStore } from '@/components/xflow-vue/src/composables/useGraphStore';
import { dagreLayout } from '../utils/layout.js';
import { registerDagShapes, DAG_NODE, DAG_EDGE } from '../shapes/registerDagShapes';

const graph = useGraphInstance();
const graphStore = useGraphStore();

// 注册 DAG 图形
registerDagShapes();

const ensureInitialData = () => {
  const exists = graphStore.nodes.some((item) => item.id === 'initNode1');
  if (exists) {
    return;
  }

  graphStore.addNodes([
    {
      id: 'initNode1',
      shape: DAG_NODE,
      x: 490,
      y: 200,
      data: {
        label: '读数据',
        status: 'success',
      },
      ports: [{ id: 'initNode1-1', group: 'bottom' }],
      draggable: true,
      locked: false,
    },
    {
      id: 'initNode2',
      shape: DAG_NODE,
      x: 490,
      y: 350,
      data: {
        label: '逻辑回归',
        status: 'running',
      },
      ports: [
        { id: 'initNode2-1', group: 'top' },
        { id: 'initNode2-2', group: 'bottom' },
        { id: 'initNode2-3', group: 'bottom' },
      ],
      draggable: true,
      locked: false,
    },
    {
      id: 'initNode3',
      shape: DAG_NODE,
      x: 320,
      y: 500,
      data: {
        label: '模型预测',
        status: 'running',
      },
      ports: [
        { id: 'initNode3-1', group: 'top' },
        { id: 'initNode3-2', group: 'bottom' },
      ],
      draggable: true,
      locked: false,
    },
    {
      id: 'initNode4',
      shape: DAG_NODE,
      x: 670,
      y: 500,
      data: {
        label: '读取参数',
        status: 'running',
      },
      ports: [
        { id: 'initNode4-1', group: 'top' },
        { id: 'initNode4-2', group: 'bottom' },
      ],
      draggable: true,
      locked: false,
    },
  ]);

  graphStore.addEdges([
    {
      id: 'initEdge1',
      shape: DAG_EDGE,
      source: { cell: 'initNode1', port: 'initNode1-1' },
      target: { cell: 'initNode2', port: 'initNode2-1' },
      animated: true,
    },
    {
      id: 'initEdge2',
      shape: DAG_EDGE,
      source: { cell: 'initNode2', port: 'initNode2-2' },
      target: { cell: 'initNode3', port: 'initNode3-1' },
      animated: true,
    },
    {
      id: 'initEdge3',
      shape: DAG_EDGE,
      source: { cell: 'initNode2', port: 'initNode2-3' },
      target: { cell: 'initNode4', port: 'initNode4-1' },
      animated: true,
    },
  ]);

  // 模拟状态变化
  window.setTimeout(() => {
    graphStore.updateNode('initNode2', {
      data: {
        status: 'success',
      },
    });
    graphStore.updateEdge('initEdge1', {
      animated: false,
    });
  }, 1000);

  window.setTimeout(() => {
    graphStore.updateNode('initNode4', {
      data: {
        status: 'success',
      },
    });
    graphStore.updateNode('initNode3', {
      data: {
        status: 'failed',
      },
    });
    graphStore.updateEdge('initEdge2', {
      animated: false,
    });
    graphStore.updateEdge('initEdge3', {
      animated: false,
    });
  }, 2000);
};

onMounted(async () => {
  // 确保初始数据
  ensureInitialData();
  
  // 等待一下再进行布局，确保节点已经添加
  setTimeout(async () => {
    const g = graph?.value;
    if (!g) return;
    
    // 初始进行一次横向布局，避免节点重叠/边交叉
    await dagreLayout(g, 'LR');
    g.centerContent();
  }, 100);
});
</script>

<style scoped>
</style>
