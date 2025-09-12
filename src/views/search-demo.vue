<template>
  <div class="search-demo">
    <div class="demo-header">
      <h1>ZxSearch 搜索组件演示</h1>
      <p>基于 Element Plus 的搜索组件，支持多种搜索模式和配置</p>
    </div>

    <!-- 基础用法 -->
    <div class="demo-section">
      <h2>基础用法</h2>
      <div class="demo-content">
        <ZxSearch
          v-model="basicSearchValue"
          placeholder="请输入搜索内容"
          @search="handleBasicSearch"
        />
        <p class="demo-description">基础的搜索组件，支持输入和搜索功能</p>
        <div class="result-display">
          <p><strong>搜索结果:</strong> {{ basicSearchResult }}</p>
        </div>
      </div>
    </div>

    <!-- 不同搜索模式 -->
    <div class="demo-section">
      <h2>不同搜索模式</h2>
      
      <div class="mode-demo">
        <h3>点击搜索模式（默认）</h3>
        <ZxSearch
          v-model="clickSearchValue"
          search-mode="click"
          placeholder="输入内容后点击搜索图标"
          @search="handleClickSearch"
        />
        <p class="mode-description">需要点击搜索图标才会触发搜索事件</p>
      </div>
      
      <div class="mode-demo">
        <h3>输入搜索模式</h3>
        <ZxSearch
          v-model="inputSearchValue"
          search-mode="input"
          placeholder="直接输入即可搜索（防抖300ms）"
          @search="handleInputSearch"
        />
        <p class="mode-description">输入内容后自动触发搜索（防抖300ms），无需点击搜索按钮</p>
      </div>
      
      <div class="result-display">
        <h3>搜索结果展示</h3>
        <p><strong>点击模式搜索值:</strong> {{ clickSearchResult }}</p>
        <p><strong>输入模式搜索值:</strong> {{ inputSearchResult }}</p>
      </div>
    </div>

    <!-- 自定义配置 -->
    <div class="demo-section">
      <h2>自定义配置</h2>
      
      <div class="config-demo">
        <h3>自定义防抖延迟</h3>
        <ZxSearch
          v-model="debounceSearchValue"
          search-mode="input"
          :debounce="800"
          placeholder="自定义防抖延迟800ms"
          @search="handleDebounceSearch"
        />
        <p class="mode-description">可以自定义防抖延迟时间，适应不同的使用场景</p>
      </div>
      
      <div class="config-demo">
        <h3>禁用状态</h3>
        <ZxSearch
          v-model="disabledSearchValue"
          disabled
          placeholder="禁用状态的搜索框"
        />
        <p class="mode-description">支持禁用状态，适用于权限控制等场景</p>
      </div>
      
      <div class="config-demo">
        <h3>自定义尺寸</h3>
        <div class="size-demo">
          <ZxSearch
            v-model="largeSearchValue"
            size="large"
            placeholder="大尺寸搜索框"
            @search="handleSizeSearch"
          />
          <ZxSearch
            v-model="defaultSearchValue"
            size="default"
            placeholder="默认尺寸搜索框"
            @search="handleSizeSearch"
          />
          <ZxSearch
            v-model="smallSearchValue"
            size="small"
            placeholder="小尺寸搜索框"
            @search="handleSizeSearch"
          />
        </div>
        <p class="mode-description">支持大、中、小三种尺寸</p>
      </div>
    </div>

    <!-- 实际应用场景 -->
    <div class="demo-section">
      <h2>实际应用场景</h2>
      
      <div class="application-demo">
        <h3>表格数据筛选</h3>
        <div class="table-search">
          <ZxSearch
            v-model="tableSearchValue"
            search-mode="input"
            placeholder="搜索用户姓名、邮箱或角色"
            @search="handleTableSearch"
          />
        </div>
        
        <el-table :data="filteredTableData" style="width: 100%; margin-top: 15px;">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="姓名" />
          <el-table-column prop="email" label="邮箱" />
          <el-table-column prop="role" label="角色" />
        </el-table>
        
        <p class="mode-description">实时搜索表格数据，支持多字段模糊匹配</p>
      </div>
    </div>

    <!-- API 文档 -->
    <div class="demo-section">
      <h2>API 文档</h2>
      
      <div class="api-table">
        <h3>Props</h3>
        <el-table :data="propsData" style="width: 100%;">
          <el-table-column prop="prop" label="属性" width="150" />
          <el-table-column prop="type" label="类型" width="120" />
          <el-table-column prop="default" label="默认值" width="120" />
          <el-table-column prop="description" label="说明" />
        </el-table>
        
        <h3 style="margin-top: 30px;">Events</h3>
        <el-table :data="eventsData" style="width: 100%;">
          <el-table-column prop="event" label="事件名" width="150" />
          <el-table-column prop="params" label="参数" width="200" />
          <el-table-column prop="description" label="说明" />
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 基础搜索
const basicSearchValue = ref('')
const basicSearchResult = ref('')

// 不同模式搜索
const clickSearchValue = ref('')
const inputSearchValue = ref('')
const clickSearchResult = ref('')
const inputSearchResult = ref('')

// 自定义配置
const debounceSearchValue = ref('')
const disabledSearchValue = ref('')
const largeSearchValue = ref('')
const defaultSearchValue = ref('')
const smallSearchValue = ref('')

// 表格搜索
const tableSearchValue = ref('')
const tableData = ref([
  { id: 1, name: '张三', email: 'zhangsan@example.com', role: '管理员' },
  { id: 2, name: '李四', email: 'lisi@example.com', role: '用户' },
  { id: 3, name: '王五', email: 'wangwu@example.com', role: '编辑' },
  { id: 4, name: '赵六', email: 'zhaoliu@example.com', role: '用户' },
  { id: 5, name: '钱七', email: 'qianqi@example.com', role: '管理员' },
  { id: 6, name: '孙八', email: 'sunba@example.com', role: '用户' }
])

// API 文档数据
const propsData = ref([
  { prop: 'modelValue', type: 'String', default: "''", description: '绑定值' },
  { prop: 'placeholder', type: 'String', default: "'请输入搜索内容'", description: '输入框占位文本' },
  { prop: 'searchMode', type: 'String', default: "'click'", description: '搜索模式：click | input' },
  { prop: 'debounce', type: 'Number', default: '300', description: '防抖延迟时间（ms）' },
  { prop: 'disabled', type: 'Boolean', default: 'false', description: '是否禁用' },
  { prop: 'size', type: 'String', default: "'default'", description: '尺寸：large | default | small' },
  { prop: 'clearable', type: 'Boolean', default: 'true', description: '是否可清空' }
])

const eventsData = ref([
  { event: 'search', params: '(value: string)', description: '搜索事件，返回搜索值' },
  { event: 'clear', params: '()', description: '清空事件' },
  { event: 'focus', params: '(event: Event)', description: '输入框获得焦点事件' },
  { event: 'blur', params: '(event: Event)', description: '输入框失去焦点事件' }
])

// 计算属性
const filteredTableData = computed(() => {
  if (!tableSearchValue.value) {
    return tableData.value
  }
  
  const keyword = tableSearchValue.value.toLowerCase()
  return tableData.value.filter(item => 
    item.name.toLowerCase().includes(keyword) ||
    item.email.toLowerCase().includes(keyword) ||
    item.role.toLowerCase().includes(keyword)
  )
})

// 事件处理函数
const handleBasicSearch = (value) => {
  basicSearchResult.value = value
  console.log('基础搜索:', value)
}

const handleClickSearch = (value) => {
  clickSearchResult.value = value
  console.log('点击搜索:', value)
}

const handleInputSearch = (value) => {
  inputSearchResult.value = value
  console.log('输入搜索:', value)
}

const handleDebounceSearch = (value) => {
  console.log('防抖搜索:', value)
}

const handleSizeSearch = (value) => {
  console.log('尺寸搜索:', value)
}

const handleTableSearch = (value) => {
  console.log('表格搜索:', value)
  // filteredTableData 会自动更新
}
</script>

<style scoped>
.search-demo {
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
  margin-bottom: 20px;
  font-size: 18px;
  border-bottom: 2px solid #409eff;
  padding-bottom: 8px;
}

.demo-section h3 {
  color: #606266;
  margin-bottom: 15px;
  font-size: 16px;
}

.demo-content {
  margin-top: 20px;
}

.demo-description,
.mode-description {
  margin-top: 10px;
  color: #909399;
  font-size: 13px;
  font-style: italic;
}

.mode-demo,
.config-demo {
  margin-bottom: 25px;
  padding: 15px;
  background: #fafafa;
  border-radius: 4px;
}

.result-display {
  margin-top: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
  border-left: 4px solid #409eff;
}

.result-display p {
  margin: 5px 0;
  color: #606266;
  font-size: 14px;
}

.size-demo {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.table-search {
  margin-bottom: 15px;
}

.application-demo {
  padding: 20px;
  background: #fafafa;
  border-radius: 4px;
}

.api-table {
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-demo {
    padding: 10px;
  }
  
  .demo-section {
    padding: 15px;
  }
  
  .size-demo {
    gap: 10px;
  }
}
</style>