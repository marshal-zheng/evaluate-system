// 导出事件工厂相关功能
export * from './eventFactory.js'

// 导出类型定义和基础类
export * from './types.js'

// 导出事件总线服务
export * from './EventBus.js'

// 为了方便使用，提供一些常用的导出别名
export { EventBusSrv as EventBus } from './EventBus.js'
export { globalEventBus as eventBus } from './EventBus.js'
export { createEventBus } from './EventBus.js'

// 导出常用的类型实现
export {
  BusEventBase,
  BusEventWithPayload,
  AppEventImpl as AppEvent,
  EventBusImpl,
  LegacyEmitterImpl as LegacyEmitter,
  EventBusExtendedImpl as EventBusExtended
} from './types.js'

// 导出事件工厂函数
export {
  eventFactory,
  createEventWithPayload,
  resetEventTypes,
  hasEventType,
  getAllEventTypes
} from './eventFactory.js'