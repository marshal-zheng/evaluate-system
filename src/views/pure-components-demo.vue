<template>
  <div class="pure-components-demo">
    <div class="demo-header">
      <h1>Pure 组件统一注册演示</h1>
      <p>展示所有已注册的 Pure 组件库组件的使用示例</p>
    </div>

    <!-- ZxIcon 图标组件演示 -->
    <div class="demo-section">
      <h2>ZxIcon 图标组件</h2>
      <div class="demo-content">
        <div class="icon-demo">
          <ZxIcon icon="Edit" size="24" />
          <ZxIcon icon="Delete" size="24" color="#F56C6C" />
          <ZxIcon icon="Search" size="24" color="#409EFF" />
          <ZxIcon icon="Plus" size="24" color="#67C23A" />
        </div>
        <p class="demo-description">支持自定义图标、大小和颜色</p>
      </div>
    </div>

    <!-- ZxSearch 搜索组件演示 -->
    <div class="demo-section">
      <h2>ZxSearch 搜索组件</h2>
      <div class="demo-content">
        <div class="search-demo">
          <ZxSearch 
            v-model="searchValue" 
            placeholder="请输入搜索内容"
            search-mode="click"
            @search="handleSearch"
          />
          <ZxSearch 
            v-model="searchValue2" 
            placeholder="输入即搜索（防抖）"
            search-mode="input"
            @search="handleSearch2"
          />
        </div>
        <p class="demo-description">支持点击搜索和输入搜索两种模式</p>
        <div class="search-result">
          <p>点击搜索结果: {{ searchResult }}</p>
          <p>输入搜索结果: {{ searchResult2 }}</p>
        </div>
      </div>
    </div>

    <!-- ZxSelect 选择器组件演示 -->
    <div class="demo-section">
      <h2>ZxSelect 选择器组件</h2>
      <div class="demo-content">
        <div class="select-demo">
          <ZxSelect 
            v-model="selectValue"
            :options="selectOptions"
            placeholder="请选择选项"
          />
          <ZxSelect 
            v-model="multiSelectValue"
            :options="selectOptions"
            multiple
            placeholder="多选模式"
          />
        </div>
        <p class="demo-description">支持单选和多选模式</p>
        <div class="select-result">
          <p>单选结果: {{ selectValue }}</p>
          <p>多选结果: {{ multiSelectValue }}</p>
        </div>
      </div>
    </div>

    <!-- ZxGridList 网格列表组件演示 -->
    <div class="demo-section">
      <h2>ZxGridList 网格列表组件</h2>
      <div class="demo-content">
        <ZxGridList
          :load-data="loadGridData"
          :page-size="5"
          class="grid-demo"
        >
          <template #form="{ query }">
            <div class="grid-form">
              <el-input 
                v-model="query.keyword" 
                placeholder="搜索用户"
                style="width: 200px; margin-right: 10px;"
              />
              <el-button type="primary" @click="refreshGrid">搜索</el-button>
            </div>
          </template>
          
          <template #table="{ grid, hasData, isEmpty }">
            <el-table :data="hasData ? grid.data : []" style="width: 100%">
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="name" label="姓名" />
              <el-table-column prop="email" label="邮箱" />
              <el-table-column prop="role" label="角色" />
              
              <template #empty>
                <div v-if="isEmpty">
                  <ZxEmpty description="暂无数据" />
                </div>
              </template>
            </el-table>
          </template>
        </ZxGridList>
        <p class="demo-description">支持查询、分页、排序等功能的数据列表组件</p>
      </div>
    </div>

    <!-- ZxEmpty 空状态组件演示 -->
    <div class="demo-section">
      <h2>ZxEmpty 空状态组件</h2>
      <div class="demo-content">
        <div class="empty-demo">
          <div class="empty-item">
            <ZxEmpty />
          </div>
          <div class="empty-item">
            <ZxEmpty description="没有找到相关数据">
              <el-button type="primary" @click="handleRefresh">刷新数据</el-button>
            </ZxEmpty>
          </div>
        </div>
        <p class="demo-description">支持自定义描述和操作按钮的空状态组件</p>
      </div>
    </div>

    <!-- ZxTooltipOrPopover 提示组件演示 -->
    <div class="demo-section">
      <h2>ZxTooltipOrPopover 提示组件</h2>
      <div class="demo-content">
        <div class="tooltip-demo">
          <ZxTooltipOrPopover content="这是一个提示信息" mode="tooltip">
            <el-button>悬停显示提示</el-button>
          </ZxTooltipOrPopover>
          
          <ZxTooltipOrPopover 
            title="弹出框标题" 
            content="这是弹出框的内容" 
            mode="popover"
            trigger="click"
          >
            <el-button type="primary">点击显示弹出框</el-button>
          </ZxTooltipOrPopover>
        </div>
        <p class="demo-description">支持提示和弹出框两种模式，多种触发方式</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

// 搜索组件数据
const searchValue = ref('')
const searchValue2 = ref('')
const searchResult = ref('')
const searchResult2 = ref('')

// 选择器组件数据
const selectValue = ref('')
const multiSelectValue = ref([])
const selectOptions = ref([
  { label: '选项1', value: 'option1' },
  { label: '选项2', value: 'option2' },
  { label: '选项3', value: 'option3' },
  { label: '选项4', value: 'option4' }
])

// 网格列表组件数据
const gridRef = ref()
const mockUsers = [
  { id: 1, name: '张三', email: 'zhangsan@example.com', role: '管理员' },
  { id: 2, name: '李四', email: 'lisi@example.com', role: '用户' },
  { id: 3, name: '王五', email: 'wangwu@example.com', role: '编辑' },
  { id: 4, name: '赵六', email: 'zhaoliu@example.com', role: '用户' },
  { id: 5, name: '钱七', email: 'qianqi@example.com', role: '管理员' },
  { id: 6, name: '孙八', email: 'sunba@example.com', role: '用户' },
  { id: 7, name: '周九', email: 'zhoujiu@example.com', role: '编辑' },
  { id: 8, name: '吴十', email: 'wushi@example.com', role: '用户' }
]

// 事件处理函数
const handleSearch = (value) => {
  searchResult.value = value
  console.log('点击搜索:', value)
}

const handleSearch2 = (value) => {
  searchResult2.value = value
  console.log('输入搜索:', value)
}

const loadGridData = async (params) => {
  // 模拟API请求
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const { page = 1, pageSize = 10, keyword = '' } = params
  
  // 过滤数据
  let filteredData = mockUsers
  if (keyword) {
    filteredData = mockUsers.filter(user => 
      user.name.includes(keyword) || 
      user.email.includes(keyword) ||
      user.role.includes(keyword)
    )
  }
  
  // 分页
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const data = filteredData.slice(start, end)
  
  return {
    data,
    total: filteredData.length
  }
}

const refreshGrid = () => {
  if (gridRef.value) {
    gridRef.value.loadData()
  }
}

const handleRefresh = () => {
  console.log('刷新数据')
}
</script>

<style scoped>
.pure-components-demo {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-header {
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.demo-header h1 {
  color: #303133;
  margin-bottom: 10px;
}

.demo-header p {
  color: #606266;
  font-size: 14px;
}

.demo-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fff;
}

.demo-section h2 {
  color: #303133;
  margin-bottom: 15px;
  font-size: 18px;
  border-bottom: 2px solid #409eff;
  padding-bottom: 8px;
}

.demo-content {
  margin-top: 20px;
}

.demo-description {
  margin-top: 15px;
  color: #909399;
  font-size: 13px;
  font-style: italic;
}

/* 图标演示样式 */
.icon-demo {
  display: flex;
  gap: 20px;
  align-items: center;
}

/* 搜索演示样式 */
.search-demo {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.search-result {
  margin-top: 15px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
}

.search-result p {
  margin: 5px 0;
  color: #606266;
  font-size: 14px;
}

/* 选择器演示样式 */
.select-demo {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.select-result {
  margin-top: 15px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
}

.select-result p {
  margin: 5px 0;
  color: #606266;
  font-size: 14px;
}

/* 网格列表演示样式 */
.grid-demo {
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.grid-form {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #fafafa;
  border-bottom: 1px solid #ebeef5;
}

/* 空状态演示样式 */
.empty-demo {
  display: flex;
  gap: 40px;
  justify-content: center;
}

.empty-item {
  flex: 1;
  min-height: 200px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 提示组件演示样式 */
.tooltip-demo {
  display: flex;
  gap: 20px;
  align-items: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .pure-components-demo {
    padding: 10px;
  }
  
  .demo-section {
    padding: 15px;
  }
  
  .search-demo,
  .select-demo {
    flex-direction: column;
  }
  
  .empty-demo {
    flex-direction: column;
    gap: 20px;
  }
  
  .tooltip-demo {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>