/**
 * 事件系统功能验证示例
 * 这个文件展示了如何使用转换后的 JavaScript 事件系统
 * 注意：这个文件仅用于验证功能，不是正式的测试套件
 */

// 导入事件系统
import {
  EventBusSrv,
  createEventBus,
  eventFactory,
  createEventType,
  createEventWithPayloadType,
  createEventSystem,
  createSimpleEventSystem,
  validateEventSystem
} from './index.js'

/**
 * 基本功能验证
 */
function testBasicFunctionality() {
  console.log('=== 基本功能验证 ===')
  
  // 创建事件总线
  const eventBus = createEventBus()
  
  // 测试 Legacy 事件
  console.log('测试 Legacy 事件...')
  const legacyEvent = eventFactory('user-login')
  
  eventBus.on(legacyEvent, (payload) => {
    console.log('Legacy 事件接收到:', payload)
  })
  
  eventBus.emit(legacyEvent, { userId: 123, username: 'test' })
  
  // 测试现代事件
  console.log('测试现代事件...')
  const UserLoginEvent = createEventType('modern-user-login')
  
  const subscription = eventBus.subscribe(UserLoginEvent, (event) => {
    console.log('现代事件接收到:', event.type, event.payload)
  })
  
  eventBus.publish(new UserLoginEvent({ userId: 456, username: 'modern-test' }))
  
  // 清理
  subscription.unsubscribe()
  eventBus.removeAllListeners()
  
  console.log('基本功能验证完成\n')
}

/**
 * 高级功能验证
 */
function testAdvancedFunctionality() {
  console.log('=== 高级功能验证 ===')
  
  // 测试事件系统创建
  const eventSystem = createEventSystem({
    enableLegacy: true,
    namespace: 'app'
  })
  
  console.log('事件系统信息:', eventSystem.getInfo())
  
  // 测试简单事件系统
  const simpleSystem = createSimpleEventSystem()
  
  const unsubscribe = simpleSystem.subscribe('test-event', (payload) => {
    console.log('简单事件系统接收到:', payload)
  })
  
  simpleSystem.publish('test-event', 'Hello World')
  
  // 测试一次性事件
  simpleSystem.once('once-event', (payload) => {
    console.log('一次性事件接收到:', payload)
  })
  
  simpleSystem.publish('once-event', 'First time')
  simpleSystem.publish('once-event', 'Second time') // 这个不会被接收
  
  // 清理
  unsubscribe()
  simpleSystem.clear()
  eventSystem.destroy()
  
  console.log('高级功能验证完成\n')
}

/**
 * 错误处理验证
 */
function testErrorHandling() {
  console.log('=== 错误处理验证 ===')
  
  try {
    // 测试重复事件名称
    eventFactory('duplicate-event')
    eventFactory('duplicate-event') // 应该抛出错误
  } catch (error) {
    console.log('正确捕获重复事件错误:', error.message)
  }
  
  try {
    // 测试无效事件名称
    eventFactory('') // 应该抛出错误
  } catch (error) {
    console.log('正确捕获无效事件名称错误:', error.message)
  }
  
  try {
    // 测试无效处理器
    const eventBus = createEventBus()
    eventBus.on('test', null) // 应该抛出错误
  } catch (error) {
    console.log('正确捕获无效处理器错误:', error.message)
  }
  
  console.log('错误处理验证完成\n')
}

/**
 * 性能验证
 */
function testPerformance() {
  console.log('=== 性能验证 ===')
  
  const eventBus = createEventBus()
  const TestEvent = createEventType('performance-test')
  
  let receivedCount = 0
  const subscription = eventBus.subscribe(TestEvent, () => {
    receivedCount++
  })
  
  const startTime = Date.now()
  const eventCount = 10000
  
  for (let i = 0; i < eventCount; i++) {
    eventBus.publish(new TestEvent(`test-${i}`))
  }
  
  const endTime = Date.now()
  const duration = endTime - startTime
  
  console.log(`发布 ${eventCount} 个事件耗时: ${duration}ms`)
  console.log(`接收到 ${receivedCount} 个事件`)
  console.log(`平均每个事件耗时: ${(duration / eventCount).toFixed(3)}ms`)
  
  subscription.unsubscribe()
  eventBus.removeAllListeners()
  
  console.log('性能验证完成\n')
}

/**
 * 运行所有验证
 */
export function runAllTests() {
  console.log('开始验证 JavaScript 事件系统功能...\n')
  
  try {
    testBasicFunctionality()
    testAdvancedFunctionality()
    testErrorHandling()
    testPerformance()
    
    // 运行内置验证
    console.log('=== 内置验证 ===')
    const validationResult = validateEventSystem()
    console.log('验证结果:', validationResult)
    
    if (validationResult.valid) {
      console.log('\n✅ 所有功能验证通过！事件系统转换成功！')
    } else {
      console.log('\n❌ 验证失败:', validationResult.errors)
    }
    
  } catch (error) {
    console.error('验证过程中发生错误:', error)
  }
}

/**
 * 使用示例
 */
export function usageExample() {
  console.log('\n=== 使用示例 ===')
  
  // 1. 简单使用
  const eventBus = createEventBus()
  
  // Legacy 方式
  const loginEvent = eventFactory('user-login')
  eventBus.on(loginEvent, (user) => {
    console.log('用户登录:', user.name)
  })
  eventBus.emit(loginEvent, { name: 'Alice' })
  
  // 现代方式
  const UserLogoutEvent = createEventType('user-logout')
  const sub = eventBus.subscribe(UserLogoutEvent, (event) => {
    console.log('用户登出:', event.payload.name)
  })
  eventBus.publish(new UserLogoutEvent({ name: 'Alice' }))
  
  // 2. 使用事件系统
  const system = createEventSystem({ namespace: 'myapp' })
  const MyEvent = system.createEvent('my-event')
  
  system.subscribe(MyEvent, (event) => {
    console.log('我的事件:', event.payload)
  })
  
  system.publish(new MyEvent('Hello from event system!'))
  
  // 3. 简单事件系统
  const simple = createSimpleEventSystem()
  
  const unsub = simple.subscribe('notification', (message) => {
    console.log('通知:', message)
  })
  
  simple.publish('notification', '您有新消息')
  
  // 清理
  sub.unsubscribe()
  unsub()
  system.destroy()
  simple.clear()
  eventBus.removeAllListeners()
  
  console.log('使用示例完成')
}

// 如果直接运行此文件，执行验证
if (typeof window === 'undefined' && typeof process !== 'undefined') {
  // Node.js 环境
  runAllTests()
  usageExample()
}