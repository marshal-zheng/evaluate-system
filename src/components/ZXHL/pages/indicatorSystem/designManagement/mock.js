// 指标体系管理 Mock 数据和 API

// 模拟指标体系数据
const mockIndicatorSystems = [
  {
    id: 'IS001',
    name: '企业管理效能评估体系',
    category: 'management_efficiency',
    description: '用于评估企业管理层面的效能指标，包括决策效率、执行能力、协调能力等维度',
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-03-20 14:20:00',
    creator: '张经理'
  },
  {
    id: 'IS002',
    name: '技术能力评估指标体系',
    category: 'technical_capability',
    description: '针对技术团队和技术能力的综合评估指标体系',
    createTime: '2024-02-01 09:15:00',
    updateTime: '2024-03-18 16:45:00',
    creator: '李工程师'
  },
  {
    id: 'IS003',
    name: '服务质量评价体系',
    category: 'service_quality',
    description: '用于评估客户服务质量和满意度的指标体系',
    createTime: '2024-02-10 11:20:00',
    updateTime: '2024-03-15 13:30:00',
    creator: '王主管'
  },
  {
    id: 'IS004',
    name: '创新能力评估框架',
    category: 'innovation_capability',
    description: '评估组织创新能力和创新成果的综合指标体系',
    createTime: '2024-02-20 14:00:00',
    updateTime: '2024-03-22 10:15:00',
    creator: '陈博士'
  },
  {
    id: 'IS005',
    name: '风险控制指标体系',
    category: 'risk_control',
    description: '用于识别、评估和控制各类业务风险的指标体系',
    createTime: '2024-03-01 15:45:00',
    updateTime: '2024-03-25 09:20:00',
    creator: '赵总监'
  },
  {
    id: 'IS006',
    name: '资源配置效率评估',
    category: 'resource_allocation',
    description: '评估人力、物力、财力等资源配置合理性和效率的指标体系',
    createTime: '2024-03-05 08:30:00',
    updateTime: '2024-03-26 17:10:00',
    creator: '钱经理'
  },
  {
    id: 'IS007',
    name: '人员素质评价体系',
    category: 'personnel_quality',
    description: '全面评估员工专业能力、综合素质和发展潜力的指标体系',
    createTime: '2024-03-10 12:00:00',
    updateTime: '2024-03-28 11:40:00',
    creator: '孙HR'
  },
  {
    id: 'IS008',
    name: '成本控制评估指标',
    category: 'cost_control',
    description: '用于监控和评估各项成本控制措施有效性的指标体系',
    createTime: '2024-03-12 16:20:00',
    updateTime: '2024-03-30 14:55:00',
    creator: '周财务'
  }
]

// 分类选项
const categoryOptions = [
  { label: '管理效能', value: 'management_efficiency' },
  { label: '技术能力', value: 'technical_capability' },
  { label: '服务质量', value: 'service_quality' },
  { label: '创新能力', value: 'innovation_capability' },
  { label: '风险控制', value: 'risk_control' },
  { label: '资源配置', value: 'resource_allocation' },
  { label: '人员素质', value: 'personnel_quality' },
  { label: '成本控制', value: 'cost_control' }
]

// 生成ID
const generateId = () => {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return `IS${timestamp}${random}`
}

// 模拟延迟
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

// 指标体系 API
export const indicatorSystemApi = {
  // 获取列表
  async getList(params = {}) {
    await delay()
    
    const { 
      page = 1, 
      size = 10, 
      keyword = '', 
      category = '' 
    } = params

    let filteredData = [...mockIndicatorSystems]

    // 关键词搜索
    if (keyword) {
      filteredData = filteredData.filter(item => 
        item.name.toLowerCase().includes(keyword.toLowerCase()) ||
        item.description.toLowerCase().includes(keyword.toLowerCase())
      )
    }

    // 分类筛选
    if (category) {
      filteredData = filteredData.filter(item => item.category === category)
    }

    // 分页
    const total = filteredData.length
    const start = (page - 1) * size
    const end = start + size
    const list = filteredData.slice(start, end)

    return {
      success: true,
      data: {
        list,
        total,
        page: Number(page),
        size: Number(size),
        pages: Math.ceil(total / size)
      }
    }
  },

  // 获取详情
  async getDetail(id) {
    await delay()
    
    const item = mockIndicatorSystems.find(item => item.id === id)
    if (item) {
      return {
        success: true,
        data: { ...item }
      }
    } else {
      return {
        success: false,
        message: '指标体系不存在'
      }
    }
  },

  // 创建
  async create(data) {
    await delay()
    
    const newItem = {
      ...data,
      id: generateId(),
      createTime: new Date().toLocaleString(),
      updateTime: new Date().toLocaleString(),
      creator: '当前用户'
    }
    
    mockIndicatorSystems.unshift(newItem)
    
    return {
      success: true,
      data: newItem,
      message: '创建成功'
    }
  },

  // 更新
  async update(data) {
    await delay()
    
    const index = mockIndicatorSystems.findIndex(item => item.id === data.id)
    if (index !== -1) {
      mockIndicatorSystems[index] = {
        ...mockIndicatorSystems[index],
        ...data,
        updateTime: new Date().toLocaleString()
      }
      
      return {
        success: true,
        data: mockIndicatorSystems[index],
        message: '更新成功'
      }
    } else {
      return {
        success: false,
        message: '指标体系不存在'
      }
    }
  },

  // 删除
  async delete(id) {
    await delay()
    
    const index = mockIndicatorSystems.findIndex(item => item.id === id)
    if (index !== -1) {
      mockIndicatorSystems.splice(index, 1)
      return {
        success: true,
        message: '删除成功'
      }
    } else {
      return {
        success: false,
        message: '指标体系不存在'
      }
    }
  },

  // 导出模版
  async exportTemplate(id) {
    await delay(1000) // 模拟较长的处理时间
    
    const item = mockIndicatorSystems.find(item => item.id === id)
    if (item) {
      return {
        success: true,
        data: {
          downloadUrl: `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${btoa('模拟Excel文件内容')}`
        },
        message: '导出成功'
      }
    } else {
      return {
        success: false,
        message: '指标体系不存在'
      }
    }
  },

  // 导入
  async import(formData) {
    await delay(2000) // 模拟较长的处理时间
    
    // 模拟导入成功
    return {
      success: true,
      data: {
        importCount: Math.floor(Math.random() * 10) + 1
      },
      message: '导入成功'
    }
  },

  // 导出列表
  async export() {
    await delay(1500) // 模拟较长的处理时间
    
    return {
      success: true,
      data: {
        downloadUrl: `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${btoa('模拟Excel列表文件内容')}`
      },
      message: '导出成功'
    }
  },

  // 获取分类选项
  async getCategoryOptions() {
    await delay(100)
    
    return {
      success: true,
      data: categoryOptions
    }
  }
}

// 默认导出
export default {
  indicatorSystemApi,
  mockIndicatorSystems,
  categoryOptions
}