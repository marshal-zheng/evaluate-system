<template>
  <div class="zx-form-create-advanced">
    <el-form
      ref="formRef"
      :model="formModel"
      :label-width="labelWidth"
      :size="size"
      :disabled="disabled"
      class="zx-form-create-advanced__form"
    >
      <template v-for="(rule, idx) in processedRules" :key="rule.field || idx">
        <el-form-item
          :label="rule.title || ''"
          :prop="rule.field"
          :rules="rule.validate || []"
          class="zx-form-create-advanced__item"
        >
          <component
            :is="resolveComponent(rule)"
            v-model="formModel[rule.field]"
            v-bind="rule.props || {}"
            :options="rule.options"
            @change="val => handleFieldChange(rule.field, val, rule)"
          />
          
          <!-- 控制器展示受控组件 -->
          <template v-if="rule.control && rule.control.length">
            <div v-for="controlItem in rule.control" :key="controlItem.value">
              <template v-if="formModel[rule.field] === controlItem.value">
                <div class="zx-form-create-advanced__controlled">
                  <template v-for="(controlRule, cIdx) in controlItem.rule" :key="controlRule.field || cIdx">
                    <el-form-item
                      :label="controlRule.title || ''"
                      :prop="controlRule.field"
                      :rules="controlRule.validate || []"
                      class="zx-form-create-advanced__controlled-item"
                    >
                      <component
                        :is="resolveComponent(controlRule)"
                        v-model="formModel[controlRule.field]"
                        v-bind="controlRule.props || {}"
                        :options="controlRule.options"
                        @change="val => handleFieldChange(controlRule.field, val, controlRule)"
                      />
                    </el-form-item>
                  </template>
                </div>
              </template>
            </div>
          </template>
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
  options: { type: Object, default: () => ({}) },
  formRule: { type: Array, default: () => [] },
  formItem: { type: Array, default: () => [] },
  api: { type: Object, default: null },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['update:api', 'update', 'update:formItem', 'change', 'mounted'])

const formRef = ref(null)
const formModel = reactive({})

// 级联映射和控制器映射
const cascadeItemsMaps = ref({})
const controlFormItemsMaps = ref({})

// 处理后的规则列表
const processedRules = computed(() => {
  return processFormRules(props.formRule || [])
})

// 解析组件类型
function resolveComponent(rule) {
  const t = rule.type?.toLowerCase()
  if (t === 'password') return PassWord
  if (t === 'searchselect') return SearchSelect  
  if (t === 'number' || t === 'int' || t === 'float') return 'el-input-number'
  if (t === 'textarea') return 'el-input'
  if (t === 'select') return 'el-select'
  if (t === 'radio') return 'el-radio-group'
  if (t === 'checkbox') return 'el-checkbox-group'
  if (t === 'date') return 'el-date-picker'
  if (t === 'datetime') return 'el-date-picker'
  if (t === 'cascader') return 'el-cascader'
  return 'el-input'
}

// 处理表单规则
function processFormRules(rules) {
  // 1. 初始化级联映射
  initCascadeItemsMaps(rules)
  
  // 2. 处理控制器映射
  getControlFormItemsMaps(rules)
  
  // 3. 转换表单项
  const convertedRules = rules
    .filter(item => !item.displayConditions?.field) // 过滤掉被控制的项
    .map(item => convertFormItem(item))
  
  return convertedRules
}

// 初始化级联映射
function initCascadeItemsMaps(rules) {
  cascadeItemsMaps.value = {}
  
  rules.forEach(item => {
    const cascadeName = item.couplingConfig?.cascade
    if (cascadeName) {
      if (!cascadeItemsMaps.value[cascadeName]) {
        cascadeItemsMaps.value[cascadeName] = []
      }
      cascadeItemsMaps.value[cascadeName].push(item)
    }
  })
}

// 处理控制器映射
function getControlFormItemsMaps(rules) {
  controlFormItemsMaps.value = {}
  
  rules.forEach(item => {
    const controlField = item.displayConditions?.field
    if (controlField) {
      if (!controlFormItemsMaps.value[controlField]) {
        controlFormItemsMaps.value[controlField] = []
      }
      controlFormItemsMaps.value[controlField].push(item)
    }
  })
}

// 转换表单项
function convertFormItem(item) {
  const converted = {
    type: item.type?.toLowerCase() || 'input',
    field: item.name || '',
    title: item.label || '',
    value: item.value || getDefaultValue(item.type),
    options: mapOptions(item.options || []),
    validate: item.validate || [],
    props: {
      placeholder: item.platformPlaceHolder || getDefaultPlaceholder(item.type),
      disabled: item.props?.disabled || props.disabled,
      instructionsIcon: item.instructionsIcon,
      subDesc: item.subDesc,
      optionMethod: item.optionMethod,
      inputSearch: item.inputSearch,
      ...item.props
    },
    control: []
  }

  // 处理控制器
  if (controlFormItemsMaps.value[item.name]) {
    const controlItems = controlFormItemsMaps.value[item.name]
    const controlMap = {}
    
    controlItems.forEach(controlItem => {
      const value = controlItem.displayConditions?.value
      if (!controlMap[value]) {
        controlMap[value] = []
      }
      controlMap[value].push(convertFormItem(controlItem))
    })
    
    converted.control = Object.keys(controlMap).map(value => ({
      value,
      rule: controlMap[value]
    }))
  }

  // 初始化表单模型
  if (!(converted.field in formModel)) {
    formModel[converted.field] = converted.value
  }

  return converted
}

// 映射选项
function mapOptions(options) {
  return options.map(option => ({
    label: option.text || option.label,
    value: option.value,
    children: option.children ? mapOptions(option.children) : undefined
  }))
}

// 获取默认值
function getDefaultValue(type) {
  const t = type?.toUpperCase()
  if (['MULTIPLE_SELECT', 'CHECKBOX', 'MULTIPLE_MEMBER', 'MULTIPLE_INPUT'].includes(t)) {
    return []
  }
  if (['INT', 'FLOAT'].includes(t)) {
    return 0
  }
  return ''
}

// 获取默认占位符
function getDefaultPlaceholder(type) {
  const t = type?.toUpperCase()
  if (['SELECT', 'MULTIPLE_SELECT', 'RADIO', 'CHECKBOX', 'DATE', 'DATETIME'].includes(t)) {
    return '请选择'
  }
  return '请输入'
}

// 字段变化处理
function handleFieldChange(field, value, rule) {
  formModel[field] = value
  
  // 处理级联更新
  if (cascadeItemsMaps.value[field]) {
    cascadeItemsMaps.value[field].forEach(cascadeItem => {
      if (cascadeItem.name !== field) {
        formModel[cascadeItem.name] = ''
      }
    })
  }
  
  // 表单验证
  if (formRef.value) {
    formRef.value.validateField(field)
  }
  
  emit('change', value, rule, apiMethods)
}

// API 方法
const apiMethods = {
  validateField: (field) => formRef.value?.validateField(field),
  validate: () => formRef.value?.validate(),
  resetFields: () => formRef.value?.resetFields(),
  clearValidate: () => formRef.value?.clearValidate(),
  formData: () => ({ ...formModel }),
  getValue: (field) => formModel[field],
  setValue: (data) => Object.assign(formModel, data),
  disabled: (disabled) => {
    // 实现禁用逻辑
  }
}

// 监听表单规则变化
watch(() => props.formRule, () => {
  // 重新初始化表单模型
  nextTick(() => {
    const tempObj = {}
    props.formRule.forEach(item => {
      tempObj[item.name] = item.value
    })
    Object.assign(formModel, tempObj)
  })
}, { deep: true, immediate: true })

// 组件挂载
onMounted(() => {
  emit('update:api', apiMethods)
  
  if (props.disabled) {
    apiMethods.disabled(true)
  }
  
  emit('mounted')
})

// 计算属性
const labelWidth = computed(() => props.options?.form?.labelWidth || '120px')
const size = computed(() => props.options?.form?.size || 'default')

// 监听处理后的规则变化
watch(() => processedRules.value, (val) => {
  emit('update:formItem', val)
}, { deep: true })
</script>

<style lang="scss">
@import './index.scss';

.zx-form-create-advanced {
  &__controlled {
    margin-left: 24px;
    padding-left: 16px;
    border-left: 2px solid #e4e7ed;
    
    &-item {
      margin-bottom: 12px;
    }
  }
}
</style>
