<template>
  <ZxDrawer
    v-model="visible"
    :title="drawerTitle"
    :width="600"
    :ok-loading="loading"
    :ok-disabled="loading"
    :show-full-screen="true"
    :closable="true"
    :mask-closable="false"
    :unmount-on-close="false"
    class="panel-edit-pane"
    @confirm="handleConfirm"
    @cancel="handleCancel"
    @close="handleClose"
  >
    <template #headerRight>
      <el-tooltip content="重置表单" placement="bottom">
        <el-button
          type="text"
          size="small"
          :icon="RefreshRight"
          @click="handleReset"
          :disabled="loading"
        >
          重置
        </el-button>
      </el-tooltip>
    </template>

    <div class="panel-edit-content">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-position="top"
        label-width="auto"
        size="default"
        class="panel-edit-form"
      >
        <!-- 基础信息区域 -->
        <div class="form-section">
          <div class="section-header">
            <el-icon class="section-icon"><Setting /></el-icon>
            <span class="section-title">基础配置</span>
          </div>
          
          <el-row :gutter="16">
            <el-col :span="24">
              <el-form-item label="面板标题" prop="title" class="form-item-required">
                <el-input
                  v-model="formData.title"
                  placeholder="请输入面板标题"
                  maxlength="50"
                  show-word-limit
                  clearable
                  :disabled="loading"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="16">
            <el-col :span="24">
              <el-form-item label="面板描述" prop="description">
                <el-input
                  v-model="formData.description"
                  type="textarea"
                  placeholder="请输入面板描述信息（可选）"
                  :rows="3"
                  maxlength="200"
                  show-word-limit
                  resize="none"
                  clearable
                  :disabled="loading"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 显示设置区域 -->
        <div class="form-section">
          <div class="section-header">
            <el-icon class="section-icon"><View /></el-icon>
            <span class="section-title">显示设置</span>
          </div>

          <el-row :gutter="16">
            <el-col :span="24">
              <el-form-item label="背景透明" prop="transparentBackground">
                <div class="switch-item">
                  <el-switch
                    v-model="formData.transparentBackground"
                    :disabled="loading"
                    active-text="开启"
                    inactive-text="关闭"
                    inline-prompt
                  />
                  <span class="switch-description">
                    开启后面板背景将变为透明，适用于叠加显示场景
                  </span>
                </div>
              </el-form-item>
            </el-col>
          </el-row>

        </div>

        <!-- 高级选项 -->
        <ZxExpandToggle 
          v-model="showAdvancedOptions"
          expanded-text="收起"
          collapsed-text="展开"
          text-suffix="高级选项"
          trigger-position="center"
        >
          <template #content>
            <div class="form-section">
              <div class="section-header">
                <el-icon class="section-icon"><Setting /></el-icon>
                <span class="section-title">高级选项</span>
              </div>
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="面板宽度" prop="width">
                    <el-input-number
                      v-model="formData.width"
                      :min="200"
                      :max="1200"
                      :step="10"
                      controls-position="right"
                      :disabled="loading"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="面板高度" prop="height">
                    <el-input-number
                      v-model="formData.height"
                      :min="150"
                      :max="800"
                      :step="10"
                      controls-position="right"
                      :disabled="loading"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </template>
        </ZxExpandToggle>
      </el-form>
    </div>
  </ZxDrawer>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Setting,
  View,
  RefreshRight,
  ArrowDown,
  ArrowUp
} from '@element-plus/icons-vue'
import ZxDrawer from '@/components/ZXHL/comp/pure/ZxDrawer'
import ZxExpandToggle from '@/components/ZXHL/comp/pure/ZxExpandToggle'

// Props 定义
const props = defineProps({
  /** 是否显示编辑面板 */
  modelValue: {
    type: Boolean,
    default: false
  },
  /** 面板数据 */
  panelData: {
    type: Object,
    default: () => ({})
  },
  /** 编辑模式：create | edit */
  mode: {
    type: String,
    default: 'edit',
    validator: (value) => ['create', 'edit'].includes(value)
  },
  /** 是否显示加载状态 */
  loading: {
    type: Boolean,
    default: false
  }
})

// Events 定义
const emit = defineEmits([
  'update:modelValue',
  'confirm',
  'cancel',
  'reset'
])

// 响应式数据
const formRef = ref(null)
const visible = ref(props.modelValue)
const showAdvancedOptions = ref(false)

// 表单数据
const formData = ref({
  title: '',
  description: '',
  transparentBackground: false,
  width: 400,
  height: 300
})

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: '请输入面板标题', trigger: 'blur' },
    { min: 1, max: 50, message: '标题长度应在1-50个字符之间', trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '描述长度不能超过200个字符', trigger: 'blur' }
  ],
  width: [
    { type: 'number', min: 200, max: 1200, message: '宽度应在200-1200px之间', trigger: 'change' }
  ],
  height: [
    { type: 'number', min: 150, max: 800, message: '高度应在150-800px之间', trigger: 'change' }
  ]
}

// 计算属性
const drawerTitle = computed(() => {
  return props.mode === 'create' ? '创建面板' : '编辑面板'
})

// 监听器
watch(
  () => props.modelValue,
  (val) => {
    if (visible.value !== val) {
      visible.value = val
      if (val) {
        initFormData()
      }
    }
  }
)

watch(
  () => visible.value,
  (val) => {
    if (val !== props.modelValue) {
      emit('update:modelValue', val)
    }
  }
)

watch(
  () => props.panelData,
  () => {
    if (visible.value) {
      // 仅当关键字段变更时才重置表单，避免频繁触发
      const d = props.panelData || {}
      const f = formData.value || {}
      const changed = (
        d.title !== f.title ||
        d.description !== f.description ||
        d.transparentBackground !== f.transparentBackground ||
        d.width !== f.width ||
        d.height !== f.height
      )
      if (changed) {
        initFormData()
      }
    }
  },
  { deep: true }
)

// 方法
const initFormData = () => {
  const data = props.panelData || {}
  formData.value = {
    title: data.title || '',
    description: data.description || '',
    transparentBackground: data.transparentBackground || false,
    width: data.width || 400,
    height: data.height || 300
  }
  // 打开时默认收起高级选项，避免上一次状态影响当前校验
  showAdvancedOptions.value = false
  
  // 重置表单验证状态
  nextTick(() => {
    if (formRef.value) {
      formRef.value.clearValidate()
      validateForm()
    }
  })
}

const validateForm = async () => {
  if (!formRef.value) return false
  
  try {
    await formRef.value.validate()
    return true
  } catch (error) {
    return false
  }
}

const handleConfirm = async () => {
  const isValid = await validateForm()
  if (!isValid) {
    return
  }

  const submitData = {
    ...formData.value,
    mode: props.mode
  }
  
  emit('confirm', submitData)
}

const handleCancel = () => {
  emit('cancel')
}

const handleClose = () => {
  emit('cancel')
}

const handleReset = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  initFormData()
  emit('reset')
  ElMessage.success('表单已重置')
}

// 暴露方法
defineExpose({
  validateForm,
  resetForm: handleReset,
  getFormData: () => formData.value
})
</script>

<script>
export default {
  name: 'PanelEditPane'
}
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>