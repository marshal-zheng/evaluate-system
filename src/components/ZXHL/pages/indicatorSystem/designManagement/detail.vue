<template>
  <div class="xflow-dag-container">
    <DAGPage 
      :operators="operators"
      :operators-loading="operatorsLoading"
      :dnd-config="dndConfig"
      :layout="layoutMode"
      :custom-menu-items="customMenuItems"
      @edit-node="handleEditNode"
    />
    
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

// 可以通过 props 传入不同的数据来演示异步加载效果

// 数据配置
const operators = ref([]);
const operatorsLoading = ref(false);
const layoutMode = ref('vertical'); // 'vertical' | 'horizontal'

// 指标详情抽屉相关
const showIndicatorDrawer = ref(false);
const currentIndicatorData = ref({});

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

// 自定义右键菜单配置
const customMenuItems = {
  node: [
    {
      id: 'edit-indicator',
      label: '编辑指标',
      icon: 'Edit',
      action: (node) => {
        handleEditNode(node);
      },
    },
    {
      id: 'delete-indicator',
      label: '删除指标',
      icon: 'Delete',
      action: (node) => {
        handleDeleteNode(node);
      },
    },
    {
      id: 'copy-indicator',
      label: '复制指标',
      icon: 'DocumentCopy',
      action: (node) => {
        handleCopyNode(node);
      },
    }
  ],
  blank: [
    {
      id: 'add-indicator',
      label: '添加指标',
      icon: 'Plus',
      action: (position) => {
        handleAddNode(position);
      },
    }
  ]
};

// 编辑节点处理函数
const handleEditNode = (node) => {
  console.log('编辑指标节点:', node);
  
  // 从节点数据中提取指标信息
  const nodeData = node?.getData?.() || {};
  const originalData = nodeData.originalData || {};
  
  // 构造指标数据，映射到表单字段
  currentIndicatorData.value = {
    id: node?.id || '',
    parentIndicator: '', // 可以根据图结构分析上级指标
    indicatorName: nodeData.label || originalData.name || '',
    supportDescription: 0,
    calculationModel: '',
    calculationModelName: '',
    type: '指标点',
    attribute: '',
    priority: '',
    defaultValue: '',
    notes: nodeData.description || originalData.value || ''
  };
  
  showIndicatorDrawer.value = true;
};

// 删除节点处理函数
const handleDeleteNode = (node) => {
  console.log('删除指标节点:', node);
  // 这里可以添加删除确认对话框
  // 然后调用图实例的删除方法
};

// 复制节点处理函数
const handleCopyNode = (node) => {
  console.log('复制指标节点:', node);
  // 这里可以添加复制节点的逻辑
};

// 添加节点处理函数
const handleAddNode = (position) => {
  console.log('添加指标节点:', position);
  // 这里可以添加新增节点的逻辑
};

// 指标表单确认处理
const handleIndicatorConfirm = (formData) => {
  console.log('指标表单确认:', formData);
  
  // 这里可以调用API保存指标数据
  // 然后更新图中的节点数据
  
  showIndicatorDrawer.value = false;
  
  // 可以在这里更新节点显示
  // 如果有图实例的话，可以更新节点的label和data
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

// 初始化数据
onMounted(() => {
  operators.value = staticOperators;
  console.log('初始化自定义菜单项:', customMenuItems);
  
  // 监听customMenuItems的变化
  console.log('customMenuItems 内容:', JSON.stringify(customMenuItems, null, 2));
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
