// 模版管理相关 mock 接口

export default [
  // 获取模版列表
  {
    url: '/api/template/list',
    method: 'get',
    response: ({ query }) => {
      const page = parseInt(query.page || query.pageNumber || query.current) || 1
      const size = parseInt(query.size || query.pageSize || query.limit) || 10
      
      const mockData = [
        { 
          id: 1, 
          name: '系统性能评估模版', 
          description: '用于评估系统整体性能指标的标准模版',
          evaluationScheme: 'performance_scheme',
          evaluationSchemeName: '性能评估方案',
          evaluationAlgorithm: 'weighted_average',
          evaluationAlgorithmName: '加权平均算法',
          indicatorSystem: 'performance_indicators',
          indicatorSystemName: '性能指标体系',
          createTime: '2024-01-15 10:30:00',
          updateTime: '2024-01-16 14:20:00',
          creator: '张三',
          status: 'active'
        },
        { 
          id: 2, 
          name: '安全性评估模版', 
          description: '专门用于系统安全性评估的综合模版',
          evaluationScheme: 'security_scheme',
          evaluationSchemeName: '安全评估方案',
          evaluationAlgorithm: 'fuzzy_logic',
          evaluationAlgorithmName: '模糊逻辑算法',
          indicatorSystem: 'security_indicators',
          indicatorSystemName: '安全指标体系',
          createTime: '2024-01-14 09:15:00',
          updateTime: '2024-01-15 16:45:00',
          creator: '李四',
          status: 'active'
        },
        { 
          id: 3, 
          name: '可用性评估模版', 
          description: '评估系统可用性和稳定性的专用模版',
          evaluationScheme: 'availability_scheme',
          evaluationSchemeName: '可用性评估方案',
          evaluationAlgorithm: 'neural_network',
          evaluationAlgorithmName: '神经网络算法',
          indicatorSystem: 'availability_indicators',
          indicatorSystemName: '可用性指标体系',
          createTime: '2024-01-13 14:20:00',
          updateTime: '2024-01-14 11:30:00',
          creator: '王五',
          status: 'active'
        },
        { 
          id: 4, 
          name: '综合评估模版', 
          description: '多维度综合评估模版，适用于全面系统评估',
          evaluationScheme: 'comprehensive_scheme',
          evaluationSchemeName: '综合评估方案',
          evaluationAlgorithm: 'ahp_method',
          evaluationAlgorithmName: '层次分析法',
          indicatorSystem: 'comprehensive_indicators',
          indicatorSystemName: '综合指标体系',
          createTime: '2024-01-12 08:45:00',
          updateTime: '2024-01-13 15:20:00',
          creator: '赵六',
          status: 'active'
        },
        { 
          id: 5, 
          name: '效率评估模版', 
          description: '专注于系统运行效率评估的模版',
          evaluationScheme: 'efficiency_scheme',
          evaluationSchemeName: '效率评估方案',
          evaluationAlgorithm: 'data_envelopment',
          evaluationAlgorithmName: '数据包络分析',
          indicatorSystem: 'efficiency_indicators',
          indicatorSystemName: '效率指标体系',
          createTime: '2024-01-11 16:30:00',
          updateTime: '2024-01-12 09:45:00',
          creator: '孙七',
          status: 'inactive'
        }
      ]

      // 模拟搜索过滤
      let filteredData = mockData
      if (query.keyword) {
        const keyword = query.keyword.toLowerCase()
        filteredData = mockData.filter(item => 
          item.name.toLowerCase().includes(keyword) ||
          item.description.toLowerCase().includes(keyword)
        )
      }

      // 模拟分页
      const total = filteredData.length
      const start = (page - 1) * size
      const end = start + size
      const list = filteredData.slice(start, end)

      return {
        code: 200,
        message: '获取成功',
        data: {
          list,
          total,
          page,
          size,
          pages: Math.ceil(total / size)
        }
      }
    }
  },

  // 获取模版详情
  {
    url: '/api/template/:id',
    method: 'get',
    response: ({ params }) => {
      console.log('Mock template detail - params:', params)
      if (!params || !params.id) {
        console.error('Mock template detail - missing id parameter')
        return {
          code: 400,
          message: '缺少模板ID参数',
          data: null
        }
      }
      const id = parseInt(params.id)
      const template = {
        id,
        name: '系统性能评估模版',
        description: '用于评估系统整体性能指标的标准模版，包含CPU、内存、磁盘、网络等多个维度的性能指标',
        evaluationScheme: 'performance_scheme',
        evaluationSchemeName: '性能评估方案',
        evaluationAlgorithm: 'weighted_average',
        evaluationAlgorithmName: '加权平均算法',
        indicatorSystem: 'performance_indicators',
        indicatorSystemName: '性能指标体系',
        createTime: '2024-01-15 10:30:00',
        updateTime: '2024-01-16 14:20:00',
        creator: '张三',
        status: 'active'
      }

      return {
        code: 200,
        message: '获取成功',
        data: template
      }
    }
  },

  // 创建模版
  {
    url: '/api/template/create',
    method: 'post',
    response: ({ body }) => {
      return {
        code: 200,
        message: '创建成功',
        data: {
          id: Date.now(),
          ...body,
          createTime: new Date().toLocaleString('zh-CN'),
          updateTime: new Date().toLocaleString('zh-CN'),
          creator: '当前用户',
          status: 'active'
        }
      }
    }
  },

  // 更新模版
  {
    url: '/api/template/:id',
    method: 'put',
    response: ({ params, body }) => {
      console.log('Mock template update - params:', params)
      if (!params || !params.id) {
        return {
          code: 400,
          message: '缺少模板ID参数',
          data: null
        }
      }
      return {
        code: 200,
        message: '更新成功',
        data: {
          id: parseInt(params.id),
          ...body,
          updateTime: new Date().toLocaleString('zh-CN')
        }
      }
    }
  },

  // 删除模版
  {
    url: '/api/template/:id',
    method: 'delete',
    response: ({ params }) => {
      console.log('Mock template delete - params:', params)
      if (!params || !params.id) {
        return {
          code: 400,
          message: '缺少模板ID参数',
          data: null
        }
      }
      return {
        code: 200,
        message: '删除成功',
        data: {
          id: parseInt(params.id)
        }
      }
    }
  },



  // 获取状态选项
  {
    url: '/api/template/status/options',
    method: 'get',
    response: () => {
      return {
        code: 200,
        message: '获取成功',
        data: [
          { label: '草稿', value: 'draft' },
          { label: '启用', value: 'active' },
          { label: '停用', value: 'inactive' },
          { label: '归档', value: 'archived' }
        ]
      }
    }
  }
]