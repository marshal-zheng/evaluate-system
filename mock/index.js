/**
 * Mock数据配置入口文件
 * 统一管理所有mock接口
 */

// 导出mock接口配置
export default [
  // 评估任务列表
  {
    url: '/api/evaluation/list',
    method: 'get',
    response: ({ query }) => {
      const page = parseInt(query.page) || 1
      const size = parseInt(query.size) || 10
      
      // 模拟评估任务数据
      const mockData = [
        {
          id: 1,
          name: '系统A性能评估',
          type: '性能评估',
          status: 'completed',
          progress: 100,
          score: 95.6,
          createTime: '2024-01-15 10:30:00'
        },
        {
          id: 2,
          name: '系统B安全性评估',
          type: '安全评估',
          status: 'running',
          progress: 65,
          score: null,
          createTime: '2024-01-14 14:20:00'
        },
        {
          id: 3,
          name: '系统C准确性评估',
          type: '准确性评估',
          status: 'pending',
          progress: 0,
          score: null,
          createTime: '2024-01-13 09:15:00'
        },
        {
          id: 4,
          name: '系统D响应时间评估',
          type: '性能评估',
          status: 'failed',
          progress: 30,
          score: null,
          createTime: '2024-01-12 16:45:00'
        },
        {
          id: 5,
          name: '系统E功能评估',
          type: '功能评估',
          status: 'completed',
          progress: 100,
          score: 88.9,
          createTime: '2024-01-11 11:30:00'
        }
      ]
      
      // 模拟分页
      const total = 5
      const start = (page - 1) * size
      const end = start + size
      const list = mockData.slice(start, end)
      
      return {
        code: 200,
        message: '获取成功',
        data: {
          list,
          total,
          page,
          size
        }
      }
    }
  },

  // 评估结果接口
  {
    url: '/api/evaluation/result',
    method: 'get',
    response: ({ query }) => {
      return {
        success: true,
        code: "200",
        msg: "SUCCESS",
        data: {
          zhpgObjectResultList: [
            [
              "0.85", "0.82", "0.79", "0.76", "0.81", "0.84", "0.80", "0.83", "0.78",
              "0.80", "0.82", "0.85", "0.81", "0.79", "0.83", "0.87", "0.89"
            ],
            [
              "0.75", "0.72", "0.69", "0.66", "0.71", "0.74", "0.70", "0.73", "0.68",
              "0.70", "0.72", "0.75", "0.71", "0.69", "0.73", "0.77", "0.79"
            ]
          ],
          detailNames: [
            "系统效能评估",
            "处理能力",
            "稳定性",
            "响应能力",
            "可靠性",
            "容错率",
            "恢复率",
            "响应时间",
            "传输速率",
            "工作效率",
            "处理效率",
            "准确率",
            "发现问题",
            "解决用时",
            "跟踪用时",
            "识别用时",
            "精确度"
          ],
          titleList: [
            "方案A",
            "方案B"
          ],
          type: "1"
        }
      }
    }
  },

  // 动态评估结果接口（支持不同参数）
  {
    url: '/api/evaluation/result/dynamic',
    method: 'get',
    response: ({ query }) => {
      const scenario = query.scenario || 'default'
      
      // 根据不同场景返回不同的评估数据
      const scenarios = {
        default: {
          zhpgObjectResultList: [
            [
              "0.85", "0.82", "0.79", "0.76", "0.81", "0.84", "0.80", "0.83", "0.78",
              "0.80", "0.82", "0.85", "0.81", "0.79", "0.83", "0.87", "0.89"
            ],
            [
              "0.75", "0.72", "0.69", "0.66", "0.71", "0.74", "0.70", "0.73", "0.68",
              "0.70", "0.72", "0.75", "0.71", "0.69", "0.73", "0.77", "0.79"
            ]
          ],
          titleList: ["方案A", "方案B"]
        },
        scenario1: {
          zhpgObjectResultList: [
            [
              "0.90", "0.87", "0.84", "0.81", "0.86", "0.89", "0.85", "0.88", "0.83",
              "0.85", "0.87", "0.90", "0.86", "0.84", "0.88", "0.92", "0.94"
            ],
            [
              "0.80", "0.77", "0.74", "0.71", "0.76", "0.79", "0.75", "0.78", "0.73",
              "0.75", "0.77", "0.80", "0.76", "0.74", "0.78", "0.82", "0.84"
            ]
          ],
          titleList: ["方案C", "方案D"]
        },
        scenario2: {
          zhpgObjectResultList: [
            [
              "0.95", "0.92", "0.89", "0.86", "0.91", "0.94", "0.90", "0.93", "0.88",
              "0.90", "0.92", "0.95", "0.91", "0.89", "0.93", "0.97", "0.99"
            ],
            [
              "0.85", "0.82", "0.79", "0.76", "0.81", "0.84", "0.80", "0.83", "0.78",
              "0.80", "0.82", "0.85", "0.81", "0.79", "0.83", "0.87", "0.89"
            ]
          ],
          titleList: ["方案E", "方案F"]
        }
      }
      
      const selectedScenario = scenarios[scenario] || scenarios.default
      
      return {
        success: true,
        code: "200",
        msg: "SUCCESS",
        data: {
          ...selectedScenario,
          detailNames: [
            "系统效能评估",
            "处理能力",
            "稳定性",
            "响应能力",
            "可靠性",
            "容错率",
            "恢复率",
            "响应时间",
            "传输速率",
            "工作效率",
            "处理效率",
            "准确率",
            "发现问题",
            "解决用时",
            "跟踪用时",
            "识别用时",
            "精确度"
          ],
          type: "1",
          scenario: scenario
        }
      }
    }
  }
]