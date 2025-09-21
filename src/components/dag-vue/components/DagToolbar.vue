<template>
  <el-space>
    <el-button type="primary" size="small" @click="handleExecute">
      <el-icon><VideoPlay /></el-icon>
      全部执行
    </el-button>
    <el-dropdown trigger="click" @command="(key) => onLayoutDirectionChange(key)">
      <el-button type="primary" size="small">
        布局 {{ layoutLabel }}
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="TB">竖向布局</el-dropdown-item>
          <el-dropdown-item command="LR">横向布局</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <el-button type="primary" size="small" @click="onCopy">
      <el-icon><CopyDocument /></el-icon>
      复制
    </el-button>
    <el-button type="primary" size="small" @click="onPaste">
      <el-icon><DocumentCopy /></el-icon>
      粘贴
    </el-button>
  </el-space>
</template>

<script setup>
import { ref } from 'vue';
import { useGraphInstance } from '@/components/xflow-vue/src/composables/useGraphInstance';
import { useClipboard } from '@/components/xflow-vue/src/composables/useClipboard';
import { useGraphEvent } from '@/components/xflow-vue/src/composables/useGraphEvent';
import { useGraphStore } from '@/components/xflow-vue/src/composables/useGraphStore';
import { useKeyboard } from '@/components/xflow-vue/src/composables/useKeyboard';
import { CopyDocument, DocumentCopy, VideoPlay } from '@element-plus/icons-vue';
import { dagreLayout } from '../utils/layout.js';

const emit = defineEmits(['layout-change']);

const graph = useGraphInstance();
const clipboard = useClipboard(graph);
const graphStore = useGraphStore();

const layoutDir = ref('LR');
const layoutLabel = ref('横向');

const onCopy = () => {
  clipboard.copy();
};

const onPaste = () => {
  clipboard.paste();
};

const onDelete = (e) => {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();
  const g = graph?.value;
  if (!g) return;
  const selectedNodes = g.getSelectedCells().filter((cell) => cell.isNode?.());
  if (selectedNodes.length) {
    graphStore.removeNodes(selectedNodes.map((cell) => cell.id));
  }
};

useKeyboard('ctrl+c', (e) => { e?.preventDefault?.(); onCopy(); });
useKeyboard('ctrl+v', (e) => { e?.preventDefault?.(); onPaste(); });
useKeyboard('backspace', onDelete);
useKeyboard('delete', onDelete);

useGraphEvent('node:change:data', ({ node }) => {
  const g = graph?.value;
  if (!g) return;
  const edges = g.getIncomingEdges(node) || [];
  const status = node?.getData?.().status;
  edges.forEach((edge) => {
    graphStore.updateEdge(edge.id, {
      animated: status === 'running',
    });
  });
});

const handleExecute = () => {
  const g = graph?.value;
  if (!g) return;
  const nodes = g.getNodes();
  nodes.forEach((node, index) => {
    const nodeData = node.getData() || {};
    graphStore.updateNode(node.id, {
      data: {
        ...nodeData,
        status: 'running',
      },
    });

    window.setTimeout(() => {
      const outgoing = g.getOutgoingEdges(node) || [];
      const hasOutgoing = outgoing.length > 0;
      const numericId = parseInt(String(node.id).replace(/[^0-9]/g, ''), 10);
      const fallbackStatus = Number.isNaN(numericId) || numericId % 2 !== 0 ? 'success' : 'failed';
      graphStore.updateNode(node.id, {
        data: {
          ...nodeData,
          status: hasOutgoing ? 'success' : fallbackStatus,
        },
      });
      outgoing.forEach((edge) => {
        graphStore.updateEdge(edge.id, {
          animated: false,
        });
      });
    }, 1000 * index + 1);
  });
};

const onLayoutDirectionChange = async (dir) => {
  const g = graph?.value;
  if (!g) return;
  layoutDir.value = dir;
  layoutLabel.value = dir === 'TB' ? '竖向' : '横向';
  await dagreLayout(g, dir);
  g.centerContent();
  // 通知父级更新 DnD 使用的布局方向
  emit('layout-change', dir);
};
</script>

<style scoped>
</style>
