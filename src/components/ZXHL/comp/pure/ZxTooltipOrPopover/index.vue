<template>
  <component 
    :is="Component" 
    v-bind="finalProps" 
    :popper-class="popperClass"
    :content-class="contentClass"
  >
    <template v-if="isPopover" #reference>
      <slot></slot>
    </template>
    <template v-if="$slots.content">
        <slot name="content"></slot>
      </template>
    <slot v-if="!isPopover"></slot>
  </component>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { ElPopover, ElTooltip } from 'element-plus'

// 组件名称
defineOptions({
  name: 'ZxTooltipOrPopover'
})

// Props 定义
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  },
  trigger: {
    type: String,
    default: 'hover'
  },
  placement: {
    type: String,
    default: 'top'
  }
})



const attrs = useAttrs()

// 计算属性
const isPopover = computed(() => Boolean(props.title))
const Component = computed(() => (isPopover.value ? ElPopover : ElTooltip))

// CSS 类名计算
const popperClass = computed(() => {
  const baseClass = 'zx-tooltip-or-popover'
  const typeClass = isPopover.value ? 'zx-popover' : 'zx-tooltip'
  const customClass = attrs.popperClass || ''
  return [baseClass, typeClass, customClass].filter(Boolean).join(' ')
})

const contentClass = computed(() => {
  const baseClass = 'zx-tooltip-or-popover-content'
  const customClass = attrs.contentClass || ''
  return [baseClass, customClass].filter(Boolean).join(' ')
})

// 合并最终的 props (移除 effect 默认值，让组件跟随系统主题)
const finalProps = computed(() => {
  const { popperClass: _, contentClass: __, ...restAttrs } = attrs
  return {
    trigger: props.trigger,
    placement: props.placement,
    content: props.content,
    title: props.title,
    ...restAttrs
  }
})
</script>

<style lang="scss">
@import './index.scss';
</style>