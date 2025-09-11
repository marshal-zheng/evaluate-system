# ZxGridList 组件使用文档

一个功能强大、易于使用的 Vue 3 列表组件，支持查询、分页、排序等功能。

## 特性

- 🚀 基于 Vue 3 Composition API
- 📱 响应式设计，支持移动端
- 🔄 支持自动刷新
- 🌐 支持 URL 状态同步
- ⚡ 内置防抖优化
- 🎨 现代化 UI 设计
- 📦 轻量级，无额外依赖

## 安装

```bash
# 如果是内部组件，无需安装
# 直接从项目中导入使用
```

## 基本用法

```vue
<template>
  <ZxGridList
    :load-data="loadUserList"
    :show-pagination="true"
    :page-sizes="[10, 20, 50, 100]"
  >
    <!-- 查询表单插槽 -->
    <template #form="{ query, data, loading }">
      <el-form inline>
        <el-form-item label="用户名">
          <el-input 
            v-model="query.username" 
            placeholder="请输入用户名"
            @input="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="请选择状态">
            <el-option label="全部" value="" />
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="loading">
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <!-- 表格插槽 -->
    <template #table="{ grid, loading, refresh }">
      <el-table 
        :data="grid.list" 
        :loading="loading"
        @sort-change="handleSortChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="username" label="用户名" sortable="custom" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </template>
  </ZxGridList>
</template>

<script setup>
import { ref } from 'vue'
import ZxGridList from '@/components/ZXHL/comp/pure/ZxGridList/index.vue'
import { getUserList } from '@/api/user'

const gridRef = ref()

// 数据加载函数
const loadUserList = async (params) => {
  try {
    const { query, pager } = params
    const response = await getUserList({
      ...query,
      page: pager.page,
      size: pager.size
    })
    
    return {
      list: response.data.list,
      pager: {
        page: response.data.page,
        size: response.data.size,
        total: response.data.total
      }
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    throw error
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

// 排序处理
const handleSortChange = ({ prop, order }) => {
  const sortParams = {
    sortBy: order ? prop : undefined,
    sortOrder: order
  }
  gridRef.value?.updateState('query', sortParams)
  gridRef.value?.loadData({}, { immediate: true })
}

// 编辑用户
const handleEdit = (row) => {
  console.log('编辑用户:', row)
}

// 删除用户
const handleDelete = (row) => {
  console.log('删除用户:', row)
}
</script>
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| loadData | 数据加载函数，必需 | Function | - |
| initialState | 初始状态 | Object | `{}` |
| showPagination | 是否显示分页 | Boolean | `true` |
| pageSizes | 分页大小选项 | Array | `[10, 20, 50, 100]` |
| paginationLayout | 分页组件布局 | String | `'total, sizes, prev, pager, next, jumper'` |
| small | 分页组件是否为小尺寸 | Boolean | `false` |
| paginationBackground | 分页按钮是否有背景色 | Boolean | `true` |
| loadOnMounted | 组件挂载时是否自动加载 | Boolean | `true` |
| queryTransform | 查询参数转换函数 | Function | `(query) => query` |
| paramsTransform | 参数预处理函数 | Function | `(params) => params` |
| autoRefresh | 自动刷新配置 | Boolean/Object | `false` |
| clearSelectionOnLoad | 加载时是否清除表格选择 | Boolean | `true` |
| syncUrlState | 是否同步 URL 状态 | Boolean | `false` |
| urlStateKey | URL 状态键名 | String | `'_state'` |
| pageFrom0 | 分页是否从 0 开始 | Boolean | `false` |
| debounceDelay | 防抖延迟(ms) | Number | `300` |
| defaultPageSize | 默认分页大小 | Number | `20` |

## Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| beforeLoad | 加载前触发 | `(params)` |
| dataLoaded | 数据加载成功后触发 | `(response)` |
| loadError | 数据加载失败后触发 | `(error)` |
| stateChange | 状态变化时触发 | `(newState)` |

## Slots

### form 插槽
查询表单区域，提供以下参数：
- `query`: 当前查询参数
- `data`: 完整的组件状态
- `loading`: 加载状态

### table 插槽
表格区域，提供以下参数：
- `grid`: 组件状态，包含 list、pager 等
- `loading`: 加载状态
- `refresh`: 刷新函数

### pagination 插槽
分页区域，提供以下参数：
- `pager`: 分页信息

## 暴露的方法

```javascript
const gridRef = ref()

// 加载数据
await gridRef.value.loadData(params, options)

// 刷新数据
await gridRef.value.refresh(options)

// 更新单个状态
gridRef.value.updateState('query.username', 'test')

// 更新多个状态
gridRef.value.updateMultiState({ 
  query: { username: 'test' },
  pager: { page: 1 }
})

// 获取状态快照
const snapshot = gridRef.value.getStateSnapshot()

// 清除表格选择
gridRef.value.clearTableSelection()
```

## 高级用法

### 自动刷新

```vue
<ZxGridList
  :load-data="loadData"
  :auto-refresh="{ enabled: true, interval: 30000 }"
>
  <!-- 插槽内容 -->
</ZxGridList>
```

### URL 状态同步

```vue
<ZxGridList
  :load-data="loadData"
  :sync-url-state="true"
  url-state-key="listState"
>
  <!-- 插槽内容 -->
</ZxGridList>
```

### 自定义参数转换

```vue
<template>
  <ZxGridList
    :load-data="loadData"
    :query-transform="queryTransform"
    :params-transform="paramsTransform"
  >
    <!-- 插槽内容 -->
  </ZxGridList>
</template>

<script setup>
// 查询参数转换
const queryTransform = (query) => {
  return {
    ...query,
    // 添加默认参数
    tenant: 'default'
  }
}

// 参数预处理
const paramsTransform = (params) => {
  return {
    ...params,
    // 添加时间戳
    timestamp: Date.now()
  }
}
</script>
```

## 样式定制

组件支持 CSS 变量定制：

```scss
.zx-grid-list {
  // 自定义间距
  gap: 20px;
  
  // 自定义分页样式
  .zx-grid-list__pagination {
    :deep(.el-pagination) {
      --el-pagination-font-size: 16px;
      --el-pagination-button-width: 36px;
      --el-pagination-button-height: 36px;
    }
  }
}
```

## 迁移指南

### 从旧版本迁移

如果你正在从旧的 `GridList` 组件迁移，请注意以下变化：

1. **Props 重命名**：
   - `storeLoadList` → `loadData`
   - `loadOnCreated` → `loadOnMounted`
   - `chainQuery` → `queryTransform`
   - `paramsReduce` → `paramsTransform`
   - `autoReload` → `autoRefresh`
   - `queryStateKey` → `urlStateKey`

2. **插槽变化**：
   - 插槽参数结构有所调整，请参考新的插槽文档

3. **API 变化**：
   - `state` 现在是响应式的只读对象
   - 新增了更多便捷的方法

## 注意事项

1. `loadData` 函数必须返回 Promise
2. 响应数据结构应包含 `list` 和 `pager` 字段
3. 组件会自动处理并发请求，避免数据混乱
4. 建议在开发环境启用 Vue DevTools 以便调试
