<template>
  <div class="demo15-container">
    <div class="demo-header">
      <h2>Demo15 - 连线样式和端口显隐测试</h2>
      <p>测试修复后的连线样式（灰色自定义样式）和端口显隐功能（hover时显示）</p>
    </div>
    <div class="demo-content">
      <DAGPage 
        :operators="operators"
        :operators-loading="false"
        :dnd-config="dndConfig"
        layout="vertical"
      />
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import DAGPage from '@/components/dag-vue/index.vue';

export default defineComponent({
  name: 'Demo15',
  components: {
    DAGPage,
  },
  setup() {
    const operators = [
      {
        key: 'data-source',
        title: '数据源',
        shortDesc: '从数据库或文件读取数据',
        category: '数据输入',
        ports: [
          { id: 'out', group: 'bottom' }
        ]
      },
      {
        key: 'data-transform',
        title: '数据转换',
        shortDesc: '对数据进行清洗和转换',
        category: '数据处理',
        ports: [
          { id: 'in', group: 'top' },
          { id: 'out', group: 'bottom' }
        ]
      },
      {
        key: 'model-train',
        title: '模型训练',
        shortDesc: '使用机器学习算法训练模型',
        category: '机器学习',
        ports: [
          { id: 'in', group: 'top' },
          { id: 'out', group: 'bottom' }
        ]
      },
      {
        key: 'model-predict',
        title: '模型预测',
        shortDesc: '使用训练好的模型进行预测',
        category: '机器学习',
        ports: [
          { id: 'model', group: 'left' },
          { id: 'data', group: 'top' },
          { id: 'out', group: 'bottom' }
        ]
      },
      {
        key: 'data-output',
        title: '数据输出',
        shortDesc: '将结果输出到文件或数据库',
        category: '数据输出',
        ports: [
          { id: 'in', group: 'top' }
        ]
      }
    ];

    const dndConfig = {
      title: '算子库',
      searchPlaceholder: '搜索算子、组件...',
      textConfig: {
        emptyText: '暂无算子',
        loadingText: '加载中...'
      }
    };

    return {
      operators,
      dndConfig,
    };
  },
});
</script>

<style lang="scss" scoped>
.demo15-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.demo-header {
  padding: 16px;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;

  h2 {
    margin: 0 0 8px 0;
    font-size: 18px;
    color: #333;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: #666;
  }
}

.demo-content {
  flex: 1;
  overflow: hidden;
}
</style>