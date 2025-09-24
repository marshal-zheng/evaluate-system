<template></template>

<script setup>
import { onMounted, watch, nextTick } from 'vue';
import { useGraphInstance } from '../../ZxFlow/composables/useGraphInstance';
import { useGraphStore } from '../../ZxFlow/composables/useGraphStore';
import { dagreLayout } from '../utils/layout.js';
import { getNodeSizeByLayout } from '../utils/nodeGeometry.js';
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
  console.log('DagInitData - 转换数据:', data);
  if (!data || !data.nodes || !data.edges) {
    console.log('DagInitData - 数据为空或格式不正确');
    return { nodes: [], edges: [] };
  }

  const layoutOrientation = props.layoutDirection === 'TB' ? 'vertical' : 'horizontal';
  const sizeConfig = getNodeSizeByLayout(layoutOrientation);

  const nodes = data.nodes.map(node => ({
    id: node.id,
    shape: DAG_NODE,
    x: node.x || 0,
    y: node.y || 0,
    width: sizeConfig.width,
    height: sizeConfig.height,
    data: {
      // 支持新的数据结构
      type: node.type,
      properties: node.properties,
      // 兼容旧结构
      label: node.properties?.content?.label || node.label || '未命名节点',
      status: 'default',
      layoutDirection: layoutOrientation,
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
    
    console.log('DagInitData - 开始加载数据:', dataSource);
    console.log('DagInitData - 数据源类型:', typeof dataSource);
    
    // 如果是函数，调用函数获取数据
    if (typeof dataSource === 'function') {
      console.log('DagInitData - 调用函数获取数据');
      data = await dataSource();
    }
    // 如果是Promise，等待解析
    else if (dataSource && typeof dataSource.then === 'function') {
      console.log('DagInitData - 等待Promise解析');
      data = await dataSource;
    } else {
      console.log('DagInitData - 直接使用数据');
      data = dataSource;
    }
    
    console.log('DagInitData - 解析后的数据:', data);
    console.log('DagInitData - 节点数量:', data?.nodes?.length);
    console.log('DagInitData - 边数量:', data?.edges?.length);
    
    if (!data) {
      console.log('DagInitData - 数据为空，退出');
      return;
    }
    
    if (!data.nodes || !Array.isArray(data.nodes)) {
      console.error('DagInitData - 数据格式错误，nodes不是数组:', data);
      return;
    }
    
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
    
    console.log('DagInitData - 转换后的节点:', nodes);
    console.log('DagInitData - 转换后的边:', edges);
    console.log('DagInitData - 当前图实例:', graph?.value);
    
    // 添加节点和边
    if (nodes.length > 0) {
      console.log('DagInitData - 添加节点到store');
      graphStore.addNodes(nodes);
      console.log('DagInitData - store中的节点数量:', graphStore.nodes.length);
    }
    
    if (edges.length > 0) {
      console.log('DagInitData - 添加边到store');
      graphStore.addEdges(edges);
      console.log('DagInitData - store中的边数量:', graphStore.edges.length);
    }
    
    // 等待图实例准备好，然后进行布局
    const waitForGraphAndLayout = async () => {
      let attempts = 0;
      const maxAttempts = 20; // 最多等待2秒
      
      while (attempts < maxAttempts) {
        const g = graph?.value;
        console.log(`DagInitData - 等待图实例，尝试 ${attempts + 1}/${maxAttempts}:`, !!g);
        
        if (g) {
          console.log('DagInitData - 图实例已准备好，开始布局');
          
          if (props.autoLayout && nodes.length > 0) {
            // 先让节点渲染完成，再进行布局
            await new Promise(resolve => setTimeout(resolve, 200));
            await dagreLayout(g, props.layoutDirection, 100, 80);
            g.centerContent();
            console.log('DagInitData - 自动布局完成');
          }
          
          // 通知父级刷新小地图
          emit('data-updated');
          return;
        }
        
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.error('DagInitData - 等待图实例超时');
      // 即使没有图实例，也通知父级
      emit('data-updated');
    };
    
    // 启动等待和布局流程
    waitForGraphAndLayout();
    
  } catch (error) {
    console.error('加载DAG数据失败:', error);
  }
};

// 监听初始数据变化
watch(() => props.initialData, (newData) => {
  console.log('DagInitData - watch 触发，新数据:', newData);
  console.log('DagInitData - 数据类型:', typeof newData);
  if (newData) {
    // 延迟执行，确保图实例已经准备好
    setTimeout(() => {
      loadAndSetData(newData);
    }, 100);
  }
}, { immediate: false, deep: true }); // 改为 false，避免在图实例准备前执行

watch(
  () => props.layoutDirection,
  async (newDirection, oldDirection) => {
    if (!newDirection || newDirection === oldDirection) return;
    console.log('DagInitData - 布局方向变化:', { newDirection, oldDirection });
    await nextTick();
    const g = graph?.value;
    if (!g) {
      console.log('DagInitData - 图实例未准备好，暂不应用新的布局方向');
      return;
    }
    try {
      await dagreLayout(g, newDirection, 100, 80);
      g.centerContent?.();
      console.log('DagInitData - 布局方向更新完成');
    } catch (error) {
      console.warn('DagInitData - 布局方向更新失败:', error);
    }
  }
);

onMounted(async () => {
  console.log('DagInitData - onMounted 触发');
  
  // 等待足够的时间确保 XFlowGraph 完全初始化
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 如果有初始数据，加载它
  if (props.initialData) {
    console.log('DagInitData - onMounted 开始加载初始数据');
    await loadAndSetData(props.initialData);
  }
});
</script>

<style scoped>
</style>
