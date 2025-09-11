# ZxIcon 组件迁移指南

## 概述

ZxIcon 是基于原 Icon 组件优化而来的 Vue3 + JavaScript 图标组件，支持 Element Plus 并专为现代 Vue3 项目设计。

## 主要特性

- ✅ Vue3 + JavaScript 实现
- ✅ 支持 SCSS 样式（样式文件分离）
- ✅ 支持本地 SVG 图标
- ✅ 支持图标字体（如 iconfont）
- ✅ 支持悬停效果
- ✅ 集成 Element Plus ElIcon 组件
- ✅ 扁平化文件结构（无 src 文件夹）
- ❌ 移除了在线图标库支持
- ❌ 移除了 TypeScript 类型定义

## 迁移步骤

### 1. 复制组件文件

将整个 `ZxIcon` 文件夹复制到你的项目中：

```bash
# 复制到你的项目组件目录
cp -r /path/to/ZxIcon /your-project/src/components/
```

### 2. 安装依赖

确保你的项目已安装 Vue3 和 Element Plus：

```bash
yarn add vue@^3.0.0 element-plus
# 或
npm install vue@^3.0.0 element-plus
```

### 3. 全局注册组件（推荐）

在你的 `main.js` 文件中：

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import ZxIcon from './components/ZxIcon'

const app = createApp(App)

// 注册 Element Plus
app.use(ElementPlus)

// 全局注册组件
app.use(ZxIcon)
// 或者
app.component('ZxIcon', ZxIcon)

app.mount('#app')
```

### 4. 局部注册组件

在需要使用的组件中：

```javascript
import ZxIcon from '@/components/ZxIcon'
// 如果需要单独引入 Element Plus 组件
import { ElIcon } from 'element-plus'

export default {
  components: {
    ZxIcon,
    ElIcon // 可选，ZxIcon 内部已经引入
  },
  // ...
}
```

### 5. 使用组件

ZxIcon 支持三种图标使用方式，每种方式都有不同的配置要求：

### 方式一：本地图标字体库（如 iconfont）

#### 基础配置要求
1. **下载图标字体文件**：从 iconfont.cn 或其他图标字体服务下载字体文件
2. **引入字体文件**：在项目中引入 CSS 和字体文件
3. **配置字体样式**：确保图标类名正确

#### 配置步骤
```scss
// 在你的全局样式文件中引入
@font-face {
  font-family: 'iconfont';
  src: url('./assets/fonts/iconfont.woff2') format('woff2'),
       url('./assets/fonts/iconfont.woff') format('woff'),
       url('./assets/fonts/iconfont.ttf') format('truetype');
}

.iconfont {
  font-family: "iconfont" !important;
  font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

#### 使用方法
```vue
<template>
  <!-- 使用 iconfont 图标 -->
  <ZxIcon icon="iconfont icon-home" :size="20" color="#409eff" />
  <ZxIcon icon="iconfont icon-user" :size="24" />
  <ZxIcon icon="iconfont icon-setting" :size="18" color="#67c23a" />
</template>
```

### 方式二：本地 SVG 图标

#### 基础配置要求
1. **安装 vite-plugin-svg-icons**：用于处理 SVG sprite
2. **配置 Vite**：设置 SVG 图标目录
3. **准备 SVG 文件**：将 SVG 图标文件放入指定目录

#### 配置步骤
```bash
# 安装依赖
yarn add vite-plugin-svg-icons -D
```

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
      symbolId: 'icon-[dir]-[name]'
    })
  ]
})
```

```javascript
// main.js 中引入
import 'virtual:svg-icons-register'
```

#### 使用方法
```vue
<template>
  <!-- 使用本地 SVG 图标 -->
  <ZxIcon icon="svg-icon:user" :size="24" />
  <ZxIcon icon="svg-icon:home" :size="20" color="#409eff" />
  <ZxIcon icon="svg-icon:setting" :size="18" color="#67c23a" />
</template>
```

### 方式三：Element Plus 图标

#### 基础配置要求
1. **安装 Element Plus**：确保项目已安装 Element Plus
2. **安装图标库**：安装 @element-plus/icons-vue
3. **注册图标**：全局或按需注册图标组件

#### 配置步骤
```bash
# 安装依赖
yarn add element-plus @element-plus/icons-vue
```

```javascript
// main.js - 全局注册方式
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)
app.use(ElementPlus)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
```

或者按需引入：
```javascript
// 按需引入方式
import { ElIcon } from 'element-plus'
import { User, Home, Setting } from '@element-plus/icons-vue'

export default {
  components: {
    ElIcon,
    User,
    Home,
    Setting
  }
}
```

#### 使用方法
```vue
<template>
  <!-- 方式1：直接使用 Element Plus 图标组件 -->
  <ElIcon :size="20" color="#409eff">
    <User />
  </ElIcon>
  
  <!-- 方式2：通过 ZxIcon 使用（需要额外配置） -->
  <ZxIcon icon="el-icon-user" :size="20" color="#409eff" />
  <ZxIcon icon="el-icon-home" :size="24" />
  <ZxIcon icon="el-icon-setting" :size="18" color="#67c23a" />
</template>

<script>
import { User, Home, Setting } from '@element-plus/icons-vue'

export default {
  components: {
    User,
    Home,
    Setting
  }
}
</script>
```

### 综合使用示例

```vue
<template>
  <div class="icon-demo">
    <!-- 图标字体 -->
    <ZxIcon icon="iconfont icon-home" :size="20" color="#409eff" />
    
    <!-- 本地 SVG -->
    <ZxIcon icon="svg-icon:user" :size="24" />
    
    <!-- Element Plus 图标（推荐直接使用 ElIcon） -->
    <ElIcon :size="18" color="#67c23a">
      <Setting />
    </ElIcon>
    
    <!-- 带悬停效果 -->
    <ZxIcon 
      icon="iconfont icon-star" 
      :size="18" 
      color="#909399" 
      hover-color="#f56c6c" 
    />
  </div>
</template>
```

#### 高级用法

```vue
<template>
  <div class="icon-demo">
    <!-- 自定义类名 -->
    <ZxIcon 
      icon="icon-setting" 
      :size="16" 
      class-name="custom-icon"
    />
    
    <!-- 动态图标 -->
    <ZxIcon 
      :icon="currentIcon" 
      :size="iconSize" 
      :color="iconColor"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentIcon: 'icon-home',
      iconSize: 20,
      iconColor: '#409eff'
    }
  }
}
</script>
```

## 组件 API

### Props

| 参数 | 说明 | 类型 | 默认值 | 必填 |
|------|------|------|--------|------|
| icon | 图标名称 | String | - | 是 |
| size | 图标大小 | Number/String | 16 | 否 |
| color | 图标颜色 | String | - | 否 |
| hoverColor | 悬停时的颜色 | String | - | 否 |
| className | 自定义类名 | String | - | 否 |

### 图标类型说明

1. **图标字体**：直接使用类名，如 `icon-home`、`el-icon-edit` 等
2. **本地 SVG**：使用 `svg-icon:` 前缀，如 `svg-icon:user`

## 样式定制

### 全局样式

你可以在全局样式文件中覆盖默认样式：

```scss
// 在你的全局 SCSS 文件中
.zx-icon {
  // 自定义默认样式
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
  }
  
  // 自定义 SVG 样式
  svg {
    transition: fill 0.3s ease;
  }
}
```

### 主题定制

```scss
// 定义主题变量
$icon-primary-color: #409eff;
$icon-success-color: #67c23a;
$icon-warning-color: #e6a23c;
$icon-danger-color: #f56c6c;

// 应用主题
.zx-icon {
  &.primary { color: $icon-primary-color; }
  &.success { color: $icon-success-color; }
  &.warning { color: $icon-warning-color; }
  &.danger { color: $icon-danger-color; }
}
```

## 本地 SVG 图标配置

如果你需要使用本地 SVG 图标，需要配置 SVG sprite：

### 1. 安装 vite-plugin-svg-icons（如果使用 Vite）

```bash
yarn add vite-plugin-svg-icons -D
```

### 2. 配置 vite.config.js

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
      symbolId: 'icon-[dir]-[name]'
    })
  ]
})
```

### 3. 在 main.js 中引入

```javascript
import 'virtual:svg-icons-register'
```

### 4. 放置 SVG 文件

将 SVG 文件放在 `src/assets/icons/` 目录下，然后使用：

```vue
<ZxIcon icon="svg-icon:filename" />
```

## 迁移注意事项

### 从原 Icon 组件迁移

1. **保持 Element Plus 支持**：
   ```javascript
   // ZxIcon 内部使用 ElIcon 作为容器
   import ZxIcon from '@/components/ZxIcon'
   ```

2. **更新组件名称**：
   ```vue
   <!-- 原来 -->
   <Icon icon="icon-home" />
   
   <!-- 现在 -->
   <ZxIcon icon="icon-home" />
   ```

3. **移除在线图标相关配置**：
   - 不再需要 `@iconify/vue`
   - 不再需要 `VITE_USE_ONLINE_ICON` 环境变量

4. **新的文件结构**：
   ```
   ZxIcon/
   ├── index.vue      # 主组件文件
   ├── index.scss     # 样式文件
   ├── index.js       # 入口文件
   ├── example.vue    # 使用示例
   └── README.md      # 文档
   ```

### 兼容性说明

- **Vue 版本**：需要 Vue 3.0+
- **Element Plus**：需要 Element Plus 2.0+
- **浏览器支持**：现代浏览器（IE11+）
- **构建工具**：支持 Vite、Webpack 等
- **样式预处理器**：需要支持 SCSS

## 常见问题

### Q: 图标不显示怎么办？

A: 检查以下几点：
1. 确保图标字体文件已正确引入
2. 检查图标类名是否正确
3. 确保 SVG sprite 已正确配置（如果使用本地 SVG）

### Q: 如何添加新的图标？

A: 
- **图标字体**：在 CSS 中添加新的图标类
- **本地 SVG**：将 SVG 文件放入配置的图标目录

### Q: 如何自定义图标样式？

A: 通过 `className` prop 添加自定义类名，然后在 CSS 中定义样式。

## 示例项目

完整的使用示例可以参考项目中的测试文件。

## 更新日志

- v1.0.0: 初始版本，基于原 Icon 组件简化而来

## 许可证

与原项目保持一致。