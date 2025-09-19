import React, { useEffect, useRef, useState } from 'react';
import { useParams, history } from '@umijs/max';
import {
  Card,
  Button,
  Space,
  Typography,
  Spin,
  Alert,
  Row,
  Col,
  Statistic,
  Progress,
  Tag,
  Divider,
  message,
  Tabs,
  Table,
  Timeline,
  List,
  Avatar,
  Badge,
  Descriptions,
  Anchor,
  BackTop,
  Affix,
  Tooltip,
} from 'antd';
import {
  ArrowLeftOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  FullscreenOutlined,
  FileTextOutlined,
  BarChartOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  TrophyOutlined,
  RocketOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { GridStack } from 'gridstack';
import 'gridstack/dist/gridstack.min.css';
import { getTaskDetail } from './services/taskService';
import type { TaskDetail } from './types/task';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface ResultsProps {}

const Results: React.FC<ResultsProps> = () => {
  const { id } = useParams<{ id: string }>();
  const gridRef = useRef<HTMLDivElement>(null);
  const gridInstanceRef = useRef<GridStack | null>(null);
  const [loading, setLoading] = useState(true);
  const [taskDetail, setTaskDetail] = useState<TaskDetail | null>(null);

  // 从mock数据获取仪表板配置
  const getDashboardConfig = (taskId: string) => {
    // 根据任务ID获取对应的仪表板模板配置
    const dashboardTemplates = {
      'dash_001': {
        name: '业务指标仪表板',
        components: [
          { type: 'line_chart', title: '趋势分析', position: { x: 0, y: 0, w: 6, h: 4 } },
          { type: 'pie_chart', title: '占比分析', position: { x: 6, y: 0, w: 6, h: 4 } },
          { type: 'table', title: '详细数据', position: { x: 0, y: 4, w: 12, h: 4 } }
        ]
      },
      'dash_002': {
        name: '数据质量仪表板',
        components: [
          { type: 'gauge', title: '质量得分', position: { x: 0, y: 0, w: 4, h: 4 } },
          { type: 'bar_chart', title: '质量分布', position: { x: 4, y: 0, w: 8, h: 4 } },
          { type: 'heatmap', title: '质量热力图', position: { x: 0, y: 4, w: 12, h: 4 } }
        ]
      },
      'dash_003': {
        name: '安全监控仪表板',
        components: [
          { type: 'alert_panel', title: '安全告警', position: { x: 0, y: 0, w: 6, h: 3 } },
          { type: 'status_grid', title: '安全状态', position: { x: 6, y: 0, w: 6, h: 3 } },
          { type: 'timeline', title: '事件时间线', position: { x: 0, y: 3, w: 12, h: 5 } }
        ]
      },
      'dash_004': {
        name: '用户体验仪表板',
        components: [
          { type: 'score_card', title: '体验评分', position: { x: 0, y: 0, w: 3, h: 2 } },
          { type: 'funnel_chart', title: '用户漏斗', position: { x: 3, y: 0, w: 6, h: 4 } },
          { type: 'map_chart', title: '地域分布', position: { x: 9, y: 0, w: 3, h: 4 } }
        ]
      },
      'dash_005': {
        name: '流程效率仪表板',
        components: [
          { type: 'process_flow', title: '流程图', position: { x: 0, y: 0, w: 8, h: 4 } },
          { type: 'efficiency_meter', title: '效率指标', position: { x: 8, y: 0, w: 4, h: 4 } },
          { type: 'bottleneck_analysis', title: '瓶颈分析', position: { x: 0, y: 4, w: 12, h: 4 } }
        ]
      }
    };
    
    // 默认使用业务指标仪表板
    return dashboardTemplates['dash_001'] || dashboardTemplates['dash_001'];
  };

  // 企业级评估报告数据
  const mockResultData = {
    overallScore: 85.6,
    status: 'completed',
    completedTime: '2024-01-15 14:30:00',
    evaluationPeriod: '2024年第一季度',
    evaluator: '数据质量评估团队',
    department: '数字化转型部',
    
    // 执行摘要
    executiveSummary: {
      overview: '本次数据质量监控评估涵盖了企业核心业务系统的数据完整性、准确性、一致性和及时性四个维度。评估结果显示，整体数据质量水平达到85.6分，处于良好水平，但在系统性能和安全指标方面仍有提升空间。',
      keyFindings: [
        '数据完整性达到88.5%，超出行业平均水平',
        '用户满意度持续提升，达到90.1分',
        '系统性能存在瓶颈，需要优化处理',
        '安全防护体系需要进一步加强'
      ],
      recommendations: [
        '建议优化数据库查询性能，提升系统响应速度',
        '加强数据安全防护措施，完善访问控制机制',
        '建立数据质量监控预警机制',
        '定期开展数据治理培训，提升团队专业能力'
      ]
    },
    
    // 关键指标
    metrics: [
      { 
        name: '数据质量', 
        score: 88.5, 
        trend: 'up', 
        target: 90,
        description: '数据完整性、准确性、一致性综合评分',
        status: 'good'
      },
      { 
        name: '系统性能', 
        score: 82.3, 
        trend: 'down', 
        target: 85,
        description: '系统响应时间、吞吐量、稳定性评估',
        status: 'warning'
      },
      { 
        name: '用户满意度', 
        score: 90.1, 
        trend: 'up', 
        target: 88,
        description: '用户体验、界面友好性、功能完整性',
        status: 'excellent'
      },
      { 
        name: '安全指标', 
        score: 78.9, 
        trend: 'stable', 
        target: 85,
        description: '数据安全、访问控制、合规性检查',
        status: 'needs_improvement'
      },
    ],
    
    // 详细分析
    detailedAnalysis: {
      strengths: [
        { title: '数据完整性表现优异', description: '核心业务数据完整率达到95.2%，远超行业标准' },
        { title: '用户体验持续优化', description: '界面响应速度提升30%，用户操作流程简化' },
        { title: '监控体系日趋完善', description: '建立了7×24小时实时监控机制' }
      ],
      weaknesses: [
        { title: '系统性能存在瓶颈', description: '高峰期响应时间超过3秒，影响用户体验' },
        { title: '安全防护需要加强', description: '部分敏感数据访问控制机制不够完善' },
        { title: '数据治理流程待优化', description: '缺乏统一的数据标准和治理规范' }
      ],
      opportunities: [
        { title: '云原生技术应用', description: '采用微服务架构提升系统扩展性' },
        { title: 'AI智能运维', description: '引入机器学习算法优化系统性能' },
        { title: '数据中台建设', description: '构建企业级数据中台，统一数据服务' }
      ],
      threats: [
        { title: '数据合规风险', description: '新法规要求对数据处理提出更高标准' },
        { title: '技术债务累积', description: '历史系统维护成本持续上升' },
        { title: '人才流失风险', description: '核心技术人员流动性增加' }
      ]
    },
    
    // 行动计划
    actionPlan: [
      {
        priority: 'high',
        title: '系统性能优化',
        description: '优化数据库查询，升级硬件配置',
        owner: '技术架构团队',
        timeline: '2024年2月-4月',
        status: 'planning',
        tasks: [
          '数据库索引优化',
          '缓存策略调整',
          '负载均衡配置',
          '性能监控完善'
        ]
      },
      {
        priority: 'high',
        title: '安全体系加强',
        description: '完善访问控制，加强数据加密',
        owner: '信息安全团队',
        timeline: '2024年3月-5月',
        status: 'planning',
        tasks: [
          '权限管理优化',
          '数据加密升级',
          '安全审计完善',
          '应急响应机制'
        ]
      },
      {
        priority: 'medium',
        title: '数据治理规范',
        description: '建立数据标准，完善治理流程',
        owner: '数据管理团队',
        timeline: '2024年4月-8月',
        status: 'planning',
        tasks: [
          '数据标准制定',
          '治理流程设计',
          '质量监控机制',
          '培训体系建设'
        ]
      }
    ],
    charts: {
      'line_chart': {
        title: '综合评分趋势',
        type: 'line',
        data: [75, 78, 82, 85, 88, 85.6],
      },
      'pie_chart': {
        title: '指标分布',
        type: 'pie',
        data: [
          { name: '数据质量', value: 88.5 },
          { name: '系统性能', value: 82.3 },
          { name: '用户满意度', value: 90.1 },
          { name: '安全指标', value: 78.9 },
        ],
      },
      'bar_chart': {
        title: '详细指标对比',
        type: 'bar',
        data: [
          { category: '数据完整性', current: 85, target: 90 },
          { category: '响应时间', current: 78, target: 85 },
          { category: '用户活跃度', current: 92, target: 88 },
          { category: '安全漏洞', current: 76, target: 80 },
        ],
      },
      'table': {
        title: '详细数据',
        type: 'table',
        data: {
          columns: ['指标名称', '当前值', '目标值', '完成率'],
          rows: [
            ['质量指标', '85.6', '90', '95.1%'],
            ['效率指标', '92.3', '95', '97.2%'],
            ['安全指标', '78.9', '85', '92.8%'],
            ['用户体验', '88.5', '90', '98.3%']
          ]
        }
      },
      'gauge': {
        title: '质量得分',
        type: 'gauge',
        data: {
          value: 85.6,
          max: 100,
          color: '#1890ff'
        }
      }
    },
  };

  // 获取任务详情
  useEffect(() => {
    const fetchTaskDetail = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const detail = await getTaskDetail(id);
        setTaskDetail(detail);
      } catch (error) {
        message.error('获取任务详情失败');
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetail();
  }, [id]);

  // 初始化 GridStack
  useEffect(() => {
    if (!gridRef.current || loading || !taskDetail) return;

    // 初始化 GridStack
    const grid = GridStack.init({
      cellHeight: 60,
      margin: 10,
      resizable: {
        handles: 'e, se, s, sw, w'
      },
      draggable: {
        handle: '.grid-stack-item-content .drag-handle'
      }
    }, gridRef.current);

    gridInstanceRef.current = grid;

    // 获取仪表板配置
    const dashboardConfig = getDashboardConfig(id || '');
    
    // 添加图表组件
     dashboardConfig.components.forEach((component, index) => {
       const chartType = component.type as keyof typeof mockResultData.charts;
       const chartData = mockResultData.charts[chartType];
       
       if (!chartData) return;
      
      const widget = document.createElement('div');
      widget.className = 'grid-stack-item';
      widget.setAttribute('gs-x', component.position.x.toString());
      widget.setAttribute('gs-y', component.position.y.toString());
      widget.setAttribute('gs-w', component.position.w.toString());
      widget.setAttribute('gs-h', component.position.h.toString());
      widget.setAttribute('gs-id', `${chartType}_${index}`);

      const content = document.createElement('div');
      content.className = 'grid-stack-item-content';
      content.innerHTML = `
        <div class="drag-handle" style="cursor: move; padding: 8px; background: #f5f5f5; border-bottom: 1px solid #d9d9d9; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 500;">${component.title}</span>
          <span style="color: #999; font-size: 12px;">${chartData.type.toUpperCase()}</span>
        </div>
        <div style="padding: 16px; height: calc(100% - 41px); display: flex; align-items: center; justify-content: center; background: #fff;">
          ${renderChartContent(chartData)}
        </div>
      `;

      widget.appendChild(content);
      grid.addWidget(widget);
    });

    return () => {
      if (gridInstanceRef.current) {
        gridInstanceRef.current.destroy();
        gridInstanceRef.current = null;
      }
    };
  }, [loading, taskDetail]);

  // 渲染图表内容
  const renderChartContent = (chart: any) => {
    switch (chart.type) {
      case 'line':
        return `
          <div style="width: 100%; height: 100%; display: flex; align-items: end; justify-content: space-around; border-bottom: 1px solid #eee;">
            ${chart.data.map((value: number, index: number) => `
              <div style="width: 20px; height: ${value}%; background: linear-gradient(to top, #1890ff, #69c0ff); margin: 0 2px; border-radius: 2px 2px 0 0; position: relative;">
                <span style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-size: 10px; color: #666;">${value}</span>
              </div>
            `).join('')}
          </div>
        `;
      case 'pie':
        return `
          <div style="width: 120px; height: 120px; border-radius: 50%; background: conic-gradient(#1890ff 0deg 90deg, #52c41a 90deg 180deg, #faad14 180deg 270deg, #f5222d 270deg 360deg); display: flex; align-items: center; justify-content: center;">
            <div style="width: 60px; height: 60px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #1890ff;">
              ${mockResultData.overallScore}
            </div>
          </div>
        `;
      case 'bar':
        return `
          <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: space-around;">
            ${chart.data.map((item: any) => `
              <div style="display: flex; align-items: center; margin: 4px 0;">
                <span style="width: 80px; font-size: 12px; color: #666;">${item.category}</span>
                <div style="flex: 1; height: 16px; background: #f0f0f0; border-radius: 8px; margin: 0 8px; position: relative;">
                  <div style="height: 100%; width: ${item.current}%; background: linear-gradient(to right, #1890ff, #69c0ff); border-radius: 8px;"></div>
                  <span style="position: absolute; right: 4px; top: 50%; transform: translateY(-50%); font-size: 10px; color: #666;">${item.current}%</span>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      default:
        return `<div style="color: #999; text-align: center;">暂无数据</div>`;
    }
  };

  // 返回任务列表
  const handleBack = () => {
    history.push('/evaluation-task-management/task-list');
  };

  // 下载报告
  const handleDownload = () => {
    // 模拟生成PDF报告
    message.loading('正在生成报告...', 2).then(() => {
      message.success('报告已生成并下载');
    });
  };

  // 分享结果
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    message.success('报告链接已复制到剪贴板');
  };

  // 打印报告
  const handlePrint = () => {
    window.print();
  };

  // 全屏显示
  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return '#52c41a';
      case 'good': return '#1890ff';
      case 'warning': return '#faad14';
      case 'needs_improvement': return '#f5222d';
      default: return '#d9d9d9';
    }
  };

  // 获取优先级颜色
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  // 渲染SWOT分析
  const renderSWOTAnalysis = () => {
    const { strengths, weaknesses, opportunities, threats } = mockResultData.detailedAnalysis;
    
    return (
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title={<><TrophyOutlined style={{ color: '#52c41a' }} /> 优势 (Strengths)</>} size="small">
            <List
              size="small"
              dataSource={strengths}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<CheckCircleOutlined />} style={{ backgroundColor: '#52c41a' }} />}
                    title={item.title}
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title={<><ExclamationCircleOutlined style={{ color: '#f5222d' }} /> 劣势 (Weaknesses)</>} size="small">
            <List
              size="small"
              dataSource={weaknesses}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<ExclamationCircleOutlined />} style={{ backgroundColor: '#f5222d' }} />}
                    title={item.title}
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title={<><RocketOutlined style={{ color: '#1890ff' }} /> 机会 (Opportunities)</>} size="small">
            <List
              size="small"
              dataSource={opportunities}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<RocketOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                    title={item.title}
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title={<><ExclamationCircleOutlined style={{ color: '#faad14' }} /> 威胁 (Threats)</>} size="small">
            <List
              size="small"
              dataSource={threats}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<ExclamationCircleOutlined />} style={{ backgroundColor: '#faad14' }} />}
                    title={item.title}
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  // 渲染行动计划表格
  const renderActionPlanTable = () => {
    const columns = [
      {
        title: '优先级',
        dataIndex: 'priority',
        key: 'priority',
        width: 80,
        render: (priority: string) => (
          <Tag color={getPriorityColor(priority)}>
            {priority === 'high' ? '高' : priority === 'medium' ? '中' : '低'}
          </Tag>
        ),
      },
      {
        title: '行动项目',
        dataIndex: 'title',
        key: 'title',
        width: 150,
      },
      {
        title: '描述',
        dataIndex: 'description',
        key: 'description',
      },
      {
        title: '负责团队',
        dataIndex: 'owner',
        key: 'owner',
        width: 120,
        render: (owner: string) => (
          <Space>
            <TeamOutlined />
            {owner}
          </Space>
        ),
      },
      {
        title: '时间计划',
        dataIndex: 'timeline',
        key: 'timeline',
        width: 120,
        render: (timeline: string) => (
          <Space>
            <ClockCircleOutlined />
            {timeline}
          </Space>
        ),
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 80,
        render: (status: string) => (
          <Badge 
            status={status === 'planning' ? 'processing' : 'success'} 
            text={status === 'planning' ? '规划中' : '进行中'} 
          />
        ),
      },
    ];

    return (
      <Table
        columns={columns}
        dataSource={mockResultData.actionPlan.map((item, index) => ({ ...item, key: index }))}
        pagination={false}
        size="small"
        expandable={{
          expandedRowRender: (record) => (
            <div style={{ margin: 0 }}>
              <Title level={5}>具体任务：</Title>
              <Timeline size="small">
                {record.tasks.map((task: string, index: number) => (
                  <Timeline.Item key={index}>{task}</Timeline.Item>
                ))}
              </Timeline>
            </div>
          ),
          rowExpandable: (record) => record.tasks && record.tasks.length > 0,
        }}
      />
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>加载中...</div>
      </div>
    );
  }

  if (!taskDetail) {
    return (
      <Alert
        message="任务不存在"
        description="未找到指定的评估任务"
        type="error"
        showIcon
        action={
          <Button type="primary" onClick={handleBack}>
            返回任务列表
          </Button>
        }
      />
    );
  }

  return (
    <div style={{ padding: '0 24px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* 页面头部 */}
      <div style={{ background: '#fff', padding: '24px', marginBottom: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
            返回
          </Button>
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            数据质量监控评估报告
          </Title>
        </Space>
        
        {/* 报告基本信息 */}
        <Row gutter={24} style={{ marginTop: 24 }}>
          <Col span={12}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="评估对象">{taskDetail?.name || '企业核心业务系统'}</Descriptions.Item>
              <Descriptions.Item label="评估周期">{mockResultData.evaluationPeriod}</Descriptions.Item>
              <Descriptions.Item label="评估团队">{mockResultData.evaluator}</Descriptions.Item>
              <Descriptions.Item label="所属部门">{mockResultData.department}</Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={12}>
            <div style={{ textAlign: 'right' }}>
              <Space>
                <Tag color={taskDetail?.status === 'completed' ? 'success' : 'processing'} style={{ fontSize: 14, padding: '4px 12px' }}>
                  {taskDetail?.statusName || '已完成'}
                </Tag>
                <Text type="secondary">完成时间: {mockResultData.completedTime}</Text>
              </Space>
              
              <div style={{ marginTop: 16 }}>
                <Space>
                  <Tooltip title="下载PDF报告">
                    <Button icon={<DownloadOutlined />} onClick={handleDownload} type="primary">
                      下载报告
                    </Button>
                  </Tooltip>
                  <Tooltip title="打印报告">
                    <Button icon={<PrinterOutlined />} onClick={handlePrint}>
                      打印
                    </Button>
                  </Tooltip>
                  <Tooltip title="分享报告链接">
                    <Button icon={<ShareAltOutlined />} onClick={handleShare}>
                      分享
                    </Button>
                  </Tooltip>
                  <Tooltip title="全屏查看">
                    <Button icon={<FullscreenOutlined />} onClick={handleFullscreen}>
                      全屏
                    </Button>
                  </Tooltip>
                </Space>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* 导航锚点 */}
      <Affix offsetTop={80}>
        <Card size="small" style={{ marginBottom: 16 }}>
          <Anchor
            direction="horizontal"
            items={[
              { key: 'summary', href: '#summary', title: '执行摘要' },
              { key: 'metrics', href: '#metrics', title: '关键指标' },
              { key: 'analysis', href: '#analysis', title: '详细分析' },
              { key: 'dashboard', href: '#dashboard', title: '数据看板' },
              { key: 'actions', href: '#actions', title: '行动计划' },
            ]}
          />
        </Card>
      </Affix>

      {/* 执行摘要 */}
      <Card id="summary" style={{ marginBottom: 24 }}>
        <Title level={3}>
          <FileTextOutlined style={{ color: '#1890ff', marginRight: 8 }} />
          执行摘要
        </Title>
        
        {/* 综合评分 */}
        <Row gutter={24} style={{ marginBottom: 32 }}>
          <Col span={6}>
            <Card style={{ textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <Statistic
                title={<span style={{ color: 'white' }}>综合评分</span>}
                value={mockResultData.overallScore}
                precision={1}
                valueStyle={{ color: 'white', fontSize: 36, fontWeight: 'bold' }}
                suffix={<span style={{ color: 'white' }}>分</span>}
              />
              <div style={{ marginTop: 8, fontSize: 14, opacity: 0.9 }}>良好水平</div>
            </Card>
          </Col>
          {mockResultData.metrics.map((metric, index) => (
            <Col span={6} key={index}>
              <Card hoverable>
                <Statistic
                  title={metric.name}
                  value={metric.score}
                  precision={1}
                  valueStyle={{ 
                    color: getStatusColor(metric.status),
                    fontSize: 24,
                    fontWeight: 'bold'
                  }}
                  suffix="分"
                />
                <div style={{ marginTop: 12 }}>
                  <Progress 
                    percent={(metric.score / metric.target) * 100} 
                    showInfo={false} 
                    strokeColor={getStatusColor(metric.status)}
                    size="small"
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 12, color: '#666' }}>
                    <span>目标: {metric.target}分</span>
                    <span>完成率: {((metric.score / metric.target) * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <Tooltip title={metric.description}>
                  <Text type="secondary" style={{ fontSize: 12 }}>{metric.description}</Text>
                </Tooltip>
              </Card>
            </Col>
          ))}
        </Row>

        {/* 概述 */}
        <Paragraph style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 24 }}>
          {mockResultData.executiveSummary.overview}
        </Paragraph>

        {/* 关键发现和建议 */}
        <Row gutter={24}>
          <Col span={12}>
            <Card title="关键发现" size="small" headStyle={{ background: '#f0f9ff' }}>
              <List
                size="small"
                dataSource={mockResultData.executiveSummary.keyFindings}
                renderItem={(item, index) => (
                  <List.Item>
                    <Space>
                      <Badge count={index + 1} style={{ backgroundColor: '#1890ff' }} />
                      <Text>{item}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="核心建议" size="small" headStyle={{ background: '#f6ffed' }}>
              <List
                size="small"
                dataSource={mockResultData.executiveSummary.recommendations}
                renderItem={(item, index) => (
                  <List.Item>
                    <Space>
                      <BulbOutlined style={{ color: '#52c41a' }} />
                      <Text>{item}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 关键指标详情 */}
      <Card id="metrics" style={{ marginBottom: 24 }}>
        <Title level={3}>
          <BarChartOutlined style={{ color: '#1890ff', marginRight: 8 }} />
          关键指标分析
        </Title>
        
        <Row gutter={[24, 24]}>
          {mockResultData.metrics.map((metric, index) => (
            <Col span={12} key={index}>
              <Card 
                size="small" 
                title={metric.name}
                extra={
                  <Tag color={getStatusColor(metric.status).replace('#', '')}>
                    {metric.status === 'excellent' ? '优秀' : 
                     metric.status === 'good' ? '良好' : 
                     metric.status === 'warning' ? '警告' : '需改进'}
                  </Tag>
                }
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="当前得分"
                      value={metric.score}
                      precision={1}
                      suffix="分"
                      valueStyle={{ color: getStatusColor(metric.status) }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="目标得分"
                      value={metric.target}
                      suffix="分"
                      valueStyle={{ color: '#666' }}
                    />
                  </Col>
                </Row>
                <div style={{ marginTop: 16 }}>
                  <Progress
                    percent={(metric.score / metric.target) * 100}
                    strokeColor={getStatusColor(metric.status)}
                    format={(percent) => `${percent?.toFixed(1)}%`}
                  />
                </div>
                <Paragraph style={{ marginTop: 12, fontSize: 13, color: '#666' }}>
                  {metric.description}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* SWOT分析 */}
      <Card id="analysis" style={{ marginBottom: 24 }}>
        <Title level={3}>
          <BulbOutlined style={{ color: '#1890ff', marginRight: 8 }} />
          SWOT战略分析
        </Title>
        {renderSWOTAnalysis()}
      </Card>

      {/* 交互式数据看板 */}
      <Card 
        id="dashboard"
        title={
          <Title level={3} style={{ margin: 0 }}>
            <BarChartOutlined style={{ color: '#1890ff', marginRight: 8 }} />
            交互式数据看板
          </Title>
        }
        extra={
          <Text type="secondary" style={{ fontSize: 12 }}>
            拖拽和调整图表大小来自定义布局
          </Text>
        }
        style={{ marginBottom: 24 }}
        bodyStyle={{ padding: 0 }}
      >
        <div 
          ref={gridRef} 
          className="grid-stack"
          style={{ 
            minHeight: 600,
            padding: 16,
            background: '#f5f5f5'
          }}
        />
      </Card>

      {/* 行动计划 */}
      <Card id="actions" style={{ marginBottom: 24 }}>
        <Title level={3}>
          <RocketOutlined style={{ color: '#1890ff', marginRight: 8 }} />
          行动计划与建议
        </Title>
        {renderActionPlanTable()}
      </Card>

      {/* 返回顶部 */}
      <BackTop />

      {/* 自定义样式 */}
      <style>{`
        .grid-stack {
          background: #f5f5f5;
        }
        
        .grid-stack-item-content {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          padding: 20px;
          overflow: hidden;
          border: 1px solid #f0f0f0;
          transition: all 0.3s ease;
        }
        
        .grid-stack-item:hover .grid-stack-item-content {
          box-shadow: 0 6px 24px rgba(0,0,0,0.12);
          border-color: #1890ff;
        }
        
        .grid-stack-item.ui-draggable-dragging .grid-stack-item-content {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
          transform: rotate(2deg);
        }
        
        .drag-handle:hover {
          background: #e6f7ff !important;
        }
        
        .chart-container {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .chart-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #262626;
          border-bottom: 2px solid #1890ff;
          padding-bottom: 8px;
          display: flex;
          align-items: center;
        }
        
        .chart-content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 200px;
        }
        
        .enterprise-report {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          min-height: 100vh;
          padding: 24px;
        }
        
        .report-header {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          margin-bottom: 24px;
        }
        
        .navigation-anchor {
          position: sticky;
          top: 80px;
          z-index: 100;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(10px);
          border-radius: 8px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.1);
        }
        
        .swot-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 16px;
        }
        
        .swot-item {
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid;
        }
        
        .swot-strengths {
          background: #f6ffed;
          border-left-color: #52c41a;
        }
        
        .swot-weaknesses {
          background: #fff2e8;
          border-left-color: #fa8c16;
        }
        
        .swot-opportunities {
          background: #f0f9ff;
          border-left-color: #1890ff;
        }
        
        .swot-threats {
          background: #fff1f0;
          border-left-color: #f5222d;
        }
        
        @media print {
          .no-print {
            display: none !important;
          }
          
          .grid-stack-item-content {
            box-shadow: none;
            border: 1px solid #ddd;
          }
        }
      `}</style>
    </div>
  );
};

export default Results;