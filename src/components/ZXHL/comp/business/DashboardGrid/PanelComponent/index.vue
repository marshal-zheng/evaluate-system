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
const emit = defineEmits(['remove-panel', 'duplicate-panel', 'edit-panel'])

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

// 复制当前面板
const duplicatePanel = () => {
  const src = props.panel || {}
  const newId = `${String(src.type || 'panel').toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const gridPos = src.gridPos && typeof src.gridPos === 'object' ? src.gridPos : {}
  const newPanel = {
    id: newId,
    type: src.type,
    title: src.title || '未命名面板',
    chartType: src.chartType,
    path: src.path,
    params: src.params || {},
    contentNoPadding: !!src.contentNoPadding,
    gridPos: {
      x: gridPos.x ?? src.x ?? 0,
      y: (gridPos.y ?? src.y ?? 0) + 1, // 下移一格，避免完全重叠
      w: gridPos.w ?? src.w ?? 6,
      h: gridPos.h ?? src.h ?? 3
    }
  }

  // 优先使用 dashboard 的新增能力（非受控模式）
  if (props.dashboard && typeof props.dashboard.addPanel === 'function') {
    props.dashboard.addPanel(newPanel)
    return
  }
  // 受控模式：交由父级处理
  emit('duplicate-panel', newPanel)
}

// 处理来自 PanelHeader 的菜单操作
const onHeaderMenuAction = async (action) => {
  if (action === 'delete') {
    await delPanel()
  } else if (action === 'duplicate') {
    duplicatePanel()
  } else if (action === 'edit') {
    // 由外层统一弹出 EditPane
    emit('edit-panel', props.panel)
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
