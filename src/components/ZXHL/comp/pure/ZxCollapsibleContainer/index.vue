<template>
  <div class="zx-collapsible-container-wrapper" :class="{ 'collapsed': isCollapsed }">
    <!-- 标题栏 -->
    <div class="collapsible-header">
      <h3 v-if="!isCollapsed && title">{{ title }}</h3>
      <div class="header-actions">
        <el-button
          type="text"
          size="small"
          class="collapse-btn"
          :title="isCollapsed ? expandTooltip : collapseTooltip"
          @click="toggleCollapse"
        >
          <el-icon>
            <component :is="isCollapsed ? expandIcon : collapseIcon" />
          </el-icon>
        </el-button>
        <div v-if="showStatus && !isCollapsed" class="status-indicator">
          <slot name="status">
            <div v-if="loading" class="loading-indicator">
              <el-icon class="is-loading">
                <Loading />
              </el-icon>
              <span>{{ loadingText }}</span>
            </div>
            <div v-else-if="completed" class="completed-indicator">
              <el-icon>
                <SuccessFilled />
              </el-icon>
              <span>{{ completedText }}</span>
            </div>
          </slot>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="collapsible-content">
      <div class="content-scrollbar">
        <slot :isCollapsed="isCollapsed" :toggleCollapse="toggleCollapse">
          <div class="default-content">
            <p>请在此处添加内容</p>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Loading, SuccessFilled, DArrowLeft, DArrowRight } from '@element-plus/icons-vue'

// 定义组件名称
defineOptions({
  name: 'ZxCollapsibleContainer'
})

// Props 定义
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  defaultCollapsed: {
    type: Boolean,
    default: true
  },
  expandIcon: {
    type: [String, Object],
    default: () => DArrowLeft
  },
  collapseIcon: {
    type: [String, Object],
    default: () => DArrowRight
  },
  expandTooltip: {
    type: String,
    default: '展开'
  },
  collapseTooltip: {
    type: String,
    default: '收起'
  },
  showStatus: {
    type: Boolean,
    default: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  completed: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: '处理中...'
  },
  completedText: {
    type: String,
    default: '完成'
  },
  autoExpand: {
    type: Boolean,
    default: true
  },
  completedDuration: {
    type: Number,
    default: 3000
  },
  modelValue: {
    type: Boolean,
    default: undefined
  }
})

// Emits 定义
const emit = defineEmits(['update:modelValue', 'toggle', 'expand', 'collapse'])

// 响应式数据
const isCollapsed = ref(props.defaultCollapsed)
const hasTriggeredExpansion = ref(false)
const completedTimer = ref(null)

// 切换收缩状态
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  
  // 发出事件
  emit('update:modelValue', isCollapsed.value)
  emit('toggle', isCollapsed.value)
  
  if (isCollapsed.value) {
    emit('collapse')
    // 如果用户手动收起，重置触发状态
    hasTriggeredExpansion.value = false
  } else {
    emit('expand')
  }
}

// 监听loading状态变化，自动展开
watch(() => props.loading, (newVal, oldVal) => {
  // 当开始加载时，如果还没有触发过展开且启用自动展开，则展开组件
  if (newVal === true && !hasTriggeredExpansion.value && props.autoExpand) {
    hasTriggeredExpansion.value = true
    isCollapsed.value = false
    emit('update:modelValue', false)
    emit('expand')
  }

  // 当加载完成时，显示完成状态
  if (oldVal === true && newVal === false && props.completed) {
    // 清理之前的定时器
    if (completedTimer.value) {
      clearTimeout(completedTimer.value)
    }
    // 设置新的定时器
    completedTimer.value = setTimeout(() => {
      // 这里可以添加完成状态消失的逻辑
    }, props.completedDuration)
  }
})

// 监听 modelValue 变化
watch(() => props.modelValue, (newVal) => {
  if (newVal !== undefined) {
    isCollapsed.value = newVal
  }
})

// 监听 defaultCollapsed 变化
watch(() => props.defaultCollapsed, (newVal) => {
  if (props.modelValue === undefined) {
    isCollapsed.value = newVal
  }
})

// 生命周期
onMounted(() => {
  // 如果有 modelValue，优先使用 modelValue
  if (props.modelValue !== undefined) {
    isCollapsed.value = props.modelValue
  }
})

onBeforeUnmount(() => {
  // 清理定时器
  if (completedTimer.value) {
    clearTimeout(completedTimer.value)
  }
})

// 暴露方法给父组件
defineExpose({
  toggleCollapse,
  expand: () => {
    if (isCollapsed.value) {
      toggleCollapse()
    }
  },
  collapse: () => {
    if (!isCollapsed.value) {
      toggleCollapse()
    }
  },
  isCollapsed: () => isCollapsed.value
})
</script>

<style lang="scss">
@import './index.scss';
</style>