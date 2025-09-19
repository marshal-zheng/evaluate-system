<template>
  <div class="indicator-system-overview">
    <ZxGridList
      :load-data="loadIndicatorSystemData"
      :show-pagination="true"
      :page-sizes="[10, 20, 50, 100]"
      :default-page-size="10"
      :load-on-mounted="true"
      :clear-selection-on-load="true"
      class="indicator-system-grid"
    >
      <!-- 工具栏：左-操作 | 中-筛选 | 右-搜索 -->
      <template #form="{ query, data, loading, refresh, updateState }">
        <div class="zx-grid-form-bar">
          <div class="zx-grid-form-bar__left">
            <ZxButton type="primary" @click="handleCreate">新建指标体系</ZxButton>
            <ZxButton type="success" @click="handleImport">导入</ZxButton>
            <ZxButton type="warning" @click="handleExport">导出</ZxButton>
          </div>
          <div class="zx-grid-form-bar__filters">
            <SelectCategory 
              v-model="query.category" 
              placeholder="所属分类"
              style="width: 150px"
              @change="(v) => onFilterChange('category', v, { refresh, updateState })" 
            />
          </div>
          <div class="zx-grid-form-bar__right">
            <ZxSearch
              v-model="query.keyword"
              placeholder="搜索指标体系名称"
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
          <el-table-column prop="name" label="指标体系名称" min-width="200" show-overflow-tooltip />
          <el-table-column prop="description" label="指标体系描述" min-width="250" show-overflow-tooltip />
          <el-table-column prop="category" label="所属分类" width="150">
            <template #default="{ row }">
              {{ getCategoryText(row.category) }}
            </template>
          </el-table-column>
          <el-table-column prop="updateTime" label="最后修改时间" width="180" />
          <el-table-column label="操作" width="280" class-name="op-col" label-class-name="op-col__header">
            <template #default="{ row }">
              <div class="op-col__wrap">
                <ZxButton link type="primary" @click="handleDesign(row)">设计</ZxButton>
                <ZxButton link type="primary" @click="handleExportTemplate(row)">导出模版</ZxButton>
                <ZxButton link type="danger" @click="handleDelete(row, refresh)">删除</ZxButton>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </ZxGridList>

    <!-- 指标体系表单弹窗 -->
    <IndicatorSystemFormDialog
      v-model="dialogVisible"
      :indicator-system-data="currentIndicatorSystem"
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
import IndicatorSystemFormDialog from './components/IndicatorSystemFormDialog.vue'
import SelectCategory from './components/selector/SelectCategory.vue'
import { indicatorSystemApi } from './mock.js'

const router = useRouter()

// 弹窗相关状态
const dialogVisible = ref(false)
const dialogMode = ref('create') // create, edit, view
const currentIndicatorSystem = ref(null)

// 分类映射
const categoryMap = {
  'management_efficiency': '管理效能',
  'technical_capability': '技术能力',
  'service_quality': '服务质量',
  'innovation_capability': '创新能力',
  'risk_control': '风险控制',
  'resource_allocation': '资源配置',
  'personnel_quality': '人员素质',
  'cost_control': '成本控制'
}

// 获取分类文本
const getCategoryText = (category) => {
  return categoryMap[category] || category
}

// 加载指标体系数据
const loadIndicatorSystemData = async (params) => {
  return await indicatorSystemApi.getList(params)
}

// 筛选变化处理
const onFilterChange = (key, value, { refresh, updateState }) => {
  updateState({ [key]: value })
  refresh()
}

// 搜索处理
const onSearch = ({ refresh, updateState }) => {
  refresh()
}

// 新建指标体系
const handleCreate = () => {
  currentIndicatorSystem.value = null
  dialogMode.value = 'create'
  dialogVisible.value = true
}

// 设计指标体系
const handleDesign = (row) => {
  // 跳转到指标体系设计页面
  router.push({
    name: 'IndicatorSystemDetail',
    params: { id: row.id }
  })
}

// 导出模版
const handleExportTemplate = async (row) => {
  try {
    ElMessage.info('正在导出模版...')
    const result = await indicatorSystemApi.exportTemplate(row.id)
    if (result.success) {
      // 创建下载链接
      const link = document.createElement('a')
      link.href = result.data.downloadUrl
      link.download = `${row.name}_模版.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      ElMessage.success('导出成功')
    } else {
      ElMessage.error(result.message || '导出失败')
    }
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 删除指标体系
const handleDelete = async (row, refresh) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除指标体系"${row.name}"吗？此操作不可撤销。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const result = await indicatorSystemApi.delete(row.id)
    if (result.success) {
      ElMessage.success('删除成功')
      refresh()
    } else {
      ElMessage.error(result.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 导入
const handleImport = () => {
  // 创建文件输入元素
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.xlsx,.xls'
  input.onchange = async (event) => {
    const file = event.target.files[0]
    if (file) {
      try {
        ElMessage.info('正在导入...')
        const formData = new FormData()
        formData.append('file', file)
        
        const result = await indicatorSystemApi.import(formData)
        if (result.success) {
          ElMessage.success('导入成功')
          // 刷新列表
          window.location.reload()
        } else {
          ElMessage.error(result.message || '导入失败')
        }
      } catch (error) {
        console.error('导入失败:', error)
        ElMessage.error('导入失败')
      }
    }
  }
  input.click()
}

// 导出
const handleExport = async () => {
  try {
    ElMessage.info('正在导出...')
    const result = await indicatorSystemApi.export()
    if (result.success) {
      // 创建下载链接
      const link = document.createElement('a')
      link.href = result.data.downloadUrl
      link.download = '指标体系列表.xlsx'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      ElMessage.success('导出成功')
    } else {
      ElMessage.error(result.message || '导出失败')
    }
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 表单提交成功处理
const handleFormSuccess = (data) => {
  ElMessage.success(dialogMode.value === 'create' ? '创建成功' : '保存成功')
  // 刷新列表
  window.location.reload()
}
</script>