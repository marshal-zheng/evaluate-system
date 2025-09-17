<template>
  <ZxTooltipOrPopover
    v-if="tooltip || popoverTitle"
    :content="tooltip"
    :title="popoverTitle"
    :trigger="tooltipTrigger"
    :placement="tooltipPlacement"
    :disabled="disabled || (!tooltip && !popoverTitle)"
  >
    <!-- SVG 图标 (通过 svg-icon: 前缀识别) -->
    <el-icon 
      v-if="isLocalSvg"
      :class="iconClasses" 
      :size="size" 
      :color="currentColor"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @click="handleClick"
    >
      <svg aria-hidden="true">
        <use :xlink:href="symbolId" />
      </svg>
    </el-icon>
    
    <!-- Element Plus 图标 -->
    <el-icon 
      v-else-if="type === 'element'"
      :class="iconClasses" 
      :size="size" 
      :color="currentColor"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @click="handleClick"
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
      @click="handleClick"
    ></i>
    
    <!-- Popover 内容插槽 -->
    <template v-if="popoverTitle && $slots.popoverContent" #content>
      <slot name="popoverContent"></slot>
    </template>
  </ZxTooltipOrPopover>
  
  <!-- 无 tooltip/popover 时的普通图标 -->
  <template v-else>
    <!-- SVG 图标 (通过 svg-icon: 前缀识别) -->
    <el-icon 
      v-if="isLocalSvg"
      :class="iconClasses" 
      :size="size" 
      :color="currentColor"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @click="handleClick"
    >
      <svg aria-hidden="true">
        <use :xlink:href="symbolId" />
      </svg>
    </el-icon>
    
    <!-- Element Plus 图标 -->
    <el-icon 
      v-else-if="type === 'element'"
      :class="iconClasses" 
      :size="size" 
      :color="currentColor"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @click="handleClick"
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
      @click="handleClick"
    ></i>
  </template>
</template>

<script setup>
import { computed, ref } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import ZxTooltipOrPopover from '../ZxTooltipOrPopover/index.vue'
import './index.scss'

// 组件名称
defineOptions({
  name: 'ZxIcon'
})

// Props 定义
const props = defineProps({
  // 图标类型：element | iconfont (svg 通过 icon 前缀 svg-icon: 自动识别)
  type: {
    type: String,
    default: 'element',
    validator: (value) => ['element', 'iconfont'].includes(value)
  },
  // 图标名称 (SVG 图标使用 svg-icon:图标名 格式)
  icon: {
    type: String,
    required: true
  },
  // 图标颜色 (不设置默认值，跟随系统主题)
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
  },
  // Tooltip 文本
  tooltip: {
    type: String,
    default: ''
  },
  // Popover 标题 (有标题时显示为 popover，否则为 tooltip)
  popoverTitle: {
    type: String,
    default: ''
  },
  // Tooltip/Popover 触发方式
  tooltipTrigger: {
    type: String,
    default: 'hover',
    validator: (value) => ['hover', 'click', 'focus', 'manual'].includes(value)
  },
  // Tooltip/Popover 位置
  tooltipPlacement: {
    type: String,
    default: 'top'
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  }
})

// 事件定义
const emit = defineEmits(['click'])

const isHover = ref(false)

// 计算属性
// 判断是否为本地 SVG 图标
const isLocalSvg = computed(() => props.icon.startsWith('svg-icon:'))

// SVG 图标的 symbol ID
const symbolId = computed(() => {
  return isLocalSvg.value ? `#icon-${props.icon.split('svg-icon:')[1]}` : ''
})

const iconComponent = computed(() => {
  return ElementPlusIconsVue[props.icon] || null
})

const iconClasses = computed(() => {
  const classes = ['zx-icon']
  
  if (props.disabled) {
    classes.push('is-disabled')
  }
  
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
  
  if (props.disabled) {
    classes.push('is-disabled')
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
  if (props.hoverColor && !props.disabled) {
    isHover.value = true
  }
}

const handleMouseLeave = () => {
  if (!props.disabled) {
    isHover.value = false
  }
}

const handleClick = (event) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>