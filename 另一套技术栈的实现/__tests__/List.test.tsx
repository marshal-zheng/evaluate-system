import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { BrowserRouter } from 'react-router-dom';
import List from '../List';

// Mock antd components
jest.mock('@ant-design/pro-components', () => ({
  ProTable: ({ columns, request, toolBarRender, ...props }: any) => {
    const mockData = [
      {
        id: '1',
        name: '测试任务1',
        status: 'draft',
        metricSystemName: '指标体系1',
        creator: '张三',
        createTime: '2024-01-01 10:00:00',
      },
      {
        id: '2',
        name: '测试任务2',
        status: 'published',
        metricSystemName: '指标体系2',
        creator: '李四',
        createTime: '2024-01-02 11:00:00',
      },
    ];

    return (
      <div data-testid="pro-table">
        <div data-testid="toolbar">
          {toolBarRender && toolBarRender()}
        </div>
        <table>
          <thead>
            <tr>
              {columns.map((col: any, index: number) => (
                <th key={index}>{col.title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockData.map((item: any) => (
              <tr key={item.id} data-testid={`table-row-${item.id}`}>
                {columns.map((col: any, index: number) => (
                  <td key={index}>
                    {col.render ? col.render(item[col.dataIndex], item) : item[col.dataIndex]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/evaluation-task-management/task-management' }),
}));

// Mock API
jest.mock('@/services/evaluationTaskManagement', () => ({
  getTaskList: jest.fn(() =>
    Promise.resolve({
      data: [
        {
          id: '1',
          name: '测试任务1',
          status: 'draft',
          metricSystemName: '指标体系1',
          creator: '张三',
          createTime: '2024-01-01 10:00:00',
        },
      ],
      total: 1,
      success: true,
    })
  ),
  deleteTask: jest.fn(() => Promise.resolve({ success: true })),
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

describe('TaskManagement List', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('应该正确渲染任务列表', async () => {
    renderWithProviders(<List />);
    
    expect(screen.getByTestId('pro-table')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('测试任务1')).toBeInTheDocument();
      expect(screen.getByText('测试任务2')).toBeInTheDocument();
    });
  });

  it('应该显示正确的列标题', () => {
    renderWithProviders(<List />);
    
    expect(screen.getByText('任务名称')).toBeInTheDocument();
    expect(screen.getByText('状态')).toBeInTheDocument();
    expect(screen.getByText('指标体系')).toBeInTheDocument();
    expect(screen.getByText('创建人')).toBeInTheDocument();
    expect(screen.getByText('创建时间')).toBeInTheDocument();
    expect(screen.getByText('操作')).toBeInTheDocument();
  });

  it('应该显示工具栏按钮', () => {
    renderWithProviders(<List />);
    
    const toolbar = screen.getByTestId('toolbar');
    expect(toolbar).toBeInTheDocument();
  });

  it('应该正确显示任务状态', async () => {
    renderWithProviders(<List />);
    
    await waitFor(() => {
      expect(screen.getByText('草稿')).toBeInTheDocument();
      expect(screen.getByText('已发布')).toBeInTheDocument();
    });
  });

  it('应该显示操作按钮', async () => {
    renderWithProviders(<List />);
    
    await waitFor(() => {
      const rows = screen.getAllByTestId(/table-row-/);
      expect(rows).toHaveLength(2);
    });
  });
});