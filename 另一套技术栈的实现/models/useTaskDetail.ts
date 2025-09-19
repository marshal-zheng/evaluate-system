import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { useState } from 'react';
import {
  getTaskDetail,
  updateTask,
  runTask,
  stopTask,
} from '../services/taskService';
import type { UpdateTaskParams } from '../types/task';

export default function useTaskDetail(taskId: string) {
  const queryClient = useQueryClient();
  const [activated, setActivated] = useState(false);

  // 激活方法
  const activate = () => setActivated(true);

  // 任务详情查询
  const detailQuery = useQuery({
    queryKey: ['taskDetail', taskId],
    queryFn: async () => {
      if (!taskId) return null;
      return await getTaskDetail(taskId);
    },
    enabled: activated && !!taskId,
    staleTime: 0,
  });

  // 更新任务
  const updateMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      message.success('更新成功');
      queryClient.invalidateQueries({ queryKey: ['taskDetail', taskId] });
      queryClient.invalidateQueries({ queryKey: ['taskList'] });
    },
    onError: () => {
      message.error('更新失败');
    },
  });

  // 运行任务
  const runMutation = useMutation({
    mutationFn: runTask,
    onSuccess: () => {
      message.success('任务已开始运行');
      queryClient.invalidateQueries({ queryKey: ['taskDetail', taskId] });
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
      queryClient.invalidateQueries({ queryKey: ['taskDetail', taskId] });
      queryClient.invalidateQueries({ queryKey: ['taskList'] });
    },
    onError: () => {
      message.error('停止失败');
    },
  });

  // 刷新详情
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['taskDetail', taskId] });
  };

  return {
    // 数据
    detail: detailQuery.data,
    loading: detailQuery.isLoading,
    error: detailQuery.error,
    
    // 方法
    activate,
    refresh,
    updateTask: updateMutation.mutate,
    runTask: runMutation.mutate,
    stopTask: stopMutation.mutate,
    
    // 状态
    updating: updateMutation.isPending,
    running: runMutation.isPending,
    stopping: stopMutation.isPending,
  };
}