<template>
  <div class="search-demo-page">
    <div class="demo-container">
      <h1>ZxSearch 表格筛选组件演示</h1>
      
      <!-- 表格数据筛选 -->
      <!-- <div class="demo-section">
        <h2>表格数据筛选</h2>
        <div class="search-container">
           <ZxSearch
             v-model="searchValue"
             placeholder="请输入搜索内容筛选表格数据"
             @search="handleSearch"
             @clear="handleClear"
           />
         </div>
        
        <div class="table-container">
          <el-table :data="filteredTableData" style="width: 100%" border>
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="name" label="应用名" width="150" />
            <el-table-column prop="type" label="类型" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === '运行中' ? 'success' : 'info'">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述" />
            <el-table-column prop="createTime" label="创建时间" width="180" />
          </el-table>
        </div>
        
        <div class="result-display">
           <p><strong>搜索值:</strong> {{ searchValue }}</p>
           <p><strong>搜索模式:</strong> 模糊搜索（默认）</p>
           <p><strong>筛选结果:</strong> 共 {{ filteredTableData.length }} 条数据</p>
         </div>
      </div> -->
      
      <!-- 不同搜索模式演示 -->
      <div class="demo-section">
        <h2>不同搜索模式演示</h2>
        
        <div class="config-demo">
          <h3>点击图标搜索模式（默认）</h3>
          <ZxSearch
            v-model="searchValue2"
            search-mode="click"
            placeholder="输入内容后点击搜索图标"
            @search="handleSearch2"
          />
          <p class="mode-description">需要点击搜索图标才会触发搜索事件</p>
        </div>
        
        <div class="config-demo">
          <h3>直接输入检索模式</h3>
          <ZxSearch
             v-model="searchValue3"
             search-mode="input"
             placeholder="直接输入即可搜索（防抖300ms）"
            @search="handleSearch3"
          />
          <p class="mode-description">输入内容后自动触发搜索（防抖300ms），无需点击搜索按钮</p>
        </div>
        
        <div class="result-display">
          <h3>搜索结果展示</h3>
          <p><strong>点击模式搜索值:</strong> {{ searchValue2 }}</p>
          <p><strong>输入模式搜索值:</strong> {{ searchValue3 }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ZxSearch from '@/components/ZXHL/comp/pure/ZxSearch/index.vue'

// 搜索相关数据
const searchValue = ref('')
const searchValue2 = ref('')
const searchValue3 = ref('')

// 表格数据
const tableData = ref([
  { id: 1, name: '用户管理系统', type: 'Web应用', status: '运行中', description: '企业用户权限管理平台', createTime: '2024-01-15 10:30:00' },
  { id: 2, name: '数据分析平台', type: 'Web应用', status: '停止', description: '业务数据统计分析工具', createTime: '2024-01-20 14:20:00' },
  { id: 3, name: '移动端APP', type: '移动应用', status: '运行中', description: '客户服务移动应用', createTime: '2024-02-01 09:15:00' },
  { id: 4, name: 'API网关', type: '微服务', status: '运行中', description: '统一API接口管理', createTime: '2024-02-10 16:45:00' },
  { id: 5, name: '消息推送服务', type: '微服务', status: '运行中', description: '实时消息推送系统', createTime: '2024-02-15 11:30:00' },
  { id: 6, name: '文件存储服务', type: '微服务', status: '停止', description: '分布式文件存储', createTime: '2024-02-20 13:20:00' },
  { id: 7, name: '监控告警系统', type: 'Web应用', status: '运行中', description: '系统性能监控和告警', createTime: '2024-03-01 08:00:00' },
  { id: 8, name: '日志分析工具', type: 'Web应用', status: '运行中', description: '系统日志收集分析', createTime: '2024-03-05 15:10:00' }
])

// 筛选后的表格数据
const filteredTableData = computed(() => {
  if (!searchValue.value.trim()) {
    return tableData.value
  }
  
  const keyword = searchValue.value.toLowerCase()
  return tableData.value.filter(item => {
    return item.name.toLowerCase().includes(keyword) ||
           item.type.toLowerCase().includes(keyword) ||
           item.status.toLowerCase().includes(keyword) ||
           item.description.toLowerCase().includes(keyword)
  })
})

// 事件处理函数
const handleSearch = (searchData) => {
  console.log('搜索事件:', searchData)
  // 这里可以添加额外的搜索逻辑，比如发送API请求
}

const handleClear = () => {
  console.log('清空搜索')
  // 清空时的额外处理逻辑
}

const handleSearch2 = (searchData) => {
  console.log('简洁模式搜索:', searchData)
}

const handleSearch3 = (searchData) => {
  console.log('实时搜索:', searchData)
}
</script>

<style scoped>
.search-demo-page {
  padding: 20px;
  background-color: var(--el-bg-color-page);
  min-height: 100vh;
}

.demo-container {
  max-width: 800px;
  margin: 0 auto;
  background: var(--el-bg-color);
  padding: 30px;
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
}

h1 {
  text-align: center;
  color: var(--el-text-color-primary);
  margin-bottom: 30px;
  font-size: 28px;
  font-weight: 600;
}

h2 {
  color: var(--el-text-color-regular);
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: 500;
  border-bottom: 2px solid var(--el-color-primary-light-8);
  padding-bottom: 8px;
}

.demo-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  background: var(--el-fill-color-extra-light);
}

.result {
  margin-top: 10px;
  padding: 8px 12px;
  background: var(--el-color-info-light-9);
  border-left: 3px solid var(--el-color-info);
  border-radius: 4px;
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.user-results {
  margin-top: 15px;
  max-height: 200px;
  overflow-y: auto;
}

.user-item {
  padding: 8px 12px;
  margin-bottom: 5px;
  background: var(--el-color-success-light-9);
  border-radius: 4px;
  font-size: 14px;
  color: var(--el-text-color-regular);
}

/* 搜索模式描述样式 */
.mode-description {
  margin-top: 8px;
  padding: 8px 12px;
  background: var(--el-color-info-light-9);
  border-left: 3px solid var(--el-color-info);
  border-radius: 4px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
}

/* 自定义搜索样式 */
:deep(.custom-search) {
  .search-input {
    border: 2px solid var(--el-color-success);
  }
  
  .search-button {
    background: linear-gradient(45deg, var(--el-color-success), var(--el-color-success-light-3));
    border: none;
    font-weight: 600;
  }
}

@media (max-width: 768px) {
  .demo-container {
    padding: 20px;
    margin: 10px;
  }
  
  .demo-section {
    padding: 15px;
  }
}
</style>