import EventEmitter from 'eventemitter3'

/**
 * 事件总线服务类
 * 提供现代事件总线功能和传统事件发射器兼容性
 */
export class EventBusSrv {
  constructor() {
    this.emitter = new EventEmitter()
  }

  /**
   * 发布事件
   * @param {Object} event - 事件对象，包含 type 和 payload 属性
   */
  publish(event) {
    this.emitter.emit(event.type, event)
  }

  /**
   * 订阅事件
   * @param {Object|string} typeFilter - 事件类型过滤器
   * @param {Function} handler - 事件处理器
   * @returns {Object} 取消订阅对象
   */
  subscribe(typeFilter, handler) {
    return this.getStream(typeFilter).subscribe({ next: handler })
  }

  /**
   * 获取事件流
   * @param {Object|string} eventType - 事件类型
   * @returns {Object} 可观察对象
   */
  getStream(eventType) {
    const type = eventType.type || eventType
    
    return {
      subscribe: (observer) => {
        const handler = (event) => {
          if (typeof observer === 'function') {
            observer(event)
          } else if (observer.next) {
            observer.next(event)
          }
        }

        this.emitter.on(type, handler)

        return {
          unsubscribe: () => {
            this.emitter.off(type, handler)
          }
        }
      }
    }
  }

  /**
   * 传统事件发射方法
   * @param {Object|string} event - 事件对象或事件名称
   * @param {*} payload - 事件载荷
   */
  emit(event, payload) {
    if (typeof event === 'string') {
      this.emitter.emit(event, { type: event, payload })
    } else {
      this.emitter.emit(event.name, { type: event.name, payload })
    }
  }

  /**
   * 监听事件（传统方式）
   * @param {Object|string} event - 事件对象或事件名称
   * @param {Function} handler - 事件处理器
   * @param {Object} scope - 作用域对象（可选）
   */
  on(event, handler, scope) {
    // 创建包装器以兼容旧的事件处理器
    handler.wrapper = (emittedEvent) => {
      handler(emittedEvent.payload)
    }

    if (typeof event === 'string') {
      this.emitter.on(event, handler.wrapper)
    } else {
      this.emitter.on(event.name, handler.wrapper)
    }

    // 如果提供了作用域，在作用域销毁时自动取消监听
    if (scope && scope.$on && typeof scope.$on === 'function') {
      const unbind = scope.$on('$destroy', () => {
        this.off(event, handler)
        unbind()
      })
    }
  }

  /**
   * 移除事件监听器
   * @param {Object|string} event - 事件对象或事件名称
   * @param {Function} handler - 事件处理器
   */
  off(event, handler) {
    if (typeof event === 'string') {
      this.emitter.off(event, handler.wrapper)
      return
    }

    this.emitter.off(event.name, handler.wrapper)
  }

  /**
   * 移除所有监听器
   */
  removeAllListeners() {
    this.emitter.removeAllListeners()
  }
}

/**
 * 创建事件总线实例的工厂函数
 * @returns {EventBusSrv} 事件总线实例
 */
export function createEventBus() {
  return new EventBusSrv()
}

/**
 * 默认的全局事件总线实例
 */
export const globalEventBus = new EventBusSrv()