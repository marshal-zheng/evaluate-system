<template>
  <ZxDrawer
    v-model="visible"
    title="指标详情"
    :width="520"
    :mask="false"
    :close-on-press-escape="false"
    :disabled-width-drag="false"
    :show-handle-border="true"
    :mask-closable="false"
    :footer="true"
    :form-ref="formRef"
    :form-model="formData"
    :auto-reset-form="true"
    :pre-validate="true"
    :confirm="handleConfirm"
    @cancel="handleCancel"
    @close="handleClose"
  >
    <div class="indicator-detail-form">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-position="top"
        size="default"
      >
        <!-- 上级指标 - 只有当存在上级指标时才显示 -->
        <el-form-item 
          v-if="formData.parentIndicator" 
          label="上级指标" 
          prop="parentIndicator"
        >
          <div class="parent-indicator-display">
            <ZxTag 
              type="info" 
              theme="light"
              size="default"
              :tooltip-disabled="false"
              :max-width="'100%'"
              class="parent-indicator-tag"
            >
              {{ formData.parentIndicator }}
            </ZxTag>
          </div>
        </el-form-item>

        <!-- 指标名称 -->
        <el-form-item label="指标名称" prop="indicatorName">
          <ZxInput
            v-model="formData.indicatorName"
            placeholder="请输入指标名称"
            maxlength="50"
            show-word-limit
            :disabled="disabledMenu.includes('indicatorName') || isReadOnly"
          />
        </el-form-item>

        <el-form-item label="支撑说明" prop="supportDescription">
          <div class="support-description-field">
            <el-input-number
              v-model="formData.supportDescription"
              placeholder="0"
              :min="0"
              :max="100"
              :precision="0"
              :disabled="disabledMenu.includes('supportDescription') || isReadOnly"
              class="support-input"
            />
            <span class="percent-symbol">%</span>
          </div>
        </el-form-item>

        <!-- 计算模型：仅叶子节点显示 -->
        <el-form-item v-if="isLeafNode" label="计算模型" prop="calculationModel">
          <div class="calculation-model-field">
            <!-- 当有选择的计算模型时，使用ZxTag展示 -->
            <div v-if="formData.calculationModelName" class="calculation-model-display">
              <ZxTag 
                type="primary" 
                size="default"
                :tooltip="formData.calculationModelName"
                class="calculation-model-tag"
              >
                <span class="model-name-text">{{ formData.calculationModelName }}</span>
              </ZxTag>
              <el-button
                type="primary"
                size="small"
                :disabled="disabledMenu.includes('calculationModel') || isReadOnly"
                @click="openModelSelectDialog"
                style="margin-left: 8px;"
              >
                更换
              </el-button>
            </div>
            
            <!-- 当没有选择计算模型时，显示选择按钮 -->
            <div v-else class="calculation-model-empty">
              <span class="empty-text">未选择计算模型</span>
              <el-button
                type="primary"
                :disabled="disabledMenu.includes('calculationModel') || isReadOnly"
                @click="openModelSelectDialog"
                style="margin-left: 8px;"
              >
                选择
              </el-button>
            </div>
          </div>
        </el-form-item>

        <!-- 类型 -->
        <el-form-item label="类型" prop="customType">
          <ZxInput
            v-model="formData.customType"
            placeholder="请输入类型"
            :disabled="disabledMenu.includes('customType') || isReadOnly"
          />
        </el-form-item>

        <!-- 属性 -->
        <el-form-item label="属性" prop="customProperties">
          <ZxInput
            v-model="formData.customProperties"
            placeholder="请输入属性"
            :disabled="disabledMenu.includes('customProperties') || isReadOnly"
          />
        </el-form-item>

        <!-- 单位 -->
        <el-form-item label="单位" prop="unit">
          <ZxInput
            v-model="formData.unit"
            placeholder="请输入单位"
            :disabled="disabledMenu.includes('unit') || isReadOnly"
          />
        </el-form-item>

        <!-- 优先级 -->
        <el-form-item label="优先级" prop="priority">
          <ZxInput
            v-model="formData.priority"
            placeholder="请输入优先级"
            :disabled="disabledMenu.includes('priority') || isReadOnly"
          />
        </el-form-item>

        <!-- 默认值 -->
        <el-form-item label="默认值" prop="defaultValue">
          <ZxInput
            v-model="formData.defaultValue"
            placeholder="请输入默认值"
            :disabled="disabledMenu.includes('defaultValue') || isReadOnly"
          />
        </el-form-item>

        <!-- 备注 -->
        <el-form-item label="备注" prop="notes">
          <ZxInput
            v-model="formData.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
            :disabled="disabledMenu.includes('notes') || isReadOnly"
          />
        </el-form-item>
      </el-form>
    </div>

    <!-- 计算模型选择对话框 -->
    <ModelSelectDialog
      v-model="showModelSelectDialog"
      :default-selected-id="formData.calculationModel"
      @confirm="handleModelSelect"
      @cancel="handleModelSelectCancel"
    />
  </ZxDrawer>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import ZxDrawer from '@/components/ZXHL/comp/pure/ZxDrawer'
import ZxTag from '@/components/ZXHL/comp/pure/ZxTag'
import ZxIcon from '@/components/ZXHL/comp/pure/ZxIcon'
import ZxInput from '@/components/ZXHL/comp/pure/ZxInput'
import ModelSelectDialog from './ModelSelectDialog.vue'

// Props 定义
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  indicatorData: {
    type: Object,
    default: () => ({})
  },
  disabledMenu: {
    type: Array,
    default: () => []
  },
  isReadOnly: {
    type: Boolean,
    default: false
  }
})

// Emits 定义
const emit = defineEmits(['update:modelValue', 'confirm', 'cancel', 'close'])

// 响应式数据
const formRef = ref(null)
const showModelSelectDialog = ref(false)
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 表单数据
const formData = reactive({
  isLeafNode: true,
  parentIndicator: '',
  indicatorName: '',
  supportDescription: 0,
  calculationModel: '', // 存储模型ID
  calculationModelName: '', // 存储模型名称用于显示
  calculationModelData: null, // 存储完整的模型对象
  customType: '',
  customProperties: '',
  unit: '', // 添加单位字段
  priority: '',
  defaultValue: '',
  notes: ''
})

// 计算属性
const isLeafNode = computed(() => formData.isLeafNode)

// 表单验证规则
const formRules = {
  indicatorName: [
    { required: true, message: '请输入指标名称', trigger: 'blur' },
    { max: 50, message: '指标名称不能超过50个字符', trigger: 'blur' }
  ],
  supportDescription: [
    { type: 'number', min: 0, max: 100, message: '支撑说明必须在0-100之间', trigger: 'blur' }
  ]
}

// 监听指标数据变化，更新表单
watch(
  () => props.indicatorData,
  (newData) => {
    console.log('IndicatorDetailFormDrawer - 接收到新数据:', newData)
    if (newData && Object.keys(newData).length > 0) {
      // 直接克隆整个数据对象，避免手动映射
      Object.assign(formData, {
        // 设置默认值，确保必要字段存在
        isLeafNode: true,
        parentIndicator: '',
        indicatorName: '',
        supportDescription: 0,
        calculationModel: '',
        calculationModelName: '',
        calculationModelData: null,
        customType: '',
        customProperties: '',
        unit: '',
        priority: '',
        defaultValue: '',
        notes: '',
        // 用新数据覆盖默认值
        ...newData
      })
      
      // 非叶子节点强制清空模型字段
      if (!formData.isLeafNode) {
        formData.calculationModel = ''
        formData.calculationModelName = ''
        formData.calculationModelData = null
      }
      
      console.log('IndicatorDetailFormDrawer - 表单数据已更新:', formData)
    }
  },
  { immediate: true, deep: true }
)

// 打开模型选择对话框
const openModelSelectDialog = () => {
  showModelSelectDialog.value = true
}

// 处理模型选择确认
const handleModelSelect = (selectedModel) => {
  formData.calculationModel = selectedModel.id
  formData.calculationModelName = selectedModel.name
  formData.calculationModelData = selectedModel // 存储完整的模型对象
  showModelSelectDialog.value = false
}

// 处理模型选择取消
const handleModelSelectCancel = () => {
  showModelSelectDialog.value = false
}

// 事件处理函数
const handleConfirm = async () => {
  try {
    // 表单验证
    await formRef.value.validate()
    
    // 提交数据
    const submitData = { ...formData }
    emit('confirm', submitData)
    
    return true
  } catch (error) {
    console.error('表单验证失败:', error)
    return false
  }
}

const handleCancel = () => {
  emit('cancel')
}

const handleClose = () => {
  emit('close')
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  // 重置为默认值
  const defaultData = {
    isLeafNode: true,
    parentIndicator: '',
    indicatorName: '',
    supportDescription: 0,
    calculationModel: '',
    calculationModelName: '',
    calculationModelData: null,
    customType: '',
    customProperties: '',
    unit: '',
    priority: '',
    defaultValue: '',
    notes: ''
  }
  Object.assign(formData, defaultData)
}

// 暴露方法
defineExpose({
  resetForm,
  formRef
})
</script>

<style lang="scss" scoped>
.indicator-detail-form {
  padding: 20px;
  
  .parent-indicator-display {
    display: flex;
    align-items: center;
    
    .parent-indicator-tag {
      width: 100%;
      
      :deep(.zx-tag-content) {
        display: flex;
        align-items: center;
        gap: 6px;
        width: 100%;
        
        .zx-tag-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }
        
        .zx-tag-text {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }
  
  .support-description-field {
    display: flex;
    align-items: center;
    width: 100%;
    
    .support-input {
      flex: 1;
    }
    
    .percent-symbol {
      margin-left: 8px;
      color: var(--el-text-color-regular);
      font-size: 14px;
      flex-shrink: 0;
    }
  }
  
  .calculation-model-field {
    display: flex;
    align-items: center;
    width: 100%;
    
    .calculation-model-display {
      display: flex;
      align-items: center;
      width: 100%;
      
      .calculation-model-tag {
        max-width: 300px;
        
        .model-name-text {
          display: inline-block;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          vertical-align: middle;
        }
      }
    }
    
    .calculation-model-empty {
      display: flex;
      align-items: center;
      width: 100%;
      
      .empty-text {
        color: var(--el-text-color-placeholder);
        font-size: 14px;
        flex: 1;
      }
    }
  }
  
  :deep(.el-form-item) {
    margin-bottom: 20px;
    
    .el-form-item__label {
      color: var(--el-text-color-primary);
      font-weight: 500;
    }
    
    .el-form-item__content {
      .el-input,
      .el-select,
      .el-input-number {
        width: 100%;
      }
      
      .el-textarea {
        .el-textarea__inner {
          resize: vertical;
          min-height: 80px;
        }
      }
    }
  }
  
  // 支撑说明输入框样式调整
  :deep(.el-input-number) {
    .el-input__inner {
      text-align: left;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .indicator-detail-form {
    padding: 16px;
    
    :deep(.el-form-item) {
      margin-bottom: 16px;
    }
  }
}
</style>