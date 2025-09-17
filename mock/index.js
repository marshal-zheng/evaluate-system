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
        },
        {
          id: 11,
          name: '情感分析评估-BERT',
          type: '情感评估',
          status: 'completed',
          progress: 100,
          score: 89.2,
          createTime: '2024-01-05 14:15:00'
        },
        {
          id: 12,
          name: '文本摘要评估-T5',
          type: '摘要评估',
          status: 'running',
          progress: 78,
          score: null,
          createTime: '2024-01-04 11:40:00'
        },
        {
          id: 13,
          name: '机器翻译评估-mT5',
          type: '翻译评估',
          status: 'pending',
          progress: 0,
          score: null,
          createTime: '2024-01-03 16:20:00'
        },
        {
          id: 14,
          name: '图像识别评估-CLIP',
          type: '视觉评估',
          status: 'completed',
          progress: 100,
          score: 93.7,
          createTime: '2024-01-02 09:30:00'
        },
        {
          id: 15,
          name: '语音识别评估-Whisper',
          type: '语音评估',
          status: 'failed',
          progress: 25,
          score: null,
          createTime: '2024-01-01 13:45:00'
        },
        {
          id: 16,
          name: '推理能力评估-PaLM',
          type: '推理评估',
          status: 'completed',
          progress: 100,
          score: 91.4,
          createTime: '2023-12-31 10:20:00'
        },
        {
          id: 17,
          name: '代码理解评估-CodeT5',
          type: '代码评估',
          status: 'running',
          progress: 55,
          score: null,
          createTime: '2023-12-30 15:10:00'
        },
        {
          id: 18,
          name: '数学计算评估-Minerva',
          type: '数学评估',
          status: 'pending',
          progress: 0,
          score: null,
          createTime: '2023-12-29 08:30:00'
        },
        {
          id: 19,
          name: '常识推理评估-UnifiedQA',
          type: '常识评估',
          status: 'completed',
          progress: 100,
          score: 86.8,
          createTime: '2023-12-28 12:15:00'
        },
        {
          id: 20,
          name: '文档问答评估-LayoutLM',
          type: '文档评估',
          status: 'failed',
          progress: 40,
          score: null,
          createTime: '2023-12-27 17:50:00'
        },
        {
          id: 21,
          name: '对话生成评估-DialoGPT',
          type: '对话评估',
          status: 'completed',
          progress: 100,
          score: 88.5,
          createTime: '2023-12-26 14:25:00'
        },
        {
          id: 22,
          name: '文本分类评估-RoBERTa',
          type: '分类评估',
          status: 'running',
          progress: 82,
          score: null,
          createTime: '2023-12-25 11:35:00'
        },
        {
          id: 23,
          name: '实体识别评估-SpaCy',
          type: 'NER评估',
          status: 'pending',
          progress: 0,
          score: null,
          createTime: '2023-12-24 16:40:00'
        },
        {
          id: 24,
          name: '关键词提取评估-KeyBERT',
          type: '关键词评估',
          status: 'completed',
          progress: 100,
          score: 90.1,
          createTime: '2023-12-23 09:55:00'
        },
        {
          id: 25,
          name: '文本相似度评估-SentenceBERT',
          type: '相似度评估',
          status: 'failed',
          progress: 18,
          score: null,
          createTime: '2023-12-22 13:20:00'
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
  },

  // 评估结果接口
  {
    url: '/api/evaluation/result',
    method: 'get',
    response: ({ query }) => {
      // 模拟评估结果数据，基于提供的数据结构
      return {
        success: true,
        code: "200",
        msg: "SUCCESS",
        data: {
          zhpgObjectResultList: [
            [
              "0.90888",
              "0.87",
              "0.8283999999999999",
              "0.7600000000000001",
              "0.79",
              "0.92",
              "0.82",
              "0.87",
              "0.85",
              "0.86",
              "0.89",
              "0.9",
              "0.89",
              "0.88",
              "0.9",
              "0.95",
              "0.98"
            ],
            [
              "0.87364",
              "0.93",
              "0.8071999999999999",
              "0.8494999999999999",
              "0.74",
              "0.83",
              "0.85",
              "0.86",
              "0.7",
              "0.7",
              "0.72",
              "0.85",
              "0.8",
              "0.81",
              "0.85",
              "0.85",
              "0.9"
            ]
          ],
          detailNames: [
            "作战任务效能评估",
            "火力打击能力",
            "防御能力",
            "侦察感知能力",
            "机动率",
            "生存率",
            "抗毁率",
            "响应时间",
            "信息传输速率",
            "信息工作效率",
            "信息融合处理效率",
            "识别正确率",
            "发现目标",
            "发现用时",
            "跟踪用时",
            "识别用时",
            "定位准确率",
            "目标指示完整性"
          ],
          titleList: [
            "有电池",
            "无电池"
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
              "0.90888", "0.87", "0.8284", "0.76", "0.79", "0.92", "0.82", "0.87", "0.85",
              "0.86", "0.89", "0.9", "0.89", "0.88", "0.9", "0.95", "0.98"
            ],
            [
              "0.87364", "0.93", "0.8072", "0.8495", "0.74", "0.83", "0.85", "0.86", "0.7",
              "0.7", "0.72", "0.85", "0.8", "0.81", "0.85", "0.85", "0.9"
            ]
          ],
          titleList: ["有电池", "无电池"]
        },
        combat: {
          zhpgObjectResultList: [
            [
              "0.95", "0.92", "0.88", "0.85", "0.91", "0.94", "0.89", "0.93", "0.87",
              "0.90", "0.92", "0.95", "0.91", "0.89", "0.93", "0.97", "0.99"
            ],
            [
              "0.82", "0.85", "0.79", "0.76", "0.83", "0.88", "0.81", "0.84", "0.78",
              "0.80", "0.82", "0.86", "0.83", "0.81", "0.85", "0.89", "0.92"
            ],
            [
              "0.75", "0.78", "0.72", "0.69", "0.76", "0.81", "0.74", "0.77", "0.71",
              "0.73", "0.75", "0.79", "0.76", "0.74", "0.78", "0.82", "0.85"
            ]
          ],
          titleList: ["高强度作战", "中等强度作战", "低强度作战"]
        },
        defense: {
          zhpgObjectResultList: [
            [
              "0.88", "0.91", "0.85", "0.82", "0.89", "0.92", "0.86", "0.90", "0.84",
              "0.87", "0.89", "0.93", "0.88", "0.86", "0.91", "0.94", "0.96"
            ],
            [
              "0.79", "0.82", "0.76", "0.73", "0.80", "0.85", "0.78", "0.81", "0.75",
              "0.77", "0.79", "0.83", "0.80", "0.78", "0.82", "0.86", "0.89"
            ]
          ],
          titleList: ["主动防御", "被动防御"]
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
            "作战任务效能评估",
            "火力打击能力",
            "防御能力",
            "侦察感知能力",
            "机动率",
            "生存率",
            "抗毁率",
            "响应时间",
            "信息传输速率",
            "信息工作效率",
            "信息融合处理效率",
            "识别正确率",
            "发现目标",
            "发现用时",
            "跟踪用时",
            "识别用时",
            "定位准确率",
            "目标指示完整性"
          ],
          type: "1",
          scenario: scenario
        }
      }
    }
  }
]