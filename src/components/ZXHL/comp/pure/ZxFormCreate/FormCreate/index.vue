<template>
  <div class="zx-form-create">
    <div v-if="title" class="form-title">
      {{ title }}
    </div>
    <el-form
      ref="formRef"
      :model="innerModel"
      :label-width="labelWidth"
      :inline="inline"
      :size="size"
      :disabled="disabled"
    >
      <el-form-item
        v-for="item in normalizedSchema"
        :key="item.field"
        :label="item.title"
        :prop="item.field"
        :rules="item.rules"
      >
        <component
          :is="resolveComponent(item)"
          v-model="innerModel[item.field]"
          :placeholder="item.props?.placeholder || `请输入${item.title}`"
          :options="item.options"
          :type="item.type === 'textarea' ? 'textarea' : undefined"
          :picker-options="item.type === 'datetime' ? { format: 'yyyy-MM-dd HH:mm:ss' } : undefined"
          v-bind="item.props"
          @change="handleFieldChange(item, $event)"
        />
      </el-form-item>
      <el-form-item v-if="$slots.actions || submitText || cancelText">
        <slot name="actions" :submit="handleSubmit" :cancel="handleCancel">
          <el-button v-if="cancelText" @click="handleCancel">{{ cancelText }}</el-button>
          <el-button v-if="submitText" type="primary" @click="handleSubmit">{{ submitText }}</el-button>
        </slot>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'

// 子组件（包内）
import PassWord from '../PassWord/index.vue'
import SearchSelect from '../SearchSelect/index.vue'

const props = defineProps({
  modelValue: { type: Object, default: () => ({}) },
  schema: { type: Array, default: () => [] },
  title: { type: String, default: '' },
  labelWidth: { type: [String, Number], default: '120px' },
  inline: { type: Boolean, default: false },
  size: { type: String, default: 'default' },
  disabled: { type: Boolean, default: false },
  submitText: { type: String, default: '提交' },
  cancelText: { type: String, default: '取消' }
})

const emit = defineEmits(['update:modelValue', 'submit', 'cancel', 'change'])

const formRef = ref(null)
const innerModel = reactive({ ...props.modelValue })

watch(() => props.modelValue, (val) => {
  // 同步外部变更
  Object.keys(innerModel).forEach(k => delete innerModel[k])
  Object.assign(innerModel, val || {})
}, { deep: true })

watch(innerModel, (val) => {
  emit('update:modelValue', { ...val })
}, { deep: true })

const normalizedSchema = computed(() => {
  return (props.schema || []).map(item => ({
    type: (item.type || 'input').toLowerCase(),
    field: item.field || item.prop || '',
    title: item.title || item.label || '',
    options: item.options || [],
    rules: item.rules || [],
    props: item.props || {}
  })).filter(i => i.field)
})

function resolveComponent(item) {
  const t = item.type
  // 统一为 Element Plus 生态，Jira 相关不包含
  if (t === 'password' || t === 'passwordinput') return PassWord
  if (t === 'select' || t === 'searchselect') return SearchSelect
  if (t === 'number' || t === 'int' || t === 'float') return 'el-input-number'
  if (t === 'textarea') return 'el-input'
  if (t === 'radio') return 'el-radio-group'
  if (t === 'checkbox') return 'el-checkbox-group'
  if (t === 'date') return 'el-date-picker'
  if (t === 'datetime') return 'el-date-picker'
  if (t === 'cascader') return 'el-cascader'
  return 'el-input'
}

function handleFieldChange(item, val) {
  emit('change', { field: item.field, value: val, model: { ...innerModel } })
}

function handleCancel() {
  emit('cancel', { model: { ...innerModel } })
}

function handleSubmit() {
  // 简单通过，不做内置校验收集，交由外部或后续增强
  // 若需要表单校验，可通过 formRef.validate 调用（当存在校验规则时）
  try {
    // @ts-ignore 仅在实际存在时调用，不引入 TS
    formRef.value?.validate?.((valid) => {
      if (valid === false) return
      emit('submit', { model: { ...innerModel } })
    }) || emit('submit', { model: { ...innerModel } })
  } catch (e) {
    emit('submit', { model: { ...innerModel } })
  }
}
</script>

<style lang="scss">
@import '../index.scss';
</style>
