<template>
  <div class="zx-form-create-basic">
    <el-form
      ref="formRef"
      :model="formModel"
      :label-width="labelWidth"
      :inline="inline"
      :size="size"
      :disabled="disabled"
      class="zx-form-create-basic__form"
    >
      <template v-for="(rule, idx) in normalizedRules" :key="rule.field || idx">
        <el-form-item
          :label="rule.title || ''"
          :prop="rule.field"
          :rules="rule.validate || []"
          class="zx-form-create-basic__item"
        >
          <component
            :is="resolveComponent(rule)"
            v-model="formModel[rule.field]"
            v-bind="rule.props || {}"
            :options="rule.options"
            @change="val => handleFieldChange(rule.field, val)"
          />
        </el-form-item>
      </template>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'

// 子组件
import PassWord from '../PassWord/index.vue'
import SearchSelect from '../SearchSelect/index.vue'

const props = defineProps({
  option: { type: Object, default: () => ({}) },
  isInFor: { type: Boolean, default: false }
})

const emit = defineEmits(['mounted', 'reload', 'change'])

// 支持 v-model:api 和 v-model:rule
const api = defineModel('api', { default: null })
const rule = defineModel('rule', { default: () => [] })

const formRef = ref(null)
const formModel = reactive({})

// 标准化规则
const normalizedRules = computed(() => {
  return (rule.value || []).map(item => ({
    type: (item.type || 'input').toLowerCase(),
    field: item.field || '',
    title: item.title || '',
    value: item.value || '',
    options: item.options || [],
    validate: item.validate || [],
    props: {
      placeholder: item.props?.placeholder || '请输入',
      ...item.props
    }
  })).filter(i => i.field)
})

// 解析组件类型
function resolveComponent(rule) {
  const t = rule.type
  if (t === 'password') return PassWord
  if (t === 'searchselect') return SearchSelect
  if (t === 'number') return 'el-input-number'
  if (t === 'textarea') return 'el-input'
  if (t === 'select') return 'el-select'
  if (t === 'radio') return 'el-radio-group'
  if (t === 'checkbox') return 'el-checkbox-group'
  if (t === 'date') return 'el-date-picker'
  if (t === 'datetime') return 'el-date-picker'
  return 'el-input'
}

// 字段变化处理
function handleFieldChange(field, value) {
  formModel[field] = value
  if (formRef.value) {
    formRef.value.validateField(field)
  }
  emit('change', field)
}

// 初始化表单模型
function initFormModel() {
  normalizedRules.value.forEach(rule => {
    if (!(rule.field in formModel)) {
      formModel[rule.field] = rule.value
    }
  })
}

// 暴露 API 方法
const apiMethods = {
  validateField: (field) => formRef.value?.validateField(field),
  validate: () => formRef.value?.validate(),
  resetFields: () => formRef.value?.resetFields(),
  clearValidate: () => formRef.value?.clearValidate(),
  refresh: () => initFormModel(),
  formData: () => ({ ...formModel }),
  getValue: (field) => formModel[field],
  setValue: (data) => Object.assign(formModel, data)
}

// 监听规则变化
watch(() => rule.value, () => {
  initFormModel()
  if (api.value) {
    api.value.refresh?.()
  }
}, { deep: true, immediate: true })

// 设置 API
watch(() => api.value, (newApi) => {
  if (newApi) {
    Object.assign(newApi, apiMethods)
  }
}, { immediate: true })

// 组件挂载后触发事件
onMounted(() => {
  api.value = apiMethods
  emit('mounted')
})

watch(() => rule.value, () => {
  emit('reload')
}, { deep: true })

// 默认配置
const labelWidth = computed(() => props.option?.form?.labelWidth || '120px')
const inline = computed(() => props.option?.form?.inline || false)
const size = computed(() => props.option?.form?.size || 'default')
const disabled = computed(() => props.option?.form?.disabled || false)
</script>

<style lang="scss">
@import './index.scss';

.zx-form-create-basic {
  &__form {
    .zx-form-create-basic__item {
      margin-bottom: 16px;
    }
  }
}
</style>
