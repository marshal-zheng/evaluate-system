<template>
  <el-dialog
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
            <el-button v-if="showCancel" :disabled="okLoading" @click="handleCancel">
              {{ cancelText || '取消' }}
            </el-button>
            <!-- 自定义按钮插槽 -->
            <slot name="self-button"></slot>
            <el-button
              v-if="showContinue"
              type="default"
              :loading="okLoading"
              :disabled="okDisabled"
              @click="handleContinue"
            >
              {{ saveContinueText || '保存并继续' }}
            </el-button>
            <el-button
              type="primary"
              :disabled="okDisabled"
              :loading="okLoading"
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
  }
})

// 定义事件
const emit = defineEmits([
  'update:modelValue',
  'confirm',
  'cancel',
  'continue',
  'close',
  'open'
])

// 响应式数据
const visible = ref(props.modelValue)
const switchEnable = ref(props.switchProps?.enable || false)
const confirmLoading = ref(false)

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
  if (props.confirm) {
    confirmLoading.value = true
    try {
      await props.confirm(switchEnable.value)
      confirmLoading.value = false
    } catch (error) {
      console.log(error)
      confirmLoading.value = false
    }
  }
  emit('confirm')
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
  if (props.handleBeforeCancel) {
    const result = props.handleBeforeCancel()
    if (result) {
      done()
    }
  } else {
    done()
  }
}
</script>

<style lang="scss">
@import './index.scss';
</style>
