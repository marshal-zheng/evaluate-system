<template>
  <div class="indicator-dag-test">
    <h2>指标DAG编辑器测试</h2>
    
    <div class="test-controls">
      <el-button @click="toggleSideNav">
        {{ testConfig.isShowSideNav ? '隐藏' : '显示' }}左侧导航
      </el-button>
      <el-button @click="toggleEditable">
        {{ testConfig.isEditable ? '设为只读' : '设为可编辑' }}
      </el-button>
      <el-button @click="getSaveData" type="primary">
        获取保存数据
      </el-button>
      <el-button @click="forceRefresh" type="warning">
        强制刷新图形
      </el-button>
    </div>
    
    <div class="test-editor">
      <IndicatorDagEditor
        ref="editorRef"
        :key="refreshKey"
        :list-data="testListData"
        :graph-data="testGraphData"
        :is-show-side-nav="testConfig.isShowSideNav"
        :is-editable="testConfig.isEditable"
        @save="handleSave"
        @edit-node="handleEditNode"
        @delete-node="handleDeleteNode"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import IndicatorDagEditor from './IndicatorDagEditor.vue'
import { ElMessage } from 'element-plus'
import graphDataJson from './data.json'

// 编辑器引用
const editorRef = ref(null)
const refreshKey = ref(0)

// 测试配置
const testConfig = reactive({
  isShowSideNav: true,
  isEditable: true
})

// 测试用的基础指标数据
const testListData = [
  { name: '用户满意度', value: '衡量用户对产品或服务的满意程度' },
  { name: '系统响应时间', value: '系统处理请求并返回结果的时间' },
  { name: '错误率', value: '系统运行过程中出现错误的比率' },
  { name: '转化率', value: '访问用户中完成目标行为的比率' },
  { name: '活跃用户数', value: '在特定时间段内使用产品的用户数量' }
]

// 测试用的图数据 - 使用静态数据
const testGraphData = graphDataJson

// 调试信息
console.log('test.vue - 图数据:', testGraphData)
console.log('test.vue - 节点数量:', testGraphData?.nodes?.length)
console.log('test.vue - 边数量:', testGraphData?.edges?.length)


// 控制函数
const toggleSideNav = () => {
  testConfig.isShowSideNav = !testConfig.isShowSideNav
}

const toggleEditable = () => {
  testConfig.isEditable = !testConfig.isEditable
}


const getSaveData = () => {
  if (editorRef.value) {
    const data = editorRef.value.getSaveData()
    console.log('获取到的保存数据:', data)
    ElMessage.success('数据已获取，请查看控制台')
  }
}

const forceRefresh = () => {
  console.log('强制刷新图形')
  // 通过改变key来强制重新渲染组件
  refreshKey.value++
  ElMessage.info('图形已强制刷新')
}

// 事件处理函数
const handleSave = (graphData) => {
  console.log('保存图数据:', graphData)
  ElMessage.success('图数据已保存')
}

const handleEditNode = (node) => {
  console.log('编辑节点:', node)
  ElMessage.info(`正在编辑节点: ${node?.getData?.()?.label || '未知节点'}`)
}

const handleDeleteNode = (node) => {
  console.log('删除节点:', node)
  ElMessage.warning(`已删除节点: ${node?.getData?.()?.label || '未知节点'}`)
}
</script>

<style scoped>
.indicator-dag-test {
  padding: 20px;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.indicator-dag-test h2 {
  margin-bottom: 20px;
  color: #303133;
}

.test-controls {
  margin-bottom: 20px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.test-editor {
  flex: 1;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}
</style>
