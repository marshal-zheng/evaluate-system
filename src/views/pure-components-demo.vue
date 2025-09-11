<template>
  <div class="pure-components-demo">
    <div class="demo-header">
      <h1>Pure 组件统一全局注册演示</h1>
      <p>展示 Pure 组件库的统一全局注册功能和各组件的基本用法</p>
    </div>

    <div class="demo-section">
      <h2>1. ZxIcon 图标组件</h2>
      <div class="demo-content">
        <ZxIcon icon="Edit" size="20" color="#409EFF" />
        <ZxIcon icon="Delete" size="24" color="#F56C6C" hover-color="#FF0000" />
        <ZxIcon icon="Search" size="28" color="#67C23A" />
      </div>
    </div>

    <div class="demo-section">
      <h2>2. ZxSearch 搜索组件</h2>
      <div class="demo-content">
        <ZxSearch 
          v-model="searchValue" 
          placeholder="请输入搜索内容" 
          style="width: 300px;"
        />
        <p>搜索值: {{ searchValue }}</p>
      </div>
    </div>

    <div class="demo-section">
      <h2>3. ZxSelect 选择器组件</h2>
      <div class="demo-content">
        <ZxSelect 
          v-model="selectValue" 
          :options="selectOptions"
          placeholder="请选择选项"
          style="width: 200px;"
        />
        <p>选择值: {{ selectValue }}</p>
      </div>
    </div>

    <div class="demo-section">
      <h2>4. ZxTooltipOrPopover 提示组件</h2>
      <div class="demo-content">
        <ZxTooltipOrPopover content="这是一个提示信息">
          <el-button>悬停显示提示</el-button>
        </ZxTooltipOrPopover>
      </div>
    </div>

    <div class="demo-section">
      <h2>5. 全局注册说明</h2>
      <div class="demo-content">
        <el-card>
          <h3>使用方法</h3>
          <pre><code>// 在 main.js 中全局注册所有 Pure 组件
import PureComponents from '@/components/ZXHL/comp/pure'

const app = createApp(App)
app.use(PureComponents)

// 或者单独注册某个组件
import { ZxIcon } from '@/components/ZXHL/comp/pure'
app.use(ZxIcon)</code></pre>
          
          <h3>组件特性</h3>
          <ul>
            <li>✅ 支持统一全局注册</li>
            <li>✅ 支持单独组件注册</li>
            <li>✅ 基于 Vue 3 Composition API</li>
            <li>✅ 兼容 Element Plus 技术栈</li>
            <li>✅ 提供完整的 TypeScript 类型支持</li>
          </ul>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 组件名称
defineOptions({
  name: 'PureComponentsDemo'
})

// 响应式数据
const searchValue = ref('')
const selectValue = ref('')
const selectOptions = ref([
  { label: '选项1', value: 'option1' },
  { label: '选项2', value: 'option2' },
  { label: '选项3', value: 'option3' }
])
</script>

<style lang="scss" scoped>
.pure-components-demo {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;

  .demo-header {
    text-align: center;
    margin-bottom: 40px;
    
    h1 {
      color: #303133;
      margin-bottom: 10px;
    }
    
    p {
      color: #606266;
      font-size: 16px;
    }
  }

  .demo-section {
    margin-bottom: 40px;
    
    h2 {
      color: #409EFF;
      border-bottom: 2px solid #409EFF;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    
    .demo-content {
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      
      .zx-icon {
        margin-right: 15px;
      }
      
      p {
        margin-top: 15px;
        color: #606266;
      }
      
      pre {
        background: #2d3748;
        color: #e2e8f0;
        padding: 15px;
        border-radius: 6px;
        overflow-x: auto;
        margin: 15px 0;
      }
      
      ul {
        margin: 15px 0;
        
        li {
          margin: 8px 0;
          color: #606266;
        }
      }
    }
  }
}
</style>