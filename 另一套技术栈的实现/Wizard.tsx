import React, { useState } from 'react';
import { useNavigate } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import {
  Steps,
  Form,
  Input,
  Select,
  Radio,
  Card,
  Button,
  Space,
  Divider,
  Alert,
  Row,
  Col,
  Typography,
  Tag,
  message,
} from 'antd';
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import useTaskForm from './models/useTaskForm';
import type { TaskWizardData } from './types/task';

const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

const Wizard: React.FC = () => {
  const navigate = useNavigate();
  const {
    templates,
    algorithms,
    metricSystems,
    dashboardTemplates,
    templatesLoading,
    algorithmsLoading,
    metricSystemsLoading,
    dashboardTemplatesLoading,
    activate,
    saveWizard,
    saving,
  } = useTaskForm();

  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<TaskWizardData>({
    step1: {
      name: '',
      description: '',
      createType: 'blank',
      algorithm: '',
    },
    step2: {
      metricSystemId: '',
      customizations: [],
      dataMapping: [],
    },
    step3: {
      dashboardTemplateId: '',
      layoutConfig: {},
    },
    step4: {
      summary: {},
      validated: false,
    },
  });

  const [form] = Form.useForm();

  // 初始化数据
  React.useEffect(() => {
    activate();
  }, [activate]);

  // 步骤配置
  const steps = [
    {
      title: '设置与方法选择',
      description: '基本信息和算法选择',
    },
    {
      title: '配置指标体系与数据',
      description: '选择指标体系和数据映射',
    },
    {
      title: '配置结果展示',
      description: '选择仪表板模板',
    },
    {
      title: '审查与启动',
      description: '确认配置并启动任务',
    },
  ];

  // 下一步
  const handleNext = async () => {
    try {
      const values = await form.validateFields();
      const newWizardData = { ...wizardData };
      
      if (currentStep === 0) {
        newWizardData.step1 = { ...newWizardData.step1, ...values };
      } else if (currentStep === 1) {
        newWizardData.step2 = { ...newWizardData.step2, ...values };
      } else if (currentStep === 2) {
        newWizardData.step3 = { ...newWizardData.step3, ...values };
      }
      
      setWizardData(newWizardData);
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 上一步
  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  // 完成
  const handleFinish = async () => {
    try {
      const values = await form.validateFields();
      const finalData = { ...wizardData };
      finalData.step4 = { ...finalData.step4, ...values };
      
      await saveWizard(finalData);
      message.success('任务创建成功！');
      navigate('/evaluation-task-management/task-list');
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败，请重试');
    }
  };

  // 渲染步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderStep1();
      case 1:
        return renderStep2();
      case 2:
        return renderStep3();
      case 3:
        return renderStep4();
      default:
        return null;
    }
  };

  // 渲染第一步
  const renderStep1 = () => (
    <div>
      <Form form={form} layout="vertical" initialValues={wizardData.step1}>
        <Card title="基本信息" size="small" style={{ marginBottom: 24 }}>
          <Form.Item
            name="name"
            label="任务名称"
            rules={[{ required: true, message: '请输入任务名称' }]}
          >
            <Input placeholder="请输入任务名称" size="large" />
          </Form.Item>
          
          <Form.Item name="description" label="任务描述">
            <TextArea rows={4} placeholder="请输入任务描述" />
          </Form.Item>
        </Card>

        <Card title="创建方式" size="small" style={{ marginBottom: 24 }}>
          <Form.Item
            name="createType"
            label="请选择创建方式"
            rules={[{ required: true, message: '请选择创建方式' }]}
          >
            <Radio.Group style={{ width: '100%' }}>
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <Card 
                  size="small" 
                  style={{ cursor: 'pointer', border: '1px solid #d9d9d9' }}
                  hoverable
                  bodyStyle={{ padding: '16px' }}
                >
                  <Radio value="blank" style={{ width: '100%' }}>
                    <div style={{ marginLeft: '8px' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: 4 }}>从空白创建</div>
                      <div style={{ color: '#666', fontSize: '12px' }}>从零开始配置评估任务</div>
                    </div>
                  </Radio>
                </Card>
                <Card 
                  size="small" 
                  style={{ cursor: 'pointer', border: '1px solid #d9d9d9' }}
                  hoverable
                  bodyStyle={{ padding: '16px' }}
                >
                  <Radio value="template" style={{ width: '100%' }}>
                    <div style={{ marginLeft: '8px' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: 4 }}>从任务模板创建</div>
                      <div style={{ color: '#666', fontSize: '12px' }}>基于现有模板快速创建</div>
                    </div>
                  </Radio>
                </Card>
              </Space>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.createType !== currentValues.createType
            }
          >
            {({ getFieldValue }) =>
              getFieldValue('createType') === 'template' ? (
                <Form.Item
                  name="templateId"
                  label="任务模板"
                  rules={[{ required: true, message: '请选择任务模板' }]}
                >
                  <Select
                    placeholder="请选择任务模板"
                    loading={templatesLoading}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children as unknown as string)
                        ?.toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {templates.map((template) => (
                      <Option key={template.id} value={template.id}>
                        {template.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              ) : null
            }
          </Form.Item>
        </Card>

        <Card title="评估算法" size="small" style={{ marginBottom: 24 }}>
          <Form.Item
            name="algorithm"
            label="请选择评估算法"
            rules={[{ required: true, message: '请选择评估算法' }]}
          >
            {algorithmsLoading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Text type="secondary">正在加载算法列表...</Text>
              </div>
            ) : algorithms.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Text type="secondary">暂无可用算法</Text>
              </div>
            ) : (
              <Radio.Group style={{ width: '100%' }}>
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  {algorithms.map((algorithm) => (
                    <Card
                      key={algorithm.id}
                      size="small"
                      style={{ 
                        cursor: 'pointer',
                        border: '1px solid #d9d9d9',
                        borderRadius: '6px'
                      }}
                      hoverable
                      bodyStyle={{ padding: '12px 16px' }}
                    >
                      <Radio value={algorithm.id} style={{ width: '100%' }}>
                        <div style={{ marginLeft: '8px' }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                            {algorithm.name}
                          </div>
                          <div style={{ color: '#666', fontSize: '12px', lineHeight: '1.4' }}>
                            {algorithm.description}
                          </div>
                          {algorithm.category && (
                            <div style={{ marginTop: '4px' }}>
                              <Tag color="blue">{algorithm.category}</Tag>
                              {algorithm.complexity && (
                                <Tag color={
                                  algorithm.complexity === 'low' ? 'green' : 
                                  algorithm.complexity === 'medium' ? 'orange' : 'red'
                                }>
                                  {algorithm.complexity === 'low' ? '简单' : 
                                   algorithm.complexity === 'medium' ? '中等' : '复杂'}
                                </Tag>
                              )}
                            </div>
                          )}
                        </div>
                      </Radio>
                    </Card>
                  ))}
                </Space>
              </Radio.Group>
            )}
          </Form.Item>
        </Card>
      </Form>
    </div>
  );

  // 渲染第二步
  const renderStep2 = () => (
    <div>
      <Form form={form} layout="vertical" initialValues={wizardData.step2}>
        <Alert
          message="指标体系配置"
          description="请选择一个基础指标体系模板，您可以在此基础上进行临时性修改。原始模板不会受到影响。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form.Item
          name="metricSystemId"
          label="指标体系模板"
          rules={[{ required: true, message: '请选择指标体系模板' }]}
        >
          <Select
            placeholder="请选择指标体系模板"
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
                <Space direction="vertical" size={0}>
                  <Text>{system.name}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {system.description}
                  </Text>
                </Space>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Divider>数据映射配置</Divider>
        <Alert
          message="数据映射提示"
          description="为指标体系中的每个叶子节点配置数据源。所有必需的数据源都完成映射后，才能运行任务。"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Card title="数据映射配置" size="small">
          <Text type="secondary">请先选择指标体系模板，然后配置数据映射</Text>
        </Card>
      </Form>
    </div>
  );

  // 渲染第三步
  const renderStep3 = () => (
    <div>
      <Form form={form} layout="vertical" initialValues={wizardData.step3}>
        <Alert
          message="仪表板配置"
          description="选择一个仪表板模板来展示评估结果，或选择空白画布自定义布局。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form.Item
          name="dashboardTemplateId"
          label="仪表板模板"
          rules={[{ required: true, message: '请选择仪表板模板' }]}
        >
          <Radio.Group style={{ width: '100%' }}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card
                  size="small"
                  hoverable
                  style={{ cursor: 'pointer' }}
                  cover={
                    <div
                      style={{
                        height: 120,
                        background: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text type="secondary">空白画布</Text>
                    </div>
                  }
                >
                  <Radio value="blank">空白画布</Radio>
                </Card>
              </Col>
              {dashboardTemplates.map((template) => (
                <Col span={12} key={template.id}>
                  <Card
                    size="small"
                    hoverable
                    style={{ cursor: 'pointer' }}
                    cover={
                      <div
                        style={{
                          height: 120,
                          background: '#f5f5f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text type="secondary">模板预览</Text>
                      </div>
                    }
                  >
                    <Radio value={template.id}>{template.name}</Radio>
                  </Card>
                </Col>
              ))}
            </Row>
          </Radio.Group>
        </Form.Item>
      </Form>
    </div>
  );

  // 渲染第四步
  const renderStep4 = () => (
    <div>
      <Alert
        message="配置审查"
        description="请确认以下配置信息，确认无误后可保存为草稿或直接运行任务。"
        type="success"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Text strong>任务名称：</Text>
            <Text>{wizardData.step1.name}</Text>
          </Col>
          <Col span={12}>
            <Text strong>创建方式：</Text>
            <Text>{wizardData.step1.createType === 'blank' ? '从空白创建' : '从模板创建'}</Text>
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 8 }}>
          <Col span={12}>
            <Text strong>评估算法：</Text>
            <Text>{wizardData.step1.algorithm}</Text>
          </Col>
          <Col span={12}>
            <Text strong>描述：</Text>
            <Text>{wizardData.step1.description || '无'}</Text>
          </Col>
        </Row>
      </Card>

      <Card title="指标体系与数据" size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Text strong>指标体系：</Text>
            <Text>{wizardData.step2.metricSystemId}</Text>
          </Col>
          <Col span={12}>
            <Text strong>数据映射：</Text>
            <Tag color={wizardData.step2.dataMapping.length > 0 ? 'success' : 'warning'}>
              {wizardData.step2.dataMapping.length > 0 ? '已配置' : '未配置'}
            </Tag>
          </Col>
        </Row>
      </Card>

      <Card title="结果展示" size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Text strong>仪表板模板：</Text>
            <Text>{wizardData.step3.dashboardTemplateId}</Text>
          </Col>
        </Row>
      </Card>

      <Form form={form} layout="vertical">
        <Form.Item name="saveType" label="操作选择" initialValue="draft">
          <Radio.Group>
            <Radio value="draft">
              <Space>
                <InfoCircleOutlined />
                保存为草稿
              </Space>
            </Radio>
            <Radio value="run" disabled={wizardData.step2.dataMapping.length === 0}>
              <Space>
                <CheckCircleOutlined />
                运行任务
                {wizardData.step2.dataMapping.length === 0 && (
                  <Text type="secondary">(需完成数据映射)</Text>
                )}
              </Space>
            </Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </div>
  );

  return (
    <PageContainer
      title="创建评估任务"
      onBack={() => navigate('/evaluation-task-management/task-list')}
    >
      <Card>
        <Steps 
          current={currentStep} 
          style={{ marginBottom: 32 }}
          size="small"
        >
          {steps.map((step, index) => (
            <Step 
              key={index} 
              title={step.title} 
              description={step.description}
            />
          ))}
        </Steps>

        <div style={{ minHeight: 500, marginBottom: 24 }}>
          {renderStepContent()}
        </div>

        <div style={{ textAlign: 'right' }}>
          <Space>
            <Button onClick={() => navigate('/evaluation-task-management/task-list')}>
              取消
            </Button>
            {currentStep > 0 && (
              <Button onClick={handlePrev}>
                上一步
              </Button>
            )}
            {currentStep < steps.length - 1 && (
              <Button type="primary" onClick={handleNext}>
                下一步
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button type="primary" loading={saving} onClick={handleFinish}>
                完成
              </Button>
            )}
          </Space>
        </div>
      </Card>
    </PageContainer>
  );
};

export default Wizard;