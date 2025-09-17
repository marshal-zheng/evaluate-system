<template>
  <div class="debug-container">
    <h2>Debug ZxDetailCard 展开收起问题</h2>
    
    <div class="debug-info">
      <p>当前展开状态: {{ isExpanded }}</p>
      <p>点击计数: {{ clickCount }}</p>
      <p>最后操作: {{ lastAction }}</p>
    </div>

    <ZxDetailCard
      title="测试卡片"
      :description="testDescription"
      :simple-show-count="3"
      @expand="handleExpand"
      @collapse="handleCollapse"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ZxDetailCard from './src/components/ZXHL/comp/pure/ZxDetailCard/index.vue'

const isExpanded = ref(false)
const clickCount = ref(0)
const lastAction = ref('无')

const testDescription = ref([
  { key: 'item1', locale: '项目1', value: '值1' },
  { key: 'item2', locale: '项目2', value: '值2' },
  { key: 'item3', locale: '项目3', value: '值3' },
  { key: 'item4', locale: '项目4', value: '值4' },
  { key: 'item5', locale: '项目5', value: '值5' },
  { key: 'item6', locale: '项目6', value: '值6' }
])

function handleExpand() {
  console.log('展开事件触发')
  isExpanded.value = true
  clickCount.value++
  lastAction.value = '展开'
}

function handleCollapse() {
  console.log('收起事件触发')
  isExpanded.value = false
  clickCount.value++
  lastAction.value = '收起'
}
</script>

<style scoped>
.debug-container {
  padding: 20px;
}

.debug-info {
  background: #f5f5f5;
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 4px;
}

.debug-info p {
  margin: 5px 0;
}
</style>