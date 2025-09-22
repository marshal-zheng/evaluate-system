// 指标相关 mock 接口，集中在此文件
// 导出为数组，便于在 index.js 中统一聚合

export default [
	// 指标数据
	{
		url: '/api/indicator/data',
		method: 'get',
		response: () => {
			return {
				code: 200,
				message: '获取成功',
				data: [
					{ id: 1, name: '指标1', value: 85.6, unit: '%' },
					{ id: 2, name: '指标2', value: 92.3, unit: 'ms' },
					{ id: 3, name: '指标3', value: 78.9, unit: 'MB' }
				]
			}
		}
	},

	// 获取指标体系设计选项
	{
		url: '/api/indicator/system/options',
		method: 'get',
		response: () => {
			return {
				code: 200,
				message: '获取成功',
				data: [
					{ label: '性能指标体系', value: 'performance_indicators', indicatorCount: 15 },
					{ label: '安全指标体系', value: 'security_indicators', indicatorCount: 12 },
					{ label: '可用性指标体系', value: 'availability_indicators', indicatorCount: 8 },
					{ label: '综合指标体系', value: 'comprehensive_indicators', indicatorCount: 25 },
					{ label: '效率指标体系', value: 'efficiency_indicators', indicatorCount: 10 },
					{ label: '质量指标体系', value: 'quality_indicators', indicatorCount: 18 },
					{ label: '用户体验指标体系', value: 'user_experience_indicators', indicatorCount: 14 },
					{ label: '成本效益指标体系', value: 'cost_benefit_indicators', indicatorCount: 9 }
				]
			}
		}
	},

	// 获取指标体系列表
	{
		url: '/api/indicator/system/list',
		method: 'get',
		response: ({ query }) => {
			const page = parseInt(query.page || 1)
			const size = parseInt(query.size || 10)
			
			const mockData = [
				{ 
					id: 1, 
					name: '性能指标体系', 
					value: 'performance_indicators',
					description: '包含CPU使用率、内存占用、响应时间等性能相关指标',
					indicatorCount: 12,
					createTime: '2024-01-10 10:00:00'
				},
				{ 
					id: 2, 
					name: '安全指标体系', 
					value: 'security_indicators',
					description: '包含漏洞数量、安全事件、访问控制等安全相关指标',
					indicatorCount: 8,
					createTime: '2024-01-09 14:30:00'
				},
				{ 
					id: 3, 
					name: '可用性指标体系', 
					value: 'availability_indicators',
					description: '包含系统可用率、故障恢复时间、服务连续性等指标',
					indicatorCount: 6,
					createTime: '2024-01-08 09:15:00'
				}
			]

			const total = mockData.length
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
					size,
					pages: Math.ceil(total / size)
				}
			}
		}
	},

	// 根据ID获取指标体系详情
	{
		url: '/api/indicator/system/:id',
		method: 'get',
		response: ({ params }) => {
			if (!params || !params.id) {
				return {
					code: 400,
					message: '缺少指标体系ID参数',
					data: null
				}
			}
			const id = parseInt(params.id)
			return {
				code: 200,
				message: '获取成功',
				data: {
					id,
					name: '性能指标体系',
					value: 'performance_indicators',
					description: '包含CPU使用率、内存占用、响应时间等性能相关指标的完整体系',
					indicatorCount: 12,
					createTime: '2024-01-10 10:00:00',
					indicators: [
						{ name: 'CPU使用率', weight: 0.2, unit: '%' },
						{ name: '内存占用率', weight: 0.15, unit: '%' },
						{ name: '响应时间', weight: 0.25, unit: 'ms' },
						{ name: '吞吐量', weight: 0.2, unit: 'req/s' },
						{ name: '错误率', weight: 0.2, unit: '%' }
					]
				}
			}
		}
	},

	// 获取指标体系结构数据（用于DAG画布）
	{
		url: '/api/indicator/system/:id/structure',
		method: 'get',
		response: ({ params }) => {
			// 返回与data.json一致的结构数据
			return {
				code: 200,
				message: '获取成功',
				data: {
					nodes: [
						{
							id: "1663477489012345678",
							type: "root-node",
							x: 836,
							y: 120,
							properties: {
								content: {
									id: "1663477489012345679",
									label: "根节点"
								},
								weight: 50,
								otherData: {},
								parentNodeId: null,
								customType: "",
								customProperties: "",
								unit: "",
								priority: "",
								defaultValue: "",
								notes: "",
								level: 1
							}
						},
						{
							id: "1663477489012345680",
							type: "sub-node",
							x: 724,
							y: 240,
							properties: {
								content: {
									id: "1663477489012345681",
									label: "二级指标"
								},
								weight: 50,
								otherData: {
									state: null,
									flag: 1,
									createId: null,
									modifyId: null,
									createTime: "2025-09-10 21:07:20",
									modifyTime: "2025-09-10 21:13:57",
									id: "1965764024555020290",
									oprModelName: "测试模型",
									oprModelDesc: "测试模型",
									oprModelPath: "1965764024555020290.ktr",
									sqlContent: null,
									index: 1,
									title: "测试模型",
									desc: "测试模型",
									label: "测试模型"
								},
								parentNodeId: "1663477489012345678",
								customType: "1",
								customProperties: "2",
								unit: "3",
								priority: "4",
								defaultValue: "5",
								notes: "6",
								level: 2
							}
						},
						{
							id: "1663477489012345682",
							type: "leaf-node",
							x: 686,
							y: 440,
							properties: {
								content: {
									id: "1663477489012345683",
									label: "三级指标"
								},
								weight: 50,
								otherData: {},
								parentNodeId: "1663477489012345680",
								customType: "1",
								customProperties: "2",
								unit: "3",
								priority: "4",
								defaultValue: "5",
								notes: "6",
								level: 3
							}
						},
						{
							id: "1663477489012345684",
							type: "leaf-node",
							x: 761,
							y: 440,
							properties: {
								content: {
									id: "1663477489012345685",
									label: "三级指标2"
								},
								weight: 50,
								otherData: {
									state: null,
									flag: 1,
									createId: null,
									modifyId: null,
									createTime: "2025-09-10 21:07:20",
									modifyTime: "2025-09-10 21:13:57",
									id: "1965764024555020290",
									oprModelName: "测试模型",
									oprModelDesc: "测试模型",
									oprModelPath: "1965764024555020290.ktr",
									sqlContent: null,
									index: 1,
									title: "测试模型",
									desc: "测试模型",
									label: "测试模型"
								},
								parentNodeId: "1663477489012345680",
								customType: "1",
								customProperties: "2",
								unit: "3",
								priority: "4",
								defaultValue: "5",
								notes: "6",
								level: 3
							}
						},
						{
							id: "1663477489012345686",
							type: "sub-node",
							x: 949,
							y: 240,
							properties: {
								content: {
									id: "1663477489012345687",
									label: "二级指标2"
								},
								weight: 50,
								otherData: {},
								parentNodeId: "1663477489012345678",
								customType: "",
								customProperties: "",
								unit: "",
								priority: "",
								defaultValue: "",
								notes: "",
								level: 2
							}
						}
					],
					edges: [
						{
							id: "1663477489012345688",
							type: "mindmap-edge",
							sourceNodeId: "1663477489012345680",
							targetNodeId: "1663477489012345682",
							startPoint: { x: 723.5, y: 240 },
							endPoint: { x: 686, y: 362 },
							properties: {},
							pointsList: [
								{ x: 723.5, y: 240 },
								{ x: 723.5, y: 320 },
								{ x: 686, y: 320 },
								{ x: 686, y: 362 }
							]
						},
						{
							id: "1663477489012345689",
							type: "mindmap-edge",
							sourceNodeId: "1663477489012345680",
							targetNodeId: "1663477489012345684",
							startPoint: { x: 723.5, y: 240 },
							endPoint: { x: 761, y: 362 },
							properties: {},
							pointsList: [
								{ x: 723.5, y: 240 },
								{ x: 723.5, y: 320 },
								{ x: 761, y: 320 },
								{ x: 761, y: 362 }
							]
						},
						{
							id: "1663477489012345690",
							type: "mindmap-edge",
							sourceNodeId: "1663477489012345678",
							targetNodeId: "1663477489012345680",
							startPoint: { x: 836, y: 120 },
							endPoint: { x: 723.5, y: 202 },
							properties: {},
							pointsList: [
								{ x: 836, y: 120 },
								{ x: 836, y: 167.75 },
								{ x: 723.5, y: 167.75 },
								{ x: 723.5, y: 202 }
							]
						},
						{
							id: "1663477489012345691",
							type: "mindmap-edge",
							sourceNodeId: "1663477489012345678",
							targetNodeId: "1663477489012345686",
							startPoint: { x: 836, y: 120 },
							endPoint: { x: 948.5, y: 202 },
							properties: {},
							pointsList: [
								{ x: 836, y: 120 },
								{ x: 836, y: 167.75 },
								{ x: 948.5, y: 167.75 },
								{ x: 948.5, y: 202 }
							]
						}
					]
				}
			}
		}
	},

	// 获取计算模型列表
	{
		url: '/api/indicator/calculation-model/list',
		method: 'get',
		response: ({ query }) => {
			console.log('Mock API - /api/indicator/calculation-model/list 接收到的查询参数:', query)
			
			const pageNumber = parseInt(query.pageNumber || 1)
			const pageSize = parseInt(query.pageSize || 10)
			const keyword = query.keyword || ''
			
			console.log('Mock API - 解析后的分页参数:', { pageNumber, pageSize, keyword })
			
			// 模拟计算模型数据
			let allModels = [
				{
					id: 1,
					name: '线性回归模型',
					description: '基于线性回归算法的计算模型，适用于连续数值预测',
					type: 'regression',
					algorithm: 'linear_regression',
					createTime: '2024-01-15 10:30:00',
					updateTime: '2024-01-20 14:20:00',
					status: 'active'
				},
				{
					id: 2,
					name: '决策树模型',
					description: '基于决策树算法的分类模型，适用于分类预测任务',
					type: 'classification',
					algorithm: 'decision_tree',
					createTime: '2024-01-16 09:15:00',
					updateTime: '2024-01-22 16:45:00',
					status: 'active'
				},
				{
					id: 3,
					name: '神经网络模型',
					description: '深度学习神经网络模型，适用于复杂模式识别',
					type: 'deep_learning',
					algorithm: 'neural_network',
					createTime: '2024-01-18 11:20:00',
					updateTime: '2024-01-25 13:30:00',
					status: 'active'
				},
				{
					id: 4,
					name: '随机森林模型',
					description: '集成学习随机森林算法，提高预测准确性',
					type: 'ensemble',
					algorithm: 'random_forest',
					createTime: '2024-01-20 08:45:00',
					updateTime: '2024-01-26 10:15:00',
					status: 'active'
				},
				{
					id: 5,
					name: '支持向量机模型',
					description: 'SVM算法模型，适用于高维数据分类和回归',
					type: 'svm',
					algorithm: 'support_vector_machine',
					createTime: '2024-01-22 14:30:00',
					updateTime: '2024-01-28 09:20:00',
					status: 'active'
				},
				{
					id: 6,
					name: '聚类分析模型',
					description: 'K-means聚类算法，用于数据分组和模式发现',
					type: 'clustering',
					algorithm: 'kmeans',
					createTime: '2024-01-25 16:10:00',
					updateTime: '2024-01-30 11:40:00',
					status: 'active'
				},
				{
					id: 7,
					name: '时间序列预测模型',
					description: 'ARIMA时间序列分析模型，适用于时序数据预测',
					type: 'time_series',
					algorithm: 'arima',
					createTime: '2024-01-28 12:25:00',
					updateTime: '2024-02-02 15:50:00',
					status: 'active'
				},
				{
					id: 8,
					name: '贝叶斯分类模型',
					description: '朴素贝叶斯算法，基于概率的分类模型',
					type: 'classification',
					algorithm: 'naive_bayes',
					createTime: '2024-01-30 10:15:00',
					updateTime: '2024-02-05 14:30:00',
					status: 'active'
				},
				{
					id: 9,
					name: '梯度提升模型',
					description: 'XGBoost梯度提升算法，高性能机器学习模型',
					type: 'ensemble',
					algorithm: 'xgboost',
					createTime: '2024-02-01 09:40:00',
					updateTime: '2024-02-07 16:20:00',
					status: 'active'
				},
				{
					id: 10,
					name: '关联规则模型',
					description: 'Apriori关联规则挖掘算法，发现数据间的关联性',
					type: 'association',
					algorithm: 'apriori',
					createTime: '2024-02-03 13:55:00',
					updateTime: '2024-02-08 12:10:00',
					status: 'active'
				}
			]
			
			// 根据关键词过滤
			if (keyword) {
				allModels = allModels.filter(model => 
					model.name.toLowerCase().includes(keyword.toLowerCase()) ||
					model.description.toLowerCase().includes(keyword.toLowerCase()) ||
					model.type.toLowerCase().includes(keyword.toLowerCase())
				)
			}
			
			// 分页处理
			const total = allModels.length
			const startIndex = (pageNumber - 1) * pageSize
			const endIndex = startIndex + pageSize
			const records = allModels.slice(startIndex, endIndex)
			
			return {
				code: 200,
				message: '获取成功',
				data: {
					records,
					total,
					pageNumber,
					pageSize,
					totalPages: Math.ceil(total / pageSize)
				}
			}
		}
	}
]