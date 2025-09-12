# ZxDialog 对话框组件

基于 Element Plus 的对话框组件，支持开关控制、自定义按钮、描述列表等功能。

## 功能特性

- ✅ 基于 Element Plus el-dialog 组件
- ✅ 支持开关控制功能
- ✅ 支持自定义操作按钮
- ✅ 支持描述列表展示
- ✅ 支持多种尺寸（small/medium/large）
- ✅ 响应式设计，适配移动端
- ✅ 支持暗色主题
- ✅ JavaScript 类型支持

## 基础用法

```vue
<template>
  <div>
    <el-button @click="dialog = true">打开对话框</el-button>
    
    <ZxDialog
      v-model="dialog"
      title="基础对话框"
      width="600px"
    >
      <p>这是对话框内容</p>
    </ZxDialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ZxDialog from '@/components/ZXHL/comp/pure/ZxDialog'

const dialog = ref(false)
</script>
```

## 高级用法

### 带开关的对话框

```vue
<template>
  <ZxDialog
    v-model="dialog"
    title="带开关的对话框"
    :switch-props="{
      showSwitch: true,
      switchName: '启用功能',
      switchTooltip: '开启后将启用此功能',
      enable: switchValue
    }"
    @confirm="handleConfirm"
  >
    <p>这是一个带开关控制的对话框</p>
  </ZxDialog>
</template>

<script setup>
import { ref } from 'vue'

const dialog = ref(false)
const switchValue = ref(false)

const handleConfirm = (enable) => {
  console.log('开关状态:', enable)
  dialog.value = false
}
</script>
```

### 描述列表对话框

```vue
<template>
  <ZxDialog
    v-model="dialog"
    title="详情信息"
    :descriptions="descriptions"
    :show-skeleton="loading"
  >
    <template #descValue="{ item }">
      <span v-if="item.label === '状态'" :class="getStatusClass(item.value)">
        {{ item.value }}
      </span>
      <span v-else>{{ item.value }}</span>
    </template>
  </ZxDialog>
</template>

<script setup>
import { ref } from 'vue'

const dialog = ref(false)
const loading = ref(false)
const descriptions = ref([
  { label: '用户名', value: 'admin' },
  { label: '邮箱', value: 'admin@example.com' },
  { label: '状态', value: '正常' },
  { label: '创建时间', value: '2023-12-01 10:00:00' }
])

const getStatusClass = (status) => {
  return status === '正常' ? 'text-green-500' : 'text-red-500'
}
</script>
```

### 自定义操作按钮

```vue
<template>
  <ZxDialog
    v-model="dialog"
    title="自定义操作"
    :show-continue="true"
    save-continue-text="保存并新建"
    @confirm="handleSave"
    @continue="handleSaveAndNew"
  >
    <template #self-button>
      <el-button @click="handleExport">导出</el-button>
    </template>
    
    <template #footerLeft>
      <el-button type="info" @click="handleHelp">帮助</el-button>
    </template>
    
    <p>自定义操作按钮的对话框</p>
  </ZxDialog>
</template>

<script setup>
import { ref } from 'vue'

const dialog = ref(false)

const handleSave = () => {
  console.log('保存')
  dialog.value = false
}

const handleSaveAndNew = () => {
  console.log('保存并新建')
  // 不关闭对话框，继续新建
}

const handleExport = () => {
  console.log('导出')
}

const handleHelp = () => {
  console.log('显示帮助')
}
</script>
```

### 不同尺寸

```vue
<template>
  <div>
    <el-button @click="showSmall">小尺寸</el-button>
    <el-button @click="showMedium">中等尺寸</el-button>
    <el-button @click="showLarge">大尺寸</el-button>
    
    <ZxDialog
      v-model="dialog"
      title="不同尺寸对话框"
      :dialog-size="currentSize"
    >
      <p>当前尺寸: {{ currentSize }}</p>
    </ZxDialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const dialog = ref(false)
const currentSize = ref('medium')

const showSmall = () => {
  currentSize.value = 'small'
  dialog.value = true
}

const showMedium = () => {
  currentSize.value = 'medium'
  dialog.value = true
}

const showLarge = () => {
  currentSize.value = 'large'
  dialog.value = true
}
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|---------|
| modelValue / v-model | 是否显示对话框 | boolean | — | false |
| title | 对话框标题 | string | — | — |
| titleTag | 标题标签文本 | string | — | — |
| titleTagColor | 标题标签颜色 | string | — | — |
| descriptions | 描述列表数据 | array | — | [] |
| footer | 是否显示底部操作栏 | boolean | — | true |
| showCancel | 是否显示取消按钮 | boolean | — | true |
| mask | 是否显示遮罩层 | boolean | — | true |
| showSkeleton | 是否显示骨架屏 | boolean | — | false |
| okLoading | 确定按钮加载状态 | boolean | — | false |
| okDisabled | 确定按钮禁用状态 | boolean | — | false |
| okText | 确定按钮文本 | string | — | 确定 |
| cancelText | 取消按钮文本 | string | — | 取消 |
| saveContinueText | 保存并继续按钮文本 | string | — | 保存并继续 |
| showContinue | 是否显示保存并继续按钮 | boolean | — | false |
| width | 对话框宽度 | string \| number | — | 50% |
| dialogSize | 对话框尺寸 | string | small / medium / large | medium |
| noContentPadding | 是否移除内容区域内边距 | boolean | — | false |
| closable | 是否显示关闭按钮 | boolean | — | true |
| noTitle | 是否隐藏标题栏 | boolean | — | false |
| dialogStyle | 对话框自定义样式 | object | — | {} |
| maskClosable | 是否可以通过点击遮罩关闭 | boolean | — | false |
| unmountOnClose | 关闭时销毁子元素 | boolean | — | false |
| switchProps | 开关配置对象 | object | — | {} |
| handleBeforeCancel | 取消前的回调函数 | function | — | null |
| confirm | 确认回调函数 | function | — | null |

### switchProps 配置

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|---------|
| showSwitch | 是否显示开关 | boolean | false |
| switchName | 开关标签文本 | string | — |
| switchTooltip | 开关提示信息 | string | — |
| enable | 开关初始状态 | boolean | false |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 对话框显示状态改变时触发 | (value: boolean) |
| confirm | 点击确定按钮时触发 | (switchValue: boolean) |
| cancel | 点击取消按钮时触发 | — |
| continue | 点击保存并继续按钮时触发 | — |
| open | 对话框打开时触发 | — |
| close | 对话框关闭时触发 | — |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 对话框内容 |
| title | 自定义标题内容 |
| headerLeft | 标题左侧内容 |
| tbutton | 标题右侧按钮 |
| descValue | 自定义描述列表值内容 |
| footer | 自定义底部内容 |
| footerLeft | 底部左侧内容 |
| self-button | 自定义操作按钮 |

## 样式定制

组件使用 SCSS 变量，可以通过覆盖以下变量来定制样式：

```scss
// 对话框圆角
--zx-dialog-border-radius: 8px;

// 对话框阴影
--zx-dialog-box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);

// 头部背景色
--zx-dialog-header-bg: #ffffff;

// 内容背景色
--zx-dialog-body-bg: #ffffff;

// 底部背景色
--zx-dialog-footer-bg: #ffffff;

// 边框颜色
--zx-dialog-border-color: #e4e7ed;
```

## 注意事项

1. 组件基于 Element Plus，请确保项目中已正确安装和配置 Element Plus
2. 开关功能需要配置 `switchProps` 对象
3. 描述列表功能需要传入 `descriptions` 数组
4. 自定义按钮可以通过插槽实现
5. 建议在使用前先了解 Element Plus Dialog 组件的基础用法

## 兼容性

- Vue 3.3+
- Element Plus 2.3+
- 现代浏览器（Chrome 50+, Firefox 50+, Edge 50+）