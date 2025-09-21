/* eslint-disable no-prototype-builtins */
/* eslint-disable no-restricted-syntax */

// Libraries
import { defaultsDeep, cloneDeep, isEqual } from 'lodash-es'

// Utils
import {
  EventBusSrv
} from '../../../../utils/envent'

// 不需要持久化的属性
const notPersistedProperties = {
  events: true,
  hasChanged: true
}

// 默认值
const defaults = {
  gridPos: { x: 0, y: 0, h: 3, w: 6 },
  path: '',
  title: '',
  params: {},
  metadata: {
    data: null // 用于存储 JSON 字符串化的数据
  }
}

export class PanelModel {
  constructor (model = {}) {
    // 初始化属性
    this.id = null
    this.gridPos = { x: 0, y: 0, h: 3, w: 6 }
    this.type = 'panel'
    this.title = ''
    this.collapsed = false
    this.hasChanged = false
    this.params = {}
    this.panels = null
    this.metadata = { data: null }
    
    // 初始化事件总线
    this.events = new EventBusSrv()
    
    // 恢复模型数据
    this.restoreModel(model)
  }

  /** 根据持久化的 PanelModel 恢复属性值 */
  restoreModel (model) {
    // 开始清理
    for (const property of Object.keys(this)) {
      if (notPersistedProperties[property] || !this.hasOwnProperty(property)) {
        continue
      }

      if (model[property]) {
        continue
      }

      if (typeof this[property] === 'function') {
        continue
      }

      if (typeof this[property] === 'symbol') {
        continue
      }

      delete this[property]
    }

    // 从持久化模型复制属性
    for (const property of Object.keys(model)) {
      this[property] = model[property]
    }

    // 应用默认值
    defaultsDeep(this, cloneDeep(defaults))
  }

  getSaveModel () {
    const model = {}

    for (const property of Object.keys(this)) {
      if (notPersistedProperties[property] || !this.hasOwnProperty(property)) {
        continue
      }

      if (isEqual(this[property], defaults[property])) {
        continue
      }

      model[property] = cloneDeep(this[property])
    }

    return model
  }

  updateGridPos (newPos) {
    this.gridPos.x = newPos.x
    this.gridPos.y = newPos.y
    this.gridPos.w = newPos.w
    this.gridPos.h = newPos.h
  }

  hasTitle () {
    return this.title && this.title.length > 0
  }

  destroy () {
    this.events.removeAllListeners()
  }

  setProperty (key, value) {
    this[key] = value
    this.hasChanged = true
  }

  /**
   * 设置面板的数据（自动进行 JSON 字符串化）
   * @param {any} data - 要存储的数据
   */
  setData (data) {
    if (!this.metadata) {
      this.metadata = {}
    }
    this.metadata.data = data ? JSON.stringify(data) : null
    this.hasChanged = true
  }

  /**
   * 获取面板的数据（自动进行 JSON 解析）
   * @returns {any} 解析后的数据对象
   */
  getData () {
    if (!this.metadata || !this.metadata.data) {
      return null
    }
    try {
      return JSON.parse(this.metadata.data)
    } catch (error) {
      console.warn('Failed to parse panel data:', error)
      return null
    }
  }

  /**
   * 检查面板是否有数据
   * @returns {boolean}
   */
  hasData () {
    return !!(this.metadata && this.metadata.data)
  }
}