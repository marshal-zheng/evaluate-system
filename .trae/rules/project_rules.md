# 评估系统项目规则 (Evaluate System Project Rules)

## 项目概述 (Project Overview)
这是一个基于 Vue 3 + Vite + Element Plus 的现代化前端评估系统项目。项目采用 Composition API、TypeScript 类型支持、组件自动导入等现代前端技术栈。

## 技术栈 & 架构规范 (Tech Stack & Architecture)

### 核心技术栈
- **前端框架**: Vue 3.3.4 (Composition API)
- **构建工具**: Vite 4.4.6
- **UI框架**: Element Plus 2.3.8 + Icons
- **状态管理**: Pinia 2.1.4
- **路由**: Vue Router 4.2.4
- **样式**: SCSS + Element Plus 主题定制
- **HTTP客户端**: Axios 1.4.0
- **图表库**: ECharts 5.4.2
- **富文本编辑器**: WangEditor 5.1.23
- **工作流图**: LogicFlow 1.2.10

### 项目结构规范
```
src/
├── assets/          # 静态资源 (图片、样式、字体等)
│   └── css/        # 全局样式和主题定制
├── components/     # 可复用组件
│   ├── ZXHL/      # 业务组件库
│   └── *.vue      # 通用组件
├── composables/    # Vue 3 组合式函数
├── http/          # API接口封装
├── plugins/       # 插件配置 (Element Plus等)
├── stores/        # Pinia状态管理
├── utils/         # 工具函数
├── views/         # 页面组件
├── App.vue        # 根组件
└── main.js        # 应用入口
```

## 开发规范 (Development Standards)

### 组件开发规范
1. **使用 Composition API**: 优先使用 `<script setup>` 语法
2. **组件命名**: 采用 PascalCase，文件名使用 kebab-case
3. **Props 定义**: 使用 `defineProps()` 并提供类型注解
4. **事件定义**: 使用 `defineEmits()` 声明事件
5. **组合式函数**: 以 `use` 开头命名，放在 `composables/` 目录

### Element Plus 集成规范
- **自动导入**: 已配置 `unplugin-vue-components` 和 `unplugin-auto-import`
- **图标使用**: 通过 `@element-plus/icons-vue` 全局注册
- **主题定制**: 在 `assets/css/custom.scss` 中定制主题变量
- **工具函数**: 使用 `composables/useElementPlus.js` 中的封装函数

### 状态管理规范
- **使用 Pinia**: 替代 Vuex，采用 Composition API 风格
- **Store 组织**: 按功能模块拆分 Store
- **命名约定**: Store 文件以 `use` 开头，如 `useUserStore`

### API 请求规范
- **统一封装**: 在 `http/` 目录下按模块封装API
- **代理配置**: 开发环境使用 Vite 代理，生产环境配置实际域名
- **错误处理**: 统一的错误处理和提示机制

### 样式开发规范
- **SCSS预处理**: 使用 SCSS 进行样式开发
- **CSS变量**: 配合 Element Plus 的 CSS 变量系统
- **响应式设计**: 支持多端适配
- **作用域样式**: 组件内使用 `scoped` 样式

## 构建与部署规范 (Build & Deployment)

### 构建配置
- **输出目录**: `zhpg` (客户现场要求)
- **浏览器兼容**: Chrome 50+, Edge 50+, Firefox 50+
- **Legacy支持**: 使用 `@vitejs/plugin-legacy` 支持旧版浏览器
- **基础路径**: 相对路径 `./` 便于部署

### 代理配置 (现场环境)
```javascript
// 开发环境代理配置
proxy: {
  '/api': { target: 'http://10.7.7.81:7999' },
  '/user': { target: 'http://172.168.20.151:8081' },
  '/gateway': { target: 'http://172.168.20.151:8081' }
}
```

### 路径别名
- `@/` → `src/`
- `views/` → `src/views/`
- `components/` → `src/components/`
- `stores/` → `src/stores/`
- `utils/` → `src/utils/`
- `http/` → `src/http/`

## 代码质量规范 (Code Quality)

### ESLint 配置
- 继承 Vue3 官方推荐配置
- 支持 Prettier 代码格式化
- 检查 `.vue`, `.js`, `.jsx`, `.cjs`, `.mjs` 文件

### 命令脚本
- `npm run dev`: 启动开发服务器
- `npm run build`: 构建生产版本
- `npm run preview`: 预览构建结果
- `npm run lint`: 代码检查和修复
- `npm run format`: 代码格式化

## AI助手指导原则 (AI Assistant Guidelines)

### 优先考虑事项
1. **现有架构兼容**: 基于现有的 Vue 3 + Element Plus 架构进行扩展
2. **组合式API优先**: 使用 Composition API 和 `<script setup>` 语法
3. **类型安全**: 利用自动导入和TypeScript类型定义
4. **性能优化**: 组件懒加载、代码分割、树摇优化
5. **用户体验**: 响应式设计、加载状态、错误处理

### 开发建议
1. **组件复用**: 优先使用项目中已有的扩展组件
2. **状态管理**: 合理使用 Pinia 进行状态管理
3. **API集成**: 遵循现有的HTTP封装模式
4. **主题一致**: 使用 Element Plus 主题系统保持视觉一致性
5. **工具函数**: 利用 `composables/` 中的工具函数

### 代码生成指导
- 生成Vue组件时使用 `<script setup>` 语法
- 自动导入已配置，无需手动导入Vue和Element Plus组件
- 使用项目中的工具函数，如 `useMessage()`, `useDialog()` 等
- 遵循现有的文件组织结构和命名约定
- 考虑响应式设计和多端适配

### 故障排除指导
1. **构建问题**: 检查 `vite.config.js` 配置
2. **组件问题**: 确认自动导入配置正确
3. **样式问题**: 检查SCSS预处理器配置
4. **API问题**: 确认代理配置和网络连接
5. **类型问题**: 检查TypeScript类型定义文件

## 客户现场特殊要求

### 部署要求
- 构建输出目录: `zhpg`
- 支持相对路径部署
- 兼容旧版浏览器 (Chrome 50+)

### 网络环境
- 开发代理: `10.7.7.81:7999`
- 用户服务: `172.168.20.151:8081`
- 网关服务: `172.168.20.151:8081`

### 包管理
- 使用 Yarn 1.22.22 作为包管理器
- 锁定版本避免依赖冲突

---

*此规则文件旨在帮助AI助手更好地理解项目结构和开发规范，提供更准确和有用的代码建议。*
