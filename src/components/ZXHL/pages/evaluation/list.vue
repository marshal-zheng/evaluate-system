<template>
  <div class="evaluation-overview">
    <ZxGridList
      ref="gridRef"
      :load-data="loadEvaluationData"
      :show-pagination="true"
      :page-sizes="[10, 20, 50, 100]"
      :default-page-size="10"
      :load-on-mounted="false"
      :clear-selection-on-load="true"
      class="evaluation-grid"
    >
      <!-- 工具栏：左-操作 | 中-筛选 | 右-搜索 -->
      <template #form="{ query, data, loading }">
        <div class="zx-grid-form-bar">
          <div class="zx-grid-form-bar__left">
            <ZxButton type="primary" @click="handleCreate">新建评估</ZxButton>
          </div>
          <div class="zx-grid-form-bar__filters">
            <SelectStatus v-model="query.status" @change="onFilterChange" style="width: 150px" />
          </div>
          <div class="zx-grid-form-bar__right">
            <ZxSearch
              v-model="query.keyword"
              placeholder="搜索评估名称/ID"
              :loading="loading"
              search-mode="click"
              @search="onSearch"
              @clear="onSearch"
            />
          </div>
        </div>
      </template>

      <!-- 表格内容 -->
      <template #table="{ grid, loading, refresh }">
        <el-table :data="grid.list" style="width: 100%" max-height="calc(100vh - 230px)" sc>
          <!-- <el-table-column prop="id" label="ID" width="80" /> -->
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
                <ZxButton link type="primary" @click="viewDetail(row)">查看</ZxButton>
                <ZxButton link type="primary" @click="editEvaluation(row)">编辑</ZxButton>
                <ZxButton link type="danger">删除</ZxButton>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </ZxGridList>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import { evaluationApi } from '@/components/ZXHL/api/modules/evaluation/index.js'
import ZxGridList from '@/components/ZXHL/comp/pure/ZxGridList/index.vue'
import SelectStatus from './components/selectors/SelectStatus.vue'
import { ZxSearch, ZxButton } from '@/components/ZXHL/comp/pure/index.js'

// 组件引用
const gridRef = ref(null)

// 组件挂载后手动加载数据
onMounted(() => {
  nextTick(() => {
    gridRef.value?.refresh()
  })
})

// 数据加载函数 - 适配 ZxGridList  
const loadEvaluationData = async (params) => {
  console.log('=== loadEvaluationData 开始 ===')
  console.log('请求参数:', params)
  
  try {
    const data = await evaluationApi.getEvaluationList(params)
    console.log('API 响应数据:', data)
    console.log('数据类型:', typeof data)
    console.log('数据结构:', {
      hasData: !!data,
      hasDataProp: !!data?.data,
      hasList: !!data?.list || !!data?.data?.list,
      hasPager: !!data?.pager || !!data?.data?.pager
    })
    return data
  } catch (error) {
    console.error('loadEvaluationData 请求失败:', error)
    throw error
  }
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

// actions in toolbar
const handleCreate = () => {
  console.log('新建评估')
}

const onFilterChange = (value) => {
  console.log('=== onFilterChange 触发 ===')
  console.log('选择的状态值:', value)
  console.log('当前 query 状态:', gridRef.value?.gridState?.query)
  
  // 先更新页码，再刷新
  gridRef.value?.updateState('pager.page', 1)
  
  // 使用 nextTick 确保状态更新后再刷新
  nextTick(() => {
    console.log('准备刷新，当前 query:', gridRef.value?.gridState?.query)
    gridRef.value?.refresh()
  })
}

const onSearch = () => {
  gridRef.value?.updateState('pager.page', 1)
  gridRef.value?.refresh()
}
</script>

<style scoped>
</style>