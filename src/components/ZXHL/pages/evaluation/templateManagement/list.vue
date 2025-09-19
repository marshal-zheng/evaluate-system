<template>
  <div class="template-overview">
    <ZxGridList
      :load-data="loadTemplateData"
      :show-pagination="true"
      :page-sizes="[10, 20, 50, 100]"
      :default-page-size="10"
      :load-on-mounted="true"
      :clear-selection-on-load="true"
      class="template-grid"
    >
      <!-- 工具栏：左-操作 | 中-筛选 | 右-搜索 -->
      <template #form="{ query, data, loading, refresh, updateState }">
        <div class="zx-grid-form-bar">
          <div class="zx-grid-form-bar__left">
            <ZxButton type="primary" @click="handleCreate">新建模版</ZxButton>
          </div>
          <div class="zx-grid-form-bar__filters">
            <SelectStatus v-model="query.status" @change="(v) => onFilterChange('status', v, { refresh, updateState })" style="width: 150px" />
            <EvaluationSchemeSelector 
              v-model="query.evaluationScheme" 
              placeholder="评估方案"
              style="width: 150px; margin-left: 12px"
              @change="(v) => onFilterChange('evaluationScheme', v, { refresh, updateState })" 
            />
            <EvaluationAlgorithmSelector 
              v-model="query.evaluationAlgorithm" 
              placeholder="评估算法"
              style="width: 150px; margin-left: 12px"
              @change="(v) => onFilterChange('evaluationAlgorithm', v, { refresh, updateState })" 
            />
            <IndicatorSystemSelector 
              v-model="query.indicatorSystem" 
              placeholder="指标体系"
              style="width: 150px; margin-left: 12px"
              @change="(v) => onFilterChange('indicatorSystem', v, { refresh, updateState })" 
            />
          </div>
          <div class="zx-grid-form-bar__right">
            <ZxSearch
              v-model="query.keyword"
              placeholder="搜索模版名称"
              :loading="loading"
              search-mode="click"
              @search="() => onSearch({ refresh, updateState })"
              @clear="() => onSearch({ refresh, updateState })"
            />
          </div>
        </div>
      </template>

      <!-- 表格内容 -->
      <template #table="{ grid, loading, refresh }">
        <el-table :data="grid.list" style="width: 100%" max-height="calc(100vh - 230px)">
          <el-table-column prop="name" label="模版名称" min-width="200" />
          <el-table-column prop="type" label="模版类型" width="120">
            <template #default="{ row }">
              {{ getTypeText(row.type) }}
            </template>
          </el-table-column>
          <el-table-column prop="scenario" label="适用场景" width="120">
            <template #default="{ row }">
              {{ getScenarioText(row.scenario) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
          <el-table-column prop="createTime" label="创建时间" width="180" />
          <el-table-column label="操作" width="200" class-name="op-col" label-class-name="op-col__header">
            <template #default="{ row }">
              <div class="op-col__wrap">
                <ZxButton link type="primary" @click="viewDetail(row)">设计</ZxButton>
                <ZxButton link type="primary" @click="handleEdit(row)">编辑</ZxButton>
                <ZxButton link type="primary" @click="handleCopy(row)">复制</ZxButton>
                <ZxButton link type="danger" @click="handleDelete(row, refresh)">删除</ZxButton>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </ZxGridList>

    <!-- 模版表单弹窗 -->
    <TemplateFormDialog
      v-model="dialogVisible"
      :template-data="currentTemplate"
      :mode="dialogMode"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import ZxGridList from '@/components/ZXHL/comp/pure/ZxGridList'
import ZxButton from '@/components/ZXHL/comp/pure/ZxButton'
import ZxSearch from '@/components/ZXHL/comp/pure/ZxSearch'
import SelectStatus from './components/selector/SelectStatus.vue'
import TemplateFormDialog from './components/TemplateFormDialog.vue'
import { templateApi } from '@/components/ZXHL/api/modules/evaluation/template'
import { 
  EvaluationSchemeSelector, 
  EvaluationAlgorithmSelector, 
  IndicatorSystemSelector 
} from '@/components/ZXHL/comp/business/Selector'

const router = useRouter()

// 响应式数据
const dialogVisible = ref(false)
const currentTemplate = ref(null)
const dialogMode = ref('create') // create | edit | view

// 状态映射
const statusMap = {
  draft: { text: '草稿', type: 'info' },
  active: { text: '启用', type: 'success' },
  inactive: { text: '停用', type: 'warning' },
  archived: { text: '归档', type: 'danger' }
}

// 类型映射
const typeMap = {
  comprehensive: '综合评估',
  performance: '绩效评估',
  risk: '风险评估',
  quality: '质量评估'
}

// 场景映射
const scenarioMap = {
  project: '项目评估',
  personnel: '人员评估',
  system: '系统评估',
  process: '流程评估'
}

// 数据加载函数
const loadTemplateData = async (params) => {
  try {
    const response = await templateApi.getTemplateList(params)
    return {
      list: response.list || [],
      total: response.total || 0
    }
  } catch (error) {
    console.error('加载模版数据失败:', error)
    ElMessage.error('加载数据失败')
    return { list: [], total: 0 }
  }
}

// 工具函数
const getStatusText = (status) => statusMap[status]?.text || '未知'
const getStatusType = (status) => statusMap[status]?.type || 'info'
const getTypeText = (type) => typeMap[type] || '未知'
const getScenarioText = (scenario) => scenarioMap[scenario] || '未知'

// 筛选变化处理
const onFilterChange = (filterType, value, { refresh, updateState }) => {
  console.log(`模板筛选变化 - 类型: ${filterType}, 值:`, value)
  
  // 更新对应的筛选条件
  updateState(filterType, value)
  
  // 页码重置到第一页
  updateState('pager.page', 1)
  
  refresh()
}

// 搜索处理
const onSearch = ({ refresh, updateState }) => {
  refresh()
}

// 查看详情
const viewDetail = (row) => {
  router.push({
    name: 'TemplateDetail',
    params: { id: row.id }
  })
}

// 新建
const handleCreate = () => {
  currentTemplate.value = null
  dialogMode.value = 'create'
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  currentTemplate.value = row
  dialogMode.value = 'edit'
  dialogVisible.value = true
}

// 复制
const handleCopy = (row) => {
  currentTemplate.value = { ...row, id: null, name: `${row.name}_副本` }
  dialogMode.value = 'create'
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row, refresh) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除模版"${row.name}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await templateApi.deleteTemplate(row.id)
    ElMessage.success('删除成功')
    refresh()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 表单成功回调
const handleFormSuccess = () => {
  dialogVisible.value = false
  // 刷新列表会通过 ZxGridList 的 refresh 方法处理
}
</script>

<style lang="scss" scoped>

</style>