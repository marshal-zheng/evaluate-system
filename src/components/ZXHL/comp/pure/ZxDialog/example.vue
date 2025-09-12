<template>
  <div class="zx-dialog-example">
    <h2>ZxDialog 组件示例</h2>
    
    <div class="example-section">
      <h3>基础用法</h3>
      <el-button @click="basicDialog = true">基础对话框</el-button>
      
      <ZxDialog
        v-model="basicDialog"
        title="基础对话框"
        width="600px"
        @confirm="handleBasicConfirm"
      >
        <p>这是一个基础的对话框示例，包含标题、内容和操作按钮。</p>
        <p>您可以点击确定或取消按钮来关闭对话框。</p>
      </ZxDialog>
    </div>

    <div class="example-section">
      <h3>带开关的对话框</h3>
      <el-button @click="switchDialog = true">开关对话框</el-button>
      
      <ZxDialog
        v-model="switchDialog"
        title="功能设置"
        :switch-props="{
          showSwitch: true,
          switchName: '启用自动保存',
          switchTooltip: '开启后将自动保存您的更改',
          enable: autoSave
        }"
        @confirm="handleSwitchConfirm"
      >
        <p>这是一个带开关控制的对话框示例。</p>
        <p>您可以通过开关来控制功能的启用状态。</p>
        <p>当前自动保存状态：<strong>{{ autoSave ? '已启用' : '已禁用' }}</strong></p>
      </ZxDialog>
    </div>

    <div class="example-section">
      <h3>描述列表对话框</h3>
      <el-button @click="descDialog = true">详情对话框</el-button>
      
      <ZxDialog
        v-model="descDialog"
        title="用户详情"
        :descriptions="userDescriptions"
        :show-skeleton="descLoading"
        width="700px"
      >
        <template #descValue="{ item }">
          <span v-if="item.label === '状态'" :class="getStatusClass(item.value)">
            {{ item.value }}
          </span>
          <el-tag v-else-if="item.label === '角色'" :type="getRoleType(item.value)">
            {{ item.value }}
          </el-tag>
          <span v-else>{{ item.value }}</span>
        </template>
      </ZxDialog>
    </div>

    <div class="example-section">
      <h3>自定义操作按钮</h3>
      <el-button @click="customDialog = true">自定义按钮</el-button>
      
      <ZxDialog
        v-model="customDialog"
        title="文档管理"
        :show-continue="true"
        save-continue-text="保存并新建"
        @confirm="handleSave"
        @continue="handleSaveAndNew"
      >
        <template #self-button>
          <el-button type="info" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
          <el-button type="warning" @click="handlePreview">
            <el-icon><View /></el-icon>
            预览
          </el-button>
        </template>
        
        <template #footerLeft>
          <el-button type="info" @click="handleHelp">
            <el-icon><QuestionFilled /></el-icon>
            帮助
          </el-button>
        </template>
        
        <div class="custom-content">
          <p>这是一个带自定义操作按钮的对话框。</p>
          <el-form :model="form" label-width="80px">
            <el-form-item label="文档名称">
              <el-input v-model="form.name" placeholder="请输入文档名称" />
            </el-form-item>
            <el-form-item label="文档类型">
              <el-select v-model="form.type" placeholder="请选择文档类型">
                <el-option label="Word文档" value="word" />
                <el-option label="PDF文档" value="pdf" />
                <el-option label="Excel表格" value="excel" />
              </el-select>
            </el-form-item>
            <el-form-item label="描述">
              <el-input v-model="form.description" type="textarea" rows="3" />
            </el-form-item>
          </el-form>
        </div>
      </ZxDialog>
    </div>

    <div class="example-section">
      <h3>不同尺寸</h3>
      <el-button @click="showSizeDialog('small')">小尺寸</el-button>
      <el-button @click="showSizeDialog('medium')">中等尺寸</el-button>
      <el-button @click="showSizeDialog('large')">大尺寸</el-button>
      
      <ZxDialog
        v-model="sizeDialog"
        title="不同尺寸对话框"
        :dialog-size="currentSize"
      >
        <div class="size-content">
          <h4>当前尺寸: {{ currentSize }}</h4>
          <p>这是一个 {{ currentSize }} 尺寸的对话框示例。</p>
          <div class="size-info">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="小尺寸">适合简单的确认对话框</el-descriptions-item>
              <el-descriptions-item label="中等尺寸">适合一般的表单和内容展示</el-descriptions-item>
              <el-descriptions-item label="大尺寸">适合复杂的表单和详细内容</el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
      </ZxDialog>
    </div>

    <div class="example-section">
      <h3>特殊配置</h3>
      <el-button @click="noMaskDialog = true">无遮罩</el-button>
      <el-button @click="noPaddingDialog = true">无内边距</el-button>
      <el-button @click="noTitleDialog = true">无标题</el-button>
      
      <!-- 无遮罩对话框 -->
      <ZxDialog
        v-model="noMaskDialog"
        title="无遮罩对话框"
        :mask="false"
      >
        <p>这是一个没有遮罩层的对话框，背景不会变暗。</p>
      </ZxDialog>
      
      <!-- 无内边距对话框 -->
      <ZxDialog
        v-model="noPaddingDialog"
        title="无内边距对话框"
        :no-content-padding="true"
        width="800px"
      >
        <el-table :data="tableData" style="width: 100%">
          <el-table-column prop="name" label="姓名" />
          <el-table-column prop="age" label="年龄" />
          <el-table-column prop="address" label="地址" />
        </el-table>
      </ZxDialog>
      
      <!-- 无标题对话框 -->
      <ZxDialog
        v-model="noTitleDialog"
        :no-title="true"
        width="500px"
      >
        <div class="no-title-content">
          <h3>自定义标题区域</h3>
          <p>这是一个没有默认标题栏的对话框，您可以完全自定义头部内容。</p>
        </div>
      </ZxDialog>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, View, QuestionFilled } from '@element-plus/icons-vue'
import ZxDialog from './index.vue'

// 基础对话框
const basicDialog = ref(false)

// 开关对话框
const switchDialog = ref(false)
const autoSave = ref(false)

// 描述列表对话框
const descDialog = ref(false)
const descLoading = ref(false)
const userDescriptions = ref([
  { label: '用户名', value: 'admin' },
  { label: '真实姓名', value: '管理员' },
  { label: '邮箱', value: 'admin@example.com' },
  { label: '手机号', value: '138****8888' },
  { label: '角色', value: '超级管理员' },
  { label: '状态', value: '正常' },
  { label: '最后登录', value: '2023-12-01 10:30:00' },
  { label: '创建时间', value: '2023-01-01 09:00:00' }
])

// 自定义按钮对话框
const customDialog = ref(false)
const form = reactive({
  name: '',
  type: '',
  description: ''
})

// 尺寸对话框
const sizeDialog = ref(false)
const currentSize = ref('medium')

// 特殊配置对话框
const noMaskDialog = ref(false)
const noPaddingDialog = ref(false)
const noTitleDialog = ref(false)

// 表格数据
const tableData = ref([
  { name: '张三', age: 25, address: '北京市朝阳区' },
  { name: '李四', age: 30, address: '上海市浦东新区' },
  { name: '王五', age: 28, address: '广州市天河区' }
])

// 事件处理函数
const handleBasicConfirm = () => {
  ElMessage.success('基础对话框确认成功！')
  basicDialog.value = false
}

const handleSwitchConfirm = (enable) => {
  autoSave.value = enable
  ElMessage.success(`自动保存已${enable ? '启用' : '禁用'}！`)
  switchDialog.value = false
}

const handleSave = () => {
  if (!form.name) {
    ElMessage.warning('请输入文档名称')
    return
  }
  ElMessage.success('文档保存成功！')
  customDialog.value = false
  resetForm()
}

const handleSaveAndNew = () => {
  if (!form.name) {
    ElMessage.warning('请输入文档名称')
    return
  }
  ElMessage.success('文档保存成功，可以继续新建！')
  resetForm()
}

const handleExport = () => {
  ElMessage.info('导出功能演示')
}

const handlePreview = () => {
  ElMessage.info('预览功能演示')
}

const handleHelp = () => {
  ElMessage.info('帮助功能演示')
}

const showSizeDialog = (size) => {
  currentSize.value = size
  sizeDialog.value = true
}

const resetForm = () => {
  form.name = ''
  form.type = ''
  form.description = ''
}

// 工具函数
const getStatusClass = (status) => {
  return status === '正常' ? 'text-green-600' : 'text-red-600'
}

const getRoleType = (role) => {
  const typeMap = {
    '超级管理员': 'danger',
    '管理员': 'warning',
    '普通用户': 'info'
  }
  return typeMap[role] || 'info'
}
</script>

<style scoped>
.zx-dialog-example {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.example-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fafafa;
}

.example-section h3 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.example-section .el-button {
  margin-right: 10px;
  margin-bottom: 10px;
}

.custom-content {
  padding: 10px 0;
}

.size-content {
  text-align: center;
}

.size-content h4 {
  margin: 0 0 15px 0;
  color: #409eff;
}

.size-info {
  margin-top: 20px;
  text-align: left;
}

.no-title-content {
  text-align: center;
  padding: 20px;
}

.no-title-content h3 {
  margin: 0 0 15px 0;
  color: #409eff;
}

.text-green-600 {
  color: #16a085;
  font-weight: 600;
}

.text-red-600 {
  color: #e74c3c;
  font-weight: 600;
}
</style>