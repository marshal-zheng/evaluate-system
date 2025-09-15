<template>
  <div :class="containerClassNames">
    <PanelHeader
      v-if="panel.title"
      ref="panelHdRef"
      :class="hdClass"
      :title="panel.title"
      :draggable="isEditable"
      @menu-action="onHeaderMenuAction"
    >
      <template #content>
        <slot name="hdContent" />
      </template>
    </PanelHeader>
    <div :class="panelContentClassNames">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { ElMessageBox } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import PanelHeader from './PanelHeader/index.vue'

// Props
const props = defineProps({
  transparent: {
    type: Boolean,
    default: false
  },
  panel: {
    type: Object,
    required: true
  },
  dashboard: {
    type: Object,
    required: true
  },
  hdClass: {
    type: String,
    default: ''
  },
  noPadding: {
    type: Boolean,
    default: false
  },
  isEditable: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['remove-panel'])

// Refs
const panelHdRef = ref(null)

// Computed
const containerClassNames = computed(() => ({
  'panel-chrome-angular': true,
  'panel-container': true,
  'panel-container--transparent': props.transparent,
  'box-shadow-small': true
}))

const panelContentClassNames = computed(() => ({
  'panel-content': true,
  'panel-content--no-padding': props.noPadding
}))

// Methods
const delPanel = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要移除当前模块?',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    // 优先调用 dashboard 的删除能力（如果存在）
    if (props.dashboard && typeof props.dashboard.removeRow === 'function') {
      props.dashboard.removeRow(props.panel, false)
    }
    // 同步对外通知删除（受控模式由父级处理实际移除）
    emit('remove-panel', props.panel?.id ?? props.panel)
  } catch {
    // 用户取消操作
  }
}

// 处理来自 PanelHeader 的菜单操作
const onHeaderMenuAction = async (action) => {
  if (action === 'delete') {
    await delPanel()
  }
}

// Lifecycle
onMounted(() => {
  if (!panelHdRef.value) {
    return
  }
  
  const del = {
    name: 'delete',
    render: () => {
      return h('el-icon', {
        class: 'el-icon-delete',
        onClick: delPanel,
        title: '移除'
      }, {
        default: () => h('Delete')
      })
    }
  }
  
  panelHdRef.value.addAction(del)
})
</script>

<style lang="scss">
@import './index.scss';
</style>