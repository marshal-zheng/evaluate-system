import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { BrowserRouter } from 'react-router-dom';
import Add from '../Add';

// Mock antd components
jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  message: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  },
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/evaluation-task-management/task-management/add' }),
}));

// Mock API
jest.mock('@/services/evaluationTaskManagement', () => ({
  createTask: jest.fn(() => Promise.resolve({ success: true, data: { id: '1' } })),
  getMetricSystemList: jest.fn(() =>
    Promise.resolve({
      data: [
        { id: '1', name: '指标体系1' },
        { id: '2', name: '指标体系2' },
      ],
      success: true,
    })
  ),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </ConfigProvider>
  );
};

describe('TaskManagement Add', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('应该正确渲染添加任务页面', () => {
    renderWithProviders(<Add />);
    
    expect(screen.getByText('创建评估任务')).toBeInTheDocument();
    expect(screen.getByLabelText('任务名称')).toBeInTheDocument();
    expect(screen.getByLabelText('任务描述')).toBeInTheDocument();
    expect(screen.getByLabelText('指标体系')).toBeInTheDocument();
  });

  it('应该显示步骤导航', () => {
    renderWithProviders(<Add />);
    
    expect(screen.getByText('基本信息')).toBeInTheDocument();
    expect(screen.getByText('选择指标')).toBeInTheDocument();
    expect(screen.getByText('配置权重')).toBeInTheDocument();
    expect(screen.getByText('完成创建')).toBeInTheDocument();
  });

  it('应该验证必填字段', async () => {
    renderWithProviders(<Add />);
    
    const submitButton = screen.getByText('下一步');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('请输入任务名称')).toBeInTheDocument();
    });
  });

  it('应该能够输入任务信息', async () => {
    renderWithProviders(<Add />);
    
    const nameInput = screen.getByLabelText('任务名称');
    const descInput = screen.getByLabelText('任务描述');
    
    await user.type(nameInput, '测试任务');
    await user.type(descInput, '这是一个测试任务');
    
    expect(nameInput).toHaveValue('测试任务');
    expect(descInput).toHaveValue('这是一个测试任务');
  });

  it('应该能够选择指标体系', async () => {
    renderWithProviders(<Add />);
    
    const selectElement = screen.getByLabelText('指标体系');
    await user.click(selectElement);
    
    await waitFor(() => {
      expect(screen.getByText('指标体系1')).toBeInTheDocument();
      expect(screen.getByText('指标体系2')).toBeInTheDocument();
    });
  });

  it('应该显示操作按钮', () => {
    renderWithProviders(<Add />);
    
    expect(screen.getByText('取消')).toBeInTheDocument();
    expect(screen.getByText('下一步')).toBeInTheDocument();
  });

  it('点击取消应该返回列表页', async () => {
    renderWithProviders(<Add />);
    
    const cancelButton = screen.getByText('取消');
    await user.click(cancelButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/evaluation-task-management/task-management');
  });

  it('应该能够进行步骤切换', async () => {
    renderWithProviders(<Add />);
    
    // 填写基本信息
    const nameInput = screen.getByLabelText('任务名称');
    await user.type(nameInput, '测试任务');
    
    const selectElement = screen.getByLabelText('指标体系');
    await user.click(selectElement);
    
    await waitFor(() => {
      const option = screen.getByText('指标体系1');
      user.click(option);
    });
    
    // 点击下一步
    const nextButton = screen.getByText('下一步');
    await user.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getByText('上一步')).toBeInTheDocument();
    });
  });
});