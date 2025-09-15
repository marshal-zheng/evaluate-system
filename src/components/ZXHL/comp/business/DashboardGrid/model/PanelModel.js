/* eslint-disable no-prototype-builtins */
/* eslint-disable no-restricted-syntax */

// Libraries
import _ from 'lodash'

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
  params: {}
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
    _.defaultsDeep(this, _.cloneDeep(defaults))
  }

  getSaveModel () {
    const model = {}

    for (const property of Object.keys(this)) {
      if (notPersistedProperties[property] || !this.hasOwnProperty(property)) {
        continue
      }

      if (_.isEqual(this[property], defaults[property])) {
        continue
      }

      model[property] = _.cloneDeep(this[property])
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
}