import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Space,
  Progress,
  Alert,
  Spin,
  Row,
  Col,
  Timeline,
  Divider,
  Typography,
} from 'antd';
import {
  ArrowLeftOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  EditOutlined,
  CopyOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import useTaskDetail from './models/useTaskDetail';
import type { TaskDetail } from './types/task';

const { Title, Text } = Typography;

const Detail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const {
    detail,
    loading,
    error,
    activate,
    refresh,
    updateTask,
    runTask,
    stopTask,
    updating,
    running,
    stopping,
  } = useTaskDetail(id || '');

  useEffect(() => {
    if (id) {
      activate();
    }
  }, [id, activate]);

  // 状态标签映射
  const getStatusTag = (status: string) => {
    const statusMap = {
      draft: { color: 'default', text: '草稿' },
      calculating: { color: 'processing', text: '计算中' },
      completed: { color: 'success', text: '已完成' },
      failed: { color: 'error', text: '失败' },
    };
    const config = statusMap[status as keyof typeof statusMap] || statusMap.draft;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 处理返回
  const handleBack = () => {
    navigate('/evaluation-task/task-management');
  };

  // 处理编辑
  const handleEdit = () => {
    navigate(`/evaluation-task/task-management/edit/${id}`);
  };

  // 处理克隆
  const handleClone = () => {
    // 实现克隆逻辑
  };

  // 处理删除
  const handleDelete = () => {
    // 实现删除逻辑
  };

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          message="加载失败"
          description="无法加载任务详情，请稍后重试。"
          type="error"
          showIcon
          action={
            <Space>
              <Button size="small" onClick={refresh}>
                重试
              </Button>
              <Button size="small" onClick={handleBack}>
                返回
              </Button>
            </Space>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* 页面头部 */}
      <div style={{ marginBottom: 24 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
            返回
          </Button>
          <Title level={3} style={{ margin: 0 }}>
            {detail.name}
          </Title>
          {getStatusTag(detail.status)}
        </Space>
        
        <div style={{ marginTop: 16 }}>
          <Space>
            {detail.status === 'draft' && (
              <>
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  loading={running}
                  onClick={() => runTask(detail.id)}
                >
                  运行任务
                </Button>
                <Button
                  icon={<EditOutlined />}
                  onClick={handleEdit}
                >
                  编辑
                </Button>
              </>
            )}
            {detail.status === 'calculating' && (
              <Button
                icon={<PauseCircleOutlined />}
                loading={stopping}
                onClick={() => stopTask(detail.id)}
              >
                停止任务
              </Button>
            )}
            <Button icon={<CopyOutlined />} onClick={handleClone}>
              克隆
            </Button>
            <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
              删除
            </Button>
          </Space>
        </div>
      </div>

      <Row gutter={24}>
        <Col span={16}>
          {/* 基本信息 */}
          <Card title="基本信息" style={{ marginBottom: 24 }}>
            <Descriptions column={2}>
              <Descriptions.Item label="任务名称">{detail.name}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Space>
                  {getStatusTag(detail.status)}
                  {detail.status === 'calculating' && detail.progress !== undefined && (
                    <Progress percent={detail.progress} size="small" style={{ width: 100 }} />
                  )}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="评估算法">{detail.algorithmName}</Descriptions.Item>
              <Descriptions.Item label="指标体系">{detail.metricSystemName}</Descriptions.Item>
              <Descriptions.Item label="创建人">{detail.creator}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{detail.createdTime}</Descriptions.Item>
              {detail.templateName && (
                <Descriptions.Item label="使用模板">{detail.templateName}</Descriptions.Item>
              )}
              {detail.updatedTime && (
                <Descriptions.Item label="更新时间">{detail.updatedTime}</Descriptions.Item>
              )}
            </Descriptions>
            {detail.description && (
              <>
                <Divider />
                <div>
                  <Text strong>任务描述：</Text>
                  <div style={{ marginTop: 8 }}>
                    <Text>{detail.description}</Text>
                  </div>
                </div>
              </>
            )}
          </Card>

          {/* 执行步骤 */}
          <Card title="执行步骤" style={{ marginBottom: 24 }}>
            <Timeline>
              {detail.steps?.map((step, index) => (
                <Timeline.Item
                  key={index}
                  color={
                    step.status === 'completed'
                      ? 'green'
                      : step.status === 'current'
                      ? 'blue'
                      : 'gray'
                  }
                >
                  <div>
                    <Text strong>{step.stepName}</Text>
                    <div style={{ marginTop: 4 }}>
                      <Tag
                        color={
                          step.status === 'completed'
                            ? 'success'
                            : step.status === 'current'
                            ? 'processing'
                            : 'default'
                        }
                      >
                        {step.status === 'completed'
                          ? '已完成'
                          : step.status === 'current'
                          ? '进行中'
                          : '待执行'}
                      </Tag>
                    </div>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>

          {/* 数据映射 */}
          {detail.dataMapping && detail.dataMapping.length > 0 && (
            <Card title="数据映射" style={{ marginBottom: 24 }}>
              {detail.dataMapping.map((mapping, index) => (
                <Card key={index} size="small" style={{ marginBottom: 8 }}>
                  <Descriptions size="small" column={1}>
                    <Descriptions.Item label="指标名称">{mapping.metricName}</Descriptions.Item>
                    <Descriptions.Item label="数据源">{mapping.dataSourceName}</Descriptions.Item>
                    <Descriptions.Item label="字段映射">
                      {mapping.columnMapping.map((col, colIndex) => (
                        <Tag key={colIndex} style={{ marginBottom: 4 }}>
                          {col.sourceColumn} → {col.targetField}
                        </Tag>
                      ))}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              ))}
            </Card>
          )}
        </Col>

        <Col span={8}>
          {/* 任务状态 */}
          <Card title="任务状态" size="small" style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text type="secondary">当前状态</Text>
                <div>{getStatusTag(detail.status)}</div>
              </div>
              {detail.status === 'calculating' && detail.progress !== undefined && (
                <div>
                  <Text type="secondary">执行进度</Text>
                  <Progress percent={detail.progress} />
                </div>
              )}
            </Space>
          </Card>

          {/* 仪表板配置 */}
          {detail.dashboardConfig && (
            <Card title="仪表板配置" size="small" style={{ marginBottom: 16 }}>
              <Descriptions size="small" column={1}>
                <Descriptions.Item label="模板名称">
                  {detail.dashboardConfig.templateName}
                </Descriptions.Item>
                <Descriptions.Item label="组件数量">
                  {detail.dashboardConfig.widgets?.length || 0} 个
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          {/* 快速操作 */}
          <Card title="快速操作" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button block onClick={refresh}>
                刷新数据
              </Button>
              {detail.status === 'completed' && (
                <Button block type="primary">
                  查看结果
                </Button>
              )}
              {detail.status === 'failed' && (
                <Button block type="primary" onClick={() => runTask(detail.id)}>
                  重新运行
                </Button>
              )}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Detail;