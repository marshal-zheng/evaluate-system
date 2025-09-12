<template>
  <div class="zx-auto-complete-demo">
    <div class="demo-header">
      <h1>ZxAutoComplete 自动完成组件</h1>
      <p>基于 Element Plus 的增强自动完成组件，支持异步数据加载、自定义过滤和提示功能。</p>
    </div>

    <div class="demo-section">
      <h2>基础用法</h2>
      <p>最简单的用法，提供静态数据源。</p>
      <div class="demo-block">
        <ZxAutoComplete
          v-model="basicValue"
          :options="basicOptions"
          placeholder="请输入搜索内容"
          style="width: 300px"
          @select="handleBasicSelect"
        />
        <div class="demo-result">
          <p>当前值: {{ basicValue }}</p>
          <p>选中项: {{ JSON.stringify(selectedBasicItem) }}</p>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h2>带提示的自动完成</h2>
      <p>为输入框添加提示信息，提升用户体验。</p>
      <div class="demo-block">
        <ZxAutoComplete
          v-model="tooltipValue"
          :options="basicOptions"
          :tooltip="{
            title: '搜索提示',
            content: '输入关键词进行搜索，支持模糊匹配'
          }"
          placeholder="带提示的自动完成"
          style="width: 300px"
        />
      </div>
    </div>

    <div class="demo-section">
      <h2>异步数据加载</h2>
      <p>支持异步函数作为数据源，适用于远程搜索场景。</p>
      <div class="demo-block">
        <ZxAutoComplete
          v-model="asyncValue"
          :options="loadAsyncOptions"
          placeholder="异步加载数据"
          style="width: 300px"
          @select="handleAsyncSelect"
        />
        <div class="demo-result">
          <p>当前值: {{ asyncValue }}</p>
          <p>选中项: {{ JSON.stringify(selectedAsyncItem) }}</p>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h2>自定义过滤</h2>
      <p>使用自定义过滤函数，实现更精确的搜索逻辑。</p>
      <div class="demo-block">
        <ZxAutoComplete
          v-model="customFilterValue"
          :options="customFilterOptions"
          :filter-option="customFilter"
          placeholder="自定义过滤规则"
          style="width: 300px"
        />
        <div class="demo-result">
          <p>当前值: {{ customFilterValue }}</p>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h2>禁用清除按钮</h2>
      <p>通过设置 allowClear 为 false 禁用清除按钮。</p>
      <div class="demo-block">
        <ZxAutoComplete
          v-model="noClearValue"
          :options="basicOptions"
          :allow-clear="false"
          placeholder="不可清除"
          style="width: 300px"
        />
      </div>
    </div>

    <div class="demo-section">
      <h2>不同尺寸</h2>
      <p>提供大、中、小三种尺寸。</p>
      <div class="demo-block">
        <div class="size-demo">
          <div class="size-item">
            <label>大尺寸:</label>
            <ZxAutoComplete
              v-model="sizeValue1"
              :options="basicOptions"
              size="large"
              placeholder="大尺寸"
              style="width: 200px"
            />
          </div>
          <div class="size-item">
            <label>默认尺寸:</label>
            <ZxAutoComplete
              v-model="sizeValue2"
              :options="basicOptions"
              placeholder="默认尺寸"
              style="width: 200px"
            />
          </div>
          <div class="size-item">
            <label>小尺寸:</label>
            <ZxAutoComplete
              v-model="sizeValue3"
              :options="basicOptions"
              size="small"
              placeholder="小尺寸"
              style="width: 200px"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import ZxAutoComplete from './index.vue'

// 基础用法
const basicValue = ref('')
const selectedBasicItem = ref(null)
const basicOptions = ref([
  { label: 'Vue.js', value: 'vue' },
  { label: 'React', value: 'react' },
  { label: 'Angular', value: 'angular' },
  { label: 'Svelte', value: 'svelte' },
  { label: 'Next.js', value: 'nextjs' },
  { label: 'Nuxt.js', value: 'nuxtjs' },
  { label: 'Vite', value: 'vite' },
  { label: 'Webpack', value: 'webpack' }
])

// 带提示
const tooltipValue = ref('')

// 异步数据
const asyncValue = ref('')
const selectedAsyncItem = ref(null)

// 自定义过滤
const customFilterValue = ref('')
const customFilterOptions = ref([
  { label: 'JavaScript 开发工程师', value: 'js-dev', category: 'frontend' },
  { label: 'Python 开发工程师', value: 'py-dev', category: 'backend' },
  { label: 'Java 开发工程师', value: 'java-dev', category: 'backend' },
  { label: 'UI/UX 设计师', value: 'ui-designer', category: 'design' },
  { label: '产品经理', value: 'pm', category: 'product' },
  { label: '数据分析师', value: 'data-analyst', category: 'data' }
])

// 禁用清除
const noClearValue = ref('')

// 不同尺寸
const sizeValue1 = ref('')
const sizeValue2 = ref('')
const sizeValue3 = ref('')

// 方法
const handleBasicSelect = (item) => {
  selectedBasicItem.value = item
  ElMessage.success(`选中了: ${item.label}`)
}

const handleAsyncSelect = (item) => {
  selectedAsyncItem.value = item
  ElMessage.success(`异步选中了: ${item.label}`)
}

// 模拟异步数据加载
const loadAsyncOptions = async (query) => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const mockData = [
    { label: '北京市', value: 'beijing' },
    { label: '上海市', value: 'shanghai' },
    { label: '广州市', value: 'guangzhou' },
    { label: '深圳市', value: 'shenzhen' },
    { label: '杭州市', value: 'hangzhou' },
    { label: '南京市', value: 'nanjing' },
    { label: '武汉市', value: 'wuhan' },
    { label: '成都市', value: 'chengdu' }
  ]
  
  // 根据查询参数过滤数据
  if (query && query.trim()) {
    return mockData.filter(item => 
      item.label.includes(query) || item.value.includes(query)
    )
  }
  
  return mockData
}

// 自定义过滤函数
const customFilter = (queryString, item) => {
  // 支持按标签、值和分类进行搜索
  const query = queryString.toLowerCase()
  return (
    item.label.toLowerCase().includes(query) ||
    item.value.toLowerCase().includes(query) ||
    item.category.toLowerCase().includes(query)
  )
}
</script>

<style lang="scss" scoped>
.zx-auto-complete-demo {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;

  .demo-header {
    margin-bottom: 40px;
    text-align: center;

    h1 {
      color: var(--el-text-color-primary);
      margin-bottom: 10px;
    }

    p {
      color: var(--el-text-color-regular);
      font-size: 14px;
    }
  }

  .demo-section {
    margin-bottom: 40px;
    padding: 20px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    background: var(--el-bg-color-page);

    h2 {
      color: var(--el-text-color-primary);
      margin-bottom: 10px;
      font-size: 18px;
    }

    p {
      color: var(--el-text-color-regular);
      margin-bottom: 20px;
      font-size: 14px;
    }

    .demo-block {
      .demo-result {
        margin-top: 15px;
        padding: 10px;
        background: var(--el-fill-color-lighter);
        border-radius: 4px;
        font-size: 12px;
        color: var(--el-text-color-secondary);

        p {
          margin: 5px 0;
        }
      }

      .size-demo {
        display: flex;
        flex-direction: column;
        gap: 15px;

        .size-item {
          display: flex;
          align-items: center;
          gap: 10px;

          label {
            width: 80px;
            font-size: 14px;
            color: var(--el-text-color-regular);
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .zx-auto-complete-demo {
    padding: 10px;

    .demo-section {
      padding: 15px;

      .demo-block {
        .size-demo {
          .size-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 5px;

            label {
              width: auto;
            }
          }
        }
      }
    }
  }
}
</style>