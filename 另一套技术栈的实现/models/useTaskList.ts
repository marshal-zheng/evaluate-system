import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { useState } from 'react';
import {
  getTaskList,
  deleteTask,
  batchDeleteTask,
  cloneTask,
  runTask,
  stopTask,
} from '../services/taskService';

export default function useTaskList() {
  const queryClient = useQueryClient();

  // 列表参数
  const [params, setParams] = useState({
    name: '',
    status: '',
    creator: '',
    no: 1,
    size: 10,
  });

  // 列表激活状态
  const [activated, setActivated] = useState(false);

  // 激活方法，页面挂载时调用一次
  const activate = () => setActivated(true);

  // 任务列表查询
  const listQuery = useQuery({
    queryKey: ['taskList', params],
    queryFn: async () => {
      return await getTaskList(params);
    },
    enabled: activated,
    staleTime: 0,
  });

  // 支持外部传参刷新
  const fetchList = (newParams?: any) => {
    if (newParams) {
      setParams((prev) => ({ ...prev, ...newParams }));
    } else {
      setParams((prev) => ({ ...prev }));
    }
  };

  // 删除任务
  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      message.success('删除成功');
      queryClient.invalidateQueries({ queryKey: ['taskList'] });
    },
    onError: () => {
      message.error('删除失败');
    },
  });

  // 批量删除任务
  const batchDeleteMutation = useMutation({
    mutationFn: batchDeleteTask,
    onSuccess: () => {
      message.success('批量删除成功');
      queryClient.invalidateQueries({ queryKey: ['taskList'] });
    },
    onError: () => {
      message.error('批量删除失败');
    },
  });

  // 克隆任务
  const cloneMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => cloneTask(id, name),
    onSuccess: () => {
      message.success('克隆成功');
      queryClient.invalidateQueries({ queryKey: ['taskList'] });
    },
    onError: () => {
      message.error('克隆失败');
    },
  });

  // 运行任务
  const runMutation = useMutation({
    mutationFn: runTask,
    onSuccess: () => {
      message.success('任务已开始运行');
      queryClient.invalidateQueries({ queryKey: ['taskList'] });
    },
    onError: () => {
      message.error('运行失败');
    },
  });

  // 停止任务
  const stopMutation = useMutation({
    mutationFn: stopTask,
    onSuccess: () => {
      message.success('任务已停止');
      queryClient.invalidateQueries({ queryKey: ['taskList'] });
    },
    onError: () => {
      message.error('停止失败');
    },
  });

  return {
    // 数据
    list: listQuery.data?.list || [],
    total: listQuery.data?.total || 0,
    loading: listQuery.isLoading,
    params,
    
    // 方法
    setParams,
    activate,
    fetchList,
    deleteTask: deleteMutation.mutate,
    batchDeleteTask: batchDeleteMutation.mutate,
    cloneTask: cloneMutation.mutate,
    runTask: runMutation.mutate,
    stopTask: stopMutation.mutate,
    
    // 状态
    deleting: deleteMutation.isPending,
    batchDeleting: batchDeleteMutation.isPending,
    cloning: cloneMutation.isPending,
    running: runMutation.isPending,
    stopping: stopMutation.isPending,
  };
}