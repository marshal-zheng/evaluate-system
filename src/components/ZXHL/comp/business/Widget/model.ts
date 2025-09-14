export interface IAssemblyInfo {
  id: string;
  componentName: string;
  componentType: string;
  status: string;
  viewConfig: string;
  description: string;
  creationTime: number;
  updateTime: number;
  path: string;
  scope: string|string[]
}

export interface IViewConfig extends IAssemblyInfo{
  w: number;
  h: number;
  x: number;
  y: number;
  minH?: number;
  minW?: number;
  path: string;
  params: Kv;
  type: string;
}

interface ILayoutItem {
  x: number;
  y: number;
  w: number;
  h: number;
  i: string;
  path: string;
  extra: Kv;
  comCfonfig?: Partial<IAssemblyInfo>
}

interface IDashboard {
  id: number;
  type: number;
  ownerType: number;
  ownerId: number;
  viewConfig: string; // ILayoutItem[] 的字符串
}
