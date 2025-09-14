<template>
  <div class="m-load-comp async-load-comp">
    <ZxButton
      v-if="isShowDel"
      type="text"
      icon="Delete"
      class="del"
      @click="delItem"
    />
    <Suspense>
      <template #default>
        <component
          :is="dynamicComponent"
          v-bind="{ ...componentProps, data }"
        />
      </template>
      <template #fallback>
        <div class="loading">
          <el-loading-spinner />
        </div>
      </template>
    </Suspense>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent, Suspense } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import ZxButton from '../../pure/ZxButton/index.vue'

// 定义 props
const props = defineProps({
  path: {
    type: String,
    required: true
  },
  props: {
    type: Object,
    default: () => ({})
  },
  data: {
    type: Object,
    default: () => ({})
  },
  isShowDel: {
    type: Boolean,
    default: false
  }
})

// 定义 emits
const emit = defineEmits(['delComp'])

// 重命名 props 避免与组件 props 冲突
const componentProps = computed(() => props.props)

// 动态组件加载，添加错误处理
const dynamicComponent = computed(() => {
  return defineAsyncComponent({
    loader: () => import(/* @vite-ignore */ props.path),
    errorComponent: {
      template: '<div class="error">组件加载失败</div>'
    },
    delay: 200,
    timeout: 3000
  })
})

// 删除方法
const delItem = () => {
  emit('delComp')
}
</script>

<style lang="scss" scoped>
.async-load-comp {
  height: 100%;
  width: 100%;
  position: relative;

  .del {
    position: absolute;
    right: 10px;
    top: 5px;
    z-index: 999;
  }

  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px;
    color: var(--el-color-primary);
  }

  .error {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px;
    color: var(--el-color-danger);
    font-size: 14px;
  }
}
</style>