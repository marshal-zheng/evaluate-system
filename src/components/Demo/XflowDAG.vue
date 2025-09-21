<template>
  <div class="xflow-dag-container">
    <DAGPage 
      :operators="operators"
      :operators-loading="operatorsLoading"
      :dnd-config="dndConfig"
      :layout="layoutMode"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { DAGPage } from '../dag-vue/index.vue';

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

// 初始化数据
onMounted(() => {
  operators.value = staticOperators;
});
</script>

<style scoped>
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
