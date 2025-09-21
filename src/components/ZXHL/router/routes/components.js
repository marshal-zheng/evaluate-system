import PureRouterView from '@/components/ZXHL/comp/pure/ZxPureRouterView/index.vue'

export const componentRoutes = [
  {
    path: 'components',
    name: 'ComponentsDemo',
    meta: { 
      title: '组件演示',
      icon: 'Grid'
    },
    redirect: 'pure-components',
    component: PureRouterView,
    children: [
      // {
      //   path: 'pure-components',
      //   name: 'PureComponentsDemo',
      //   meta: { 
      //     title: 'Pure 组件统一注册演示'
      //   },
      //   component: () => import('@/views/pure-components-demo.vue')
      // },
      {
        path: 'zx-drawer',
        name: 'ZxDrawerDemo',
        meta: { 
          title: 'ZxDrawer 抽屉组件'
        },
        component: () => import('@/components/ZXHL/comp/pure/ZxDrawer/example.vue')
      },
      {
        path: 'zx-card',
        name: 'ZxCardDemo',
        meta: { 
          title: 'ZxCard 卡片组件'
        },
        component: () => import('@/components/ZXHL/comp/pure/ZxCard/example.vue')
      },
      {
        path: 'zx-dialog',
        name: 'ZxDialogDemo',
        meta: { 
          title: 'ZxDialog 对话框组件'
        },
        component: () => import('@/components/ZXHL/comp/pure/ZxDialog/example.vue')
      },
      {
        path: 'zx-icon',
        name: 'ZxIconDemo',
        meta: { 
          title: 'ZxIcon 图标组件'
        },
        component: () => import('@/components/ZXHL/comp/pure/ZxIcon/example.vue')
      },
      {
        path: 'zx-empty',
        name: 'ZxEmptyDemo',
        meta: { 
          title: 'ZxEmpty 空状态组件'
        },
        component: () => import('@/components/ZXHL/comp/pure/ZxEmpty/example.vue')
      },
      {
        path: 'zx-grid-list',
        name: 'ZxGridListDemo',
        meta: { 
          title: 'ZxGridList 网格列表组件'
        },
        component: () => import('@/components/ZXHL/comp/pure/ZxGridList/example.vue')
      },
      // {
      //   path: 'zx-search',
      //   name: 'ZxSearchDemo',
      //   meta: { 
      //     title: 'ZxSearch 搜索组件'
      //   },
      //   component: () => import('@/views/search-demo.vue')
      // },
      {
        path: 'zx-tag',
        name: 'ZxTagDemo',
        meta: { 
          title: 'ZxTag 标签组件'
        },
        component: () => import('@/components/ZXHL/comp/pure/ZxTag/example.vue')
      },
      {
        path: 'zx-split-box',
        name: 'ZxSplitBoxDemo',
        component: () => import('@/components/ZXHL/comp/pure/ZxSplitBox/example.vue'),
        meta: {
          title: 'ZxSplitBox 分割面板',
          icon: 'Grid'
        }
      },
      {
        path: 'zx-tags-input',
        name: 'ZxTagsInputDemo',
        meta: { 
          title: 'ZxTagsInput 标签输入组件'
        },
        component: () => import('@/components/ZXHL/comp/pure/ZxTagsInput/example.vue')
      },
      {
        path: 'zx-upload',
        name: 'ZxUploadDemo',
        meta: { 
          title: 'ZxUpload 文件上传组件'
        },
        component: () => import('@/components/ZXHL/comp/pure/ZxUpload/example.vue')
      },
      {
        path: 'zx-list',
        name: 'ZxListDemo',
        meta: { 
          title: 'ZxList 列表组件'
        },
        component: () => import('@/components/ZXHL/comp/pure/ZxList/example.vue')
      },
      {
        path: 'zx-export-drawer',
        name: 'ZXExportDrawerDemo',
        meta: { 
          title: 'ZXExportDrawer 导出字段选择抽屉'
        },
        component: () => import('@/components/ZXHL/comp/pure/ZxExportDrawer/example.vue')
      },
      {
        path: 'zx-more-setting-collapse',
        name: 'ZxMoreSettingCollapseDemo',
        meta: { 
          title: 'ZxMoreSettingCollapse 更多设置折叠组件'
        },
        component: () => import('@/components/ZXHL/comp/pure/ZxMoreSettingCollapse/example.vue')
      },
      {
        path: 'zx-expand-toggle',
        name: 'ZxExpandToggleDemo',
        meta: { 
          title: 'ZxExpandToggle 展开收起组件'
        },
        component: () => import('@/components/ZXHL/comp/pure/ZxExpandToggle/example.vue')
      },
      {
        path: 'zx-popconfirm',
        name: 'ZxPopconfirmDemo',
        meta: { 
          title: 'ZxPopconfirm 气泡确认框组件'
        },
        component: () => import('@/components/ZXHL/comp/pure/ZxPopconfirm/example.vue')
      },
      {
        path: 'zx-input',
        name: 'ZxInputDemo',
        meta: { 
          title: 'ZxInput 增强输入框组件'
        },
        component: () => import('@/components/ZXHL/comp/pure/ZxInput/example.vue')
      },
      {
        path: 'zx-auto-complete',
        name: 'ZxAutoCompleteDemo',
        meta: { 
          title: 'ZxAutoComplete 自动完成组件'
        },
        component: () => import('@/components/ZXHL/comp/pure/ZxAutoComplete/example.vue')
      },
      {
        path: 'zx-tooltip-or-popover',
        name: 'ZxTooltipOrPopoverDemo',
        meta: { 
          title: 'ZxTooltipOrPopover 提示组件'
        },
        component: () => import('@/components/ZXHL/comp/pure/ZxTooltipOrPopover/example.vue')
      },
      {
        path: 'zx-button',
        name: 'ZxButtonDemo',
        meta: { 
          title: 'ZxButton 增强按钮组件'
        },
        component: () => import('@/components/ZXHL/comp/pure/ZxButton/example.vue')
      },
      {
        path: 'zx-tabs',
        name: 'ZxTabsDemo',
        meta: { 
          title: 'ZxTabs 标签页组件'
        },
        component: () => import('@/components/ZXHL/comp/pure/ZxTabs/example.vue')
      },
      {
        path: 'zx-detail-card',
        name: 'ZxDetailCardDemo',
        meta: { 
          title: 'ZxDetailCard 详情卡片组件'
        },
        component: () => import('@/components/ZXHL/comp/pure/ZxDetailCard/example.vue')
      },
      {
        path: 'zx-chart',
        name: 'ZxChartDemo',
        meta: { 
          title: 'ZxChart 图表组件'
        },
        component: () => import('@/components/ZXHL/comp/pure/ZxChart/example.vue')
      },
      {
        path: 'widget',
        name: 'WidgetDemo',
        meta: { 
          title: 'Widget 异步加载组件'
        },
        component: () => import('@/components/ZXHL/comp/business/Widget/example.vue')
      },
      {
        path: 'dashboard-grid-vue3',
        name: 'DashboardGridDemo',
        meta: { 
          title: 'DashboardGrid 网格布局组件'
        },
        component: () => import('@/components/ZXHL/comp/business/DashboardGrid/example/index.vue')
      },
      {
        path: 'xflow-vue',
        name: 'XFlowVueDemo',
        meta: { 
          title: 'XFlow Vue 图编辑器'
        },
        component: () => import('@/components/ZXHL/comp/business/xflow-vue/examples/BasicExample.vue')
      },
      {
        path: 'zx-confirm-input',
        name: 'ZxConfirmInputDemo',
        meta: { 
          title: 'ZxConfirmInput 输入确认对话框'
        },
        component: () => import('@/components/ZXHL/comp/pure/ZxConfirmInput/example.vue')
      },
      {
        path: 'zx-floating-panel',
        name: 'ZxFloatingPanelDemo',
        meta: {
          title: 'ZxFloatingPanel 浮动面板组件'
        },
        component: () => import('@/components/ZXHL/comp/pure/ZxFloatingPanel/example.vue')
      },
      {
        path: 'zx-form-create',
        name: 'ZxFormCreateDemo',
        meta: { 
          title: 'ZxFormCreate 表单创建组件'
        },
        component: () => import('@/components/ZXHL/comp/pure/ZxFormCreate/example.vue')
      }
    ]
  }
]