# Operators 数据优化说明

## 优化目标
让 `operators` 属性像 `initial-graph-data` 一样支持 Promise 和静态数据两种方式。

## 主要修改

### 1. DAG 组件 (`src/components/ZXHL/comp/business/Dag/index.vue`)

#### Props 类型扩展
```javascript
// 之前：只支持数组
operators: {
  type: Array,
  default: () => []
}

// 之后：支持数组、Promise、函数
operators: {
  type: [Array, Promise, Function],
  default: () => []
}
```

#### 添加 Promise 数据处理逻辑
```javascript
// 处理 operators 数据，支持 Promise 和静态数据
const operators = ref([]);
const internalOperatorsLoading = ref(false);

// 加载 operators 数据的函数
const loadOperatorsData = async (dataSource) => {
  try {
    let data;
    
    // 如果是函数，调用函数获取数据
    if (typeof dataSource === 'function') {
      data = await dataSource();
    }
    // 如果是Promise，等待解析
    else if (dataSource && typeof dataSource.then === 'function') {
      data = await dataSource;
    } else if (Array.isArray(dataSource)) {
      data = dataSource;
    } else {
      data = [];
    }
    
    operators.value = data || [];
    
  } catch (error) {
    console.error('加载算子数据失败:', error);
    operators.value = [];
  } finally {
    internalOperatorsLoading.value = false;
  }
};

// 监听 operators prop 变化
watch(operatorsProp, (newOperators) => {
  if (newOperators) {
    internalOperatorsLoading.value = true;
    loadOperatorsData(newOperators);
  }
}, { immediate: true });

// 合并加载状态
const finalOperatorsLoading = computed(() => {
  return operatorsLoading.value || internalOperatorsLoading.value;
});
```

### 2. Detail 页面 (`src/components/ZXHL/pages/indicatorSystem/designManagement/detail.vue`)

#### 添加异步数据加载函数
```javascript
// 加载算子数据 - 支持Promise和静态数据两种方式
const loadOperatorsData = async () => {
  try {
    operatorsLoading.value = true;
    
    // 模拟异步加载算子数据
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 返回更丰富的算子数据（包含 category 字段）
    const operatorsData = [
      { name: 'MySQL数据源', value: '连接MySQL数据库读取数据', category: '数据源' },
      // ... 更多数据
    ];
    
    return operatorsData;
    
  } catch (error) {
    console.error('加载算子数据失败:', error);
    return [];
  } finally {
    operatorsLoading.value = false;
  }
};
```

#### 添加数据模式切换功能
```javascript
// 数据模式切换相关
const useStaticOperators = ref(false);

const toggleOperatorsDataMode = () => {
  useStaticOperators.value = !useStaticOperators.value;
  console.log('算子数据模式切换:', useStaticOperators.value ? '静态数据' : '异步数据');
};
```

#### 模板中动态切换数据源
```vue
<DAGPage 
  :operators="useStaticOperators ? staticOperators : loadOperatorsData"
  :operators-loading="operatorsLoading"
  <!-- 其他属性 -->
/>
```

#### 新增测试按钮
```vue
<el-button 
  :type="useStaticOperators ? 'info' : 'primary'" 
  @click="toggleOperatorsDataMode"
  :loading="operatorsLoading"
>
  <el-icon><DataBoard /></el-icon>
  {{ useStaticOperators ? '使用静态数据' : '使用异步数据' }}
</el-button>
```

## 支持的数据格式

### 1. 静态数组数据
```javascript
const operators = [
  { name: 'MySQL数据源', value: '连接MySQL数据库读取数据' },
  { name: 'CSV文件读取', value: '读取本地CSV文件数据' }
];
```

### 2. Promise 数据
```javascript
const operators = loadOperatorsData(); // 返回 Promise
```

### 3. 函数数据
```javascript
const operators = () => {
  return fetch('/api/operators').then(res => res.json());
};
```

## 使用方式

### 方式一：静态数据
```vue
<DAGPage :operators="staticOperators" />
```

### 方式二：Promise 数据
```vue
<DAGPage :operators="loadOperatorsData" />
```

### 方式三：函数数据
```vue
<DAGPage :operators="() => fetchOperators()" />
```

## 特性

1. **自动处理加载状态**：内部会自动管理 Promise 数据的加载状态
2. **错误处理**：加载失败时会回退到空数组，不会导致组件崩溃
3. **响应式更新**：支持动态切换数据源
4. **向下兼容**：完全兼容原有的静态数组数据格式
5. **合并加载状态**：外部传入的 loading 状态和内部处理 Promise 的 loading 状态会自动合并

## 测试功能

在详情页面新增了一个切换按钮，可以在静态数据和异步数据之间切换，方便测试两种数据模式的效果。
