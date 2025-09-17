<template>
  <div class="zx-button-wrapper">
    <TooltipOrPopover v-if="!isEmpty(tooltip)" v-bind="tooltip">
      <el-button
        v-bind="buttonAttrs"
        :loading="enableLoading && loading"
        @click="handleClick"
      >
        <slot />
      </el-button>
      <template v-slot:content>
        <slot name="tooltip-content" />
      </template>
    </TooltipOrPopover>
    <el-button
      v-else
      v-bind="buttonAttrs"
      :loading="enableLoading && loading"
      @click="handleClick"
    >
      <slot />
    </el-button>
  </div>
</template>
  
<script>
import { defineComponent, ref, watch, onUnmounted, toRefs } from 'vue'
import { ElButton } from 'element-plus'
import { debounce, throttle, omit, isEmpty } from 'lodash-es'
import TooltipOrPopover from '../ZxTooltipOrPopover/index.vue'

export default defineComponent({
  name: 'ZxButton',
  // ZxButton 基于 Element Plus 的 el-button，默认跟随系统主题
  // 支持通过 CSS 变量自定义样式：
  // --zx-button-border-radius: 自定义圆角
  // --zx-button-font-weight: 自定义字重  
  // --zx-button-transition: 自定义过渡动画
  // --zx-button-box-shadow: 自定义悬停阴影效果
  components: {
    ElButton,
    TooltipOrPopover,
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    tooltip: {
      type: Object,
      default: () => ({}),
    },
    debounce: {
      type: Number,
      default: 300,
    },
    throttle: {
      type: Number,
      default: 300,
    },
    enableLoading: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, { emit, attrs }) {
    const { debounce: debounceDuration, throttle: throttleDuration, enableLoading } = toRefs(props)
    const loading = ref(props.modelValue)

    const executeClick = async () => {
      loading.value = true
      emit('update:modelValue', true)
      emit('startLoading')
      try {
        if (typeof attrs.onClick === 'function') {
          await attrs.onClick()
        }
        emit('success')
      } catch (error) {
        console.error('Error during button click:', error)
        emit('error', error)
      } finally {
        loading.value = false
        emit('update:modelValue', false)
        emit('endLoading')
      }
    }

    let debouncedClick = debounce(executeClick, debounceDuration.value)
    let throttledClick = throttle(debouncedClick, throttleDuration.value)

    watch([debounceDuration, throttleDuration], () => {
      debouncedClick = debounce(executeClick, debounceDuration.value)
      throttledClick = throttle(debouncedClick, throttleDuration.value)
    }, { immediate: true })

    watch(() => props.modelValue, (newValue) => {
      loading.value = newValue
    })

    onUnmounted(() => {
      debouncedClick.cancel()
      throttledClick.cancel()
    })

    const buttonAttrs = {
      ...omit(attrs, ['onClick']),
      type: attrs.type || 'primary'
    }

    return {
      loading,
      handleClick: throttledClick,
      buttonAttrs,
      isEmpty
    }
  },
})
</script>

<style lang="scss">
@import './index.scss';
</style>