# ZxGridList 空状态使用指南

## 概述

ZxGridList 组件现已增强空状态处理能力，支持在显示空状态时保留表头，并提供灵活的自定义选项。

## 新增功能

### 1. 表格插槽增强属性

在 `table` 插槽中新增以下属性：

- `hasData`: 是否有数据
- `isEmpty`: 是否为空状态
- `emptySlot`: 空状态插槽内容
- `renderEmpty`: 渲染空状态的函数

### 2. 新增方法

- `renderTableEmpty()`: 渲染表格内空状态的函数

## 使用示例

### 1. 基础用法 - El-Table 保留表头

```vue
<template>
  <ZxGridList
    :load-data="loadData"
    :columns="columns"
    empty-description="暂无数据"
  >
    <template #table="{ hasData, isEmpty, renderEmpty }">
      <el-table
        :data="hasData ? state.data : []"
        style="width: 100%"
      >
        <!-- 表头列定义 -->
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="age" label="年龄" />
        <el-table-column prop="email" label="邮箱" />
        
        <!-- 空状态行 -->
        <template #empty>
          <div v-if="isEmpty">
            <component :is="renderEmpty" />
          </div>
        </template>
      </el-table>
    </template>
  </ZxGridList>
</template>
```

### 2. 自定义空状态内容

```vue
<template>
  <ZxGridList
    :load-data="loadData"
    :columns="columns"
  >
    <template #table="{ hasData, isEmpty }">
      <el-table
        :data="hasData ? state.data : []"
        style="width: 100%"
      >
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="age" label="年龄" />
        
        <template #empty>
          <div v-if="isEmpty" class="custom-empty">
            <ZxEmpty
              description="没有找到相关数据"
              image="/custom-empty.svg"
            >
              <template #extra>
                <el-button type="primary" @click="handleRefresh">
                  重新加载
                </el-button>
              </template>
            </ZxEmpty>
          </div>
        </template>
      </el-table>
    </template>
  </ZxGridList>
</template>
```

### 3. 其他表格组件使用

```vue
<template>
  <ZxGridList
    :load-data="loadData"
    empty-description="暂无数据"
  >
    <template #table="{ hasData, isEmpty, renderEmpty }">
      <!-- 自定义表格组件 -->
      <div class="custom-table">
        <!-- 表头 -->
        <div class="table-header">
          <div class="header-cell">姓名</div>
          <div class="header-cell">年龄</div>
          <div class="header-cell">邮箱</div>
        </div>
        
        <!-- 数据行或空状态 -->
        <div class="table-body">
          <template v-if="hasData">
            <div
              v-for="item in state.data"
              :key="item.id"
              class="table-row"
            >
              <div class="table-cell">{{ item.name }}</div>
              <div class="table-cell">{{ item.age }}</div>
              <div class="table-cell">{{ item.email }}</div>
            </div>
          </template>
          
          <template v-else-if="isEmpty">
            <div class="empty-container">
              <component :is="renderEmpty" />
            </div>
          </template>
        </div>
      </div>
    </template>
  </ZxGridList>
</template>
```

### 4. 使用空状态插槽

```vue
<template>
  <ZxGridList
    :load-data="loadData"
    :columns="columns"
  >
    <template #table="{ hasData, isEmpty, emptySlot }">
      <el-table
        :data="hasData ? state.data : []"
        style="width: 100%"
      >
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="age" label="年龄" />
        
        <template #empty>
          <div v-if="isEmpty">
            <component :is="emptySlot" />
          </div>
        </template>
      </el-table>
    </template>
    
    <!-- 自定义空状态插槽 -->
    <template #empty>
      <div class="custom-empty-content">
        <el-icon size="48" color="#ccc">
          <Document />
        </el-icon>
        <p>暂无数据，请尝试其他搜索条件</p>
        <el-button type="text" @click="clearFilters">
          清除筛选条件
        </el-button>
      </div>
    </template>
  </ZxGridList>
</template>
```

## 最佳实践

### 1. 表头保留策略

- **El-Table**: 使用 `#empty` 插槽结合 `isEmpty` 判断
- **自定义表格**: 始终渲染表头，根据 `hasData` 控制数据行显示
- **第三方表格**: 参考各组件的空状态处理方式

### 2. 空状态内容设计

```vue
<!-- 推荐的空状态内容结构 -->
<ZxEmpty
  :description="emptyDescription"
  :image="emptyImage"
>
  <template #extra>
    <el-button type="primary" @click="refresh">
      刷新数据
    </el-button>
    <el-button @click="clearFilters">
      清除筛选
    </el-button>
  </template>
</ZxEmpty>
```

### 3. 响应式设计

```scss
.custom-empty {
  padding: 40px 20px;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 20px 10px;
  }
}

.empty-container {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### 4. 加载状态处理

```vue
<template>
  <ZxGridList
    :load-data="loadData"
    :loading="isLoading"
  >
    <template #table="{ hasData, isEmpty, renderEmpty, isLoading }">
      <el-table
        :data="hasData ? state.data : []"
        v-loading="isLoading"
        element-loading-text="加载中..."
      >
        <!-- 表格列 -->
        
        <template #empty>
          <div v-if="isEmpty && !isLoading">
            <component :is="renderEmpty" />
          </div>
        </template>
      </el-table>
    </template>
  </ZxGridList>
</template>
```

### 5. 错误状态处理

```vue
<template>
  <ZxGridList
    :load-data="loadData"
    @error="handleError"
  >
    <template #table="{ hasData, isEmpty, renderEmpty, hasError }">
      <el-table :data="hasData ? state.data : []">
        <!-- 表格列 -->
        
        <template #empty>
          <div v-if="isEmpty">
            <ZxEmpty
              v-if="hasError"
              description="加载失败，请重试"
              image="error"
            >
              <template #extra>
                <el-button type="primary" @click="retry">
                  重新加载
                </el-button>
              </template>
            </ZxEmpty>
            <component v-else :is="renderEmpty" />
          </div>
        </template>
      </el-table>
    </template>
  </ZxGridList>
</template>
```

## 注意事项

1. **性能优化**: 使用 `v-if` 而不是 `v-show` 来控制空状态显示
2. **样式一致性**: 确保空状态样式与整体设计风格保持一致
3. **交互反馈**: 提供明确的操作按钮，如刷新、清除筛选等
4. **多语言支持**: 空状态描述文本支持国际化
5. **无障碍访问**: 为空状态添加适当的 ARIA 标签

## 兼容性说明

- 支持 Element Plus 2.0+
- 兼容 Vue 3.0+
- 支持所有现代浏览器
- 移动端友好

通过以上增强，ZxGridList 组件现在可以更好地处理空状态，同时保持表头显示，提供更好的用户体验。