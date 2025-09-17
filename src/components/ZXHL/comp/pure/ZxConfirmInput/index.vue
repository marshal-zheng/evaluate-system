<template>
  <ZxDialog
    v-model="visible"
    :title="title || '需要确认'"
    :width="width"
    :closable="closable"
    :mask-closable="maskClosable"
    :unmount-on-close="unmountOnClose"
    :class="['zx-confirm-input', `zx-confirm-input--${tone}`]"
    :no-content-padding="true"
    custom-class="zx-confirm-input__dlg"
    @open="handleOpen"
    @close="handleClose"
  >
    <!-- GitLab 风格的内容区域 -->
    <div class="zx-confirm-input__content">
      <!-- 第一行：危险警告（加粗红色） -->
      <div class="zx-confirm-input__danger-warning">
        <slot name="danger-message">
          {{ dangerMessage || `您即将删除 ${targetName || '-'}。删除的${targetType || '-'}无法恢复！您确定要继续吗？` }}
        </slot>
      </div>

      <!-- 第二行：操作描述 + 输入提示 -->
      <div class="zx-confirm-input__description">
        <slot name="description">
          {{ description || '此操作可能导致数据丢失。为了防止意外操作，我们要求您确认您的意图。' }}
        </slot>
        <slot name="input-hint">
          请输入 <strong class="zx-confirm-input__keyword">{{ keyword || targetName || '项目名称' }}</strong> 以继续，或关闭此对话框取消操作。
        </slot>
      </div>

      <!-- 输入框 -->
      <el-form :model="form" :rules="rules" ref="formRef" class="zx-confirm-input__form">
        <el-form-item prop="value" class="zx-confirm-input__form-item">
          <ZxInput
            v-model.trim="form.value"
            size="small"
            clearable
            v-bind="inputProps"
            class="zx-confirm-input__input"
            @keydown.enter="handleEnterKey"
          />
        </el-form-item>

        <slot name="extra"></slot>
      </el-form>
    </div>

    <!-- 分割线 -->
    <el-divider class="zx-confirm-input__divider" />

    <!-- Footer 操作区域 -->
    <template #footer>
      <div class="zx-confirm-input__footer">
        <slot name="footer-left"></slot>
        <div class="zx-confirm-input__actions">
          <el-button 
            type="danger" 
            :class="{ 'zx-confirm-input__btn--rounded': rounded }"
            :disabled="confirmDisabled || isLoading" 
            :loading="isLoading" 
            size="default"
            @click="tryConfirm"
            class="zx-confirm-input__confirm-btn"
          >
            {{ okText || '确认删除' }}
          </el-button>
        </div>
      </div>
    </template>
  </ZxDialog>
</template>

<script setup>
import { ref, reactive, watch, computed, nextTick } from 'vue'
import { Warning } from '@element-plus/icons-vue'

// Props 对齐 GitLab 风格
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '需要确认' },
  /** GitLab 风格：危险警告文本（第一行，红色加粗） */
  dangerMessage: { type: String, default: '' },
  /** 操作描述文本（第二行） */
  description: { type: String, default: '' },
  /** 目标名称，如项目名、用户名等 */
  targetName: { type: String, default: '' },
  /** 目标类型，如"项目"、"用户"、"文件"等 */
  targetType: { type: String, default: '项' },
  /** 要求匹配的关键字，例如项目名；留空时仅要求非空输入（当 requireKeyword 为 true） */
  keyword: { type: String, default: '' },
  /** 正则校验（与 keyword 二选一，正则优先） */
  pattern: { type: [RegExp, String], default: null },
  /** 自定义校验函数 (val) => true | string | Promise<boolean|string> */
  validator: { type: Function, default: null },
  /** 是否要求必须输入（默认是），禁用则允许直接确认 */
  requireKeyword: { type: Boolean, default: true },
  /** 确认操作的接口函数，返回 Promise，支持异步操作和 loading 状态 */
  confirmAction: { type: Function, default: null },
  /** 大小与行为 */
  width: { type: [String, Number], default: 520 },
  closable: { type: Boolean, default: true },
  maskClosable: { type: Boolean, default: false },
  unmountOnClose: { type: Boolean, default: false },
  /** 文案与输入相关 */
  placeholder: { type: String, default: '' },
  okText: { type: String, default: '确认删除' },
  cancelText: { type: String, default: '取消' },
  showCancelButton: { type: Boolean, default: true },
  okLoading: { type: Boolean, default: false },
  disabledWhenMismatch: { type: Boolean, default: true },
  caseSensitive: { type: Boolean, default: true },
  autofocus: { type: Boolean, default: true },
  maxlength: { type: Number, default: 0 },
  inputProps: { type: Object, default: () => ({}) },
  /** 按钮是否使用圆角 */
  rounded: { type: Boolean, default: false },
  /** 提示和底部区域的语气：danger|warning|info */
  tone: { 
    type: String, 
    default: 'danger', 
    validator: v => ['danger', 'warning', 'info'].includes(v)
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel', 'open', 'close', 'error'])

const visible = ref(props.modelValue)
watch(() => props.modelValue, v => (visible.value = v))
watch(() => visible.value, v => emit('update:modelValue', v))

const formRef = ref(null)
const form = reactive({ value: '' })

// 内部 loading 状态管理
const internalLoading = ref(false)
const isLoading = computed(() => props.okLoading || internalLoading.value)

const normalizedPattern = computed(() => {
  if (!props.pattern) return null
  if (props.pattern instanceof RegExp) return props.pattern
  try {
    return new RegExp(props.pattern)
  } catch (e) {
    return null
  }
})

const keywordForCompare = computed(() => (props.caseSensitive ? props.keyword : props.keyword.toLowerCase()))
const inputForCompare = computed(() => (props.caseSensitive ? form.value : form.value.toLowerCase()))

const isMatch = async () => {
  if (!props.requireKeyword) return true

  // 自定义校验优先
  if (props.validator) {
    const res = await props.validator(form.value)
    if (res === true) return true
    if (typeof res === 'string') return false // 字符串表示报错信息
    return res === false ? false : true
  }

  // 正则校验
  if (normalizedPattern.value) {
    return normalizedPattern.value.test(form.value)
  }

  // 关键字精确匹配；若未提供关键字则要求非空
  if (!props.keyword) return form.value.trim().length > 0
  return inputForCompare.value === keywordForCompare.value
}

const rules = {
  value: [
    {
      validator: async (_rule, _val, callback) => {
        if (!props.requireKeyword) return callback()
        const passed = await isMatch()
        if (passed) callback()
        else callback(new Error(errorTextComputed.value))
      },
      trigger: 'change'
    }
  ]
}

const errorTextComputed = computed(() => {
  if (normalizedPattern.value) return '输入不符合要求的格式'
  if (props.keyword) return '输入内容与要求不一致'
  return '请输入内容'
})

const localValid = ref(!props.requireKeyword)

// 修复按钮禁用逻辑：当输入正确时，按钮应该可用（显示 danger 色）
const confirmDisabled = computed(() => {
  if (!props.disabledWhenMismatch) return false
  return !localValid.value
})

watch(
  () => form.value,
  async () => {
    if (!props.requireKeyword) {
      localValid.value = true
      return
    }
    localValid.value = await isMatch()
  },
  { immediate: true }
)

watch(
  () => visible.value,
  (v) => {
    if (v) {
      // 打开时重置并自动聚焦
      form.value = ''
      // 清除表单校验状态
      nextTick(() => {
        formRef.value?.clearValidate?.()
        if (props.autofocus) {
          const el = document.querySelector('.zx-confirm-input input')
          el && el.focus()
        }
      })
    }
  }
)

const handleEnterKey = (event) => {
  // 阻止事件冒泡，防止 Dialog 接收到 Enter 键事件
  event.preventDefault()
  event.stopPropagation()
  
  // 调用确认逻辑，这样会触发校验
  tryConfirm()
}

const tryConfirm = async () => {
  if (props.disabledWhenMismatch && !(await isMatch())) {
    // 触发校验提示
    formRef.value && formRef.value.validate?.()
    return
  }

  const payload = { value: form.value }

  // 如果提供了 confirmAction，则执行异步操作
  if (props.confirmAction && typeof props.confirmAction === 'function') {
    try {
      internalLoading.value = true
      await props.confirmAction(payload)
      
      // 成功后关闭对话框
      visible.value = false
      emit('confirm', payload)
    } catch (error) {
      console.error('确认操作失败:', error)
      // 可以在这里处理错误，比如显示错误消息
      // 不关闭对话框，让用户可以重试
      emit('error', { error, payload })
    } finally {
      internalLoading.value = false
    }
  } else {
    // 没有提供 confirmAction，直接触发 confirm 事件
    emit('confirm', payload)
  }
}

const handleCancel = () => {
  visible.value = false
  emit('cancel')
}

const handleClose = () => {
  // 关闭时清除校验状态和输入值
  form.value = ''
  formRef.value?.clearValidate?.()
  visible.value = false
  emit('close')
}
const handleOpen = () => emit('open')
</script>

<style lang="scss">
@import './index.scss';
</style>
