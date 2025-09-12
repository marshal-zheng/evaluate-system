<template>
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
</template>
  
<script>
import { defineComponent, ref, watch, onUnmounted, toRefs } from 'vue'
import { ElButton } from 'element-plus'
import { debounce, throttle, omit, isEmpty } from 'lodash-es'
import TooltipOrPopover from '../ZxTooltipOrPopover/index.vue'

export default defineComponent({
  name: 'TooltipButton',
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