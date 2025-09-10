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
          name: '模型性能评估-GPT-4',
          type: '性能评估',
          status: 'completed',
          progress: 100,
          score: 95.6,
          createTime: '2024-01-15 10:30:00'
        },
        {
          id: 2,
          name: '安全性评估-Claude-3',
          type: '安全评估',
          status: 'running',
          progress: 65,
          score: null,
          createTime: '2024-01-14 14:20:00'
        },
        {
          id: 3,
          name: '准确性评估-Gemini-Pro',
          type: '准确性评估',
          status: 'pending',
          progress: 0,
          score: null,
          createTime: '2024-01-13 09:15:00'
        },
        {
          id: 4,
          name: '响应时间评估-ChatGPT',
          type: '性能评估',
          status: 'failed',
          progress: 30,
          score: null,
          createTime: '2024-01-12 16:45:00'
        },
        {
          id: 5,
          name: '多模态评估-GPT-4V',
          type: '功能评估',
          status: 'completed',
          progress: 100,
          score: 88.9,
          createTime: '2024-01-11 11:30:00'
        },
        {
          id: 6,
          name: '语言理解评估-文心一言',
          type: '理解评估',
          status: 'running',
          progress: 45,
          score: null,
          createTime: '2024-01-10 13:20:00'
        },
        {
          id: 7,
          name: '代码生成评估-Copilot',
          type: '功能评估',
          status: 'completed',
          progress: 100,
          score: 92.3,
          createTime: '2024-01-09 15:10:00'
        },
        {
          id: 8,
          name: '对话质量评估-通义千问',
          type: '质量评估',
          status: 'pending',
          progress: 0,
          score: null,
          createTime: '2024-01-08 08:45:00'
        },
        {
          id: 9,
          name: '知识问答评估-Bard',
          type: '知识评估',
          status: 'completed',
          progress: 100,
          score: 87.1,
          createTime: '2024-01-07 12:30:00'
        },
        {
          id: 10,
          name: '创意写作评估-Claude-2',
          type: '创意评估',
          status: 'failed',
          progress: 15,
          score: null,
          createTime: '2024-01-06 17:25:00'
        }
      ]
      
      // 模拟分页
      const total = 25
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
  }
]