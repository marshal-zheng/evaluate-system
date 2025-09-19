import React, { useEffect, useState } from 'react';
import {
  Button,
  Space,
  Table,
  Tag,
  Popconfirm,
  Input,
  Select,
  Modal,
  Form,
  message,
} from 'antd';
import {
  PlusOutlined,
} from '@ant-design/icons';
import { history } from '@umijs/max';
import { GridLayout, Toolbar, Pagination } from '@/components';
import useTaskList from '../models/useTaskList';
import TaskWizard from './TaskWizard';
import type { TaskListItem } from '../types/task';
import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;
const { Option } = Select;

const TaskList: React.FC = () => {
  const {
    list,
    total,
    loading,
    params,
    setParams,
    activate,
    fetchList,
    deleteTask,
    batchDeleteTask,
    cloneTask,
    runTask,
    stopTask,
    deleting,
    batchDeleting,
    cloning,
    running,
    stopping,
  } = useTaskList();

  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [wizardVisible, setWizardVisible] = useState(false);
  const [cloneModalVisible, setCloneModalVisible] = useState(false);
  const [cloneTaskId, setCloneTaskId] = useState<string>('');
  const [cloneForm] = Form.useForm();



  // 组件挂载时激活
  useEffect(() => {
    activate();
  }, [activate]);

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

  // 表格列定义
  const columns: ColumnsType<TaskListItem> = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '指标体系',
      dataIndex: 'metricSystemName',
      key: 'metricSystemName',
      width: 150,
      ellipsis: true,
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
      width: 120,
    },
    {
      title: '创建日期',
      dataIndex: 'createdTime',
      key: 'createdTime',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 300,
      render: (_, record) => {
        const actions = [];
        
        // 根据状态显示对应操作
        if (record.status === 'completed') {
          actions.push(
            <Button
              key="view"
              type="link"
              size="small"
              onClick={() => handleViewResult(record.id)}
            >
              查看结果
            </Button>
          );
        }
        
        if (record.status === 'draft') {
          actions.push(
            <Button
              key="edit"
              type="link"
              size="small"
              onClick={() => handleEdit(record.id)}
            >
              编辑
            </Button>,
            <Button
              key="run"
              type="link"
              size="small"
              loading={running}
              onClick={() => runTask(record.id)}
            >
              运行
            </Button>
          );
        }
        
        if (record.status === 'calculating') {
          actions.push(
            <Button
              key="stop"
              type="link"
              size="small"
              loading={stopping}
              onClick={() => stopTask(record.id)}
            >
              停止
            </Button>
          );
        }
        
        // 通用操作
        actions.push(
          <Button
            key="clone"
            type="link"
            size="small"
            loading={cloning}
            onClick={() => handleClone(record.id)}
          >
            克隆
          </Button>,
          <Popconfirm
            key="delete"
            title="确定要删除这个任务吗？"
            onConfirm={() => deleteTask(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              loading={deleting}
            >
              删除
            </Button>
          </Popconfirm>
        );
        
        return <Space size="small">{actions}</Space>;
      },
    },
  ];

  // 处理搜索
  const handleSearch = (value: string) => {
    setParams({ ...params, name: value, no: 1 });
  };

  // 处理状态筛选
  const handleStatusChange = (value: string) => {
    setParams({ ...params, status: value, no: 1 });
  };

  // 处理分页
  const handleTableChange = (pagination: any) => {
    setParams({
      ...params,
      no: pagination.current,
      size: pagination.pageSize,
    });
  };

  // 处理批量删除
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的任务');
      return;
    }
    Modal.confirm({
      title: '批量删除确认',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个任务吗？`,
      onOk: () => {
        batchDeleteTask(selectedRowKeys);
        setSelectedRowKeys([]);
      },
    });
  };

  // 处理查看结果
  const handleViewResult = (taskId: string) => {
    // 跳转到结果页面
    history.push(`/evaluation-task-management/task-results/${taskId}`);
  };

  // 处理编辑
  const handleEdit = (taskId: string) => {
    // 跳转到编辑页面
    history.push(`/evaluation-task-management/task-edit/${taskId}`);
  };

  // 处理克隆
  const handleClone = (taskId: string) => {
    setCloneTaskId(taskId);
    setCloneModalVisible(true);
  };

  // 确认克隆
  const handleCloneConfirm = async () => {
    try {
      const values = await cloneForm.validateFields();
      cloneTask({ id: cloneTaskId, name: values.name });
      setCloneModalVisible(false);
      cloneForm.resetFields();
    } catch (error) {
      // 表单验证失败
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys(keys as string[]);
    },
  };

  return (
    <>
      <GridLayout
        toolbar={
          <Toolbar
            left={
              <>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setWizardVisible(true)}
                >
                  创建任务
                </Button>
                <Button
                  danger
                  disabled={selectedRowKeys.length === 0}
                  loading={batchDeleting}
                  onClick={handleBatchDelete}
                >
                  批量删除
                </Button>
                <Select
                  placeholder="状态筛选"
                  allowClear
                  style={{ width: 120 }}
                  onChange={handleStatusChange}
                >
                  <Option value="draft">草稿</Option>
                  <Option value="calculating">计算中</Option>
                  <Option value="completed">已完成</Option>
                  <Option value="failed">失败</Option>
                </Select>

              </>
            }
            onSearch={(key, val) => handleSearch(val)}
            searchPlaceholder="搜索任务名称"
            loading={loading}
          />
        }
        content={
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={list}
            rowKey="id"
            loading={loading}
            pagination={false}
            scroll={{ x: 1200 }}
          />
        }
        pagination={
          <Pagination
            current={params.no}
            pageSize={params.size}
            total={total}
            onChange={(page: number, pageSize: number) =>
              setParams({ ...params, no: page, size: pageSize })
            }
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`}
          />
        }
      />

      {/* 任务创建向导 */}
      <TaskWizard
        visible={wizardVisible}
        onCancel={() => setWizardVisible(false)}
        onSuccess={() => {
          setWizardVisible(false);
          fetchList();
        }}
      />

      {/* 克隆任务模态框 */}
      <Modal
        title="克隆任务"
        open={cloneModalVisible}
        onOk={handleCloneConfirm}
        onCancel={() => {
          setCloneModalVisible(false);
          cloneForm.resetFields();
        }}
        confirmLoading={cloning}
      >
        <Form form={cloneForm} layout="vertical">
          <Form.Item
            name="name"
            label="任务名称"
            rules={[{ required: true, message: '请输入任务名称' }]}
          >
            <Input placeholder="请输入新任务的名称" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default TaskList;