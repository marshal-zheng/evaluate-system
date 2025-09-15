// Libraries
import _ from 'lodash'

import {
  EventBusSrv
} from '../../../../utils/envent'

import { DashboardPanelsChangedEvent } from './events'
import { PanelModel } from './PanelModel'

export class DashboardModel {
  constructor (data = {}) {
    const panels = data.panels || []

    this.events = new EventBusSrv()
    this.panels = panels
  }

  updatePanels (panels) {
    this.panels = _.map(panels || [], (panelData) => new PanelModel(panelData))
    this.sortPanelsByGridPos()
  }

  getNextPanelId () {
    let max = 0

    this.panels.forEach(panel => {
      if (panel.id > max) {
        max = panel.id
      }

      if (panel.collapsed) {
        panel.panels.forEach((rowPanel) => {
          if (rowPanel.id > max) {
            max = rowPanel.id
          }
        })
      }
    })
    return max + 1
  }

  forEachPanel (callback) {
    for (let i = 0; i < this.panels.length; i++) {
      callback(this.panels[i], i)
    }
  }

  addPanel (panelData) {
    panelData.id = this.getNextPanelId()

    this.panels.unshift(new PanelModel(panelData))

    this.sortPanelsByGridPos()

    // this.events.publish(new DashboardPanelsChangedEvent())
  }

  sortPanelsByGridPos () {
    this.panels.sort((panelA, panelB) => {
      if (panelA.gridPos.y === panelB.gridPos.y) {
        return panelA.gridPos.x - panelB.gridPos.x
      }
      return panelA.gridPos.y - panelB.gridPos.y
    })
  }

  getRowHeight (rowPanel) {
    if (!rowPanel.panels || rowPanel.panels.length === 0) {
      return 0
    }
    const rowYPos = rowPanel.gridPos.y
    const positions = _.map(rowPanel.panels, 'gridPos')
    const maxPos = _.maxBy(positions, pos => pos.y + pos.h)
    return maxPos.y + maxPos.h - rowYPos
  }

  removePanel (panel) {
    this.panels = this.panels.filter(item => item !== panel)
    // this.events.publish(new DashboardPanelsChangedEvent())
  }

  removeRow (row, removePanels) {
    const needToogle = (!removePanels && row.collapsed) || (removePanels && !row.collapsed)

    if (needToogle) {
      this.toggleRow(row)
    }

    this.removePanel(row)
  }

  expandRows () {
    for (let i = 0; i < this.panels.length; i++) {
      const panel = this.panels[i]

      if (panel.type !== 'row') {
        continue
      }

      if (panel.collapsed) {
        this.toggleRow(panel)
      }
    }
  }

  collapseRows () {
    for (let i = 0; i < this.panels.length; i++) {
      const panel = this.panels[i]

      if (panel.type !== 'row') {
        continue
      }

      if (!panel.collapsed) {
        this.toggleRow(panel)
      }
    }
  }

  destroy () {
    this.events.removeAllListeners()
    this.panels.forEach(panel => {
      panel.destroy()
    })
  }

  toggleRow (row) {
    const rowIndex = _.indexOf(this.panels, row)

    if (row.collapsed) {
      row.collapsed = false

      if (row.panels.length > 0) {
        // Use first panel to figure out if it was moved or pushed
        const firstPanel = row.panels[0]
        const yDiff = firstPanel.gridPos.y - (row.gridPos.y + row.gridPos.h)

        // start inserting after row
        let insertPos = rowIndex + 1
        // y max will represent the bottom y pos after all panels have been added
        // needed to know home much panels below should be pushed down
        let yMax = row.gridPos.y

        row.panels.forEach((panel) => {
          // make sure y is adjusted (in case row moved while collapsed)
          panel.gridPos.y -= yDiff
          // insert after row
          this.panels.splice(insertPos, 0, new PanelModel(panel))
          // update insert post and y max
          insertPos += 1
          yMax = Math.max(yMax, panel.gridPos.y + panel.gridPos.h)
        })
        const pushDownAmount = yMax - row.gridPos.y - 1

        // push panels below down
        for (let panelIndex = insertPos; panelIndex < this.panels.length; panelIndex++) {
          this.panels[panelIndex].gridPos.y += pushDownAmount
        }

        row.panels = []
      }

      // sort panels
      this.sortPanelsByGridPos()

      // emit change event
      // this.events.publish(new DashboardPanelsChangedEvent())
      return
    }

    const rowPanels = this.getRowPanels(rowIndex)

    // remove panels
    _.pull(this.panels, ...rowPanels)
    // save panel models inside row panel
    row.panels = _.map(rowPanels, (panel) => panel.getSaveModel())
    row.collapsed = true

    // emit change event
    this.events.publish(new DashboardPanelsChangedEvent())
  }

  /**
   * Will return all panels after rowIndex until it encounters another row
   */
  getRowPanels (rowIndex) {
    const rowPanels = []

    for (let index = rowIndex + 1; index < this.panels.length; index++) {
      const panel = this.panels[index]

      // break when encountering another row
      if (panel.type === 'row') {
        break
      }

      // this panel must belong to row
      rowPanels.push(panel)
    }

    return rowPanels
  }

  expandParentRowFor (panelId) {
    this.panels.forEach(panel => {
      if (panel.collapsed) {
        panel.panels.forEach((rowPanel) => {
          if (rowPanel.id === panelId) {
            this.toggleRow(panel)
          }
        })
      }
    })
  }
}