<template>
  <!-- Element Plus 图标 -->
  <el-icon 
    v-if="type === 'element'"
    :class="iconClasses" 
    :size="size" 
    :color="currentColor"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <component :is="iconComponent" />
  </el-icon>
  
  <!-- iconfont 图标 -->
  <i 
    v-else-if="type === 'iconfont'"
    :class="iconfontClasses"
    :style="iconfontStyles"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  ></i>
</template>

<script setup>
import { computed, ref } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import './index.scss'

// 组件名称
defineOptions({
  name: 'ZxIcon'
})

// Props 定义
const props = defineProps({
  // 图标类型：element | iconfont
  type: {
    type: String,
    default: 'element',
    validator: (value) => ['element', 'iconfont'].includes(value)
  },
  // 图标名称
  icon: {
    type: String,
    required: true
  },
  // 图标颜色
  color: {
    type: String,
    default: ''
  },
  // 图标大小
  size: {
    type: [Number, String],
    default: 16
  },
  // 悬停颜色
  hoverColor: {
    type: String,
    default: ''
  },
  // 自定义类名
  className: {
    type: String,
    default: ''
  }
})

const isHover = ref(false)

// 计算属性
const iconComponent = computed(() => {
  return ElementPlusIconsVue[props.icon] || null
})

const iconClasses = computed(() => {
  const classes = ['zx-icon']
  
  if (props.className) {
    classes.push(props.className)
  }
  
  return classes.join(' ')
})

const iconfontClasses = computed(() => {
  const classes = ['iconfont', 'zx-icon']
  
  // 添加图标类名
  if (props.icon) {
    // 如果图标名称不以 icon- 开头，则添加前缀
    const iconClass = props.icon.startsWith('icon-') ? props.icon : `icon-${props.icon}`
    classes.push(iconClass)
  }
  
  if (props.className) {
    classes.push(props.className)
  }
  
  return classes.join(' ')
})

const iconfontStyles = computed(() => {
  const styles = {}
  
  // 设置字体大小
  if (props.size) {
    styles.fontSize = typeof props.size === 'number' ? `${props.size}px` : props.size
  }
  
  // 设置颜色
  const color = isHover.value && props.hoverColor ? props.hoverColor : props.color
  if (color) {
    styles.color = color
  }
  
  return styles
})

const currentColor = computed(() => {
  return isHover.value && props.hoverColor ? props.hoverColor : props.color
})

// 事件处理
const handleMouseEnter = () => {
  if (props.hoverColor) {
    isHover.value = true
  }
}

const handleMouseLeave = () => {
  isHover.value = false
}
</script>