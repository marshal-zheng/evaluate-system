<template>
  <component :is="Component" v-bind="finalProps" :content-class="''">
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

// 合并最终的 props
const finalProps = computed(() => ({
  trigger: props.trigger,
  placement: props.placement,
  content: props.content,
  title: props.title,
  ...attrs
}))
</script>