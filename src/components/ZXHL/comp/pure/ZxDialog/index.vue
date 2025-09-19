<template>
  <el-dialog
    ref="dialogRef"
    v-model="visible"
    :title="title"
    :width="dialogWidth"
    :show-close="closable"
    :modal="mask"
    :close-on-click-modal="maskClosable"
    :close-on-press-escape="true"
    :destroy-on-close="unmountOnClose"
    :modal-class="modalClass"
    :class="[
      'zx-dialog',
      !mask ? 'zx-dialog-no-mask' : '',
      noContentPadding ? 'zx-dialog-no-content-padding' : '',
      noTitle ? 'zx-dialog-no-title' : '',
      `zx-dialog-${dialogSize}`,
      uniqueClass,
      customClass
    ]"
    :style="dynamicStyle"
    :before-close="handleBeforeClose"
    @open="handleOpen"
    @close="handleClose"
  >
    <!-- 自定义标题栏 -->
    <template #header="{ close, titleId, titleClass }">
      <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
        <slot name="title">
          <div style="display: flex; flex: 1 1 0%; align-items: center; justify-content: space-between; overflow: hidden;">
            <div style="display: flex; flex: 1 1 0%; align-items: center; overflow: hidden;">
              <span :id="titleId" :class="titleClass" class="truncate" style="max-width: 300px;">
                {{ title }}
              </span>
              <slot name="headerLeft"></slot>
              <el-tag v-if="titleTag" :color="titleTagColor" style="margin-left: 0.5rem; margin-right: auto;">
                {{ titleTag }}
              </el-tag>
            </div>
            <slot name="tbutton"></slot>
          </div>
        </slot>
      </div>
    </template>

    <!-- 对话框内容 -->
    <div class="zx-dialog-body">
      <slot>
        <el-descriptions
          v-if="descriptions && descriptions.length > 0"
          :column="1"
          border
          v-loading="showSkeleton"
        >
          <el-descriptions-item
            v-for="item in descriptions"
            :key="item.label"
            :label="item.label"
          >
            <slot name="descValue" :item="item">
              <el-tooltip
                :content="String(item.value)"
                :disabled="item.value === undefined || item.value === null || item.value?.toString() === ''"
              >
                <div>
                  {{
                    item.value === undefined || item.value === null || item.value?.toString() === ''
                      ? '-'
                      : item.value
                  }}
                </div>
              </el-tooltip>
            </slot>
          </el-descriptions-item>
        </el-descriptions>
      </slot>
    </div>

    <!-- 底部操作栏 -->
    <template v-if="footer" #footer>
      <slot name="footer">
        <div style="display: flex;" :style="{ 'justify-content': switchProps?.showSwitch ? 'space-between' : 'flex-end' }">
          <!-- 开关区域 -->
          <div v-if="switchProps?.showSwitch" style="display: flex; flex-direction: row; align-items: center; justify-content: center;">
            <el-switch v-model="switchEnable" style="margin-right: 0.25rem;" size="small" />
            <el-tooltip v-if="switchProps?.switchTooltip" :content="switchProps?.switchTooltip">
              <span style="display: flex; align-items: center;">
                <span style="margin-right: 0.25rem;">{{ switchProps?.switchName }}</span>
                <span style="margin-top: 2px;">
                  <ZxIcon icon="question-circle" style="height: 16px; width: 16px;" class="text-\[rgb\(var\(--el-color-primary\)\)\]" />
                </span>
              </span>
            </el-tooltip>
            <span v-else style="margin-right: 0.25rem;">{{ switchProps?.switchName }}</span>
          </div>
          
          <!-- 按钮区域 -->
          <div style="display: flex; justify-content: flex-end;">
            <slot name="footerLeft"></slot>
            <el-button
              v-if="showCancel"
              :disabled="okLoading || confirmLoading"
              @click="handleCancel"
            >
              {{ cancelText || '取消' }}
            </el-button>
            <!-- 自定义按钮插槽 -->
            <slot name="self-button"></slot>
            <el-button
              v-if="showContinue"
              type="default"
              :loading="okLoading || confirmLoading"
              :disabled="okDisabled || confirmLoading"
              @click="handleContinue"
            >
              {{ saveContinueText || '保存并继续' }}
            </el-button>
            <el-button
              type="primary"
              :disabled="okDisabled || confirmLoading"
              :loading="okLoading || confirmLoading"
              @click="handleOk"
            >
              {{ okText || '确定' }}
            </el-button>
          </div>
        </div>
      </slot>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import ZxIcon from '@/components/ZXHL/comp/pure/ZxIcon'

// 定义属性
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  titleTag: {
    type: String,
    default: ''
  },
  titleTagColor: {
    type: String,
    default: ''
  },
  descriptions: {
    type: Array,
    default: () => []
  },
  footer: {
    type: Boolean,
    default: true
  },
  showCancel: {
    type: Boolean,
    default: true
  },
  mask: {
    type: Boolean,
    default: true
  },
  showSkeleton: {
    type: Boolean,
    default: false
  },
  okLoading: {
    type: Boolean,
    default: false
  },
  okDisabled: {
    type: Boolean,
    default: false
  },
  okText: {
    type: String,
    default: ''
  },
  cancelText: {
    type: String,
    default: ''
  },
  saveContinueText: {
    type: String,
    default: ''
  },
  showContinue: {
    type: Boolean,
    default: false
  },
  width: {
    type: [String, Number],
    default: '50%'
  },
  dialogSize: {
    type: String,
    default: 'small',
    validator: (value) => ['small', 'large'].includes(value)
  },
  noContentPadding: {
    type: Boolean,
    default: false
  },
  closable: {
    type: Boolean,
    default: true
  },
  noTitle: {
    type: Boolean,
    default: false
  },
  dialogStyle: {
    type: Object,
    default: () => ({})
  },
  maskClosable: {
    type: Boolean,
    default: false
  },
  unmountOnClose: {
    type: Boolean,
    default: false
  },
  switchProps: {
    type: Object,
    default: () => ({})
  },
  handleBeforeCancel: {
    type: Function,
    default: null
  },
  confirm: {
    type: Function,
    default: null
  },
  modalClass: {
    type: String,
    default: 'zx-dialog-modal'
  },
  // 自定义 class 支持
  customClass: {
    type: [String, Array, Object],
    default: ''
  },
  // Padding 配置 props
  headerPadding: {
    type: String,
    default: ''
  },
  bodyPadding: {
    type: String,
    default: ''
  },
  footerPadding: {
    type: String,
    default: ''
  },
  // 表单相关增强功能配置
  formRef: { // 传入 el-form 的 ref (可选)
    type: Object,
    default: null
  },
  formModel: { // 传入表单使用的响应式对象 (可选)
    type: Object,
    default: null
  },
  autoResetForm: { // 关闭时自动重置表单（重置为打开时的初始值并清除校验）
    type: Boolean,
    default: true
  },
  preValidate: { // 点击确定前先调用 validate，失败则阻止后续 confirm
    type: Boolean,
    default: true
  },
  autoScrollToError: { // 校验失败时自动滚动到第一个错误项
    type: Boolean,
    default: true
  },
  scrollErrorOffset: { // 滚动时额外的偏移量，避免被标题等遮挡
    type: Number,
    default: 24
  }
})

// 定义事件
const emit = defineEmits([
  'update:modelValue',
  'confirm',
  'confirm-error',
  'cancel',
  'continue',
  'close',
  'open'
])

// 响应式数据
const visible = ref(props.modelValue)
const switchEnable = ref(props.switchProps?.enable || false)
const confirmLoading = ref(false)
const dialogRef = ref(null)

// 唯一类名用于多弹框区分（主要用于调试和选择器隔离）
const uniqueClass = `zx-dialog-instance-${Math.random().toString(36).slice(2, 9)}`

// 表单初始快照
const initialFormSnapshot = ref(null)

const deepClone = (obj) => {
  try {
    return JSON.parse(JSON.stringify(obj))
  } catch (_) {
    return null
  }
}

// 记录表单初始值
const snapshotFormModel = () => {
  if (props.formModel) {
    initialFormSnapshot.value = deepClone(props.formModel)
  }
  // 打开时默认清一次旧的校验提示
  if (props.formRef?.clearValidate) {
    nextTick(() => props.formRef.clearValidate())
  }
}

// 重置表单
const resetForm = () => {
  if (!props.autoResetForm) return
  // 优先使用 element-plus 内置方法
  if (props.formRef?.resetFields) {
    props.formRef.resetFields()
  } else if (props.formModel && initialFormSnapshot.value) {
    // 先删除不在初始快照中的字段
    Object.keys(props.formModel).forEach(k => {
      if (!(k in initialFormSnapshot.value)) delete props.formModel[k]
    })
    // 恢复初始值
    Object.entries(initialFormSnapshot.value).forEach(([k, v]) => {
      props.formModel[k] = v
    })
  }
  // 清除校验
  props.formRef?.clearValidate && props.formRef.clearValidate()
}

// 滚动到第一个错误项
const resolveDialogRootEl = () => {
  const vm = dialogRef.value
  if (!vm) return null

  const candidates = [
    vm.$el,
    vm.dialogContentRef,
    vm.$refs?.dialogContentRef,
    vm.$refs?.contentRef
  ]

  for (const candidate of candidates) {
    if (!candidate) continue
    if (candidate instanceof HTMLElement) return candidate
    if (candidate.$el instanceof HTMLElement) return candidate.$el
  }

  return null
}

const scrollToFirstError = () => {
  if (!props.autoScrollToError) return
  nextTick(() => {
    // el-dialog teleport 到 body，需通过组件实例拿真实 DOM
    const rootEl = resolveDialogRootEl()
    if (!rootEl || typeof rootEl.querySelector !== 'function') return
    const errorItem = rootEl.querySelector('.el-form-item.is-error') || rootEl.querySelector('.el-form-item__error')?.closest('.el-form-item')
    if (!errorItem) return

    // 查找最近可滚动容器（在对话框内部）
    let scrollParent = errorItem.parentElement
    const isScrollable = (el) => {
      if (!el) return false
      const style = window.getComputedStyle(el)
      return /(auto|scroll)/.test(style.overflowY)
    }
    while (scrollParent && scrollParent !== rootEl && !isScrollable(scrollParent)) {
      scrollParent = scrollParent.parentElement
    }
    if (!scrollParent || scrollParent === document.body || !isScrollable(scrollParent)) {
      // 兜底使用 rootEl 内容区域（.el-dialog__body）
      const body = rootEl.querySelector('.el-dialog__body')
      scrollParent = body || rootEl
    }

    const parentRect = scrollParent.getBoundingClientRect()
    const itemRect = errorItem.getBoundingClientRect()
    const offset = props.scrollErrorOffset || 0
    const targetTop = scrollParent.scrollTop + (itemRect.top - parentRect.top) - offset
    scrollParent.scrollTo({ top: targetTop < 0 ? 0 : targetTop, behavior: 'smooth' })
    // 同时高亮可考虑添加类名，这里暂不处理
  })
}

// 计算对话框宽度
const dialogWidth = ref(props.width)

// 计算动态样式，支持 props 覆盖 CSS 变量
const dynamicStyle = computed(() => {
  const style = { ...props.dialogStyle }
  
  if (props.headerPadding) {
    style['--zx-dialog-header-padding'] = props.headerPadding
  }
  
  if (props.bodyPadding) {
    style['--zx-dialog-body-padding'] = props.bodyPadding
  }
  
  if (props.footerPadding) {
    style['--zx-dialog-footer-padding'] = props.footerPadding
  }
  
  return style
})

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
  }
)

// 监听 visible 变化
watch(
  () => visible.value,
  (val) => {
    emit('update:modelValue', val)
  }
)

// 监听开关状态变化
watch(
  () => props.switchProps?.enable,
  (val) => {
    if (val !== undefined) {
      switchEnable.value = val
    }
  },
  { deep: true }
)

// 事件处理函数
const handleContinue = () => {
  emit('continue')
}

const handleOk = async () => {
  if (confirmLoading.value) {
    return
  }
  // 预校验（如果开启并且有 formRef）
  if (props.preValidate && props.formRef?.validate) {
    let valid = true
    try {
      await props.formRef.validate()
    } catch (_) {
      valid = false
    }
    if (!valid) {
      scrollToFirstError()
      return
    }
  }

  if (!props.confirm) {
    emit('confirm')
    visible.value = false
    return
  }

  confirmLoading.value = true
  let confirmResult
  let confirmError
  try {
    confirmResult = await props.confirm(switchEnable.value)
    if (confirmResult !== false) {
      visible.value = false
    }
  } catch (error) {
    confirmError = error
    console.error('[ZxDialog] confirm handler threw error:', error)
  } finally {
    confirmLoading.value = false
    emit('confirm', confirmResult)
    if (confirmError) {
      emit('confirm-error', confirmError)
    }
  }
}

const handleCancel = () => {
  visible.value = false
  emit('cancel')
}

const handleClose = () => {
  visible.value = false
  emit('close')
}

const handleOpen = () => {
  emit('open')
}

const handleBeforeClose = (done) => {
  if (!props.handleBeforeCancel) {
    done()
    return
  }

  let result
  try {
    result = props.handleBeforeCancel()
  } catch (error) {
    console.error('[ZxDialog] handleBeforeCancel error:', error)
    result = false
  }

  if (result instanceof Promise) {
    result
      .then((shouldClose) => {
        if (shouldClose !== false) {
          done()
        }
      })
      .catch((error) => {
        console.error('[ZxDialog] handleBeforeCancel promise rejected:', error)
      })
  } else if (result !== false) {
    done()
  }
}

// 监听 visible 变化，关闭后执行表单重置
let previousVisible = visible.value
watch(
  () => visible.value,
  (val) => {
    if (!val && previousVisible) {
      // 关闭动作完成后延迟执行，等待过渡
      nextTick(() => resetForm())
      confirmLoading.value = false
    }
    if (val) {
      snapshotFormModel()
    }
    previousVisible = val
  }
)

// 在对话框关闭状态下监听外部传入的 formModel 变化，保持初始快照最新
watch(
  () => props.formModel,
  (model) => {
    if (!model) {
      initialFormSnapshot.value = null
      return
    }
    if (!visible.value) {
      initialFormSnapshot.value = deepClone(model)
    }
  },
  { deep: true }
)

// 当 formRef 刚挂载时清理历史校验信息
watch(
  () => props.formRef,
  (instance) => {
    if (instance && visible.value) {
      nextTick(() => instance.clearValidate && instance.clearValidate())
    }
  }
)
</script>

<style lang="scss">
@import './index.scss';
</style>
