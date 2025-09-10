<template>
  <div class="evaluation-detail">
    <div class="detail-header">
      <h1>评估详情页面</h1>
      <p>评估ID: {{ $route.params.id }}</p>
    </div>
    
    <div class="detail-content">
      <div class="section">
        <h2>基本信息</h2>
        <p>这里是评估基本信息的占位文字</p>
        <p>评估名称：示例评估项目</p>
        <p>评估类型：综合评估</p>
        <p>创建时间：2024-01-01</p>
        <p>评估状态：进行中</p>
      </div>
      
      <div class="section">
        <h2>评估详情</h2>
        <p>这里是评估详细内容的占位文字</p>
        <p>评估描述：这是一个示例评估项目的详细描述信息</p>
        <p>评估范围：包含多个维度的综合性评估</p>
        <p>评估方法：采用定量与定性相结合的评估方法</p>
      </div>
      
      <div class="section">
        <h2>评估结果</h2>
        <p>这里是评估结果的占位文字</p>
        <p>总体评分：85分</p>
        <p>评估等级：良好</p>
        <p>改进建议：需要在某些方面进行优化</p>
      </div>
      
      <div class="section">
        <h2>附件信息</h2>
        <p>这里是附件信息的占位文字</p>
        <p>评估报告.pdf</p>
        <p>数据分析表.xlsx</p>
        <p>图表资料.png</p>
      </div>
    </div>
    
    <div class="detail-actions">
      <el-button @click="goBack">返回列表</el-button>
      <el-button type="primary">编辑评估</el-button>
      <el-button type="success">导出报告</el-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.push('/evaluation/evaluate/list')
}
</script>

<style scoped>
.evaluation-detail {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.detail-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.detail-header h1 {
  color: #303133;
  margin-bottom: 10px;
}

.detail-header p {
  color: #909399;
  font-size: 14px;
}

.detail-content {
  margin-bottom: 30px;
}

.section {
  margin-bottom: 25px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.section h2 {
  color: #409eff;
  margin-bottom: 15px;
  font-size: 18px;
}

.section p {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 8px;
}

.detail-actions {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.detail-actions .el-button {
  margin: 0 10px;
}
</style>