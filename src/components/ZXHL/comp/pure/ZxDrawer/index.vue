<template>
  <el-drawer
    v-model="visible"
    :size="fullScreen?.isFullScreen ? '100%' : drawerWidth"
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
      <div class="flex items-center justify-between w-full">
        <slot name="title">
          <div class="flex flex-1 items-center justify-between overflow-hidden">
            <div class="flex flex-1 items-center overflow-hidden">
              <span :id="titleId" :class="titleClass" class="truncate max-w-[300px]">
                {{ title }}
              </span>
              <slot name="headerLeft"></slot>
              <el-tag v-if="titleTag" :color="titleTagColor" class="ml-2 mr-auto">
                {{ titleTag }}
              </el-tag>
            </div>
            <slot name="tbutton"></slot>
          </div>
        </slot>
        <div class="zx-drawer-right-operation">
          <el-button
            v-if="showFullScreen"
            type="default"
            class="zx-drawer-fullscreen-btn"
            @click="fullScreen?.toggleFullScreen"
          >
            <ZxIcon :name="fullScreen?.isFullScreen ? 'fullscreen-exit' : 'fullscreen'" />
            {{ fullScreen?.isFullScreen ? '退出全屏' : '全屏' }}
          </el-button>
        </div>
      </div>
    </template>

    <!-- 拖拽手柄 -->
    <div
      v-if="!disabledWidthDrag && typeof drawerWidth === 'number' && !fullScreen?.isFullScreen"
      class="zx-drawer-handle"
      @mousedown="startResize"
    >
      <div class="zx-drawer-handle-dots">
        <div class="dot" v-for="i in 10" :key="i"></div>
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
        <div class="flex items-center justify-between">
          <slot name="footerLeft"></slot>
          <div class="ml-auto flex gap-3">
            <el-button :disabled="okLoading" @click="handleCancel">
              {{ cancelText || '取消' }}
            </el-button>
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
  </el-drawer>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import ZxIcon from '@/components/ZXHL/comp/pure/ZxIcon'

// 全屏功能 Hook
function useFullScreen(element) {
  const isFullScreen = ref(false)

  const toggleFullScreen = () => {
    isFullScreen.value = !isFullScreen.value
  }

  const exitFullscreen = () => {
    isFullScreen.value = false
  }

  return {
    get isFullScreen() {
      return isFullScreen.value
    },
    toggleFullScreen,
    exitFullscreen
  }
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
    default: false
  },
  maskClosable: {
    type: Boolean,
    default: true
  },
  unmountOnClose: {
    type: Boolean,
    default: false
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
  'cancel',
  'continue',
  'close',
  'open'
])

// 响应式数据
const visible = ref(props.modelValue)
const fullScreen = ref()
const resizing = ref(false)
const drawerWidth = ref(props.width)

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
    if (val) {
      nextTick(() => {
      const drawerElement = document.querySelector('.zx-drawer .el-drawer')
      fullScreen.value = useFullScreen(drawerElement)
    })
    }
  }
)

// 事件处理函数
const handleContinue = () => {
  emit('continue')
}

const handleOk = () => {
  emit('confirm')
}

const handleCancel = () => {
  fullScreen.value?.exitFullscreen()
  visible.value = false
  emit('cancel')
}

const handleClose = () => {
  fullScreen.value?.exitFullscreen()
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
