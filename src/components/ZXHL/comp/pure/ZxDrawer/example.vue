<template>
  <div class="zx-drawer-example">
    <div class="example-header">
      <h2>ZxDrawer 组件示例</h2>
      <p>基于 Element Plus 的抽屉组件，支持多种配置和交互方式</p>
    </div>

    <div class="example-controls">
      <el-space wrap>
        <el-button type="primary" @click="openBasicDrawer">
          基础抽屉
        </el-button>
        <el-button type="success" @click="openFullScreenDrawer">
          全屏功能抽屉
        </el-button>
        <el-button type="info" @click="openResizableDrawer">
          可拖拽宽度抽屉
        </el-button>
        <el-button type="warning" @click="openDescriptionDrawer">
          描述列表抽屉
        </el-button>
        <el-button type="danger" @click="openNoMaskDrawer">
          无遮罩抽屉
        </el-button>
      </el-space>
    </div>

    <!-- 主题切换 -->
    <div class="theme-controls">
      <el-space>
        <span>主题切换：</span>
        <el-button 
          :type="currentTheme === 'light' ? 'primary' : 'default'"
          @click="switchTheme('light')"
        >
          浅色
        </el-button>
        <el-button 
          :type="currentTheme === 'dark-blue' ? 'primary' : 'default'"
          @click="switchTheme('dark-blue')"
        >
          深蓝色
        </el-button>
        <span>当前主题：{{ currentTheme }}</span>
      </el-space>
    </div>

    <!-- 动态抽屉 - 懒加载 -->
    <ZxDrawer
      v-if="currentDrawer"
      v-model="drawerVisible"
      :title="currentDrawer.title"
      :show-full-screen="currentDrawer.showFullScreen"
      :width="currentDrawer.width"
      :disabled-width-drag="currentDrawer.disabledWidthDrag"
      :descriptions="currentDrawer.descriptions"
      :mask="currentDrawer.mask"
      @confirm="currentDrawer.onConfirm"
      @cancel="handleDrawerCancel"
    >
      <template v-if="currentDrawer.content" v-html="currentDrawer.content"></template>
      <component v-else-if="currentDrawer.component" :is="currentDrawer.component" />
      
      <template v-if="currentDrawer.hasDescSlot" #descValue="{ item }">
        <span v-if="item.label === '状态'">
          <el-tag :type="item.value === '正常' ? 'success' : 'danger'">
            {{ item.value }}
          </el-tag>
        </span>
        <span v-else>{{ item.value }}</span>
      </template>
    </ZxDrawer>
  </div>
</template>

<script setup>
import { ref, reactive, defineComponent, h } from 'vue'
import { ElMessage, ElForm, ElFormItem, ElInput, ElAlert, ElTable, ElTableColumn, ElCard, ElTag } from 'element-plus'
import ZxDrawer from './index.vue'
import { useTheme } from '@/composables/useTheme.js'

// 主题管理
const { currentTheme, switchTheme } = useTheme()

// 动态drawer配置
const drawerVisible = ref(false)
const currentDrawer = ref(null)

// 表单数据
const form = reactive({
  username: '',
  email: '',
  description: ''
})

// 表格数据
const tableData = [
  { name: '张三', age: 25, address: '北京市朝阳区' },
  { name: '李四', age: 30, address: '上海市浦东新区' },
  { name: '王五', age: 28, address: '广州市天河区' },
  { name: '赵六', age: 32, address: '深圳市南山区' }
]

// 描述列表数据
const descriptions = [
  { label: '用户ID', value: 'U001' },
  { label: '用户名', value: '张三' },
  { label: '邮箱', value: 'zhangsan@example.com' },
  { label: '手机号', value: '138****8888' },
  { label: '注册时间', value: '2023-01-15 10:30:00' },
  { label: '最后登录', value: '2024-01-15 14:25:30' },
  { label: '状态', value: '正常' },
  { label: '角色', value: '普通用户' },
  { label: '部门', value: '技术部' },
  { label: '备注', value: '这是一个测试用户账号，用于演示描述列表功能。' }
]

// 创建动态组件
const createBasicContent = () => {
  return defineComponent({
    setup() {
      return () => h('div', { class: 'test-content' }, [
        h('h3', '基础抽屉内容'),
        h('p', '这是一个基础的抽屉组件示例。'),
        h(ElForm, { model: form, labelWidth: '120px' }, {
          default: () => [
            h(ElFormItem, { label: '用户名' }, {
              default: () => h(ElInput, {
                modelValue: form.username,
                'onUpdate:modelValue': (val) => form.username = val,
                placeholder: '请输入用户名'
              })
            }),
            h(ElFormItem, { label: '邮箱' }, {
              default: () => h(ElInput, {
                modelValue: form.email,
                'onUpdate:modelValue': (val) => form.email = val,
                placeholder: '请输入邮箱'
              })
            }),
            h(ElFormItem, { label: '描述' }, {
              default: () => h(ElInput, {
                modelValue: form.description,
                'onUpdate:modelValue': (val) => form.description = val,
                type: 'textarea',
                rows: 4,
                placeholder: '请输入描述'
              })
            })
          ]
        })
      ])
    }
  })
}

const createFullScreenContent = () => {
  return defineComponent({
    setup() {
      return () => h('div', { class: 'test-content' }, [
        h('h3', '支持全屏切换的抽屉'),
        h('p', '点击右上角的全屏按钮可以切换全屏模式。'),
        h(ElAlert, {
          title: '全屏提示',
          type: 'info',
          description: '在全屏模式下，抽屉会占据整个屏幕宽度，提供更大的操作空间。',
          showIcon: true,
          closable: false
        }),
        h('div', { style: 'margin-top: 20px;' }, [
          h(ElTable, { data: tableData, style: 'width: 100%' }, {
            default: () => [
              h(ElTableColumn, { prop: 'name', label: '姓名', width: '180' }),
              h(ElTableColumn, { prop: 'age', label: '年龄', width: '180' }),
              h(ElTableColumn, { prop: 'address', label: '地址' })
            ]
          })
        ])
      ])
    }
  })
}

const createResizableContent = () => {
  return defineComponent({
    setup() {
      return () => h('div', { class: 'test-content' }, [
        h('h3', '可拖拽调整宽度'),
        h('p', '将鼠标悬停在抽屉左边缘，可以拖拽调整抽屉宽度。'),
        h(ElAlert, {
          title: '拖拽提示',
          type: 'success',
          description: '拖拽左边缘的手柄可以调整抽屉宽度，最小宽度为初始宽度，最大宽度为屏幕宽度的90%。',
          showIcon: true,
          closable: false
        }),
        h('div', { style: 'margin-top: 20px;' }, [
          h(ElCard, {}, {
            header: () => h('span', '示例卡片'),
            default: () => [
              h('p', '这是一个示例卡片内容，用于测试拖拽调整宽度时的内容适应性。'),
              h('p', '当抽屉宽度改变时，内容应该能够正确地重新布局。')
            ]
          })
        ])
      ])
    }
  })
}

const createNoMaskContent = () => {
  return defineComponent({
    setup() {
      return () => h('div', { class: 'test-content' }, [
        h('h3', '无遮罩模式'),
        h('p', '这个抽屉没有背景遮罩，可以与页面其他内容交互。'),
        h(ElAlert, {
          title: '无遮罩提示',
          type: 'warning',
          description: '在无遮罩模式下，用户可以与页面其他元素交互，适合辅助信息展示。',
          showIcon: true,
          closable: false
        })
      ])
    }
  })
}

// Drawer配置工厂函数
const createDrawerConfig = (type) => {
  const configs = {
    basic: {
      title: '基础抽屉',
      width: 480,
      showFullScreen: false,
      disabledWidthDrag: true,
      mask: true,
      component: createBasicContent(),
      onConfirm: () => {
        ElMessage.success('确认操作成功！')
        handleDrawerCancel()
      }
    },
    fullScreen: {
      title: '全屏功能抽屉',
      width: 600,
      showFullScreen: true,
      disabledWidthDrag: true,
      mask: true,
      component: createFullScreenContent(),
      onConfirm: () => {
        ElMessage.success('确认操作成功！')
        handleDrawerCancel()
      }
    },
    resizable: {
      title: '可拖拽宽度抽屉',
      width: 480,
      showFullScreen: false,
      disabledWidthDrag: false,
      mask: true,
      component: createResizableContent(),
      onConfirm: () => {
        ElMessage.success('确认操作成功！')
        handleDrawerCancel()
      }
    },
    description: {
      title: '描述列表抽屉',
      width: 480,
      showFullScreen: false,
      disabledWidthDrag: true,
      mask: true,
      descriptions: descriptions,
      hasDescSlot: true,
      onConfirm: () => {
        ElMessage.success('确认操作成功！')
        handleDrawerCancel()
      }
    },
    noMask: {
      title: '无遮罩抽屉',
      width: 400,
      showFullScreen: false,
      disabledWidthDrag: true,
      mask: false,
      component: createNoMaskContent(),
      onConfirm: () => {
        ElMessage.success('确认操作成功！')
        handleDrawerCancel()
      }
    }
  }
  return configs[type]
}

// 显示drawer的统一方法
const showDrawer = (type) => {
  currentDrawer.value = createDrawerConfig(type)
  drawerVisible.value = true
}

// 打开抽屉的方法
const openBasicDrawer = () => {
  showDrawer('basic')
}

const openFullScreenDrawer = () => {
  showDrawer('fullScreen')
}

const openResizableDrawer = () => {
  showDrawer('resizable')
}

const openDescriptionDrawer = () => {
  showDrawer('description')
}

const openNoMaskDrawer = () => {
  showDrawer('noMask')
}

// 处理drawer取消/关闭
const handleDrawerCancel = () => {
  drawerVisible.value = false
  ElMessage.info('已取消操作')
  // 延迟清空配置，确保动画完成
  setTimeout(() => {
    currentDrawer.value = null
  }, 300)
}
</script>

<style lang="scss" scoped>
.zx-drawer-example {
  padding: 20px;
  min-height: 100vh;
  background-color: var(--el-bg-color-page);
}

.example-header {
  text-align: center;
  margin-bottom: 40px;
  
  h2 {
    color: var(--el-text-color-primary);
    margin-bottom: 10px;
  }
  
  p {
    color: var(--el-text-color-secondary);
    font-size: 16px;
  }
}

.example-controls {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
  
  .el-button {
    margin: 0 8px 8px 0;
  }
}

.theme-controls {
  margin-bottom: 24px;
  padding: 16px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
  border: 1px solid var(--el-border-color);
  
  span {
    color: var(--el-text-color-primary);
    font-weight: 500;
  }
}

.test-content {
  h3 {
    color: var(--el-text-color-primary);
    margin-bottom: 16px;
  }
  
  p {
    color: var(--el-text-color-regular);
    line-height: 1.6;
    margin-bottom: 16px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .zx-drawer-example {
    padding: 16px;
  }
  
  .example-controls {
    .el-button {
      width: 100%;
      margin: 0 0 8px 0;
    }
  }
}
</style>