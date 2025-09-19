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
	}
]