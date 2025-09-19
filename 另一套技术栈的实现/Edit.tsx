import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Space,
  Alert,
  Spin,
  Row,
  Col,
  Typography,
  Divider,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import useTaskDetail from './models/useTaskDetail';
import useTaskForm from './models/useTaskForm';
import type { UpdateTaskParams } from './types/task';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const Edit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [hasChanges, setHasChanges] = useState(false);

  const {
    detail,
    loading: detailLoading,
    error,
    activate: activateDetail,
    updateTask,
    runTask,
    updating,
    running,
  } = useTaskDetail(id || '');

  const {
    algorithms,
    metricSystems,
    algorithmsLoading,
    metricSystemsLoading,
    activate: activateForm,
  } = useTaskForm();

  useEffect(() => {
    if (id) {
      activateDetail();
      activateForm();
    }
  }, [id, activateDetail, activateForm]);

  // 当详情数据加载完成后，设置表单初始值
  useEffect(() => {
    if (detail) {
      form.setFieldsValue({
        name: detail.name,
        description: detail.description,
        algorithm: detail.algorithm,
        metricSystemId: detail.metricSystemId,
      });
    }
  }, [detail, form]);

  // 监听表单变化
  const handleFormChange = () => {
    setHasChanges(true);
  };

  // 处理返回
  const handleBack = () => {
    if (hasChanges) {
      message.warning('有未保存的更改，请先保存或放弃更改');
      return;
    }
    navigate('/evaluation-task/task-management');
  };

  // 处理保存
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const updateParams: UpdateTaskParams = {
        id: id!,
        ...values,
      };
      
      updateTask(updateParams);
      setHasChanges(false);
      message.success('保存成功');
    } catch (error) {
      // 表单验证失败
    }
  };

  // 处理保存并运行
  const handleSaveAndRun = async () => {
    try {
      const values = await form.validateFields();
      const updateParams: UpdateTaskParams = {
        id: id!,
        ...values,
      };
      
      // 先保存
      await updateTask(updateParams);
      setHasChanges(false);
      
      // 再运行
      runTask(id!);
      message.success('任务已开始运行');
    } catch (error) {
      // 表单验证失败
    }
  };

  // 处理放弃更改
  const handleDiscard = () => {
    if (detail) {
      form.setFieldsValue({
        name: detail.name,
        description: detail.description,
        algorithm: detail.algorithm,
        metricSystemId: detail.metricSystemId,
      });
      setHasChanges(false);
    }
  };

  if (detailLoading) {
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
            <Button size="small" onClick={() => navigate('/evaluation-task/task-management')}>
              返回列表
            </Button>
          }
        />
      </div>
    );
  }

  if (detail.status !== 'draft') {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          message="无法编辑"
          description="只有草稿状态的任务才能编辑。"
          type="warning"
          showIcon
          action={
            <Button size="small" onClick={() => navigate('/evaluation-task/task-management')}>
              返回列表
            </Button>
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
            编辑任务：{detail.name}
          </Title>
        </Space>
        
        <div style={{ marginTop: 16 }}>
          <Space>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={updating}
              disabled={!hasChanges}
              onClick={handleSave}
            >
              保存
            </Button>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              loading={running}
              onClick={handleSaveAndRun}
            >
              保存并运行
            </Button>
            <Button
              disabled={!hasChanges}
              onClick={handleDiscard}
            >
              放弃更改
            </Button>
          </Space>
        </div>
      </div>

      {hasChanges && (
        <Alert
          message="有未保存的更改"
          description="您对任务进行了修改，请记得保存更改。"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Row gutter={24}>
        <Col span={16}>
          <Card title="基本信息">
            <Form
              form={form}
              layout="vertical"
              onValuesChange={handleFormChange}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="任务名称"
                    rules={[{ required: true, message: '请输入任务名称' }]}
                  >
                    <Input placeholder="请输入任务名称" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="algorithm"
                    label="评估算法"
                    rules={[{ required: true, message: '请选择评估算法' }]}
                  >
                    <Select
                      placeholder="请选择评估算法"
                      loading={algorithmsLoading}
                    >
                      {algorithms.map((algorithm) => (
                        <Option key={algorithm.id} value={algorithm.id}>
                          {algorithm.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="metricSystemId"
                    label="指标体系"
                    rules={[{ required: true, message: '请选择指标体系' }]}
                  >
                    <Select
                      placeholder="请选择指标体系"
                      loading={metricSystemsLoading}
                      showSearch
                      filterOption={(input, option) =>
                        (option?.children as unknown as string)
                          ?.toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    >
                      {metricSystems.map((system) => (
                        <Option key={system.id} value={system.id}>
                          {system.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="description" label="任务描述">
                <TextArea
                  rows={4}
                  placeholder="请输入任务描述"
                  showCount
                  maxLength={500}
                />
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="任务信息" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <div style={{ color: '#666', fontSize: 12 }}>任务ID</div>
                <div>{detail.id}</div>
              </div>
              <div>
                <div style={{ color: '#666', fontSize: 12 }}>创建人</div>
                <div>{detail.creator}</div>
              </div>
              <div>
                <div style={{ color: '#666', fontSize: 12 }}>创建时间</div>
                <div>{detail.createdTime}</div>
              </div>
              {detail.updatedTime && (
                <div>
                  <div style={{ color: '#666', fontSize: 12 }}>更新时间</div>
                  <div>{detail.updatedTime}</div>
                </div>
              )}
              {detail.templateName && (
                <div>
                  <div style={{ color: '#666', fontSize: 12 }}>使用模板</div>
                  <div>{detail.templateName}</div>
                </div>
              )}
            </Space>
          </Card>

          <Card title="编辑提示" size="small" style={{ marginTop: 16 }}>
            <Alert
              message="编辑说明"
              description={
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  <li>只有草稿状态的任务可以编辑</li>
                  <li>修改后需要保存才能生效</li>
                  <li>可以直接保存并运行任务</li>
                  <li>放弃更改将恢复到原始状态</li>
                </ul>
              }
              type="info"
              showIcon
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Edit;