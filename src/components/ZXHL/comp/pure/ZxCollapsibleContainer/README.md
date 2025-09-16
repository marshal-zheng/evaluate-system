# ZxCollapsibleContainer 可折叠容器组件

支持展开收起的侧边容器组件，具有状态指示和平滑动画效果。

## 功能特性

- ✅ **可折叠展开**: 支持点击按钮切换展开/收起状态
- ✅ **自定义标题**: 支持自定义容器标题显示
- ✅ **状态指示**: 提供加载状态和折叠状态的视觉反馈
- ✅ **平滑动画**: 展开收起过程具有流畅的过渡动画效果
- ✅ **自动展开**: 支持在特定条件下自动展开容器
- ✅ **绝对定位**: 采用绝对定位布局，适合作为侧边栏使用
- ✅ **响应式设计**: 支持移动端适配
- ✅ **外部控制**: 支持通过外部状态控制展开收起

## 基础用法

```vue
<template>
  <div style="position: relative; height: 400px;">
    <ZxCollapsibleContainer
      :width="300"
      title="我的容器"
      :collapsed="collapsed"
      @toggle="collapsed = !collapsed"
    >
      <div>
        <p>这里是容器内容</p>
        <el-button type="primary">操作按钮</el-button>
      </div>
    </ZxCollapsibleContainer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ZxCollapsibleContainer from '@/components/ZXHL/comp/pure/ZxCollapsibleContainer'

const collapsed = ref(false)
</script>
```

## 高级用法

### 加载状态

```vue
<template>
  <ZxCollapsibleContainer
    :width="300"
    title="加载中"
    :loading="loading"
    :collapsed="collapsed"
    @toggle="collapsed = !collapsed"
  >
    <div>内容区域</div>
  </ZxCollapsibleContainer>
</template>

<script setup>
import { ref } from 'vue'

const loading = ref(true)
const collapsed = ref(false)

// 模拟异步加载
setTimeout(() => {
  loading.value = false
}, 2000)
</script>
```

### 自动展开

```vue
<template>
  <ZxCollapsibleContainer
    :width="300"
    title="自动展开容器"
    :auto-expand="true"
    :collapsed="collapsed"
    @toggle="collapsed = !collapsed"
  >
    <div>当满足条件时会自动展开</div>
  </ZxCollapsibleContainer>
</template>
```

### 外部控制

```vue
<template>
  <div>
    <el-button @click="toggleContainer">切换容器</el-button>
    <el-button @click="expandContainer">展开容器</el-button>
    <el-button @click="collapseContainer">收起容器</el-button>
    
    <ZxCollapsibleContainer
      ref="containerRef"
      :width="300"
      title="外部控制容器"
      :collapsed="collapsed"
      @toggle="collapsed = !collapsed"
    >
      <div>通过外部按钮控制</div>
    </ZxCollapsibleContainer>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const containerRef = ref()
const collapsed = ref(false)

const toggleContainer = () => {
  containerRef.value?.toggle()
}

const expandContainer = () => {
  containerRef.value?.expand()
}

const collapseContainer = () => {
  containerRef.value?.collapse()
}
</script>
```

## API 参考

### Props

| 参数 | 说明 | 类型 | 默认值 | 必填 |
|------|------|------|--------|------|
| width | 容器宽度（展开状态） | Number | 300 | 否 |
| title | 容器标题 | String | '容器' | 否 |
| collapsed | 是否折叠（支持 v-model） | Boolean | false | 否 |
| loading | 是否显示加载状态 | Boolean | false | 否 |
| autoExpand | 是否自动展开 | Boolean | false | 否 |

### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| toggle | 切换展开/收起状态时触发 | (collapsed: boolean) |
| update:collapsed | 更新 collapsed 状态（用于 v-model） | (collapsed: boolean) |

### Methods

通过 ref 可以调用以下方法：

| 方法名 | 说明 | 参数 |
|--------|------|------|
| toggle() | 切换展开/收起状态 | - |
| expand() | 展开容器 | - |
| collapse() | 收起容器 | - |

### Slots

| 插槽名 | 说明 |
|--------|------|
| default | 容器内容区域 |

## 样式定制

组件使用 SCSS 编写样式，支持以下 CSS 变量定制：

```scss
.zx-collapsible-container {
  // 自定义背景色
  background: var(--container-bg-color, #fff);
  
  // 自定义边框圆角
  border-radius: var(--container-border-radius, 8px);
  
  // 自定义阴影
  box-shadow: var(--container-box-shadow, 0 2px 12px 0 rgba(0, 0, 0, 0.1));
  
  // 自定义过渡时间
  transition: width var(--container-transition-duration, 0.3s) ease;
}
```

## 注意事项

1. **定位要求**: 组件使用绝对定位，父容器需要设置 `position: relative`
2. **高度设置**: 父容器需要设置明确的高度，组件会占满父容器高度
3. **响应式**: 在移动端会自动切换为全屏模式
4. **性能优化**: 大量内容时建议使用虚拟滚动或分页加载
5. **浏览器兼容**: 支持现代浏览器，IE11+ 需要 polyfill

## 更新日志

### v1.0.0
- 初始版本发布
- 支持基础的展开收起功能
- 支持加载状态和自动展开
- 支持外部方法调用
- 支持响应式设计