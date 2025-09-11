<template>
  <div class="evaluation-overview">
    <ZxGridList
      ref="gridRef"
      :load-data="loadEvaluationData"
      :show-pagination="true"
      :page-sizes="[10, 20, 50, 100]"
      :default-page-size="10"
      :load-on-mounted="true"
      :clear-selection-on-load="true"
      class="evaluation-grid"
    >
      <!-- 这里加上筛选条件和搜索框 -->

      <!-- 表格内容 -->
      <template #table="{ grid, loading, refresh }">
        <el-table :data="grid.list" style="width: 100%" max-height="calc(100vh - 230px)" sc>
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="评估名称" min-width="200" />
          <el-table-column prop="type" label="评估类型" width="120" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="progress" label="进度" width="120">
            <template #default="{ row }">
              <el-progress :percentage="row.progress" :stroke-width="8" />
            </template>
          </el-table-column>
          <el-table-column prop="score" label="评分" width="100" />
          <el-table-column prop="createTime" label="创建时间" width="180" />
          <el-table-column label="操作" width="160" class-name="op-col" label-class-name="op-col__header">
            <template #default="{ row }">
              <div class="op-col__wrap">
                <el-button size="small" link type="primary" @click="viewDetail(row)">查看</el-button>
                <el-button size="small" link type="primary" @click="editEvaluation(row)">编辑</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </ZxGridList>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import { evaluationApi } from '@/components/ZXHL/api/modules/evaluation/index.js'
import ZxGridList from '@/components/ZXHL/comp/pure/ZxGridList/index.vue'

// 组件引用
const gridRef = ref(null)

// 数据加载函数 - 适配 ZxGridList
const loadEvaluationData = async (params) => {
  console.log('params', params)
  // 直接传递 params 给 API，让 HTTP 层处理数据格式转换
  const response = await evaluationApi.getEvaluationList(params)
  
  // HTTP 层已经处理了数据格式转换，直接返回
  return response.data
}

// 状态类型映射
const getStatusType = (status) => {
  const typeMap = {
    pending: 'info',
    running: 'warning',
    completed: 'success',
    failed: 'danger'
  }
  return typeMap[status] || 'info'
}

// 状态文本映射
const getStatusText = (status) => {
  const textMap = {
    pending: '待执行',
    running: '执行中',
    completed: '已完成',
    failed: '失败'
  }
  return textMap[status] || '未知'
}

// 查看详情
const viewDetail = (row) => {
  console.log('查看评估详情:', row.name)
}

// 编辑评估
const editEvaluation = (row) => {
  console.log('编辑评估:', row.name)
}
</script>

<style scoped>
</style>