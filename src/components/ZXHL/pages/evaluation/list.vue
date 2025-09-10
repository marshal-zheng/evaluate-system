<template>
  <div class="evaluation-overview">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>任务管理</span>
          <el-button type="primary" @click="loadData">刷新数据</el-button>
        </div>
      </template>
      <div class="content">
        <div v-if="loading" class="loading">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载中...</span>
        </div>
        <div v-else>
          <el-table :data="evaluationList" style="width: 100%">
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
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button size="small" @click="viewDetail(row)">查看</el-button>
                <el-button size="small" type="primary" @click="editEvaluation(row)">编辑</el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="pagination">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { evaluationApi } from '@/components/ZXHL/api/modules/evaluation/index.js'

// 数据状态
const loading = ref(false)
const evaluationList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 加载任务管理数据
const loadData = async () => {
  try {
    loading.value = true
    const response = await evaluationApi.getEvaluationList({
      page: currentPage.value,
      size: pageSize.value
    })
    
    if (response.code === 200) {
      evaluationList.value = response.data.list
      total.value = response.data.total
      ElMessage.success(`成功加载 ${response.data.list.length} 条Mock数据`)
    } else {
      ElMessage.error('加载数据失败')
    }
  } catch (error) {
    console.error('加载任务管理失败:', error)
    ElMessage.error('加载数据失败，请检查Mock配置')
  } finally {
    loading.value = false
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
  ElMessage.info(`查看评估详情: ${row.name}`)
}

// 编辑评估
const editEvaluation = (row) => {
  ElMessage.info(`编辑评估: ${row.name}`)
}

// 分页大小改变
const handleSizeChange = (val) => {
  pageSize.value = val
  loadData()
}

// 当前页改变
const handleCurrentChange = (val) => {
  currentPage.value = val
  loadData()
}

// 页面初始化
onMounted(() => {
  loadData()
})
</script>

<style scoped>

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content {
  min-height: 400px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
}

.loading .el-icon {
  font-size: 24px;
  margin-bottom: 10px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.el-table {
  margin-bottom: 20px;
}
</style>