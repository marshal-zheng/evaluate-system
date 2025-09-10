&lt;template&gt;
  &lt;div class="theme-demo" :class="themeClass" :style="themeStyle"&gt;
    &lt;el-card class="demo-card"&gt;
      &lt;template #header&gt;
        &lt;div class="card-header"&gt;
          &lt;h3&gt;深蓝色主题演示&lt;/h3&gt;
          &lt;el-button-group&gt;
            &lt;el-button 
              :type="currentTheme === 'light' ? 'primary' : 'default'"
              @click="switchTheme('light')"
            &gt;
              浅色
            &lt;/el-button&gt;
            &lt;el-button 
              :type="currentTheme === 'dark' ? 'primary' : 'default'"
              @click="switchTheme('dark')"
            &gt;
              深色
            &lt;/el-button&gt;
            &lt;el-button 
              :type="currentTheme === 'dark-blue' ? 'primary' : 'default'"
              @click="applyDarkBlue"
            &gt;
              深蓝色
            &lt;/el-button&gt;
          &lt;/el-button-group&gt;
        &lt;/div&gt;
      &lt;/template&gt;
      
      &lt;div class="demo-content"&gt;
        &lt;p&gt;当前主题：{{ currentTheme }}&lt;/p&gt;
        
        &lt;el-row :gutter="20"&gt;
          &lt;el-col :span="12"&gt;
            &lt;h4&gt;表单组件&lt;/h4&gt;
            &lt;el-form :model="form" label-width="80px"&gt;
              &lt;el-form-item label="用户名"&gt;
                &lt;el-input v-model="form.username" placeholder="请输入用户名" /&gt;
              &lt;/el-form-item&gt;
              &lt;el-form-item label="密码"&gt;
                &lt;el-input 
                  v-model="form.password" 
                  type="password" 
                  placeholder="请输入密码" 
                /&gt;
              &lt;/el-form-item&gt;
              &lt;el-form-item label="性别"&gt;
                &lt;el-select v-model="form.gender" placeholder="请选择"&gt;
                  &lt;el-option label="男" value="male" /&gt;
                  &lt;el-option label="女" value="female" /&gt;
                &lt;/el-select&gt;
              &lt;/el-form-item&gt;
              &lt;el-form-item&gt;
                &lt;el-button type="primary"&gt;提交&lt;/el-button&gt;
                &lt;el-button&gt;重置&lt;/el-button&gt;
              &lt;/el-form-item&gt;
            &lt;/el-form&gt;
          &lt;/el-col&gt;
          
          &lt;el-col :span="12"&gt;
            &lt;h4&gt;其他组件&lt;/h4&gt;
            &lt;div class="component-demo"&gt;
              &lt;el-tag&gt;默认标签&lt;/el-tag&gt;
              &lt;el-tag type="success"&gt;成功标签&lt;/el-tag&gt;
              &lt;el-tag type="warning"&gt;警告标签&lt;/el-tag&gt;
              &lt;el-tag type="danger"&gt;危险标签&lt;/el-tag&gt;
            &lt;/div&gt;
            
            &lt;div class="component-demo"&gt;
              &lt;el-switch v-model="switchValue" /&gt;
              &lt;el-checkbox v-model="checkboxValue"&gt;复选框&lt;/el-checkbox&gt;
              &lt;el-radio v-model="radioValue" label="radio"&gt;单选框&lt;/el-radio&gt;
            &lt;/div&gt;
            
            &lt;div class="component-demo"&gt;
              &lt;el-progress :percentage="progressValue" /&gt;
              &lt;el-slider v-model="progressValue" /&gt;
            &lt;/div&gt;
          &lt;/el-col&gt;
        &lt;/el-row&gt;
        
        &lt;el-divider&gt;数据表格&lt;/el-divider&gt;
        
        &lt;el-table :data="tableData" style="width: 100%"&gt;
          &lt;el-table-column prop="name" label="姓名" width="180" /&gt;
          &lt;el-table-column prop="age" label="年龄" width="180" /&gt;
          &lt;el-table-column prop="address" label="地址" /&gt;
          &lt;el-table-column label="操作"&gt;
            &lt;template #default&gt;
              &lt;el-button type="primary" size="small"&gt;编辑&lt;/el-button&gt;
              &lt;el-button type="danger" size="small"&gt;删除&lt;/el-button&gt;
            &lt;/template&gt;
          &lt;/el-table-column&gt;
        &lt;/el-table&gt;
      &lt;/div&gt;
    &lt;/el-card&gt;
  &lt;/div&gt;
&lt;/template&gt;

&lt;script setup&gt;
import { ref } from 'vue'
import { useTheme } from '@/composables/useTheme.js'

// 使用主题
const { 
  currentTheme, 
  switchTheme, 
  applyDarkBlue, 
  themeClass, 
  themeStyle 
} = useTheme()

// 表单数据
const form = ref({
  username: '',
  password: '',
  gender: ''
})

// 组件状态
const switchValue = ref(false)
const checkboxValue = ref(false)
const radioValue = ref('')
const progressValue = ref(30)

// 表格数据
const tableData = ref([
  {
    name: '张三',
    age: 25,
    address: '北京市朝阳区'
  },
  {
    name: '李四',
    age: 28,
    address: '上海市浦东新区'
  },
  {
    name: '王五',
    age: 32,
    address: '广州市天河区'
  }
])
&lt;/script&gt;

&lt;style scoped&gt;
.theme-demo {
  min-height: 100vh;
  padding: 20px;
  transition: background-color 0.3s, color 0.3s;
}

.demo-card {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.demo-content {
  margin-top: 20px;
}

.component-demo {
  margin: 15px 0;
  display: flex;
  gap: 10px;
  align-items: center;
}

.component-demo .el-tag {
  margin-right: 10px;
}

h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: var(--el-text-color-primary);
}

p {
  color: var(--el-text-color-regular);
}

/* 确保在深蓝色主题下的样式 */
.theme-dark-blue {
  background-color: var(--el-bg-color);
  color: var(--el-text-color-primary);
}

.theme-dark-blue .demo-card {
  background-color: var(--el-fill-color);
  border-color: var(--el-border-color);
}

.theme-dark-blue .el-divider__text {
  color: var(--el-text-color-primary);
}
&lt;/style&gt;
