/**
 * 基础事件类型
 */
export class BusEventBase {
  constructor() {
    // 获取事件类型
    this.type = this.constructor.type
  }
}

/**
 * 带载荷的基础事件类型
 */
export class BusEventWithPayload extends BusEventBase {
  constructor(payload) {
    super()
    this.payload = payload
  }
}

/**
 * 应用事件接口的默认实现
 * 用于创建简单的事件对象
 */
export class AppEventImpl {
  constructor(name, payload) {
    this.name = name
    this.payload = payload
  }
}

/**
 * 事件总线接口的默认实现
 * 提供基础的发布订阅功能
 */
export class EventBusImpl {
  constructor() {
    this.listeners = new Map()
  }

  /**
   * 发布事件
   * @param {Object} event - 事件对象
   */
  publish(event) {
    const handlers = this.listeners.get(event.type) || []
    handlers.forEach(handler => handler(event))
  }

  /**
   * 订阅事件
   * @param {Object} eventType - 事件类型
   * @param {Function} handler - 事件处理器
   * @returns {Object} 取消订阅对象
   */
  subscribe(eventType, handler) {
    const type = eventType.type || eventType
    if (!this.listeners.has(type)) {
      this.listeners.set(type, [])
    }
    this.listeners.get(type).push(handler)

    return {
      unsubscribe: () => {
        const handlers = this.listeners.get(type) || []
        const index = handlers.indexOf(handler)
        if (index > -1) {
          handlers.splice(index, 1)
        }
      }
    }
  }

  /**
   * 获取事件流（简化版本，返回订阅对象）
   * @param {Object} eventType - 事件类型
   * @returns {Object} 可观察对象
   */
  getStream(eventType) {
    return {
      subscribe: (observer) => {
        const handler = typeof observer === 'function' ? observer : observer.next
        return this.subscribe(eventType, handler)
      }
    }
  }

  /**
   * 移除所有监听器
   */
  removeAllListeners() {
    this.listeners.clear()
  }
}

/**
 * 传统事件发射器的默认实现
 */
export class LegacyEmitterImpl {
  constructor() {
    this.eventHandlers = new Map()
  }

  /**
   * 发射事件
   * @param {Object|string} event - 事件对象或事件名称
   * @param {*} payload - 事件载荷
   */
  emit(event, payload) {
    const eventName = typeof event === 'string' ? event : event.name
    const handlers = this.eventHandlers.get(eventName) || []
    handlers.forEach(handler => {
      if (typeof event === 'string') {
        handler(payload)
      } else {
        handler(event.payload || payload)
      }
    })
  }

  /**
   * 监听事件
   * @param {Object|string} event - 事件对象或事件名称
   * @param {Function} handler - 事件处理器
   * @param {*} scope - 作用域（可选）
   */
  on(event, handler, scope) {
    const eventName = typeof event === 'string' ? event : event.name
    if (!this.eventHandlers.has(eventName)) {
      this.eventHandlers.set(eventName, [])
    }
    
    const boundHandler = scope ? handler.bind(scope) : handler
    this.eventHandlers.get(eventName).push(boundHandler)
  }

  /**
   * 移除事件监听器
   * @param {Object|string} event - 事件对象或事件名称
   * @param {Function} handler - 事件处理器
   */
  off(event, handler) {
    const eventName = typeof event === 'string' ? event : event.name
    const handlers = this.eventHandlers.get(eventName) || []
    const index = handlers.indexOf(handler)
    if (index > -1) {
      handlers.splice(index, 1)
    }
  }
}

/**
 * 扩展的事件总线实现，结合了现代和传统事件处理
 */
export class EventBusExtendedImpl extends EventBusImpl {
  constructor() {
    super()
    this.legacyEmitter = new LegacyEmitterImpl()
  }

  // 继承现代事件总线的方法
  // 同时提供传统事件发射器的方法
  emit(event, payload) {
    return this.legacyEmitter.emit(event, payload)
  }

  on(event, handler, scope) {
    return this.legacyEmitter.on(event, handler, scope)
  }

  off(event, handler) {
    return this.legacyEmitter.off(event, handler)
  }
}