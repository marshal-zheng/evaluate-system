<template>
  <div class="zx-collapsible-container-example">
    <div class="example-header">
      <h2>ZxCollapsibleContainer 可折叠容器组件</h2>
      <p>支持展开收起的侧边容器组件，具有状态指示和平滑动画效果</p>
    </div>

    <div class="example-content">
      <!-- 基础用法 -->
      <div class="example-section">
        <h3>基础用法</h3>
        <div class="example-demo" style="position: relative; height: 400px; background: #f5f7fa; border-radius: 8px;">
          <ZxCollapsibleContainer
            :width="300"
            title="基础容器"
            :collapsed="basicCollapsed"
            @toggle="basicCollapsed = !basicCollapsed"
          >
            <div class="demo-content">
              <p>这是一个基础的可折叠容器示例</p>
              <el-button type="primary" @click="handleBasicAction">执行操作</el-button>
              <div style="margin-top: 20px;">
                <el-tag>标签1</el-tag>
                <el-tag type="success" style="margin-left: 8px;">标签2</el-tag>
                <el-tag type="warning" style="margin-left: 8px;">标签3</el-tag>
              </div>
            </div>
          </ZxCollapsibleContainer>
        </div>
      </div>

      <!-- 加载状态 -->
      <div class="example-section">
        <h3>加载状态</h3>
        <div class="example-demo" style="position: relative; height: 400px; background: #f5f7fa; border-radius: 8px;">
          <ZxCollapsibleContainer
            :width="280"
            title="加载中的容器"
            :loading="loadingState"
            :collapsed="loadingCollapsed"
            @toggle="loadingCollapsed = !loadingCollapsed"
          >
            <div class="demo-content">
              <p>这个容器展示了加载状态</p>
              <el-button @click="toggleLoading">切换加载状态</el-button>
            </div>
          </ZxCollapsibleContainer>
        </div>
      </div>

      <!-- 自动展开 -->
      <div class="example-section">
        <h3>自动展开</h3>
        <div class="example-demo" style="position: relative; height: 400px; background: #f5f7fa; border-radius: 8px;">
          <ZxCollapsibleContainer
            :width="320"
            title="自动展开容器"
            :auto-expand="true"
            :collapsed="autoCollapsed"
            @toggle="autoCollapsed = !autoCollapsed"
          >
            <div class="demo-content">
              <p>这个容器支持自动展开功能</p>
              <el-form label-width="80px">
                <el-form-item label="姓名">
                  <el-input v-model="formData.name" placeholder="请输入姓名" />
                </el-form-item>
                <el-form-item label="邮箱">
                  <el-input v-model="formData.email" placeholder="请输入邮箱" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary">提交</el-button>
                  <el-button>重置</el-button>
                </el-form-item>
              </el-form>
            </div>
          </ZxCollapsibleContainer>
        </div>
      </div>

      <!-- 控制按钮 -->
      <div class="example-section">
        <h3>外部控制</h3>
        <div class="control-buttons">
          <el-button @click="toggleAll">全部切换</el-button>
          <el-button @click="expandAll">全部展开</el-button>
          <el-button @click="collapseAll">全部收起</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ZxCollapsibleContainer from './index.vue'

// 响应式数据
const basicCollapsed = ref(false)
const loadingCollapsed = ref(false)
const autoCollapsed = ref(true)
const loadingState = ref(false)

const formData = ref({
  name: '',
  email: ''
})

// 方法
const handleBasicAction = () => {
  ElMessage.success('操作执行成功！')
}

const toggleLoading = () => {
  loadingState.value = !loadingState.value
  ElMessage.info(`加载状态: ${loadingState.value ? '开启' : '关闭'}`)
}

const toggleAll = () => {
  basicCollapsed.value = !basicCollapsed.value
  loadingCollapsed.value = !loadingCollapsed.value
  autoCollapsed.value = !autoCollapsed.value
}

const expandAll = () => {
  basicCollapsed.value = false
  loadingCollapsed.value = false
  autoCollapsed.value = false
}

const collapseAll = () => {
  basicCollapsed.value = true
  loadingCollapsed.value = true
  autoCollapsed.value = true
}
</script>

<style scoped>
.zx-collapsible-container-example {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.example-header {
  margin-bottom: 30px;
  text-align: center;
}

.example-header h2 {
  color: #303133;
  margin-bottom: 10px;
}

.example-header p {
  color: #606266;
  font-size: 14px;
}

.example-section {
  margin-bottom: 40px;
}

.example-section h3 {
  color: #409eff;
  margin-bottom: 15px;
  font-size: 16px;
}

.example-demo {
  border: 1px solid #dcdfe6;
  margin-bottom: 20px;
}

.demo-content {
  padding: 20px;
}

.demo-content p {
  margin-bottom: 15px;
  color: #606266;
}

.control-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.el-form-item {
  margin-bottom: 15px;
}
</style>