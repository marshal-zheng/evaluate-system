// 评估相关 mock 接口，集中在此文件
// 导出为数组，便于在 index.js 中统一聚合

export default [
	// 评估状态选项
	{
		url: '/api/evaluation/status/options',
		method: 'get',
		response: () => {
			return {
				code: 200,
				message: '获取成功',
				data: [
					{ label: '待执行', value: 'pending' },
					{ label: '执行中', value: 'running' },
					{ label: '已完成', value: 'completed' },
					{ label: '失败', value: 'failed' }
				]
			}
		}
	},
	// 评估任务列表
	{
		url: '/api/evaluation/list',
		method: 'get',
		response: ({ query }) => {
			console.log('Mock API - /api/evaluation/list 接收到的查询参数:', query)
			const page = parseInt(query.page || query.pageNumber || query.current) || 1
			const size = parseInt(query.size || query.pageSize || query.limit) || 10
			console.log('Mock API - 解析后的分页参数:', { page, size })
			const mockData = [
				{ id: 1,  name: '系统A性能评估',      type: '性能评估',   status: 'completed', progress: 100, score: 95.6, createTime: '2024-01-15 10:30:00' },
				{ id: 2,  name: '系统B安全性评估',    type: '安全评估',   status: 'running',   progress: 65,  score: null, createTime: '2024-01-14 14:20:00' },
				{ id: 3,  name: '系统C准确性评估',    type: '准确性评估', status: 'pending',   progress: 0,   score: null, createTime: '2024-01-13 09:15:00' },
				{ id: 4,  name: '系统D响应时间评估',  type: '性能评估',   status: 'failed',    progress: 30,  score: null, createTime: '2024-01-12 16:45:00' },
				{ id: 5,  name: '系统E功能评估',      type: '功能评估',   status: 'completed', progress: 100, score: 88.9, createTime: '2024-01-11 11:30:00' },
				{ id: 6,  name: '网络设备F稳定性评估', type: '稳定性评估', status: 'completed', progress: 100, score: 92.3, createTime: '2024-01-10 08:45:00' },
				{ id: 7,  name: '数据库G性能评估',    type: '性能评估',   status: 'running',   progress: 78,  score: null, createTime: '2024-01-09 15:20:00' },
				{ id: 8,  name: '应用服务H可用性评估', type: '可用性评估', status: 'completed', progress: 100, score: 97.8, createTime: '2024-01-08 12:10:00' },
				{ id: 9,  name: '存储系统I容量评估',  type: '容量评估',   status: 'pending',   progress: 0,   score: null, createTime: '2024-01-07 09:30:00' },
				{ id: 10, name: '负载均衡J效率评估',  type: '效率评估',   status: 'running',   progress: 45,  score: null, createTime: '2024-01-06 14:15:00' },
				{ id: 11, name: '防火墙K安全性评估',  type: '安全评估',   status: 'completed', progress: 100, score: 89.5, createTime: '2024-01-05 10:20:00' },
				{ id: 12, name: '监控系统L准确性评估', type: '准确性评估', status: 'failed',    progress: 25,  score: null, createTime: '2024-01-04 16:40:00' },
				{ id: 13, name: '备份系统M可靠性评估', type: '可靠性评估', status: 'completed', progress: 100, score: 94.2, createTime: '2024-01-03 11:55:00' },
				{ id: 14, name: '缓存系统N性能评估',  type: '性能评估',   status: 'running',   progress: 82,  score: null, createTime: '2024-01-02 13:25:00' },
				{ id: 15, name: '消息队列O吞吐量评估', type: '吞吐量评估', status: 'pending',   progress: 0,   score: null, createTime: '2024-01-01 09:00:00' },
				{ id: 16, name: '搜索引擎P响应时间评估', type: '性能评估', status: 'completed', progress: 100, score: 91.7, createTime: '2023-12-31 15:30:00' },
				{ id: 17, name: '日志系统Q存储效率评估', type: '效率评估', status: 'running', progress: 60, score: null, createTime: '2023-12-30 10:45:00' },
				{ id: 18, name: '认证系统R安全性评估', type: '安全评估',   status: 'completed', progress: 100, score: 96.1, createTime: '2023-12-29 14:20:00' },
				{ id: 19, name: '配置中心S可用性评估', type: '可用性评估', status: 'failed',    progress: 15,  score: null, createTime: '2023-12-28 08:30:00' },
				{ id: 20, name: '服务网关T性能评估',  type: '性能评估',   status: 'running',   progress: 55,  score: null, createTime: '2023-12-27 12:15:00' },
				{ id: 21, name: '容器平台U资源利用率评估', type: '资源评估', status: 'completed', progress: 100, score: 93.4, createTime: '2023-12-26 16:50:00' }
			]
			const total = mockData.length
			const start = (page - 1) * size
			const end = start + size
			const records = mockData.slice(start, end)
			const pages = Math.ceil(total / size)
			const result = {
				success: true,
				code: '200',
				msg: 'SUCCESS',
				data: {
					countId: null,
						current: page,
						maxLimit: null,
						optimizeCountSql: true,
						orders: [{ column: 'create_time', asc: false }],
						pages,
						records,
						searchCount: true,
						size,
						total
				}
			}
			return result
		}
	},
	// 根据ID获取评估结果接口
	{
		url: '/api/evaluation/result/:id',
		method: 'get',
		response: ({ query, params }) => {
			const id = params?.id
			const scenario = query.scenario || 'default'
			const dataByIdAndScenario = {
				'1': { default: { zhpgObjectResultList: [["0.85","0.82","0.79","0.76","0.81","0.84","0.80","0.83","0.78","0.80","0.82","0.85","0.81","0.79","0.83","0.87","0.89"],["0.75","0.72","0.69","0.66","0.71","0.74","0.70","0.73","0.68","0.70","0.72","0.75","0.71","0.69","0.73","0.77","0.79"]], titleList: ["基础方案A","基础方案B"] } },
				'2': { combat: { zhpgObjectResultList: [["0.90","0.87","0.84","0.81","0.86","0.89","0.85","0.88","0.83","0.85","0.87","0.90","0.86","0.84","0.88","0.92","0.94"],["0.80","0.77","0.74","0.71","0.76","0.79","0.75","0.78","0.73","0.75","0.77","0.80","0.76","0.74","0.78","0.82","0.84"]], titleList: ["作战方案C","作战方案D"] } },
				'3': { defense: { zhpgObjectResultList: [["0.95","0.92","0.89","0.86","0.91","0.94","0.90","0.93","0.88","0.90","0.92","0.95","0.91","0.89","0.93","0.97","0.99"],["0.85","0.82","0.79","0.76","0.81","0.84","0.80","0.83","0.78","0.80","0.82","0.85","0.81","0.79","0.83","0.87","0.89"]], titleList: ["防御方案E","防御方案F"] } }
			}
			const idData = dataByIdAndScenario[id] || dataByIdAndScenario['1']
			const scenarioData = idData[scenario] || idData.default || dataByIdAndScenario['1'].default
			return {
				success: true,
				code: '200',
				msg: 'SUCCESS',
				data: {
					...scenarioData,
					detailNames: [
						'系统效能评估','处理能力','稳定性','响应能力','可靠性','容错率','恢复率','响应时间','传输速率','工作效率','处理效率','准确率','发现问题','解决用时','跟踪用时','识别用时','精确度'
					],
					type: '1',
					id,
					scenario
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
			const scenarios = {
				default: { zhpgObjectResultList: [["0.85","0.82","0.79","0.76","0.81","0.84","0.80","0.83","0.78","0.80","0.82","0.85","0.81","0.79","0.83","0.87","0.89"],["0.75","0.72","0.69","0.66","0.71","0.74","0.70","0.73","0.68","0.70","0.72","0.75","0.71","0.69","0.73","0.77","0.79"]], titleList: ['方案A','方案B'] },
				scenario1: { zhpgObjectResultList: [["0.90","0.87","0.84","0.81","0.86","0.89","0.85","0.88","0.83","0.85","0.87","0.90","0.86","0.84","0.88","0.92","0.94"],["0.80","0.77","0.74","0.71","0.76","0.79","0.75","0.78","0.73","0.75","0.77","0.80","0.76","0.74","0.78","0.82","0.84"]], titleList: ['方案C','方案D'] },
				scenario2: { zhpgObjectResultList: [["0.95","0.92","0.89","0.86","0.91","0.94","0.90","0.93","0.88","0.90","0.92","0.95","0.91","0.89","0.93","0.97","0.99"],["0.85","0.82","0.79","0.76","0.81","0.84","0.80","0.83","0.78","0.80","0.82","0.85","0.81","0.79","0.83","0.87","0.89"]], titleList: ['方案E','方案F'] }
			}
			const selectedScenario = scenarios[scenario] || scenarios.default
			return {
				success: true,
				code: '200',
				msg: 'SUCCESS',
				data: {
					...selectedScenario,
					detailNames: [
						'系统效能评估','处理能力','稳定性','响应能力','可靠性','容错率','恢复率','响应时间','传输速率','工作效率','处理效率','准确率','发现问题','解决用时','跟踪用时','识别用时','精确度'
					],
					type: '1',
					scenario
				}
			}
		}
	},
	// 删除评估任务
	{
		url: '/api/evaluation/delete',
		method: 'delete',
		response: ({ query, body }) => {
			const id = query.id || body.id
			if (!id) {
				return { code: 400, message: '参数错误：缺少评估任务ID', data: null }
			}
			return {
				code: 401,
				message: '无权限删除',
				data: { id, deletedAt: new Date().toISOString() }
			}
		}
	},

	// 获取评估方案选项
	{
		url: '/api/evaluate/scheme/options',
		method: 'get',
		response: () => {
			return {
				code: 200,
				message: '获取成功',
				data: [
					{ label: '性能评估方案', value: 'performance_scheme' },
					{ label: '安全评估方案', value: 'security_scheme' },
					{ label: '可用性评估方案', value: 'availability_scheme' },
					{ label: '综合评估方案', value: 'comprehensive_scheme' },
					{ label: '效率评估方案', value: 'efficiency_scheme' },
					{ label: '质量评估方案', value: 'quality_scheme' },
					{ label: '成本效益评估方案', value: 'cost_benefit_scheme' }
				]
			}
		}
	},

	// 获取评估算法选项
	{
		url: '/api/evaluate/algorithm/options',
		method: 'get',
		response: () => {
			return {
				code: 200,
				message: '获取成功',
				data: [
					{ label: '加权平均算法', value: 'weighted_average', description: '基于权重的线性加权计算' },
					{ label: '模糊逻辑算法', value: 'fuzzy_logic', description: '处理不确定性和模糊信息' },
					{ label: '神经网络算法', value: 'neural_network', description: '基于机器学习的智能评估' },
					{ label: '层次分析法', value: 'ahp_method', description: '多层次多准则决策分析' },
					{ label: '数据包络分析', value: 'data_envelopment', description: '效率评估的数学规划方法' },
					{ label: '灰色关联分析', value: 'grey_correlation', description: '处理少数据不确定性问题' },
					{ label: '主成分分析', value: 'principal_component', description: '降维和特征提取方法' },
					{ label: '支持向量机', value: 'support_vector_machine', description: '分类和回归的监督学习算法' }
				]
			}
		}
	}
]

