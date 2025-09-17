<template>
  <div class="table-widget-test">
    <h2>TableWidget 组件测试</h2>
    
    <div class="test-container">
      <h3>评估数据表格展示</h3>
      <div class="table-container">
        <TableWidget :panel="testPanel" />
      </div>
    </div>

    <div class="test-info">
      <h3>当前数据信息</h3>
      <p>评估指标数量: {{ parsedData?.detailNames?.length || 0 }}</p>
      <p>评估系列数量: {{ parsedData?.titleList?.length || 0 }}</p>
      <p>数据行数: {{ parsedData?.zhpgObjectResultList?.length || 0 }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import TableWidget from '@/components/ZXHL/comp/business/Widget/components/TableWidget.vue'

// 测试数据 - 按照正确的数据结构格式
const testPanel = ref({
  metadata: {
    data: JSON.stringify({
      zhpgObjectResultList: [
        ['0.85', '0.92', '0.78', '0.88', '0.91'],  // 第一季度评估数据
        ['0.76', '0.83', '0.89', '0.72', '0.85'],  // 第二季度评估数据
        ['0.91', '0.87', '0.82', '0.94', '0.79']   // 第三季度评估数据
      ],
      detailNames: [
        '评估指标',      // 第一列表头
        '学习能力',      // 第一列数据
        '沟通技巧', 
        '团队协作',
        '创新思维',
        '执行力'
      ],
      titleList: [
        '第一季度评估',   // 第二列表头
        '第二季度评估',   // 第三列表头
        '第三季度评估'    // 第四列表头
      ]
    })
   }
 })

// 解析数据用于显示信息
const parsedData = computed(() => {
  try {
    return JSON.parse(testPanel.value.metadata.data)
  } catch (error) {
    return {}
  }
})
</script>

<style scoped>
.table-widget-test {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.test-container {
  margin-bottom: 30px;
}

.table-container {
  height: 400px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  padding: 16px;
  background: var(--el-bg-color);
}

.test-info {
  padding: 16px;
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
}

.test-info h3 {
  margin-top: 0;
  color: var(--el-text-color-primary);
}

.test-info p {
  margin: 8px 0;
  color: var(--el-text-color-regular);
}

h2, h3 {
  color: var(--el-text-color-primary);
}
</style>