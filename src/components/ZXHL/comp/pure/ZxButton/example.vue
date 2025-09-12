<template>
  <div class="zx-button-example">
    <div class="example-header">
      <h1>ZxButton 组件示例</h1>
      <p>展示 ZxButton 组件的各种用法和配置选项</p>
    </div>

    <!-- 基础用法 -->>
    <div class="example-section">
      <h2>基础用法</h2>
      <div class="demo-content">
        <div class="button-row">
          <ZxButton>默认按钮</ZxButton>
          <ZxButton type="primary">主要按钮</ZxButton>
          <ZxButton type="success">成功按钮</ZxButton>
          <ZxButton type="info">信息按钮</ZxButton>
          <ZxButton type="warning">警告按钮</ZxButton>
          <ZxButton type="danger">危险按钮</ZxButton>
        </div>
      </div>
    </div>

    <!-- 带提示的按钮 -->>
    <div class="example-section">
      <h2>带提示的按钮</h2>
      <div class="demo-content">
        <div class="button-row">
          <ZxButton 
            type="primary"
            :tooltip="{ content: '这是一个带提示的按钮' }"
          >
            悬停显示提示
          </ZxButton>
          
          <ZxButton 
            type="success"
            :tooltip="{ 
              content: '这是一个较长的提示信息，用于展示多行文本的显示效果',
              placement: 'top'
            }"
          >
            长文本提示
          </ZxButton>
          
          <ZxButton 
            type="warning"
            :tooltip="{ 
              type: 'popover',
              title: '操作确认',
              content: '确定要执行此操作吗？',
              trigger: 'click'
            }"
          >
            点击显示 Popover
          </ZxButton>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->>
    <div class="example-section">
      <h2>加载状态</h2>
      <div class="demo-content">
        <div class="button-row">
          <ZxButton 
            type="primary"
            v-model="loading1"
            @click="handleAsyncOperation1"
          >
            异步操作按钮
          </ZxButton>
          
          <ZxButton 
            type="success"
            :enable-loading="false"
            @click="handleNormalClick"
          >
            禁用加载状态
          </ZxButton>
          
          <ZxButton 
            type="info"
            v-model="loading2"
            @click="handleAsyncOperation2"
          >
            模拟网络请求
          </ZxButton>
        </div>
      </div>
    </div>

    <!-- 防抖和节流 -->>
    <div class="example-section">
      <h2>防抖和节流</h2>
      <div class="demo-content">
        <div class="button-row">
          <ZxButton 
            type="primary"
            :debounce="500"
            @click="handleDebounceClick"
          >
            防抖按钮 (500ms)
          </ZxButton>
          
          <ZxButton 
            type="success"
            :throttle="1000"
            @click="handleThrottleClick"
          >
            节流按钮 (1000ms)
          </ZxButton>
          
          <ZxButton 
            type="warning"
            :debounce="300"
            :throttle="500"
            @click="handleCombinedClick"
          >
            防抖+节流
          </ZxButton>
        </div>
        
        <div class="click-counter">
          <p>防抖点击次数: {{ debounceCount }}</p>
          <p>节流点击次数: {{ throttleCount }}</p>
          <p>组合点击次数: {{ combinedCount }}</p>
        </div>
      </div>
    </div>

    <!-- 不同尺寸 -->>
    <div class="example-section">
      <h2>不同尺寸</h2>
      <div class="demo-content">
        <div class="button-row">
          <ZxButton size="large" type="primary">大型按钮</ZxButton>
          <ZxButton type="primary">默认按钮</ZxButton>
          <ZxButton size="small" type="primary">小型按钮</ZxButton>
        </div>
      </div>
    </div>

    <!-- 圆角和圆形 -->>
    <div class="example-section">
      <h2>圆角和圆形</h2>
      <div class="demo-content">
        <div class="button-row">
          <ZxButton type="primary" round>圆角按钮</ZxButton>
          <ZxButton type="success" circle>+</ZxButton>
          <ZxButton type="info" circle>i</ZxButton>
          <ZxButton type="warning" circle>!</ZxButton>
          <ZxButton type="danger" circle>×</ZxButton>
        </div>
      </div>
    </div>

    <!-- 禁用状态 -->>
    <div class="example-section">
      <h2>禁用状态</h2>
      <div class="demo-content">
        <div class="button-row">
          <ZxButton disabled>默认按钮</ZxButton>
          <ZxButton type="primary" disabled>主要按钮</ZxButton>
          <ZxButton type="success" disabled>成功按钮</ZxButton>
          <ZxButton type="info" disabled>信息按钮</ZxButton>
          <ZxButton type="warning" disabled>警告按钮</ZxButton>
          <ZxButton type="danger" disabled>危险按钮</ZxButton>
        </div>
      </div>
    </div>

    <!-- 事件处理 -->>
    <div class="example-section">
      <h2>事件处理</h2>
      <div class="demo-content">
        <div class="button-row">
          <ZxButton 
            type="primary"
            @start-loading="onStartLoading"
            @end-loading="onEndLoading"
            @success="onSuccess"
            @error="onError"
            @click="handleEventDemo"
          >
            事件演示按钮
          </ZxButton>
        </div>
        
        <div class="event-log">
          <h3>事件日志:</h3>
          <ul>
            <li v-for="(log, index) in eventLogs" :key="index">
              {{ log }}
            </li>
          </ul>
          <el-button size="small" @click="clearLogs">清空日志</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// 响应式数据
const loading1 = ref(false)
const loading2 = ref(false)
const debounceCount = ref(0)
const throttleCount = ref(0)
const combinedCount = ref(0)
const eventLogs = ref([])

// 异步操作模拟
const handleAsyncOperation1 = async () => {
  await new Promise(resolve => setTimeout(resolve, 2000))
  ElMessage.success('操作完成！')
}

const handleAsyncOperation2 = async () => {
  await new Promise(resolve => setTimeout(resolve, 3000))
  ElMessage.success('网络请求完成！')
}

// 普通点击
const handleNormalClick = () => {
  ElMessage.info('普通点击，无加载状态')
}

// 防抖和节流点击
const handleDebounceClick = () => {
  debounceCount.value++
  ElMessage.success(`防抖点击: ${debounceCount.value}`)
}

const handleThrottleClick = () => {
  throttleCount.value++
  ElMessage.success(`节流点击: ${throttleCount.value}`)
}

const handleCombinedClick = () => {
  combinedCount.value++
  ElMessage.success(`组合点击: ${combinedCount.value}`)
}

// 事件处理
const addLog = (message) => {
  const timestamp = new Date().toLocaleTimeString()
  eventLogs.value.unshift(`[${timestamp}] ${message}`)
  if (eventLogs.value.length > 10) {
    eventLogs.value.pop()
  }
}

const onStartLoading = () => {
  addLog('开始加载')
}

const onEndLoading = () => {
  addLog('结束加载')
}

const onSuccess = () => {
  addLog('操作成功')
}

const onError = (error) => {
  addLog(`操作失败: ${error.message}`)
}

const handleEventDemo = async () => {
  // 模拟可能失败的操作
  const shouldFail = Math.random() < 0.3
  
  if (shouldFail) {
    throw new Error('模拟操作失败')
  }
  
  await new Promise(resolve => setTimeout(resolve, 1500))
  ElMessage.success('事件演示完成！')
}

const clearLogs = () => {
  eventLogs.value = []
}
</script>

<style scoped>
.zx-button-example {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.example-header {
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.example-header h1 {
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

.example-section h2 {
  color: #303133;
  margin-bottom: 20px;
  font-size: 18px;
  border-left: 4px solid #409eff;
  padding-left: 10px;
}

.demo-content {
  background: #fafafa;
  padding: 20px;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.button-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.click-counter {
  margin-top: 20px;
  padding: 15px;
  background: #f0f9ff;
  border-radius: 4px;
  border-left: 4px solid #409eff;
}

.click-counter p {
  margin: 5px 0;
  color: #303133;
  font-size: 14px;
}

.event-log {
  margin-top: 20px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.event-log h3 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 16px;
}

.event-log ul {
  list-style: none;
  padding: 0;
  margin: 0 0 10px 0;
  max-height: 200px;
  overflow-y: auto;
}

.event-log li {
  padding: 5px 0;
  color: #606266;
  font-size: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.event-log li:last-child {
  border-bottom: none;
}
</style>