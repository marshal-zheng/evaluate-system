<template>
  <div class="demo-container">
    <div class="demo-header">
      <h3>Demo14: DAG 布局测试</h3>
      <div class="demo-controls">
        <el-button-group>
          <el-button type="primary" @click="testLayout('TB')">竖向布局 (TB)</el-button>
          <el-button type="primary" @click="testLayout('LR')">横向布局 (LR)</el-button>
          <el-button type="primary" @click="testLayout('BT')">竖向反向 (BT)</el-button>
          <el-button type="primary" @click="testLayout('RL')">横向反向 (RL)</el-button>
        </el-button-group>
        <el-button @click="addSampleNodes">添加示例节点</el-button>
        <el-button @click="clearGraph">清空画布</el-button>
      </div>
    </div>
    <div class="demo-graph">
      <XFlow>
        <XFlowGraph
          pannable
          :connection-options="connectionOptions"
          :connection-edge-options="connectionEdgeOptions"
          :select-options="{ showEdgeSelectionBox: true }"
          :enable-context-menu="false"
          :fit-view="false"
        >
          <XFlowState />
          <XFlowClipboard />
          <XFlowHistory />
          <XFlowBackground color="#fafafa" />
          <XFlowGrid :size="20" type="dot" />
        </XFlowGraph>
      </XFlow>
    </div>
  </div>
</template>

<script setup>
import { nextTick } from 'vue';
import { XFlow, XFlowGraph, XFlowClipboard, XFlowState, XFlowHistory, XFlowGrid, XFlowBackground } from '@/components/xflow-vue/src/components';
import { useGraphInstance } from '@/components/xflow-vue/src/composables/useGraphInstance';
import { dagreLayout } from '@/components/dag-vue/utils/layout.js';
import { registerDagShapes } from '@/components/dag-vue/shapes/registerDagShapes.js';

// 注册 DAG 节点形状
registerDagShapes();

const graph = useGraphInstance();

const connectionEdgeOptions = {
  shape: 'edge',
  animated: false,
  zIndex: -1,
  attrs: {
    line: {
      stroke: '#A2B1C3',
      strokeWidth: 2,
    },
  },
};

const connectionOptions = {
  snap: true,
  allowBlank: false,
  allowLoop: false,
  highlight: true,
  connectionPoint: 'anchor',
  anchor: 'center',
  connector: 'rounded',
  validateMagnet({ magnet }) {
    return magnet.getAttribute('port-group') !== 'top';
  },
};

// 测试布局函数
const testLayout = async (direction) => {
  const g = graph?.value;
  if (!g) return;
  
  console.log(`Testing layout with direction: ${direction}`);
  
  try {
    await dagreLayout(g, direction);
    g.centerContent();
    console.log(`Layout ${direction} completed successfully`);
  } catch (error) {
    console.error(`Layout ${direction} failed:`, error);
  }
};

// 添加示例节点
const addSampleNodes = () => {
  const g = graph?.value;
  if (!g) return;
  
  // 清空现有内容
  g.clearCells();
  
  // 添加节点
  const nodes = [
    { id: 'node1', x: 100, y: 100, label: '开始节点' },
    { id: 'node2', x: 300, y: 100, label: '处理节点A' },
    { id: 'node3', x: 500, y: 100, label: '处理节点B' },
    { id: 'node4', x: 300, y: 300, label: '汇聚节点' },
    { id: 'node5', x: 500, y: 300, label: '结束节点' },
  ];
  
  nodes.forEach(nodeData => {
    g.addNode({
      id: nodeData.id,
      x: nodeData.x,
      y: nodeData.y,
      width: 120,
      height: 60,
      shape: 'dag-node',
      data: {
        label: nodeData.label,
        status: 'default',
      },
      ports: {
        groups: {
          top: {
            position: 'top',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#5F95FF',
                strokeWidth: 1,
                fill: '#fff',
              },
            },
          },
          bottom: {
            position: 'bottom',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#5F95FF',
                strokeWidth: 1,
                fill: '#fff',
              },
            },
          },
        },
        items: [
          { group: 'top', id: 'top' },
          { group: 'bottom', id: 'bottom' },
        ],
      },
    });
  });
  
  // 添加边
  const edges = [
    { source: 'node1', target: 'node2' },
    { source: 'node1', target: 'node3' },
    { source: 'node2', target: 'node4' },
    { source: 'node3', target: 'node4' },
    { source: 'node4', target: 'node5' },
  ];
  
  edges.forEach(edgeData => {
    g.addEdge({
      source: { cell: edgeData.source, port: 'bottom' },
      target: { cell: edgeData.target, port: 'top' },
      ...connectionEdgeOptions,
    });
  });
  
  // 延迟一下，让节点完全渲染后再应用布局
  nextTick(() => {
    testLayout('TB');
  });
};

// 清空画布
const clearGraph = () => {
  const g = graph?.value;
  if (!g) return;
  g.clearCells();
};
</script>

<style scoped>
.demo-container {
  display: flex;
  flex-direction: column;
  height: 600px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.demo-header {
  padding: 16px;
  border-bottom: 1px solid #ddd;
  background-color: #f5f5f5;
}

.demo-header h3 {
  margin: 0 0 16px 0;
}

.demo-controls {
  display: flex;
  gap: 16px;
  align-items: center;
}

.demo-graph {
  flex: 1;
  position: relative;
}

.demo-graph .xflow-graph {
  width: 100%;
  height: 100%;
}
</style>