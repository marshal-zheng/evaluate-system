<template>
  <ZxDialog
    v-model="visible"
    title="选择计算模型"
    width="800px"
    :ok-text="'确定'"
    :cancel-text="'取消'"
    :ok-disabled="!selectedModel"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  >
    <div class="model-select-dialog">
      <!-- 搜索框 -->
      <div class="search-section">
        <el-input
          v-model="searchKeyword"
          placeholder="请输入名称进行搜索"
          clearable
          @input="handleSearch"
          @clear="handleSearch"
          style="width: 100%; margin-bottom: 16px;"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 模型列表 -->
      <ZxGridList
        ref="gridRef"
        :load-data="loadModelData"
        :show-pagination="false"
        :load-on-mounted="true"
        :debounce-delay="300"
        :auto-fit-table-height="false"
        style="height: 400px;"
      >
        <template #table="{ grid, loading }">
          <el-table
            ref="tableRef"
            :data="grid.list"
            v-loading="loading"
            border
            stripe
            highlight-current-row
            @current-change="handleCurrentChange"
            style="width: 100%; height: 100%;"
          >
            <!-- 序号列 -->
            <el-table-column 
              type="index" 
              label="序号" 
              width="60" 
              align="center"
            />
            
            <!-- 计算模型名称列 -->
            <el-table-column 
              prop="name" 
              label="计算模型名称" 
              min-width="200"
              show-overflow-tooltip
            />
            
            <!-- 描述列 -->
            <el-table-column 
              prop="description" 
              label="描述" 
              min-width="200"
              show-overflow-tooltip
            />
            
            <!-- 选择列 -->
            <el-table-column 
              label="选择" 
              width="80" 
              align="center"
            >
              <template #default="{ row }">
                <el-radio 
                  v-model="selectedModelId" 
                  :label="row.id"
                  @change="handleRadioChange(row)"
                >
                  &nbsp;
                </el-radio>
              </template>
            </el-table-column>
          </el-table>
        </template>

        <!-- 空状态 -->
        <template #empty>
          <el-empty 
            :description="searchKeyword ? '未找到匹配的模型' : '暂无模型数据'"
            :image-size="100"
          />
        </template>
      </ZxGridList>
    </div>
  </ZxDialog>
</template>

<script setup>
import { ref, reactive, watch, nextTick } from 'vue'
import { Search } from '@element-plus/icons-vue'
import ZxDialog from '@/components/ZXHL/comp/pure/ZxDialog'
import ZxGridList from '@/components/ZXHL/comp/pure/ZxGridList'

// 定义组件选项
defineOptions({
  name: 'ModelSelectDialog'
})

// Props 定义
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  // 预选中的模型ID
  defaultSelectedId: {
    type: [String, Number],
    default: null
  }
})

// Emits 定义
const emit = defineEmits([
  'update:modelValue',
  'confirm',
  'cancel'
])

// 响应式数据
const visible = ref(false)
const searchKeyword = ref('')
const selectedModelId = ref(null)
const selectedModel = ref(null)
const gridRef = ref(null)
const tableRef = ref(null)

// 模拟数据
const mockModelData = [
  {
    id: 1,
    name: '测试模型',
    description: '测试模型'
  },
  {
    id: 2,
    name: '123123',
    description: '123'
  },
  {
    id: 3,
    name: '测试250331',
    description: '测试250331'
  },
  {
    id: 4,
    name: '陆航-装备研制费用-其他设备费用',
    description: '陆航-装备研制费用-其他设备费用'
  },
  {
    id: 5,
    name: '陆航-装备研制费用-保障人员费用',
    description: '陆航-装备研制费用-保障人员费用'
  },
  {
    id: 6,
    name: '陆航-装备研制费用-保障资料费用',
    description: '陆航-装备研制费用-保障资料费用'
  },
  {
    id: 7,
    name: '陆航-装备研制费用-保障设施费用',
    description: '陆航-装备研制费用-保障设施费用'
  },
  {
    id: 8,
    name: '陆航-装备研制费用-供应保障费用',
    description: '陆航-装备研制费用-供应保障费用'
  },
  {
    id: 9,
    name: '陆航-装备研制费用-维修人员费用',
    description: '陆航-装备研制费用-维修人员费用'
  }
]

// 数据加载函数
const loadModelData = async (params) => {
  // 模拟API请求延迟
  await new Promise(resolve => setTimeout(resolve, 300))
  
  let filteredData = [...mockModelData]
  
  // 根据搜索关键词过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filteredData = filteredData.filter(item => 
      item.name.toLowerCase().includes(keyword) || 
      item.description.toLowerCase().includes(keyword)
    )
  }
  
  return {
    list: filteredData,
    total: filteredData.length
  }
}

// 搜索处理
const handleSearch = () => {
  if (gridRef.value) {
    gridRef.value.refresh()
  }
}

// 单选处理
const handleRadioChange = (row) => {
  selectedModel.value = row
  // 设置表格当前行高亮
  nextTick(() => {
    if (tableRef.value) {
      tableRef.value.setCurrentRow(row)
    }
  })
}

// 表格当前行变化处理
const handleCurrentChange = (currentRow) => {
  if (currentRow) {
    selectedModelId.value = currentRow.id
    selectedModel.value = currentRow
  }
}

// 确认处理
const handleConfirm = () => {
  if (selectedModel.value) {
    emit('confirm', selectedModel.value)
    handleClose()
  }
}

// 取消处理
const handleCancel = () => {
  emit('cancel')
  handleClose()
}

// 关闭弹框
const handleClose = () => {
  visible.value = false
  emit('update:modelValue', false)
}

// 重置状态
const resetState = () => {
  searchKeyword.value = ''
  selectedModelId.value = props.defaultSelectedId || null
  selectedModel.value = null
  
  // 如果有预选中的ID，找到对应的模型
  if (props.defaultSelectedId) {
    const defaultModel = mockModelData.find(item => item.id === props.defaultSelectedId)
    if (defaultModel) {
      selectedModel.value = defaultModel
      selectedModelId.value = defaultModel.id
    }
  }
}

// 监听弹框显示状态
watch(() => props.modelValue, (newVal) => {
  visible.value = newVal
  if (newVal) {
    resetState()
    // 延迟刷新数据，确保组件已渲染
    nextTick(() => {
      if (gridRef.value) {
        gridRef.value.refresh()
      }
    })
  }
})

// 监听内部visible变化
watch(visible, (newVal) => {
  if (!newVal) {
    emit('update:modelValue', false)
  }
})
</script>

<style lang="scss" scoped>
.model-select-dialog {
  .search-section {
    margin-bottom: 16px;
  }
  
  :deep(.el-table) {
    .el-table__row {
      cursor: pointer;
      
      &:hover {
        background-color: var(--el-table-row-hover-bg-color);
      }
      
      &.current-row {
        background-color: var(--el-color-primary-light-9);
      }
    }
  }
  
  :deep(.el-radio) {
    .el-radio__input {
      .el-radio__inner {
        width: 16px;
        height: 16px;
        
        &::after {
          width: 6px;
          height: 6px;
        }
      }
    }
  }
}
</style>