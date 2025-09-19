import http from '@/utils/request';
import type {
  Task,
  TaskDetail,
  TaskListResponse,
  CreateTaskParams,
  UpdateTaskParams,
  TaskWizardData,
} from '../types/task';

interface IListParams {
  no?: number;
  size?: number;
  name?: string;
  status?: string;
  creator?: string;
  [key: string]: any;
}

// 获取任务列表
export async function getTaskList(params: IListParams): Promise<TaskListResponse> {
  const res = await http.get('/evaluation-task/tasks', { params });
  return res?.data;
}

// 获取任务详情
export async function getTaskDetail(id: string): Promise<TaskDetail> {
  const res = await http.get(`/evaluation-task/tasks/${id}`);
  return res?.data;
}

// 创建任务
export async function createTask(params: CreateTaskParams): Promise<boolean> {
  const res = await http.post('/evaluation-task/tasks', params);
  return !!res?.data;
}

// 更新任务
export async function updateTask(params: UpdateTaskParams): Promise<boolean> {
  const res = await http.put(`/evaluation-task/tasks/${params.id}`, params);
  return !!res?.data;
}

// 删除任务
export async function deleteTask(id: string): Promise<boolean> {
  const res = await http.delete(`/evaluation-task/tasks/${id}`);
  return !!res?.data;
}

// 批量删除任务
export async function batchDeleteTask(ids: string[]): Promise<boolean> {
  const res = await http.delete('/evaluation-task/tasks/batch', { data: { ids } });
  return !!res?.data;
}

// 克隆任务
export async function cloneTask(id: string, name: string): Promise<boolean> {
  const res = await http.post(`/evaluation-task/tasks/${id}/clone`, { name });
  return !!res?.data;
}

// 运行任务
export async function runTask(id: string): Promise<boolean> {
  const res = await http.post(`/evaluation-task/tasks/${id}/run`);
  return !!res?.data;
}

// 停止任务
export async function stopTask(id: string): Promise<boolean> {
  const res = await http.post(`/evaluation-task/tasks/${id}/stop`);
  return !!res?.data;
}

// 保存任务向导数据
export async function saveTaskWizard(data: TaskWizardData): Promise<{ taskId: string }> {
  const res = await http.post('/evaluation-task/tasks/wizard', data);
  return res?.data;
}

// 获取任务模板列表
export async function getTaskTemplateList(): Promise<any[]> {
  const res = await http.get('/evaluation-task/task-templates');
  return res?.data?.list || res?.data || [];
}

// 获取评估算法列表
export async function getAlgorithmList(): Promise<any[]> {
  const res = await http.get('/evaluation-task/algorithms');
  return res?.data?.list || res?.data || [];
}

// 获取指标体系列表
export async function getMetricSystemList(): Promise<any[]> {
  const res = await http.get('/metric-system/systems');
  return res?.data?.list || res?.data || [];
}

// 获取数据源列表
export async function getDataSourceList(): Promise<any[]> {
  const res = await http.get('/data-preprocessing/data-sources');
  return res?.data?.list || [];
}

// 获取仪表板模板列表
export async function getDashboardTemplateList(): Promise<any[]> {
  const res = await http.get('/evaluation-task/dashboard-templates');
  return res?.data?.list || res?.data || [];
}