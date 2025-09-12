<template>
  <ZxTooltipOrPopover
    v-bind="tooltipProps"
    :class="['zx-auto-complete', { 'zx-auto-complete--with-tooltip': hasTooltip }]"
  >
    <el-autocomplete
      v-model="inputValue"
      v-bind="$attrs"
      :fetch-suggestions="handleFetchSuggestions"
      :clearable="allowClear"
      :loading="loading"
      @focus="handleFocus"
      @blur="handleBlur"
      @select="handleSelect"
      @change="handleChange"
    >
      <template v-for="(_, name) in $slots" #[name]="slotData">
        <slot :name="name" v-bind="slotData" />
      </template>
    </el-autocomplete>
  </ZxTooltipOrPopover>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElAutocomplete } from 'element-plus'
import ZxTooltipOrPopover from '../ZxTooltipOrPopover/index.vue'

// 组件名称
defineOptions({
  name: 'ZxAutoComplete',
  inheritAttrs: false
})

// Props 定义
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  options: {
    type: [Array, Function],
    default: () => []
  },
  labelKey: {
    type: String,
    default: 'label'
  },
  valueKey: {
    type: String,
    default: 'value'
  },
  tooltip: {
    type: Object,
    default: () => ({})
  },
  allowClear: {
    type: Boolean,
    default: true
  },
  filterOption: {
    type: Function,
    default: null
  }
})

// Emits 定义
const emit = defineEmits([
  'update:modelValue',
  'select',
  'change',
  'focus',
  'blur'
])

// 响应式数据
const inputValue = ref(props.modelValue)
const loading = ref(false)
const internalOptions = ref([])
const openTooltip = ref(false)

// 计算属性
const hasTooltip = computed(() => {
  return Boolean(props.tooltip.title || props.tooltip.content)
})

const tooltipProps = computed(() => {
  return {
    placement: 'right',
    ...props.tooltip,
    open: openTooltip.value
  }
})

const selectOptions = computed(() => {
  return internalOptions.value.map(option => {
    if (option.options) {
      return {
        label: option[props.labelKey],
        options: option.options.map(subOption => ({
          label: subOption[props.labelKey],
          value: subOption[props.valueKey]
        }))
      }
    }
    return {
      label: option[props.labelKey],
      value: option[props.valueKey],
      ...option
    }
  })
})

// 默认过滤函数
const defaultFilterOption = (queryString, item) => {
  return item.label.toLowerCase().includes(queryString.toLowerCase())
}

// 方法
const loadOptions = async (params) => {
  loading.value = true
  try {
    let data
    if (typeof props.options === 'function') {
      data = await props.options(params)
    } else {
      data = props.options
    }
    internalOptions.value = data || []
  } catch (error) {
    console.error('Failed to load options:', error)
    internalOptions.value = []
  } finally {
    loading.value = false
  }
}

const handleFetchSuggestions = (queryString, callback) => {
  const filterFn = props.filterOption || defaultFilterOption
  const filteredOptions = selectOptions.value.filter(item => {
    return queryString ? filterFn(queryString, item) : true
  })
  callback(filteredOptions)
}

const handleFocus = (event) => {
  if (hasTooltip.value) {
    openTooltip.value = true
  }
  emit('focus', event)
}

const handleBlur = (event) => {
  if (hasTooltip.value) {
    openTooltip.value = false
  }
  emit('blur', event)
}

const handleSelect = (item) => {
  emit('select', item)
}

const handleChange = (value) => {
  emit('update:modelValue', value)
  emit('change', value)
}

// 监听器
watch(
  () => props.modelValue,
  (newValue) => {
    inputValue.value = newValue
  }
)

watch(
  () => inputValue.value,
  (newValue) => {
    emit('update:modelValue', newValue)
  }
)

// 生命周期
onMounted(() => {
  loadOptions()
})
</script>

<style lang="scss">
@import './index.scss';
</style>