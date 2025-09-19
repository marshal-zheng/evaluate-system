/**
 * 评估任务相关类型定义
 */

export interface Task {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'calculating' | 'completed' | 'failed';
  statusName: string;
  metricSystemId: string;
  metricSystemName: string;
  algorithm: 'AHP' | 'TOPSIS' | 'FUZZY_AHP' | 'GREY_RELATIONAL';
  algorithmName: string;
  creator: string;
  createdTime: string;
  updatedTime?: string;
  templateId?: string;
  templateName?: string;
  progress?: number;
  resultData?: any;
}

export type TaskForm = Partial<Task>;

export interface TaskListItem {
  id: string;
  name: string;
  status: 'draft' | 'calculating' | 'completed' | 'failed';
  statusName: string;
  metricSystemName: string;
  creator: string;
  createdTime: string;
  progress?: number;
}

export interface TaskDetail extends Task {
  steps: TaskStep[];
  dataMapping: DataMapping[];
  dashboardConfig?: DashboardConfig;
}

export interface TaskStep {
  stepNumber: number;
  stepName: string;
  status: 'pending' | 'completed' | 'current';
  data?: any;
}

export interface DataMapping {
  metricId: string;
  metricName: string;
  dataSourceId: string;
  dataSourceName: string;
  columnMapping: ColumnMapping[];
}

export interface ColumnMapping {
  sourceColumn: string;
  targetField: string;
  dataType: string;
}

export interface DashboardConfig {
  templateId: string;
  templateName: string;
  layout: any;
  widgets: Widget[];
}

export interface Widget {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'text';
  title: string;
  config: any;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

export interface TaskListResponse {
  list: TaskListItem[];
  total: number;
  no?: number;
  size?: number;
}

export interface CreateTaskParams {
  name: string;
  description?: string;
  algorithm: string;
  metricSystemId: string;
  templateId?: string;
}

export interface UpdateTaskParams {
  id: string;
  name?: string;
  description?: string;
  status?: string;
}

export interface TaskWizardData {
  step1: {
    name: string;
    description: string;
    createType: 'blank' | 'template';
    templateId?: string;
    algorithm: string;
  };
  step2: {
    metricSystemId: string;
    customizations: any[];
    dataMapping: DataMapping[];
  };
  step3: {
    dashboardTemplateId: string;
    layoutConfig: any;
  };
  step4: {
    summary: any;
    validated: boolean;
  };
}