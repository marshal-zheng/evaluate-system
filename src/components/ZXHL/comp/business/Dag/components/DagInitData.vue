<template></template>

<script setup>
import { onMounted, watch } from 'vue';
import { useGraphInstance } from '../../ZxFlow/composables/useGraphInstance';
import { useGraphStore } from '../../ZxFlow/composables/useGraphStore';
import { dagreLayout } from '../utils/layout.js';
import { registerDagShapes, DAG_NODE, DAG_EDGE } from '../shapes/registerDagShapes';

// Props 定义
const props = defineProps({
  // 初始数据，支持静态数据、Promise或函数
  initialData: {
    type: [Object, Promise, Function],
    default: null
  },
  // 是否自动布局
  autoLayout: {
    type: Boolean,
    default: true
  },
  // 布局方向
  layoutDirection: {
    type: String,
    default: 'LR',
    validator: (value) => ['LR', 'TB'].includes(value)
  }
});

const graph = useGraphInstance();
const graphStore = useGraphStore();
// 向父级通知数据或布局完成
const emit = defineEmits(['data-updated']);

// 注册 DAG 图形
registerDagShapes();

// 将数据转换为DAG画布格式
const convertToDAGFormat = (data) => {
  if (!data || !data.nodes || !data.edges) {
    return { nodes: [], edges: [] };
  }

  const nodes = data.nodes.map(node => ({
    id: node.id,
    shape: DAG_NODE,
    x: node.x || 0,
    y: node.y || 0,
    width: 200,
    height: 40,
    data: {
      // 支持新的数据结构
      type: node.type,
      properties: node.properties,
      // 兼容旧结构
      label: node.properties?.content?.label || node.label || '未命名节点',
      status: 'default',
      // 保存原始数据
      originalData: node
    },
    ports: generateNodePorts(node.type),
    draggable: true,
    locked: false,
  }));

  const edges = data.edges.map(edge => ({
    id: edge.id,
    shape: DAG_EDGE,
    source: { cell: edge.sourceNodeId, port: 'b' }, // 指定源端口为底部
    target: { cell: edge.targetNodeId, port: 't' }, // 指定目标端口为顶部
    animated: false,
    router: 'normal',
    connector: 'smooth',
  }));

  return { nodes, edges };
};

// 根据节点类型生成端口
const generateNodePorts = (nodeType) => {
  const ports = [];
  
  // 为所有节点类型生成标准端口，但根据类型控制可见性
  const portConfigs = [
    { 
      id: 't', 
      group: 'top',
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: '#31d0c6',
          strokeWidth: 2,
          fill: '#fff',
          style: {
            visibility: nodeType !== 'root-node' ? 'visible' : 'hidden'
          }
        }
      },
      position: { name: 'top' }
    },
    { 
      id: 'b', 
      group: 'bottom',
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: '#31d0c6',
          strokeWidth: 2,
          fill: '#fff',
          style: {
            // 所有节点都可以有底部连接桩，包括叶子节点
            visibility: 'visible'
          }
        }
      },
      position: { name: 'bottom' }
    }
  ];
  
  return portConfigs;
};

// 加载和设置数据
const loadAndSetData = async (dataSource) => {
  try {
    let data;
    
    // 如果是函数，调用函数获取数据
    if (typeof dataSource === 'function') {
      data = await dataSource();
    }
    // 如果是Promise，等待解析
    else if (dataSource && typeof dataSource.then === 'function') {
      data = await dataSource;
    } else {
      data = dataSource;
    }
    
    if (!data) return;
    
    // 清空现有数据 - 使用正确的方法
    const allNodes = graphStore.nodes.map(node => node.id);
    const allEdges = graphStore.edges.map(edge => edge.id);
    
    if (allNodes.length > 0) {
      graphStore.removeNodes(allNodes);
    }
    if (allEdges.length > 0) {
      graphStore.removeEdges(allEdges);
    }
    
    // 转换数据格式
    const { nodes, edges } = convertToDAGFormat(data);
    
    // 添加节点和边
    if (nodes.length > 0) {
      graphStore.addNodes(nodes);
    }
    
    if (edges.length > 0) {
      graphStore.addEdges(edges);
    }
    
    // 自动布局
    if (props.autoLayout && nodes.length > 0) {
      setTimeout(async () => {
        const g = graph?.value;
        if (!g) return;
        
        // 先让节点渲染完成，再进行布局
        await new Promise(resolve => setTimeout(resolve, 200));
        await dagreLayout(g, props.layoutDirection, 100, 80); // 设置合适的间距
        g.centerContent();
        // 通知父级刷新小地图
        emit('data-updated');
      }, 300);
    } else {
      // 非自动布局场景也通知父级（例如手动布局或仅增删节点）
      emit('data-updated');
    }
    
  } catch (error) {
    console.error('加载DAG数据失败:', error);
  }
};

// 监听初始数据变化
watch(() => props.initialData, (newData) => {
  if (newData) {
    loadAndSetData(newData);
  }
}, { immediate: true });

onMounted(async () => {
  // 如果有初始数据，加载它
  if (props.initialData) {
    await loadAndSetData(props.initialData);
  }
});
</script>

<style scoped>
</style>
