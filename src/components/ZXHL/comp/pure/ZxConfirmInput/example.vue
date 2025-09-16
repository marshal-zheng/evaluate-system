<template>
  <div class="demo-container">
    <h2>ZxConfirmInput 确认对话框示例</h2>
    
    <!-- 基础示例 -->
    <div class="demo-section">
      <h3>基础示例</h3>
      <div class="demo-buttons">
        <el-button type="danger" @click="show1 = true">删除项目</el-button>
        <el-button type="danger" @click="show2 = true">删除用户</el-button>
        <el-button type="warning" @click="show3 = true">重置系统</el-button>
        <el-button type="primary" @click="show4 = true">发布版本</el-button>
      </div>
    </div>

    <!-- 高级功能 -->
    <div class="demo-section">
      <h3>高级功能</h3>
      <div class="demo-buttons">
        <el-button type="danger" @click="show5 = true">自定义插槽</el-button>
        <el-button type="danger" @click="show6 = true">异步操作</el-button>
      </div>
    </div>

    <!-- 插件式调用 -->
    <div class="demo-section">
      <h3>插件式调用</h3>
      <div class="demo-buttons">
        <el-button type="danger" @click="callDangerAPI">danger()</el-button>
        <el-button type="warning" @click="callWarningAPI">warning()</el-button>
        <el-button type="primary" @click="callInfoAPI">info()</el-button>
        <el-button type="danger" @click="callDeleteProjectAPI">业务层-删除项目</el-button>
        <el-button type="danger" @click="callDeleteUserAPI">业务层-删除用户</el-button>
        <el-button type="warning" @click="callResetSystemAPI">业务层-重置系统</el-button>
      </div>
    </div>

    <!-- 对话框组件 -->

    <!-- GitLab 风格 - 删除项目 -->
    <ZxConfirmInput
      v-model="show1"
      title="需要确认"
      target-name="郑翰卿 / mcp-echarts"
      target-type="项目"
      keyword="mcp-echarts"
      ok-text="确认删除"
      @confirm="onConfirm('删除项目', $event)"
      @cancel="onCancel('删除项目')"
    />

    <!-- 删除用户 -->
    <ZxConfirmInput
      v-model="show2"
      title="删除用户账户"
      target-name="郑翰卿"
      target-type="用户账户"
      keyword="郑翰卿"
      description="此操作将永久删除用户账户及其所有相关数据。"
      ok-text="确认删除用户"
      @confirm="onConfirm('删除用户', $event)"
      @cancel="onCancel('删除用户')"
    />

    <!-- 警告语气 -->
    <ZxConfirmInput
      v-model="show3"
      title="重置系统设置"
      target-name="系统配置"
      target-type="配置"
      keyword="RESET"
      tone="warning"
      description="此操作将重置所有系统设置到默认状态。"
      ok-text="确认重置"
      @confirm="onConfirm('重置系统', $event)"
      @cancel="onCancel('重置系统')"
    />

    <!-- 信息语气 -->
    <ZxConfirmInput
      v-model="show4"
      title="发布新版本"
      target-name="v2.1.0"
      target-type="版本"
      keyword="v2.1.0"
      tone="info"
      description="此操作将发布新版本到生产环境。"
      ok-text="确认发布"
      @confirm="onConfirm('发布版本', $event)"
      @cancel="onCancel('发布版本')"
    />

    <!-- 自定义内容插槽 -->
    <ZxConfirmInput
      v-model="show5"
      title="自定义确认框"
      keyword="CUSTOM"
      ok-text="执行操作"
      @confirm="onConfirm('自定义操作', $event)"
      @cancel="onCancel('自定义操作')"
    >
      <template #danger-message>
        <strong>⚠️ 您即将执行自定义危险操作！</strong>
      </template>
      <template #description>
        这是一个使用插槽自定义内容的示例。您可以在这里放置任何自定义的描述内容。
      </template>
      <template #input-hint>
        请输入确认码 <code>CUSTOM</code> 以继续操作。
      </template>
    </ZxConfirmInput>

    <!-- 使用 confirmAction 异步接口 -->
    <ZxConfirmInput
      v-model="show6"
      title="异步删除确认"
      target-name="重要数据"
      target-type="数据"
      keyword="DELETE"
      :confirm-action="handleAsyncDelete"
      ok-text="确认删除"
      @confirm="onConfirm('异步删除成功', $event)"
      @cancel="onCancel('异步删除')"
      @error="onError"
    />
  </div>
</template>

<script setup>
import { ref, getCurrentInstance } from 'vue'
import { ElMessage } from 'element-plus'
import ZxConfirmInput from './index.vue'
import { deleteProject, deleteUser, resetSystem } from '@/utils/confirmHelpers'

const show1 = ref(false)
const show2 = ref(false)
const show3 = ref(false)
const show4 = ref(false)
const show5 = ref(false)
const show6 = ref(false)

// 获取当前实例以访问全局属性
const { proxy } = getCurrentInstance()

const onConfirm = (label, payload) => {
  ElMessage.success(`${label}：已确认（输入=${payload.value}）`)
}

const onCancel = (label) => {
  ElMessage.info(`${label}：已取消操作`)
}

const onError = ({ error, payload }) => {
  ElMessage.error(`操作失败：${error.message}`)
}

// 异步删除操作示例
const handleAsyncDelete = async (payload) => {
  // 模拟异步 API 调用
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.3) { // 70% 成功率
        resolve({ success: true, message: '删除成功' })
      } else {
        reject(new Error('网络错误，删除失败'))
      }
    }, 2000) // 模拟 2 秒的网络延迟
  })
}

// 插件式 API 调用示例
const callDangerAPI = async () => {
  try {
    const result = await proxy.$confirmInput.danger({
      targetName: 'test-project',
      keyword: 'test-project'
    })
    ElMessage.success(`危险操作确认：${result.value}`)
  } catch (error) {
    ElMessage.info('用户取消了危险操作')
  }
}

const callWarningAPI = async () => {
  try {
    const result = await proxy.$confirmInput.warning({
      targetName: '系统配置',
      keyword: 'RESET'
    })
    ElMessage.success(`警告操作确认：${result.value}`)
  } catch (error) {
    ElMessage.info('用户取消了警告操作')
  }
}

const callInfoAPI = async () => {
  try {
    const result = await proxy.$confirmInput.info({
      targetName: 'v1.0.0',
      keyword: 'v1.0.0',
      okText: '确认发布'
    })
    ElMessage.success(`信息确认：${result.value}`)
  } catch (error) {
    ElMessage.info('用户取消了信息确认')
  }
}

const callDeleteProjectAPI = async () => {
  try {
    const result = await deleteProject('my-awesome-project')
    ElMessage.success('项目删除成功')
    console.log('删除项目结果:', result)
  } catch (error) {
    ElMessage.info('用户取消删除')
  }
}

const callDeleteUserAPI = async () => {
  try {
    const result = await deleteUser('张三')
    ElMessage.success('用户删除成功')
    console.log('删除用户结果:', result)
  } catch (error) {
    ElMessage.info('用户取消删除')
  }
}

const callResetSystemAPI = async () => {
  try {
    const result = await resetSystem()
    ElMessage.success('系统重置成功')
    console.log('重置系统结果:', result)
  } catch (error) {
    ElMessage.info('用户取消重置')
  }
}
</script>

<style scoped>
.demo-container {
  padding: 20px;
}

.demo-section {
  margin-bottom: 30px;
}

.demo-section h3 {
  margin-bottom: 15px;
  color: #333;
}

.demo-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
</style>
