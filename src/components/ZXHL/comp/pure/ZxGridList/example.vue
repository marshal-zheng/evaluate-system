<template>
  <div class="grid-list-example">
    <h2>ZxGridList 使用示例</h2>
    
    <!-- 控制选项 -->
    <div class="demo-controls" style="margin-bottom: 16px; padding: 16px; background: #f5f7fa; border-radius: 4px;">
      <el-space wrap>
        <span>控制选项：</span>
        <el-switch 
          v-model="showTableBorder" 
          active-text="显示表格内边框" 
          inactive-text="隐藏表格内边框"
        />
        <div style="display: flex; align-items: center; gap: 8px;">
          <span>分页底部间距：</span>
          <el-input-number 
            v-model="paginationPaddingBottom" 
            :min="0" 
            :max="50" 
            size="small" 
            style="width: 120px;"
          />
          <span>px</span>
        </div>
      </el-space>
    </div>
    
    <el-tabs v-model="activeTab" class="demo-tabs">
      <el-tab-pane label="传统方式 (Ref调用)" name="withData">
        <ZxGridList
          ref="gridRef"
          :load-data="loadUserData"
          :show-pagination="true"
          :page-sizes="[10, 20, 50]"
          :default-page-size="20"
          :auto-refresh="{ enabled: false, interval: 30000 }"
          :show-table-border="showTableBorder"
          :pagination-padding-bottom="paginationPaddingBottom"
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

      <!-- Hook 方式示例 -->
      <el-tab-pane label="Hook方式 (推荐)" name="withHook">
        <div class="hook-demo">
          <h3>使用 useGridList Hook 的方式</h3>
          <p>通过 Hook 管理状态，避免 ref 调用的复杂性</p>
          
          <!-- 搜索表单 -->
          <el-form inline class="search-form">
            <el-form-item label="用户名">
              <el-input 
                v-model="hookGrid.state.query.username" 
                placeholder="请输入用户名"
                clearable
                @clear="hookGrid.search()"
                @keyup.enter="hookGrid.search()"
              />
            </el-form-item>
            
            <el-form-item label="邮箱">
              <el-input 
                v-model="hookGrid.state.query.email" 
                placeholder="请输入邮箱"
                clearable
                @clear="hookGrid.search()"
                @keyup.enter="hookGrid.search()"
              />
            </el-form-item>
            
            <el-form-item label="状态">
              <el-select v-model="hookGrid.state.query.status" placeholder="请选择状态" clearable>
                <el-option label="全部" value="" />
                <el-option label="启用" value="active" />
                <el-option label="禁用" value="inactive" />
              </el-select>
            </el-form-item>
            
            <el-form-item>
              <el-button 
                type="primary" 
                @click="hookGrid.search()"
                :loading="hookGrid.state.loading"
              >
                搜索
              </el-button>
              <el-button @click="hookGrid.resetSearch()">
                重置
              </el-button>
              <el-button @click="hookGrid.refresh()">
                刷新
              </el-button>
            </el-form-item>
          </el-form>

          <!-- 操作工具栏 -->
          <div class="toolbar" style="margin-bottom: 16px;">
            <el-space>
              <el-text type="info">
                已选择 {{ hookGrid.state.selection.length }} 项
              </el-text>
              <el-button 
                type="danger" 
                size="small"
                :disabled="hookGrid.state.selection.length === 0"
                @click="handleBatchDelete"
              >
                批量删除
              </el-button>
              <el-button 
                type="success" 
                size="small"
                @click="handleExport"
                :loading="hookGrid.state.loading"
              >
                导出数据
              </el-button>
            </el-space>
          </div>

          <!-- 数据表格 -->
          <el-table 
            :data="hookGrid.state.list" 
            :loading="hookGrid.state.loading"
            :border="showTableBorder"
            stripe
            @sort-change="handleHookSortChange"
            @selection-change="hookGrid.setSelection"
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
                  @click="handleHookDelete(row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="hook-pagination" style="margin-top: 16px; display: flex; justify-content: space-between; align-items: center;">
            <span style="color: var(--el-text-color-regular); font-size: 14px;">
              共 {{ hookGrid.state.pager.total }} 条记录，已选择 {{ hookGrid.state.selection.length }} 项
            </span>
            <el-pagination
              :total="hookGrid.state.pager.total"
              :current-page="hookGrid.currentPage"
              :page-size="hookGrid.state.pager.size"
              :page-sizes="[10, 20, 50, 100]"
              layout="sizes, prev, pager, next, jumper"
              background
              @size-change="hookGrid.changePageSize"
              @current-change="hookGrid.changePage"
            />
          </div>

          <!-- 状态信息 -->
          <div class="status-info" style="margin-top: 16px; padding: 12px; background: #f5f7fa; border-radius: 4px;">
            <el-row :gutter="16">
              <el-col :span="6">
                <el-statistic title="总记录数" :value="hookGrid.state.pager.total" />
              </el-col>
              <el-col :span="6">
                <el-statistic title="当前页" :value="hookGrid.currentPage" />
              </el-col>
              <el-col :span="6">
                <el-statistic title="总页数" :value="hookGrid.totalPages" />
              </el-col>
              <el-col :span="6">
                <el-statistic title="已选择" :value="hookGrid.state.selection.length" />
              </el-col>
            </el-row>
          </div>
        </div>
      </el-tab-pane>

      <!-- 简化Hook示例 -->
      <el-tab-pane label="简化Hook示例" name="simpleHook">
        <div class="simple-hook-demo">
          <h3>使用 useSimpleGridList Hook</h3>
          <p>适用于简单场景的轻量级Hook</p>
          
          <!-- 简单搜索 -->
          <el-form inline class="search-form">
            <el-form-item label="关键词">
              <el-input 
                v-model="searchKeyword" 
                placeholder="搜索用户名或邮箱"
                clearable
                @keyup.enter="handleSimpleSearch"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSimpleSearch">
                搜索
              </el-button>
              <el-button @click="simpleGrid.refresh()">
                刷新
              </el-button>
            </el-form-item>
          </el-form>

          <!-- 简单表格 -->
          <el-table 
            :data="simpleGrid.list" 
            :loading="simpleGrid.loading"
            stripe
          >
            <el-table-column type="index" label="序号" width="60" />
            <el-table-column prop="username" label="用户名" />
            <el-table-column prop="email" label="邮箱" />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>

          <!-- 简单分页 -->
          <el-pagination
            v-if="simpleGrid.total > 0"
            :total="simpleGrid.total"
            :current-page="simpleGrid.page"
            :page-size="simpleGrid.pageSize"
            layout="prev, pager, next"
            style="margin-top: 16px; text-align: center;"
            @current-change="simpleGrid.changePage"
          />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ZxGridList from './index.vue'
import { useGridList, useSimpleGridList } from './hooks/useGridList.js'

// 组件引用
const gridRef = ref()

// 当前激活的标签页
const activeTab = ref('withData')

// 控制选项
const showTableBorder = ref(false)
const paginationPaddingBottom = ref(12)

// 选中的行
const selectedRows = ref([])

// ===== 模拟 API 调用 =====  
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

// ===== Hook 方式示例 =====
// 使用完整的 useGridList Hook
const hookGrid = useGridList({
  loadData: loadUserData,
  initialQuery: {},
  defaultPageSize: 20,
  loadOnMounted: true,
  debounceDelay: 300,
  onBeforeLoad: (params) => {
    console.log('Hook: 开始加载数据:', params)
  },
  onDataLoaded: (response) => {
    console.log('Hook: 数据加载完成:', response)
    ElMessage.success('Hook: 数据加载成功')
  },
  onLoadError: (error) => {
    console.error('Hook: 数据加载失败:', error)
    ElMessage.error('Hook: 数据加载失败，请重试')
  }
})

// 简化Hook示例
const searchKeyword = ref('')
const simpleGrid = useSimpleGridList(
  // 简化的数据加载函数
  async (params) => {
    try {
      const keyword = searchKeyword.value
      const modifiedParams = {
        ...params,
        query: {
          ...params.query,
          username: keyword,
          email: keyword
        }
      }
      const result = await loadUserData(modifiedParams)
      console.log('Simple grid load result:', result)
      return result
    } catch (error) {
      console.error('Simple grid load error:', error)
      throw error
    }
  },
  {
    defaultPageSize: 10,
    loadOnMounted: false  // 先改为false，避免初始化时的问题
  }
)

// ===== Hook 相关事件处理 =====
// Hook 排序处理
const handleHookSortChange = ({ prop, order }) => {
  hookGrid.sort(prop, order)
}

// Hook 删除处理
const handleHookDelete = async (row) => {
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
    
    ElMessage.success(`Hook: 删除用户 ${row.username} 成功`)
    // Hook 方式刷新
    hookGrid.refresh()
  } catch {
    // 用户取消删除
  }
}

// 批量删除
const handleBatchDelete = async () => {
  const selected = hookGrid.state.selection
  if (selected.length === 0) return
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selected.length} 个用户吗？`,
      '确认批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    ElMessage.success(`Hook: 批量删除 ${selected.length} 个用户成功`)
    hookGrid.clearSelection()
    hookGrid.refresh()
  } catch {
    // 用户取消删除
  }
}

// 导出数据
const handleExport = () => {
  ElMessage.info('Hook: 开始导出数据...')
  // 这里可以访问当前的查询条件和数据
  console.log('当前查询条件:', hookGrid.state.query)
  console.log('当前数据:', hookGrid.state.list)
}

// 简化Hook搜索
const handleSimpleSearch = () => {
  console.log('Simple search triggered with keyword:', searchKeyword.value)
  simpleGrid.load({}, true)
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
