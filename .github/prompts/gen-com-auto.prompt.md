---
mode: agent
---

## 组件自动生成 Agent 提示词规范（Vue3 + Element Plus，无 TS）

你是一个全自动代码生成和接入的工程代理。目标：基于本仓库现有 Pure 组件的结构与代码风格，按约定一次性生成一个新的 Pure 组件及其示例页，并自动把示例路由接入到 `src/components/ZXHL/router/routes/components.js`。过程必须全自动执行，无需与用户交互。

### 输入参数
- ComponentName: 组件英文名（帕斯卡命名，必须以 Zx 前缀，例如 ZxUploader）。
- TitleCN: 组件中文标题（用于路由 meta.title 与示例页文案）。
- Description: 组件用途简介（README 与示例页用）。

若未显式提供参数：
- 从需求描述中智能提取；
- 缺失时使用可推断的安全默认值；
- 严禁向用户追问，直接按最佳实践落地。

### 技术与工程约束（硬性）
- 框架：Vue 3（<script setup> 语法）。
- UI 库：Element Plus（仅用其组件与指令）。
- 语言：JavaScript（无 TypeScript、无 .d.ts、无类型导出）。
- 构建：Vite 现有配置，使用路径别名 `@/`。
- 样式：SCSS，放置于与组件同目录的 `index.scss`，按类名作用域组织，避免全局污染。
- 命名规范：
  - 目录：`/src/components/ZXHL/comp/pure/${ComponentName}/`
  - 文件：`index.vue`、`index.js`、`index.scss`、`example.vue`、`README.md`
  - 根 CSS 类前缀：`zx-${kebab-case(ComponentName).slice(3)}`（去掉 Zx 前缀后转 kebab）
- 可访问性与国际化：使用语义化标签，Element Plus 组件默认文案可保持中文。

### 目标产物（必须全部生成）
1) 组件主文件 `index.vue`
	- 使用 `<script setup>` 与 `defineProps/defineEmits`。
	- 支持 v-model（如适用）：`modelValue` + `update:modelValue`。
	- Props 写法与默认值参照 `ZxDrawer/index.vue` 风格（对象写法，含 type 与 default）。
	- 事件命名同项目风格：`confirm/cancel/open/close/...` 按需定义。
	- 样式引入：`<style lang="scss"> @import './index.scss'; </style>`。
	- 使用 Element Plus 组件实现核心功能，必要时提供插槽以扩展（header、footer、默认插槽等）。

2) 组件导出 `index.js`
	- `import Component from './index.vue'`，`export default Component`。
	- 提供 `install(app) { app.component('ComponentName', Component) }` 以支持全局注册。
	- 不输出任何 TS 类型或 `export * from`。

3) 组件样式 `index.scss`
	- 顶部使用 `:root {}` 定义一组可定制的 CSS 变量（颜色、间距、尺寸、边框、阴影等），变量命名以组件前缀开头：`--zx-${kebab-case(ComponentName).slice(3)}-xxx`，并给出合理默认值（参照 ZxDrawer）。
	- 以根类 `.zx-xxx` 开头，使用 CSS 变量或嵌套结构组织。
	- 不污染全局，必要处使用 `:deep()` 覆盖 Element Plus 内部类。

4) 示例页 `example.vue`
	- 自包含可运行示例，导入当前目录 `./index.vue` 使用。
	- 展示核心交互（表单、按钮、表格/列表等），使用 `ElMessage` 等进行反馈。
	- 提供 1-3 个不同状态/配置的示例块，便于快速感知特性。

5) 文档 `README.md`
	- 中文：简介、特性列表、基础用法、（若有）高级用法、Props/Events/Slots 表、样式定制点、注意事项与兼容性。

6) 路由接入（自动修改文件）
	- 目标文件：`src/components/ZXHL/router/routes/components.js`
	- 在 `Pure 组件统一注册演示` 所在分组的 children 内新增一个子路由：
	  - path：`zx-${kebab-case(ComponentName).slice(3)}`
	  - name：`${ComponentName}Demo`
	  - meta.title：`"${ComponentName} ${TitleCN}"`（示例：`ZxUploader 上传组件`）
	  - component：`() => import('@/components/ZXHL/comp/pure/${ComponentName}/example.vue')`
	- 插入位置：保持与现有子路由同级，按现有文件风格（逗号、缩进、引号、属性顺序）追加到末尾。

7) 可选：全局注册清单（如需）
	- 文件：`src/components/ZXHL/comp/pure/index.js`
	- 若需要全局可用，则引入并加入 `components` 数组，遵循现有写法：
	  - `import ${ComponentName} from './${ComponentName}'`
	  - 在 `components` 里追加 `${ComponentName}`；导出对象无需改动其它内容。
	- 如示例仅局部引入可运行，此步可省略。

### 多组件目录规范（一个组件文件夹内包含多个子组件时）
- 当 `/${ComponentName}/` 需要同时包含多个子组件时，采用如下结构：
	- `src/components/ZXHL/comp/pure/${ComponentName}/`
		- `index.js`（包级导出与 install，注册所有子组件）
		- `example.vue`（包级示例页，演示所有或主要子组件用法）
		- `README.md`（包级文档，列出所有子组件）
		- `${SubComponentA}/index.vue`
		- `${SubComponentA}/index.scss`
		- `${SubComponentB}/index.vue`
		- `${SubComponentB}/index.scss`
- 命名与样式：
	- 每个子组件的根 CSS 类前缀使用其自身名称：`.zx-${kebab-case(SubComponentName).slice(3)}`。
	- 子组件 `index.vue` 使用 `<script setup>`，props/emits/样式组织与 ZxDrawer 一致。
	- 每个子组件的 `index.scss` 顶部必须在 `:root {}` 中定义该子组件的 CSS 变量，变量命名以子组件前缀开头：`--zx-${kebab-case(SubComponentName).slice(3)}-xxx`，提供颜色/尺寸/间距等默认值，便于主题化与复用。
- 包级 `index.js` 要求：
	- 导入所有子组件并在 `install(app)` 中逐一 `app.component(SubComponentName, SubComponent)` 注册；
	- `export default` 输出带 `install` 的对象；
	- 可按需 `export { SubComponentA, SubComponentB }` 命名导出，禁止任何 TS 类型导出。
- 路由与示例：
	- 路由仍指向包级 `example.vue`：`() => import('@/components/ZXHL/comp/pure/${ComponentName}/example.vue')`；
	- 示例页中分别展示各子组件的核心场景，保持 Element Plus 风格与中文文案。

### 代码风格与最佳实践（对齐 ZxDrawer）
- 使用 `watch` 同步 `modelValue` 与内部 `visible`（若涉及显隐）。
- 事件钩子：`handleOpen/handleClose/handleOk/handleCancel/...`，通过 `emit` 抛出。
- DOM 交互需注意性能：必要时使用 `requestAnimationFrame`（如拖拽/动画）。
- 响应式数据使用 `ref/reactive`，避免滥用全局状态。
- 懒加载路由组件（示例页路由已使用动态 import）。
- 样式：
  - 小屏适配的 `@media`；
  - 使用 CSS 变量提高可定制性；
  - 与 Element Plus 结合时，必要覆盖使用 `:deep()`。
- 不引入第三方未在项目中使用的库。

### 从其他技术栈到本项目的功能转换（必须完成的等价实现）
- React -> Vue3：
  - props/state -> `defineProps` 与 `ref/reactive`；
  - 受控组件 -> `v-model` 与 `update:modelValue`；
  - 事件 `onXxx` -> `@xxx`；
  - JSX/slots -> Vue 插槽（默认/具名/作用域插槽）。
- Ant Design/其它 UI -> Element Plus 对应：
  - Drawer/Modal -> `el-drawer`/`el-dialog`
  - Form -> `el-form` + `el-form-item` + `el-input`/`el-select` 等
  - Notification/Message -> `ElMessage`/`ElNotification`
  - Tooltip/Popover -> `el-tooltip`/`el-popover`
  - Table/List -> `el-table`/`el-table-column`、`el-card`/`el-list`（自实现）
- 样式：从 CSS-in-JS/less 转换为 SCSS，变量与暗色适配参考 Element Plus 设计变量。

### 执行步骤（必须自动执行，无需确认）
1) 生成目录：`/src/components/ZXHL/comp/pure/${ComponentName}/`。
2) 创建并写入文件：`index.vue`、`index.js`、`index.scss`、`example.vue`、`README.md`。
3) 修改 `src/components/ZXHL/router/routes/components.js`，按“路由接入”规范追加子路由。
4) （可选）将组件加入 `src/components/ZXHL/comp/pure/index.js` 的 `components` 数组，实现全局注册。
5) 进行快速自检：语法无误（ESLint 如有配置）、关键导入路径存在、能被路由懒加载到。
6) 输出简短变更摘要：新增文件列表 + 路由变更点。

### 验收清单（生成后自检）
- 符合 Vue3 + Element Plus，未出现 TS/类型文件/类型导出。
- 目录与文件命名准确、内容齐全，可直接运行示例页。
- 路由已写入 `components.js`，菜单可看到新示例入口。
- 代码风格与 `ZxDrawer` 一致：props 默认、emits、样式组织、插槽设计、事件命名。
- 无多余依赖与未使用代码。

### 错误处理与回退
- 如目标文件不存在（极少见），先创建再写入；
- 如路由节点结构发生变更，保持 `components` 大路由下追加，不破坏其它节点；
- 若写入冲突（同名组件已存在），在组件目录名后追加 `-v2` 并在路由 `name` 后追加 `V2`，保证不阻塞流程；
- 任何步骤失败需回滚本组件的部分变更并重试一次，仍失败则给出明确错误摘要与建议修复点。

—— 以上规范为强约束。请严格按约定创建文件、接入路由，并保持风格与 `ZxDrawer` 一致，无需向用户提问，直接完成落地与校验。
