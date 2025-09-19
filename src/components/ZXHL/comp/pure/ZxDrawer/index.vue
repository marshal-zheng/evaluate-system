<template>
  <el-drawer
    ref="drawerRef"
    v-model="visible"
    :size="computedDrawerSize"
    :direction="direction"
    :show-close="closable"
    :modal="mask"
    :close-on-click-modal="maskClosable"
    :close-on-press-escape="true"
    :destroy-on-close="unmountOnClose"
    :class="[
      'zx-drawer',
      !mask ? 'zx-drawer-no-mask' : '',
      noContentPadding ? 'zx-drawer-no-content-padding' : '',
      noTitle ? 'zx-drawer-no-title' : '',
    ]"
    :style="drawerStyle"
    :before-close="handleBeforeClose"
    @open="handleOpen"
    @close="handleClose"
  >
    <!-- 自定义标题栏 -->
    <template #header="{ close, titleId, titleClass }">
      <div class="zx-drawer-header-container">
        <slot name="title">
          <div class="zx-drawer-title-container">
            <div class="zx-drawer-title-content">
              <span :id="titleId" :class="titleClass" class="zx-drawer-title-text">
                {{ title }}
              </span>
              <slot name="headerLeft"></slot>
              <el-tag v-if="titleTag" :color="titleTagColor" class="zx-drawer-title-tag">
                {{ titleTag }}
              </el-tag>
            </div>
            <slot name="tbutton"></slot>
          </div>
        </slot>
        <div class="zx-drawer-right-operation">
          <slot name="headerRight"></slot>
          <ZxButton
            v-if="showFullScreen"
            type="text"
            size="small"
            class="zx-drawer-fullscreen-btn"
            @click="handleFullScreenToggle"
          >
            <ZxIcon :icon="fullScreenAPI.isFullScreen ? 'ScaleToOriginal' : 'FullScreen'" />
            {{ fullScreenAPI.isFullScreen ? '退出全屏' : '全屏' }}
          </ZxButton>
        </div>
      </div>
    </template>

    <!-- 拖拽手柄 -->
    <div
      v-if="!disabledWidthDrag && typeof drawerWidth === 'number' && !fullScreenAPI.isFullScreen"
      :class="['zx-drawer-handle', { 'zx-drawer-handle-with-border': showHandleBorder }]"
      @mousedown="startResize"
    >
      <div class="zx-drawer-handle-dots">
          <div class="zx-dot" v-for="i in 10" :key="i"></div>
        </div>
    </div>

    <!-- 抽屉内容 -->
    <div class="zx-drawer-body">
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
        <div class="zx-drawer-footer-container">
          <slot name="footerLeft"></slot>
          <div class="zx-drawer-footer-actions">
            <ZxButton
              :disabled="okLoading || confirmLoading"
              @click="handleCancel"
            >
              {{ cancelText || '取消' }}
            </ZxButton>
            <ZxButton
              v-if="showContinue"
              type="default"
              :loading="okLoading || confirmLoading"
              :disabled="okDisabled || confirmLoading"
              @click="handleContinue"
            >
              {{ saveContinueText || '保存并继续' }}
            </ZxButton>
            <ZxButton
              type="primary"
              :disabled="okDisabled || confirmLoading"
              :loading="okLoading || confirmLoading"
              @click="handleOk"
            >
              {{ okText || '确定' }}
            </ZxButton>
          </div>
        </div>
      </slot>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import ZxIcon from '@/components/ZXHL/comp/pure/ZxIcon'
import ZxButton from '@/components/ZXHL/comp/pure/ZxButton'

// 全屏功能状态管理
const isFullScreen = ref(false)

const toggleFullScreen = () => {
  isFullScreen.value = !isFullScreen.value
}

const exitFullscreen = () => {
  isFullScreen.value = false
}

// 全屏功能对象
const fullScreenAPI = {
  get isFullScreen() {
    return isFullScreen.value
  },
  toggleFullScreen,
  exitFullscreen
}

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
    default: 480
  },
  direction: {
    type: String,
    default: 'rtl',
    validator: (value) => ['ltr', 'rtl', 'ttb', 'btt'].includes(value)
  },
  noContentPadding: {
    type: Boolean,
    default: false
  },
  disabledWidthDrag: {
    type: Boolean,
    default: false
  },
  showHandleBorder: {
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
  drawerStyle: {
    type: Object,
    default: () => ({})
  },
  showFullScreen: {
    type: Boolean,
    default: true
  },
  maskClosable: {
    type: Boolean,
    default: true
  },
  unmountOnClose: {
    type: Boolean,
    default: false
  },
  confirm: {
    type: Function,
    default: null
  },
  autoConfirmLoading: {
    type: Boolean,
    default: true
  },
  // 表单增强配置
  formRef: {
    type: Object,
    default: null
  },
  formModel: {
    type: Object,
    default: null
  },
  autoResetForm: {
    type: Boolean,
    default: true
  },
  preValidate: {
    type: Boolean,
    default: true
  },
  autoScrollToError: {
    type: Boolean,
    default: true
  },
  scrollErrorOffset: {
    type: Number,
    default: 24
  },
  handleBeforeCancel: {
    type: Function,
    default: null
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
const drawerRef = ref(null)
const resizing = ref(false)
const drawerWidth = ref(props.width)
const isToggling = ref(false) // 防止快速切换时的状态混乱
const confirmLoading = ref(false)

// 表单快照
const initialFormSnapshot = ref(null)

const deepClone = (obj) => {
  try {
    return JSON.parse(JSON.stringify(obj))
  } catch (_) {
    return null
  }
}

const snapshotFormModel = () => {
  if (props.formModel) {
    initialFormSnapshot.value = deepClone(props.formModel)
  }
  if (props.formRef?.clearValidate) {
    nextTick(() => props.formRef.clearValidate())
  }
}

const resetForm = () => {
  if (!props.autoResetForm) return
  if (props.formRef?.resetFields) {
    props.formRef.resetFields()
  } else if (props.formModel && initialFormSnapshot.value) {
    Object.keys(props.formModel).forEach((key) => {
      if (!(key in initialFormSnapshot.value)) {
        delete props.formModel[key]
      }
    })
    Object.entries(initialFormSnapshot.value).forEach(([key, value]) => {
      props.formModel[key] = value
    })
  }
  props.formRef?.clearValidate && props.formRef.clearValidate()
}

const resolveDrawerRootEl = () => {
  const instance = drawerRef.value
  if (!instance) return null

  const candidates = [
    instance.$el,
    instance.drawerRef,
    instance.$refs?.drawerRef,
    instance.$refs?.contentRef
  ]

  for (const candidate of candidates) {
    if (!candidate) continue
    if (candidate instanceof HTMLElement) return candidate
    if (candidate.$el instanceof HTMLElement) return candidate.$el
  }
  return null
}

const scrollToFirstError = () => {
  if (!props.autoScrollToError || typeof window === 'undefined') return
  nextTick(() => {
    const rootEl = resolveDrawerRootEl()
    if (!rootEl || typeof rootEl.querySelector !== 'function') return

    const errorItem = rootEl.querySelector('.el-form-item.is-error') || rootEl.querySelector('.el-form-item__error')?.closest('.el-form-item')
    if (!errorItem) return

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
      const body = rootEl.querySelector('.el-drawer__body')
      scrollParent = body || rootEl
    }

    const parentRect = scrollParent.getBoundingClientRect()
    const itemRect = errorItem.getBoundingClientRect()
    const offset = props.scrollErrorOffset || 0
    const targetTop = scrollParent.scrollTop + (itemRect.top - parentRect.top) - offset
    scrollParent.scrollTo({ top: targetTop < 0 ? 0 : targetTop, behavior: 'smooth' })
  })
}

// 计算抽屉尺寸，确保稳定性
// 兼容数字与数字字符串（如 '600' => '600px'），避免 size 设置不生效导致只有遮罩没有抽屉内容
const computedDrawerSize = computed(() => {
  const toCssSize = (val) => {
    if (val == null) return undefined
    // number 直接返回（Element Plus 会按 px 解析）
    if (typeof val === 'number') return val
    // '100%' 等百分比字符串直接返回
    if (typeof val === 'string' && val.trim().endsWith('%')) return val
    // 纯数字字符串转为 px
    if (typeof val === 'string' && /^\d+$/.test(val.trim())) return `${val.trim()}px`
    // 其他情况（已带单位）原样返回
    return val
  }

  if (isToggling.value) {
    // 切换过程中保持当前状态
    return fullScreenAPI.isFullScreen ? '100%' : toCssSize(drawerWidth.value)
  }
  return fullScreenAPI.isFullScreen ? '100%' : toCssSize(drawerWidth.value)
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
  (val, oldVal) => {
    emit('update:modelValue', val)
    if (val) {
      snapshotFormModel()
    }
    if (!val && oldVal) {
      nextTick(() => resetForm())
      confirmLoading.value = false
    }
  }
)

// 事件处理函数
const handleContinue = () => {
  emit('continue')
}

const handleOk = async () => {
  if (confirmLoading.value) {
    return
  }

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

  const setLoading = (state = true) => {
    confirmLoading.value = !!state
  }

  let shouldAutoClose = true
  const close = () => {
    shouldAutoClose = false
    visible.value = false
  }

  const context = {
    close,
    setLoading,
    get isFullScreen() {
      return fullScreenAPI.isFullScreen
    }
  }

  if (props.autoConfirmLoading) {
    setLoading(true)
  }

  let confirmResult
  let confirmError

  try {
    confirmResult = await props.confirm(context)
    if (confirmResult === false) {
      shouldAutoClose = false
    }
    if (shouldAutoClose && confirmResult !== false) {
      visible.value = false
    }
  } catch (error) {
    confirmError = error
    console.error('[ZxDrawer] confirm handler threw error:', error)
  } finally {
    if (props.autoConfirmLoading) {
      setLoading(false)
    }
    emit('confirm', confirmResult)
    if (confirmError) {
      emit('confirm-error', confirmError)
    }
  }
}

const handleCancel = () => {
  fullScreenAPI.exitFullscreen()
  visible.value = false
  emit('cancel')
}

const handleClose = () => {
  // 退出全屏模式并关闭抽屉
  fullScreenAPI.exitFullscreen()
  visible.value = false
  emit('close')
}

const handleOpen = () => {
  emit('open')
}

const handleFullScreenToggle = async (event) => {
  // 阻止事件冒泡，防止触发其他点击事件
  event.preventDefault()
  event.stopPropagation()
  
  // 防止快速连续点击
  if (isToggling.value) {
    return
  }
  
  isToggling.value = true
  
  try {
    // 切换全屏状态
    fullScreenAPI.toggleFullScreen()
    
    // 使用 nextTick 确保DOM更新完成
    await nextTick()
    
    // 添加小延迟确保Element Plus内部状态稳定
    setTimeout(() => {
      isToggling.value = false
    }, 100)
  } catch (error) {
    console.error('全屏切换出错:', error)
    isToggling.value = false
  }
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
    console.error('[ZxDrawer] handleBeforeCancel error:', error)
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
        console.error('[ZxDrawer] handleBeforeCancel promise rejected:', error)
      })
  } else if (result !== false) {
    done()
  }
}

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

watch(
  () => props.formRef,
  (instance) => {
    if (instance && visible.value) {
      nextTick(() => instance.clearValidate && instance.clearValidate())
    }
  }
)

// 拖拽调整宽度功能
const startResize = (event) => {
  if (typeof drawerWidth.value === 'number') {
    event.preventDefault()
    event.stopPropagation()
    
    resizing.value = true
    const startX = event.clientX
    const initialWidth = drawerWidth.value
    let animationId = null
    let pendingWidth = null

    // 禁用文本选择
    document.body.style.userSelect = 'none'
    document.body.style.webkitUserSelect = 'none'
    document.body.style.mozUserSelect = 'none'
    document.body.style.msUserSelect = 'none'
    document.body.style.cursor = 'col-resize'

    // 使用 requestAnimationFrame 优化性能
    const updateWidth = () => {
      if (pendingWidth !== null && resizing.value) {
        drawerWidth.value = pendingWidth
        pendingWidth = null
      }
      animationId = null
    }

    const handleMouseMove = (moveEvent) => {
      if (resizing.value) {
        moveEvent.preventDefault()
        const newWidth = initialWidth + (startX - moveEvent.clientX)
        const minWidth = typeof props.width === 'number' ? props.width : 480
        const maxWidth = window.innerWidth * 0.9

        if (newWidth >= minWidth && newWidth <= maxWidth) {
          pendingWidth = newWidth
          
          // 使用 requestAnimationFrame 节流更新
          if (animationId === null) {
            animationId = requestAnimationFrame(updateWidth)
          }
        }
      }
    }

    const handleMouseUp = () => {
      if (resizing.value) {
        resizing.value = false
        
        // 取消待处理的动画帧
        if (animationId !== null) {
          cancelAnimationFrame(animationId)
          animationId = null
        }
        
        // 执行最后一次更新
        if (pendingWidth !== null) {
          drawerWidth.value = pendingWidth
          pendingWidth = null
        }
        
        // 恢复文本选择和光标
        document.body.style.userSelect = ''
        document.body.style.webkitUserSelect = ''
        document.body.style.mozUserSelect = ''
        document.body.style.msUserSelect = ''
        document.body.style.cursor = ''
        
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: false })
    window.addEventListener('mouseup', handleMouseUp)
  }
}
</script>

<style lang="scss">
@import './index.scss';
</style>
