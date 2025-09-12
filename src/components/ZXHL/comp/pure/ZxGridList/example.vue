<template>
  <div class="grid-list-example">
    <h2>ZxGridList 使用示例</h2>
    
    <el-tabs v-model="activeTab" class="demo-tabs">
      <el-tab-pane label="有数据状态" name="withData">
        <ZxGridList
          ref="gridRef"
          :load-data="loadUserData"
          :show-pagination="true"
          :page-sizes="[10, 20, 50]"
          :default-page-size="20"
          :auto-refresh="{ enabled: false, interval: 30000 }"
          @before-load="handleBeforeLoad"
          @data-loaded="handleDataLoaded"
          @load-error="handleLoadError"
        >
      <!-- 查询表单 -->
      <template #form="{ query, loading }">
        <el-form inline class="search-form">
          <el-form-item label="用户名">
            <el-input 
              v-model="query.username" 
              placeholder="请输入用户名"
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          
          <el-form-item label="邮箱">
            <el-input 
              v-model="query.email" 
              placeholder="请输入邮箱"
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          
          <el-form-item label="状态">
            <el-select v-model="query.status" placeholder="请选择状态" clearable>
              <el-option label="全部" value="" />
              <el-option label="启用" value="active" />
              <el-option label="禁用" value="inactive" />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button 
              type="primary" 
              @click="handleSearch" 
              :loading="loading"
            >
              搜索
            </el-button>
            <el-button @click="handleReset">
              重置
            </el-button>
            <el-button @click="handleRefresh">
              刷新
            </el-button>
          </el-form-item>
        </el-form>
      </template>

      <!-- 数据表格 -->
      <template #table="{ grid, loading }">
        <el-table 
          :data="grid.list" 
          :loading="loading"
          border
          stripe
          @sort-change="handleSortChange"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column type="index" label="序号" width="60" />
          
          <el-table-column 
            prop="username" 
            label="用户名" 
            sortable="custom"
            min-width="120"
          />
          
          <el-table-column 
            prop="email" 
            label="邮箱" 
            sortable="custom"
            min-width="180"
          />
          
          <el-table-column 
            prop="phone" 
            label="电话" 
            min-width="120"
          />
          
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column 
            prop="createTime" 
            label="创建时间" 
            sortable="custom"
            width="180"
          >
            <template #default="{ row }">
              {{ formatDate(row.createTime) }}
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="handleView(row)">
                查看
              </el-button>
              <el-button size="small" type="primary" @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button 
                size="small" 
                type="danger" 
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
      
      <!-- 自定义分页 -->
      <template #pagination="{ pager }">
        <div class="custom-pagination">
          <span>共 {{ pager.total }} 条记录</span>
          <el-pagination
            :total="pager.total"
            :current-page="pager.page"
            :page-size="pager.size"
            :page-sizes="[10, 20, 50, 100]"
            layout="sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </template>
        </ZxGridList>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ZxGridList from './index.vue'

// 组件引用
const gridRef = ref()

// 当前激活的标签页
const activeTab = ref('withData')

// 选中的行
const selectedRows = ref([])

// 模拟 API 调用
const loadUserData = async (params) => {
  console.log('加载数据参数:', params)
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 800))
  
  const { query = {}, pager = {} } = params
  const { page = 1, size = 20 } = pager
  
  // 模拟数据
  const mockUsers = []
  for (let i = 1; i <= 100; i++) {
    mockUsers.push({
      id: i,
      username: `user${i}`,
      email: `user${i}@example.com`,
      phone: `138${String(i).padStart(8, '0')}`,
      status: i % 3 === 0 ? 'inactive' : 'active',
      createTime: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    })
  }
  
  // 应用过滤条件
  let filteredUsers = mockUsers.filter(user => {
    if (query.username && !user.username.includes(query.username)) {
      return false
    }
    if (query.email && !user.email.includes(query.email)) {
      return false
    }
    if (query.status && user.status !== query.status) {
      return false
    }
    return true
  })
  
  // 应用排序
  if (query.sortBy) {
    filteredUsers.sort((a, b) => {
      const aVal = a[query.sortBy]
      const bVal = b[query.sortBy]
      const result = aVal > bVal ? 1 : aVal < bVal ? -1 : 0
      return query.sortOrder === 'descending' ? -result : result
    })
  }
  
  // 分页
  const total = filteredUsers.length
  const startIndex = (page - 1) * size
  const endIndex = startIndex + size
  const list = filteredUsers.slice(startIndex, endIndex)
  
  return {
    list,
    pager: {
      page,
      size,
      total
    }
  }
}

// 搜索处理
const handleSearch = () => {
  gridRef.value?.loadData({}, { immediate: true })
}

// 重置处理
const handleReset = () => {
  gridRef.value?.updateState('query', {})
  gridRef.value?.loadData({}, { immediate: true })
}

// 刷新处理
const handleRefresh = () => {
  gridRef.value?.refresh()
}

// 排序处理
const handleSortChange = ({ prop, order }) => {
  const sortParams = {
    sortBy: order ? prop : undefined,
    sortOrder: order
  }
  gridRef.value?.updateState('query', { 
    ...gridRef.value.state.query,
    ...sortParams 
  })
  gridRef.value?.loadData({}, { immediate: true })
}

// 分页大小变化
const handleSizeChange = (size) => {
  gridRef.value?.updateState('pager.size', size)
  gridRef.value?.updateState('pager.page', 1) // 重置到第一页
  gridRef.value?.loadData({}, { immediate: true })
}

// 页码变化
const handlePageChange = (page) => {
  gridRef.value?.updateState('pager.page', page)
  gridRef.value?.loadData({}, { immediate: true })
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
  console.log('选中行:', selection)
}

// 查看用户
const handleView = (row) => {
  ElMessage.info(`查看用户: ${row.username}`)
}

// 编辑用户
const handleEdit = (row) => {
  ElMessage.info(`编辑用户: ${row.username}`)
}

// 删除用户
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${row.username}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    ElMessage.success(`删除用户 ${row.username} 成功`)
    // 刷新数据
    handleRefresh()
  } catch {
    // 用户取消删除
  }
}

// 工具函数
const getStatusType = (status) => {
  return status === 'active' ? 'success' : 'danger'
}

const getStatusText = (status) => {
  return status === 'active' ? '启用' : '禁用'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 事件处理
const handleBeforeLoad = (params) => {
  console.log('开始加载数据:', params)
}

const handleDataLoaded = (response) => {
  console.log('数据加载完成:', response)
  ElMessage.success('数据加载成功')
}

const handleLoadError = (error) => {
  console.error('数据加载失败:', error)
  ElMessage.error('数据加载失败，请重试')
}
</script>

<style lang="scss" scoped>
.grid-list-example {
  padding: 20px;
  
  h2 {
    margin-bottom: 20px;
    color: var(--el-text-color-primary);
  }
  
  .search-form {
    background: var(--el-bg-color-page);
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 16px;
  }
  
  .custom-pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    
    span {
      color: var(--el-text-color-regular);
      font-size: 14px;
    }
  }
}
</style>
