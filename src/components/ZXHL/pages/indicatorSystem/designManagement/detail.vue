<template>
  <div class="xflow-dag-container">
    <!-- 顶部操作栏 -->
    <div class="dag-actions">
      <el-button type="primary" @click="handleGetSaveData">
        <el-icon><Document /></el-icon>
        获取保存数据
      </el-button>
      
      <!-- 新功能测试按钮 -->
      <el-divider direction="vertical" />
      
      <el-button 
        :type="showSidebar ? 'primary' : 'default'" 
        @click="toggleSidebar"
      >
        <el-icon><Menu /></el-icon>
        {{ showSidebar ? '隐藏' : '显示' }}侧边栏
      </el-button>
      
      <el-button 
        :type="showToolbar ? 'primary' : 'default'" 
        @click="toggleToolbar"
      >
        <el-icon><Operation /></el-icon>
        {{ showToolbar ? '隐藏' : '显示' }}工具栏
      </el-button>
      
      <el-button 
        :type="readonly ? 'danger' : 'success'" 
        @click="toggleReadonly"
      >
        <el-icon><Lock v-if="readonly" /><Unlock v-else /></el-icon>
        {{ readonly ? '只读模式' : '编辑模式' }}
      </el-button>
      
      <el-divider direction="vertical" />
      
      <el-button 
        :type="useStaticOperators ? 'info' : 'primary'" 
        @click="toggleOperatorsDataMode"
        :loading="operatorsLoading"
      >
        <el-icon><DataBoard /></el-icon>
        {{ useStaticOperators ? '使用静态数据' : '使用异步数据' }}
      </el-button>
    </div>
    
    <div class="dag-content">
      <DAGPage 
        ref="dagPageRef"
        :operators="useStaticOperators ? staticOperators : loadOperatorsData"
        :operators-loading="operatorsLoading"
        :dnd-config="dndConfig"
        :layout="layoutMode"
        :custom-menu-handler="customMenuHandler"
        :initial-graph-data="loadIndicatorSystemData"
        :graph-loading="graphLoading"
        :auto-layout="true"
        :show-sidebar="showSidebar"
        :readonly="readonly"
        :show-toolbar="showToolbar"
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
import { ref, onMounted } from 'vue';
import { DAGPage } from '@/components/ZXHL/comp/business/Dag/index.vue'
import IndicatorDetailFormDrawer from './components/IndicatorDetailFormDrawer.vue'
import { useMessageBox } from '@/composables/useElementPlus'
import { useGraphStore } from '@/components/ZXHL/comp/business/ZxFlow/composables/useGraphStore'
import { indicatorApi } from '@/components/ZXHL/api/modules/indicator'
import { Document, Menu, Operation, Lock, Unlock, DataBoard } from '@element-plus/icons-vue'

// 初始化工具函数
const { showConfirm } = useMessageBox()
const graphStore = useGraphStore()

// DAGPage 组件引用
const dagPageRef = ref(null)

// Mock 数据 - 用户简单格式
const staticOperators = [
  // 数据源类
  { name: 'MySQL数据源', value: '连接MySQL数据库读取数据' },
  { name: 'CSV文件读取', value: '读取本地CSV文件数据' },
  { name: 'API数据获取', value: 'REST API接口数据获取' },
  
  // 数据处理类
  { name: '数据过滤', value: '按条件过滤和筛选数据' },
  { name: '数据转换', value: '字段映射和数据转换' },
  { name: '数据关联', value: '多表关联和数据合并' },
  
  // 机器学习类
  { name: '线性回归', value: '线性回归算法模型训练' },
  { name: '决策树', value: '决策树分类算法' },
  { name: '神经网络', value: '深度学习神经网络模型' },
  
  // 数据输出类
  { name: '文件导出', value: '导出结果到文件' },
  { name: '数据库写入', value: '写入数据到数据库' },
  { name: 'API发布', value: '发布为API服务接口' },
];

// 数据配置
const operators = ref([]);
const operatorsLoading = ref(false);
const layoutMode = ref('vertical'); // 'vertical' | 'horizontal'

// 指标详情抽屉相关
const showIndicatorDrawer = ref(false);
const currentIndicatorData = ref({});
// 当前正在编辑的节点ID
const editingNodeId = ref('');

// 图数据相关
const graphLoading = ref(false);

// 新增功能测试相关
const showSidebar = ref(true);
const readonly = ref(false);
const showToolbar = ref(true);

// 数据模式切换相关
const useStaticOperators = ref(false);

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

// 自定义菜单处理器 - 将自定义菜单放在上面，通用菜单放在下面
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
    // 空白区域只使用标准菜单项，不添加自定义的"添加指标"
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
    customType: propsData.customType || '',
    customProperties: propsData.customProperties || '',
    unit: propsData.unit || '',
    priority: propsData.priority || '',
    defaultValue: propsData.defaultValue || '',
    notes: propsData.notes || ''
  };

  showIndicatorDrawer.value = true;
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
    
  } catch (error) {
    // 用户取消删除或发生错误
    if (error !== 'cancel') {
      console.error('删除指标节点时发生错误:', error);
    }
  }
};

// 添加节点处理函数
const handleAddNode = (position) => {
  console.log('添加指标节点:', position);
  // 这里可以添加新增节点的逻辑
};

// 指标表单确认处理
const handleIndicatorConfirm = (formData) => {
  console.log('指标表单确认:', formData);

  try {
    const nodeId = editingNodeId.value;
    if (!nodeId) return;

    // 仅叶子结点保留计算模型；非叶子结点强制清空
    const isLeafNode = !!currentIndicatorData.value.isLeafNode;
    const nextOtherData = isLeafNode && formData.calculationModel ? {
      id: formData.calculationModel,
      name: formData.calculationModelName,
    } : {};

    // 构建更新数据 - 使用扁平化的结构以确保X6能正确处理
    const updateData = {
      data: {
        label: formData.indicatorName,
        properties: {
          content: {
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
      console.log('节点更新后的数据:', updatedNode);
      
      // 尝试直接通过X6 API更新节点数据，确保触发Vue组件重新渲染
      if (dagPageRef.value?.getGraph) {
        const graph = dagPageRef.value.getGraph();
        const x6Node = graph?.getCellById?.(nodeId);
        if (x6Node) {
          console.log('直接通过X6更新节点数据');
          x6Node.setData(updateData.data);
          // 同时更新label属性
          x6Node.setAttrByPath('text/text', formData.indicatorName);
        }
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

// 清理节点数据，移除 originalData
const cleanNodeData = (nodeData) => {
  if (!nodeData) return nodeData;
  const cleaned = { ...nodeData };
  if (cleaned.originalData) {
    delete cleaned.originalData;
  }
  return cleaned;
};

// 主动获取保存数据的方法
const handleGetSaveData = () => {
  if (!dagPageRef.value) {
    console.warn('DAGPage 组件引用不存在');
    return;
  }

  try {
    const graphData = dagPageRef.value.getSaveData();
    if (graphData) {
      console.log('获取到的完整图数据（与data.json格式一致）:', graphData);
      
      // 验证数据格式
      const { nodes = [], edges = [] } = graphData;
      console.log('节点数据格式验证:', nodes[0]);
      console.log('边数据格式验证:', edges[0]);
      
      // 这里可以调用API保存数据
      // await indicatorApi.saveIndicatorSystemStructure(systemId, graphData);
      
      return graphData;
    }
  } catch (error) {
    console.error('获取图数据时出错:', error);
  }
};

// 保存图数据处理（来自工具栏的保存事件）
const handleSave = (graphData) => {
  console.log('接收到保存的图数据:', graphData);
  
  // 这里可以调用API保存数据
  // await indicatorApi.saveIndicatorSystemStructure(systemId, graphData);
  
  // 触发自定义事件或其他处理逻辑
  // 例如：更新父组件状态、显示保存成功消息等
};

// 新增功能测试函数
const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value;
  console.log('侧边栏状态切换:', showSidebar.value ? '显示' : '隐藏');
};

const toggleToolbar = () => {
  showToolbar.value = !showToolbar.value;
  console.log('工具栏状态切换:', showToolbar.value ? '显示' : '隐藏');
};

const toggleReadonly = () => {
  readonly.value = !readonly.value;
  console.log('模式切换:', readonly.value ? '只读模式' : '编辑模式');
};

const toggleOperatorsDataMode = () => {
  useStaticOperators.value = !useStaticOperators.value;
  console.log('算子数据模式切换:', useStaticOperators.value ? '静态数据' : '异步数据');
};

// 加载算子数据 - 支持Promise和静态数据两种方式
const loadOperatorsData = async () => {
  try {
    operatorsLoading.value = true;
    
    // 模拟异步加载算子数据
    // 实际使用时可以调用API: const response = await indicatorApi.getOperators();
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

// 加载指标体系结构数据
const loadIndicatorSystemData = async () => {
  try {
    // 模拟从路由参数获取systemId，实际使用时从路由参数获取
    const systemId = '1663477489012345678'; // 使用data.json中的根节点ID作为系统ID
    
    // 调用API获取数据
    const response = await indicatorApi.getIndicatorSystemStructure(systemId);
    
    // 返回数据，这里直接返回mock数据的格式
    return response.data || response;
    
  } catch (error) {
    console.error('加载指标体系数据失败:', error);
    // 返回空数据
    return { nodes: [], edges: [] };
  }
};

// 初始化数据
onMounted(async () => {
  console.log('初始化自定义菜单处理器');
  
  // 注意：现在 operators 和 initial-graph-data 都支持 Promise 方式
  // DAG 组件会自动处理这些异步数据的加载
});
</script>

<style>
.xflow-context-menu .menu-item {
  color:  #000 !important;
}
.xflow-dag-container {
  width: 100%;
  height: 100%;
  min-height: 600px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dag-actions {
  padding: 12px 16px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.dag-actions .el-divider--vertical {
  height: 24px;
  margin: 0 8px;
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
</style>
