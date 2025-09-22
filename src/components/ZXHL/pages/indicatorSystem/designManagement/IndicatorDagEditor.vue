<template>
  <div class="indicator-dag-editor">
    <div class="dag-content">
      <DAGPage 
        ref="dagPageRef"
        :operators="useStaticOperators ? staticOperators : loadOperatorsData"
        :operators-loading="operatorsLoading"
        :dnd-config="dndConfig"
        :layout="layoutMode"
        :custom-menu-handler="customMenuHandler"
        :initial-graph-data="processedGraphData"
        :graph-loading="graphLoading"
        :auto-layout="true"
        :show-sidebar="computedShowSidebar"
        :readonly="computedReadonly"
        :show-toolbar="isShowToolbar"
        @edit-node="handleEditNode"
        @save="handleSave"
      />
    </div>
    
    <!-- 指标详情表单抽屉 -->
    <IndicatorDetailFormDrawer
      v-model="showIndicatorDrawer"
      :indicator-data="currentIndicatorData"
      :disabled-menu="[]"
      :is-read-only="false"
      @confirm="handleIndicatorConfirm"
      @cancel="handleIndicatorCancel"
      @close="handleIndicatorClose"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { DAGPage } from '@/components/ZXHL/comp/business/Dag/index.vue'
import IndicatorDetailFormDrawer from './components/IndicatorDetailFormDrawer.vue'
import { useMessageBox } from '@/composables/useElementPlus'
import { useGraphStore } from '@/components/ZXHL/comp/business/ZxFlow/composables/useGraphStore'
import { indicatorApi } from '@/components/ZXHL/api/modules/indicator'

// Props 定义
const props = defineProps({
  // 基础指标数据（左侧树列表）
  listData: {
    type: Array,
    default: () => []
  },
  // 图数据
  graphData: {
    type: [Object, Function],
    default: () => ({ nodes: [], edges: [] })
  },
  // 是否显示左侧导航树
  isShowSideNav: {
    type: Boolean,
    default: true
  },
  isShowToolbar: {
    type: Boolean,
    default: true
  },
  // 是否可编辑
  isEditable: {
    type: Boolean,
    default: true
  }
})

// Emits 定义
const emit = defineEmits(['save', 'edit-node', 'delete-node'])

// 初始化工具函数
const { showConfirm } = useMessageBox()
const graphStore = useGraphStore()

// DAGPage 组件引用
const dagPageRef = ref(null)

// 响应式数据
const operatorsLoading = ref(false);
const layoutMode = ref('vertical');
const graphLoading = ref(false);

// 控制状态
const showSidebar = ref(props.isShowSideNav);
const readonly = ref(!props.isEditable);
const showToolbar = ref(true);
const useStaticOperators = ref(true);

// 指标详情抽屉相关
const showIndicatorDrawer = ref(false);
const currentIndicatorData = ref({});
const editingNodeId = ref('');

// 计算属性
const computedShowSidebar = computed(() => showSidebar.value);
const computedReadonly = computed(() => readonly.value);

// 静态算子数据
const staticOperators = computed(() => {
  return props.listData.length > 0 ? props.listData : [];
});

// 处理图数据 - 使用 ref 而不是 computed，确保能触发响应式更新
const processedGraphData = ref(null);

// 监听 graphData 变化并更新 processedGraphData
watch(() => props.graphData, (newData) => {
  console.log('IndicatorDagEditor - 图数据变化:', newData);
  if (typeof newData === 'function') {
    // 如果是函数，直接传递给 DAGPage
    processedGraphData.value = newData;
  } else if (newData && typeof newData === 'object') {
    // 如果是静态对象，包装成函数返回该对象
    processedGraphData.value = () => Promise.resolve(newData);
  } else {
    // 默认返回空数据的函数
    processedGraphData.value = () => Promise.resolve({ nodes: [], edges: [] });
  }
}, { immediate: true, deep: true });

// DnD 配置
const dndConfig = {
  title: '智能指标体系',
  searchPlaceholder: '搜索指标体系...',
  textConfig: {
    loadingText: '正在加载组件...',
    emptySearchText: '没有找到匹配的组件',
    emptySearchDesc: '请尝试使用其他关键词搜索',
    emptyDataText: '暂无可用指标体系',
    emptyDataDesc: ''
  }
};

// 监听 props 变化
watch(() => props.isShowSideNav, (newVal) => {
  showSidebar.value = newVal;
});

watch(() => props.isEditable, (newVal) => {
  readonly.value = !newVal;
});



// 自定义菜单处理器
const customMenuHandler = (standardItems, type, target) => {
  const customItems = [];
  
  if (type === 'node') {
    // 自定义菜单项（放在上面）
    customItems.push(
      {
        id: 'edit-indicator',
        label: '编辑指标',
        icon: 'Edit',
        action: () => handleEditNode(target),
      },
      {
        id: 'delete-indicator',
        label: '删除指标',
        icon: 'Delete',
        action: () => handleDeleteNode(target),
        danger: true,
      }
    );
    
    // 添加分隔线
    customItems.push({ type: 'divider' });
    
    // 然后添加通用菜单项（过滤掉不需要的）
    const filteredStandardItems = standardItems.filter(item => 
      item.type === 'divider' || !['delete'].includes(item.id)
    );
    customItems.push(...filteredStandardItems);
    
  } else if (type === 'blank') {
    // 空白区域只使用标准菜单项
    customItems.push(...standardItems);
    
  } else {
    // 其他类型（如边）使用标准菜单
    return standardItems;
  }
  
  return customItems;
};

// 编辑节点处理函数
const handleEditNode = (node) => {
  console.log('编辑指标节点:', node);

  // 记录当前编辑的节点ID
  editingNodeId.value = node?.id || '';

  // 从节点数据中提取指标信息
  const nodeData = node?.getData?.() || {};
  const propsData = nodeData.properties || {};
  const content = propsData.content || {};
  const otherData = propsData.otherData || {};

  // 是否叶子结点（仅叶子可以配置计算模型）
  const isLeafNode = (nodeData.type === 'leaf-node');

  // 计算模型名称兜底字段
  const modelName = otherData.oprModelName || otherData.name || otherData.title || otherData.label || '';
  const modelId = otherData.id || '';
  const modelData = otherData || null;

  // 解析上级指标名称（而非ID）
  let parentIndicatorName = '';
  const parentId = propsData.parentNodeId || '';
  try {
    if (parentId && typeof graphStore?.getNodeById === 'function') {
      const parentNode = graphStore.getNodeById(parentId);
      const parentData = parentNode?.data || {};
      const parentProps = parentData.properties || {};
      const parentContent = parentProps.content || {};
      parentIndicatorName = parentContent.label || parentData.label || '';
    }
  } catch (e) {
    // 忽略获取父名称的异常
  }

  // 构造指标数据，映射到表单字段
  currentIndicatorData.value = {
    id: editingNodeId.value,
    isLeafNode,
    parentIndicator: parentIndicatorName,
    indicatorName: content.label || nodeData.label || '',
    supportDescription: typeof propsData.weight === 'number' ? propsData.weight : 0,
    calculationModel: isLeafNode ? modelId : '',
    calculationModelName: isLeafNode ? modelName : '',
    calculationModelData: isLeafNode && modelId ? modelData : null,
    customType: propsData.customType || '',
    customProperties: propsData.customProperties || '',
    unit: propsData.unit || '',
    priority: propsData.priority || '',
    defaultValue: propsData.defaultValue || '',
    notes: propsData.notes || ''
  };

  showIndicatorDrawer.value = true;
  
  // 触发外部事件
  emit('edit-node', node);
};

// 删除节点处理函数
const handleDeleteNode = async (node) => {
  console.log('删除指标节点:', node);
  
  try {
    // 获取节点信息
    const nodeData = node?.getData?.() || {};
    const nodeName = nodeData.label || '未命名指标';
    
    // 显示删除确认对话框
    await showConfirm(
      '删除指标确认',
      `确定要删除指标 "${nodeName}" 吗？删除后无法恢复。`,
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    );
    
    // 用户确认删除，执行删除操作
    if (node?.id) {
      graphStore.removeNodes([node.id]);
      console.log(`指标节点 "${nodeName}" 已删除`);
    }
    
    // 触发外部事件
    emit('delete-node', node);
    
  } catch (error) {
    // 用户取消删除或发生错误
    if (error !== 'cancel') {
      console.error('删除指标节点时发生错误:', error);
    }
  }
};

// 指标表单确认处理
const handleIndicatorConfirm = (formData) => {
  console.log('指标表单确认:', formData);

  try {
    const nodeId = editingNodeId.value;
    if (!nodeId) return;

    // 仅叶子结点保留计算模型；非叶子结点强制清空
    const isLeafNode = !!currentIndicatorData.value.isLeafNode;
    const nextOtherData = isLeafNode && formData.calculationModel && formData.calculationModelData ? 
      formData.calculationModelData : {};

    // 获取当前节点数据以保留现有结构
    const currentNode = graphStore.getNodeById?.(nodeId);
    const currentData = currentNode?.getData?.() || {};
    const currentProperties = currentData.properties || {};
    const currentContent = currentProperties.content || {};

    // 构建更新数据 - 保留现有结构，只更新需要变更的字段
    const updateData = {
      data: {
        ...currentData,
        label: formData.indicatorName,
        properties: {
          ...currentProperties,
          content: {
            ...currentContent,
            label: formData.indicatorName,
          },
          weight: typeof formData.supportDescription === 'number' ? formData.supportDescription : Number(formData.supportDescription || 0),
          otherData: nextOtherData,
          customType: formData.customType || '',
          customProperties: formData.customProperties || '',
          unit: formData.unit || '',
          priority: formData.priority || '',
          defaultValue: formData.defaultValue || '',
          notes: formData.notes || '',
        },
      },
      // 同时更新顶级 label 以确保兼容性
      label: formData.indicatorName,
    };

    console.log('更新节点数据:', nodeId, updateData);

    // 将表单数据写回到节点（Pinia store -> XFlow 同步渲染）
    graphStore.updateNode(nodeId, updateData);
    
    // 强制触发节点重新渲染
    setTimeout(() => {
      const updatedNode = graphStore.getNodeById?.(nodeId);
      console.log('IndicatorDagEditor - 节点更新后的数据:', updatedNode);
      console.log('IndicatorDagEditor - graphStore 中的所有节点:', graphStore.nodes?.map(n => ({ id: n.id, label: n.data?.label })));
      
      // 尝试直接通过X6 API更新节点数据，确保触发Vue组件重新渲染
      if (dagPageRef.value?.getGraph) {
        const graph = dagPageRef.value.getGraph();
        const x6Node = graph?.getCellById?.(nodeId);
        if (x6Node) {
          console.log('IndicatorDagEditor - 找到 X6 节点，当前数据:', x6Node.getData());
          console.log('IndicatorDagEditor - 即将更新为:', updateData.data);
          x6Node.setData(updateData.data);
          console.log('IndicatorDagEditor - X6 节点更新完成，新数据:', x6Node.getData());
        } else {
          console.error('IndicatorDagEditor - 在 X6 图中找不到节点:', nodeId);
          console.log('IndicatorDagEditor - X6 图中的所有节点:', graph?.getNodes()?.map(n => ({ id: n.id, data: n.getData() })));
        }
      } else {
        console.error('IndicatorDagEditor - 无法获取图实例');
      }
      
      // 如果有DAG页面引用，尝试强制刷新
      if (dagPageRef.value && typeof dagPageRef.value.forceUpdate === 'function') {
        dagPageRef.value.forceUpdate();
      }
    }, 100);
    
  } catch (e) {
    console.error('更新节点数据失败:', e);
  } finally {
    showIndicatorDrawer.value = false;
  }
};

// 指标表单取消处理
const handleIndicatorCancel = () => {
  console.log('指标表单取消');
  showIndicatorDrawer.value = false;
};

// 指标表单关闭处理
const handleIndicatorClose = () => {
  console.log('指标表单关闭');
  showIndicatorDrawer.value = false;
  currentIndicatorData.value = {};
};


// 保存图数据处理（来自工具栏的保存事件）
const handleSave = (graphData) => {
  console.log('接收到保存的图数据:', graphData);
  
  // 触发外部事件
  emit('save', graphData);
};


// 加载算子数据 - 支持Promise和静态数据两种方式
const loadOperatorsData = async () => {
  try {
    operatorsLoading.value = true;
    
    // 模拟异步加载算子数据
    await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟网络延迟
    
    // 这里可以从API获取更丰富的算子数据
    const operatorsData = [
      // 数据源类
      { name: 'MySQL数据源', value: '连接MySQL数据库读取数据', category: '数据源' },
      { name: 'CSV文件读取', value: '读取本地CSV文件数据', category: '数据源' },
      { name: 'API数据获取', value: 'REST API接口数据获取', category: '数据源' },
      
      // 数据处理类
      { name: '数据过滤', value: '按条件过滤和筛选数据', category: '数据处理' },
      { name: '数据转换', value: '字段映射和数据转换', category: '数据处理' },
      { name: '数据关联', value: '多表关联和数据合并', category: '数据处理' },
      
      // 机器学习类
      { name: '线性回归', value: '线性回归算法模型训练', category: '机器学习' },
      { name: '决策树', value: '决策树分类算法', category: '机器学习' },
      { name: '神经网络', value: '深度学习神经网络模型', category: '机器学习' },
      
      // 数据输出类
      { name: '文件导出', value: '导出结果到文件', category: '数据输出' },
      { name: '数据库写入', value: '写入数据到数据库', category: '数据输出' },
      { name: 'API发布', value: '发布为API服务接口', category: '数据输出' },
    ];
    
    return operatorsData;
    
  } catch (error) {
    console.error('加载算子数据失败:', error);
    // 返回空数组
    return [];
  } finally {
    operatorsLoading.value = false;
  }
};

// 暴露方法给外部使用
const getSaveData = () => {
  if (!dagPageRef.value) {
    console.warn('DAGPage 组件引用不存在');
    return;
  }

  try {
    const graphData = dagPageRef.value.getSaveData();
    if (graphData) {
      console.log('获取到的完整图数据（与data.json格式一致）:', graphData);
      
      // 处理数据，移除指定字段中的 '-' 字符
      const processedGraphData = {
        ...graphData,
        nodes: graphData.nodes?.map(node => ({
          ...node,
          id: node.id?.replace(/-/g, '') || node.id,
          properties: {
            ...node.properties,
            content: {
              ...node.properties?.content,
              id: node.properties?.content?.id?.replace(/-/g, '') || node.properties?.content?.id
            },
            parentNodeId: node.properties?.parentNodeId?.replace(/-/g, '') || node.properties?.parentNodeId
          }
        })) || [],
        edges: graphData.edges?.map(edge => ({
          ...edge,
          id: edge.id?.replace(/-/g, '') || edge.id,
          sourceNodeId: edge.sourceNodeId?.replace(/-/g, '') || edge.sourceNodeId,
          targetNodeId: edge.targetNodeId?.replace(/-/g, '') || edge.targetNodeId
        })) || []
      };
      
      // 验证数据格式
      const { nodes = [], edges = [] } = processedGraphData;
      console.log('节点数据格式验证:', nodes[0]);
      console.log('边数据格式验证:', edges[0]);
      
      return processedGraphData;
    }
  } catch (error) {
    console.error('获取图数据时出错:', error);
  }
};

const getGraph = () => {
  return dagPageRef.value?.getGraph?.();
};

// 暴露方法
defineExpose({
  getSaveData,
  getGraph,
  dagPageRef
});

// 初始化
onMounted(async () => {
  console.log('IndicatorDagEditor 初始化完成');
});
</script>

<style scoped>
.indicator-dag-editor {
  width: 100%;
  height: 100%;
  min-height: 600px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}


.dag-content {
  flex: 1;
  height: 100%;
  overflow: hidden;
}

/* 确保容器自适应 */
:deep(.page) {
  width: 100%;
  height: 100%;
}

:deep(.container) {
  height: 100%;
}

:deep(.center) {
  height: 100%;
}

:deep(.graph) {
  height: calc(100% - 42px);
}

.xflow-context-menu .menu-item {
  color: #000 !important;
}
</style>
