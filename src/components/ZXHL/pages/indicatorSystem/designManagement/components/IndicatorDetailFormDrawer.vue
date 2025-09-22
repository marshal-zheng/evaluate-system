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
        label-width="100px"
        label-position="left"
        size="default"
      >
        <!-- 上级指标 -->
        <el-form-item label="上级指标" prop="parentIndicator">
          <div class="form-item-with-tag">
            <el-input
              v-model="formData.parentIndicator"
              placeholder="请输入上级指标"
              :disabled="disabledMenu.includes('parentIndicator') || isReadOnly"
            />
            <el-tag v-if="formData.parentIndicator" type="info" size="small" class="indicator-tag">
              指标点
            </el-tag>
          </div>
        </el-form-item>

        <!-- 指标名称 -->
        <el-form-item label="指标名称" prop="indicatorName">
          <el-input
            v-model="formData.indicatorName"
            placeholder="请输入指标名称"
            maxlength="50"
            show-word-limit
            :disabled="disabledMenu.includes('indicatorName') || isReadOnly"
          />
        </el-form-item>

        <!-- 支撑说明 -->
        <el-form-item label="支撑说明" prop="supportDescription">
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
        </el-form-item>

        <!-- 计算模型 -->
        <el-form-item label="计算模型" prop="calculationModel">
          <div class="calculation-model-field">
            <el-input
              v-model="formData.calculationModelName"
              placeholder="请选择计算模型"
              readonly
              :disabled="disabledMenu.includes('calculationModel') || isReadOnly"
              style="flex: 1;"
            />
            <el-button
              type="primary"
              :disabled="disabledMenu.includes('calculationModel') || isReadOnly"
              @click="openModelSelectDialog"
              style="margin-left: 8px;"
            >
              选择
            </el-button>
          </div>
        </el-form-item>

        <!-- 类型 -->
        <el-form-item label="类型" prop="type">
          <el-input
            v-model="formData.type"
            placeholder="请输入类型"
            :disabled="disabledMenu.includes('type') || isReadOnly"
          />
        </el-form-item>

        <!-- 属性 -->
        <el-form-item label="属性" prop="attribute">
          <el-input
            v-model="formData.attribute"
            placeholder="请输入属性"
            :disabled="disabledMenu.includes('attribute') || isReadOnly"
          />
        </el-form-item>

        <!-- 优先级 -->
        <el-form-item label="优先级" prop="priority">
          <el-input
            v-model="formData.priority"
            placeholder="请输入优先级"
            :disabled="disabledMenu.includes('priority') || isReadOnly"
          />
        </el-form-item>

        <!-- 默认值 -->
        <el-form-item label="默认值" prop="defaultValue">
          <el-input
            v-model="formData.defaultValue"
            placeholder="请输入默认值"
            :disabled="disabledMenu.includes('defaultValue') || isReadOnly"
          />
        </el-form-item>

        <!-- 备注 -->
        <el-form-item label="备注" prop="notes">
          <el-input
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
  parentIndicator: '',
  indicatorName: '',
  supportDescription: 0,
  calculationModel: '', // 存储模型ID
  calculationModelName: '', // 存储模型名称用于显示
  type: '',
  attribute: '',
  priority: '',
  defaultValue: '',
  notes: ''
})

// 表单验证规则
const formRules = {
  indicatorName: [
    { required: true, message: '请输入指标名称', trigger: 'blur' },
    { max: 50, message: '指标名称不能超过50个字符', trigger: 'blur' }
  ],
  calculationModel: [
    { required: true, message: '请选择计算模型', trigger: 'change' }
  ],
  supportDescription: [
    { type: 'number', min: 0, max: 100, message: '支撑说明必须在0-100之间', trigger: 'blur' }
  ]
}

// 监听指标数据变化，更新表单
watch(
  () => props.indicatorData,
  (newData) => {
    if (newData && Object.keys(newData).length > 0) {
      Object.assign(formData, {
        parentIndicator: newData.parentIndicator || '',
        indicatorName: newData.indicatorName || '',
        supportDescription: newData.supportDescription || 0,
        calculationModel: newData.calculationModel || '',
        calculationModelName: newData.calculationModelName || '',
        type: newData.type || '',
        attribute: newData.attribute || '',
        priority: newData.priority || '',
        defaultValue: newData.defaultValue || '',
        notes: newData.notes || ''
      })
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
  Object.assign(formData, {
    parentIndicator: '',
    indicatorName: '',
    supportDescription: 0,
    calculationModel: '',
    calculationModelName: '',
    type: '',
    attribute: '',
    priority: '',
    defaultValue: '',
    notes: ''
  })
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
  
  .form-item-with-tag {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    
    .el-input {
      flex: 1;
    }
    
    .indicator-tag {
      flex-shrink: 0;
    }
  }
  
  .support-input {
    width: calc(100% - 20px);
  }
  
  .percent-symbol {
    margin-left: 8px;
    color: var(--el-text-color-regular);
    font-size: 14px;
  }
  
  .calculation-model-field {
    display: flex;
    align-items: center;
    width: 100%;
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