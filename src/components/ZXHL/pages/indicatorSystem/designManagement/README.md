# 指标体系管理功能说明

## 功能概述

指标体系管理是系统管理模块下的一个重要功能，用于创建、编辑和管理各类评估指标体系。

## 目录结构

```
src/components/ZXHL/pages/systemManagement/indicatorSystem/
├── components/
│   ├── IndicatorSystemFormDialog.vue  # 指标体系表单对话框
│   └── selector/
│       └── SelectCategory.vue         # 所属分类选择器
├── list.vue                          # 指标体系列表页面
├── detail.vue                        # 指标体系详情页面（占位）
├── mock.js                           # Mock数据和API服务
└── saveData.js                       # 数据保存工具类
```

## 功能特性

### 1. 指标体系列表 (list.vue)
- **顶部操作栏**：
  - 左侧：新建指标体系、导入、导出
  - 中间：分类筛选
  - 右侧：搜索功能
- **列表展示**：
  - 指标体系名称
  - 指标体系描述
  - 所属分类
  - 最后修改时间
  - 操作列：设计、导出模版、删除
- **分页功能**：支持10/20/50/100条每页

### 2. 新建/编辑指标体系 (IndicatorSystemFormDialog.vue)
- **必填字段**：
  - 指标体系名称（2-50字符）
  - 所属分类（下拉选择）
- **选填字段**：
  - 指标体系描述（最多200字符）
- **表单验证**：完整的前端验证规则
- **支持模式**：新建、编辑、查看

### 3. 分类选择器 (SelectCategory.vue)
- 预设8个分类：
  - 管理效能
  - 技术能力
  - 服务质量
  - 创新能力
  - 风险控制
  - 资源配置
  - 人员素质
  - 成本控制
- 支持清空、多选等功能

### 4. 详情页面 (detail.vue)
- 显示指标体系详细信息
- 占位设计，等待后续功能开发
- 包含返回按钮和基本信息展示

## Mock 数据服务 (mock.js)

提供完整的 Mock API 服务：

### API 接口
- `getList(params)` - 获取指标体系列表（支持分页、搜索、筛选）
- `getDetail(id)` - 获取指标体系详情
- `create(data)` - 创建新的指标体系
- `update(data)` - 更新指标体系
- `delete(id)` - 删除指标体系
- `exportTemplate(id)` - 导出指标体系模板
- `import(formData)` - 导入指标体系
- `export()` - 导出指标体系列表
- `getCategoryOptions()` - 获取分类选项

### 数据特性
- 8条预设测试数据
- 真实的时间戳和用户信息
- 支持模拟网络延迟
- 完整的错误处理

## 数据保存工具 (saveData.js)

提供数据持久化和导入导出功能：

### 主要功能
- `saveToLocal(data)` - 保存到本地存储
- `getLocalData()` - 从本地存储读取
- `syncToServer()` - 同步到服务器
- `exportToJSON(data)` - 导出为JSON
- `importFromJSON(jsonString)` - 从JSON导入
- `validateData(data)` - 数据格式验证
- `batchSave(dataList)` - 批量保存

## 路由配置

新增系统管理路由配置 (`/src/components/ZXHL/router/routes/systemManagement.js`)：

```javascript
// 路由路径
/system/indicator-system/list      # 指标体系列表
/system/indicator-system/detail/:id # 指标体系详情
```

已更新主路由配置文件，支持系统管理模块。

## 使用说明

1. **访问列表页面**：导航到 `/system/indicator-system/list`
2. **新建指标体系**：点击"新建指标体系"按钮
3. **编辑指标体系**：在操作列点击"编辑"
4. **删除指标体系**：在操作列点击"删除"（需确认）
5. **设计指标体系**：点击"设计"跳转到详情页面
6. **导入导出**：使用顶部的导入/导出功能

## 技术栈

- **前端框架**：Vue 3 + Composition API
- **UI组件**：Element Plus + 自定义组件
- **路由管理**：Vue Router
- **状态管理**：本地状态 + Mock数据
- **样式方案**：SCSS

## 后续开发

1. **指标体系设计器**：在detail.vue中实现完整的指标设计功能
2. **权限控制**：添加用户权限验证
3. **数据持久化**：对接真实的后端API
4. **指标关系图**：可视化展示指标之间的关系
5. **模板功能**：支持指标体系模板的导入导出