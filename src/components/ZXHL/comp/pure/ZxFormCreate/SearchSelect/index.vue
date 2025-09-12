<template>
  <div class="zx-search-select">
    <el-select
      v-model="val"
      :placeholder="placeholder"
      :multiple="multiple"
      filterable
      remote
      :remote-method="onRemote"
      :loading="loading"
      clearable
      style="width: 100%"
    >
      <el-option
        v-for="opt in localOptions"
        :key="getKey(opt)"
        :label="getLabel(opt)"
        :value="getValue(opt)"
      />
    </el-select>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number, Array], default: '' },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: '请选择' },
  multiple: { type: Boolean, default: false },
  remoteMethod: { type: Function, default: null },
  labelKey: { type: String, default: 'label' },
  valueKey: { type: String, default: 'value' },
})
const emit = defineEmits(['update:modelValue', 'change', 'search'])

const val = ref(props.modelValue)
const loading = ref(false)
const localOptions = ref([...(props.options || [])])

watch(() => props.modelValue, v => { val.value = v })
watch(val, v => { emit('update:modelValue', v); emit('change', v) })
watch(() => props.options, v => { localOptions.value = [...(v || [])] })

function getLabel(opt) { return opt?.[props.labelKey] ?? opt?.label ?? String(opt ?? '') }
function getValue(opt) { return opt?.[props.valueKey] ?? opt?.value ?? opt }
function getKey(opt) { return getValue(opt) }

async function onRemote(query) {
  emit('search', query)
  if (!props.remoteMethod) return
  loading.value = true
  try {
    const result = await props.remoteMethod(query)
    if (Array.isArray(result)) localOptions.value = result
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss">
@import './index.scss';
</style>
