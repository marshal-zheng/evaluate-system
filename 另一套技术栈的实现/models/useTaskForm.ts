import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { useState } from 'react';
import {
  createTask,
  updateTask,
  getTaskTemplateList,
  getAlgorithmList,
  getMetricSystemList,
  getDashboardTemplateList,
  saveTaskWizard,
} from '../services/taskService';
import type { CreateTaskParams, UpdateTaskParams, TaskWizardData } from '../types/task';

export default function useTaskForm() {
  const queryClient = useQueryClient();
  const [activated, setActivated] = useState(false);

  // 激活方法
  const activate = () => setActivated(true);

  // 获取任务模板列表
  const templateQuery = useQuery({
    queryKey: ['taskTemplates'],
    queryFn: getTaskTemplateList,
    enabled: activated,
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  });

  // 获取算法列表
  const algorithmQuery = useQuery({
    queryKey: ['algorithms'],
    queryFn: getAlgorithmList,
    enabled: activated,
    staleTime: 5 * 60 * 1000,
  });

  // 获取指标体系列表
  const metricSystemQuery = useQuery({
    queryKey: ['metricSystems'],
    queryFn: getMetricSystemList,
    enabled: activated,
    staleTime: 5 * 60 * 1000,
  });

  // 获取仪表板模板列表
  const dashboardTemplateQuery = useQuery({
    queryKey: ['dashboardTemplates'],
    queryFn: getDashboardTemplateList,
    enabled: activated,
    staleTime: 5 * 60 * 1000,
  });

  // 创建任务
  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      message.success('创建成功');
      queryClient.invalidateQueries({ queryKey: ['taskList'] });
    },
    onError: () => {
      message.error('创建失败');
    },
  });

  // 更新任务
  const updateMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      message.success('更新成功');
      queryClient.invalidateQueries({ queryKey: ['taskList'] });
    },
    onError: () => {
      message.error('更新失败');
    },
  });

  // 保存任务向导
  const saveWizardMutation = useMutation({
    mutationFn: saveTaskWizard,
    onSuccess: () => {
      message.success('保存成功');
      queryClient.invalidateQueries({ queryKey: ['taskList'] });
    },
    onError: () => {
      message.error('保存失败');
    },
  });

  return {
    // 数据
    templates: templateQuery.data || [],
    algorithms: algorithmQuery.data || [],
    metricSystems: metricSystemQuery.data || [],
    dashboardTemplates: dashboardTemplateQuery.data || [],
    
    // 加载状态
    templatesLoading: templateQuery.isLoading,
    algorithmsLoading: algorithmQuery.isLoading,
    metricSystemsLoading: metricSystemQuery.isLoading,
    dashboardTemplatesLoading: dashboardTemplateQuery.isLoading,
    
    // 方法
    activate,
    createTask: createMutation.mutate,
    updateTask: updateMutation.mutate,
    saveWizard: saveWizardMutation.mutate,
    
    // 操作状态
    creating: createMutation.isPending,
    updating: updateMutation.isPending,
    saving: saveWizardMutation.isPending,
    
    // 成功回调数据
    createResult: createMutation.data,
    updateResult: updateMutation.data,
    saveResult: saveWizardMutation.data,
  };
}