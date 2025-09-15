<template>
<div>
  <!-- <h1>Vue Grid Layout</h1>
  <div className="layoutJSON">
    Displayed as <code>[x, y, w, h]</code>:
    <div className="columns">
      <div v-for="l in state.layout" :key="l.i" class="layoutItem">
        <b>{{ l.i === '__dropping-elem__' ? 'drop' : l.i }}</b>
        {{ ': ['  + l.x + ',' + l.y + ',' + l.w + ',' + l.h + ']' }}
      </div>
    </div>
  </div>
  
  <div style="margin: 10px 0;">
    <button @click="exportLayout" style="padding: 8px 16px; background: #409EFF; color: white; border: none; border-radius: 4px; cursor: pointer;">
      导出布局
    </button>
    <button @click="resetLayout" style="padding: 8px 16px; background: #67C23A; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">
      重置布局
    </button>
  </div> -->
  
  <!-- Layout export area -->
  <div v-if="state.exportedLayout" style="margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 4px;">
    <h3>导出的布局配置：</h3>
    <textarea 
      v-model="state.exportedLayout" 
      readonly 
      style="width: 100%; height: 200px; font-family: monospace; font-size: 12px;"
      @click="selectAll"
    ></textarea>
    <p v-if="state.copyHint" style="color: #67C23A; font-size: 12px;">已复制到剪贴板</p>
  </div>
  
  <!-- Draggable Vue component palette item -->
  <DraggableHello />
  <ResponsiveVueGridLayout
    class="layout"
    :rowHeight="30"
    :cols="{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }"
    :layouts="state.layouts"
    @breakpointChange="onBreakpointChange"
    @layoutChange="onLayoutChange"
    @dropDragOver="onDropDragOver"
    @drop="onDrop"
    @dragStop="onDragStop"
    :measureBeforeMount="false"
    :useCSSTransforms="state.mounted"
    :containerPadding="[16, 16]"
    :isDroppable="true"
  >
    <div v-for="(l, i) in state.layouts.lg" :key="l.i" :class="{ static: l.static }">
      <!-- Render the dropped component when available; fallback to label -->
      <component v-if="state.widgetsById[l.i]" :is="state.widgetsById[l.i]" />
      <span v-else class="text">{{ l.i }}</span>
    </div>
  </ResponsiveVueGridLayout>
</div>
</template>

<script>
// import VGL, { Responsive, WidthProvider } from "@marsio/vue-grid-layout";
// import { defineComponent, ref } from 'vue';

import VGL, { Responsive, WidthProvider } from "@marsio/vue-grid-layout";
import { defineComponent, reactive, onMounted } from 'vue';
import DraggableHello from './DraggableHello.vue'
import ChartWidget from './widgets/ChartWidget.vue'
import defaultLayout from './layout.json'
import { getDragPayload } from '../../comp/business/DashboardGrid/dragPayloadStore'

// Component registry for persistence
const widgetRegistry = {
  ChartWidget,
};

const ResponsiveVueGridLayout = WidthProvider(Responsive);

export default defineComponent({
  components: {
    VGL,
  ResponsiveVueGridLayout,
  DraggableHello,
  ChartWidget
  },
  setup(props, { attrs }) {
    // 从 layout.json 加载默认布局
    const loadDefaultLayout = () => {
      return defaultLayout.lg || [
        { x: 0, y: 0, w: 2, h: 2, i: "1", static: false },
        { x: 2, y: 0, w: 2, h: 2, i: "2", static: false },
        { x: 4, y: 0, w: 2, h: 2, i: "3", static: false }
      ];
    }
    const loadDefaultWidgetTypes = () => {
      return defaultLayout.widgetTypes || {};
    };

    const state = reactive({
      currentBreakpoint: "lg",
      compactType: "vertical",
      mounted: false,
      layout: [],
      layouts: { lg: loadDefaultLayout() },
      // map layout item id -> component
      widgetsById: {},
      widgetTypes: loadDefaultWidgetTypes(),
      exportedLayout: '',
      copyHint: false,
    })

    const hydrateWidgetsFromTypes = () => {
      state.widgetsById = {};
      for (const [id, type] of Object.entries(state.widgetTypes)) {
        const Cmp = widgetRegistry[type];
        if (Cmp) state.widgetsById[id] = Cmp;
      }
    };

    // Prime widgetsById from widgetTypes
    hydrateWidgetsFromTypes();

    onMounted(() => {
      state.mounted = true
    })

    // 导出当前布局配置
    const exportLayout = async () => {
      const layoutConfig = {
        lg: state.layouts.lg,
        widgetTypes: state.widgetTypes
      };
      const text = JSON.stringify(layoutConfig, null, 2);
      state.exportedLayout = text;
      try {
        await navigator.clipboard.writeText(text);
        state.copyHint = true;
        setTimeout(() => (state.copyHint = false), 1500);
      } catch (err) {
        // Clipboard may fail if not HTTPS or not user gesture; keep textarea for manual copy
        state.copyHint = false;
      }
    };

    // 重置布局到默认状态
    const resetLayout = () => {
      state.layouts = { lg: loadDefaultLayout() };
      state.widgetTypes = loadDefaultWidgetTypes();
      hydrateWidgetsFromTypes();
      state.exportedLayout = '';
    };

    // 选中所有文本
    const selectAll = (event) => {
      event.target.select();
    };

    const onBreakpointChange = (breakpoint) => {
      // plugin emits param directly; accept string or object
      state.currentBreakpoint = typeof breakpoint === 'string' ? breakpoint : breakpoint?.breakpoint;
    };

    const onLayoutChange = (layout, layouts) => {
      state.layout = layout;
      // keep state.layouts in sync so consumers and export see the latest
      if (layouts && layouts.lg) {
        state.layouts = layouts;
      } else if (Array.isArray(layout)) {
        state.layouts = { lg: layout };
      }
    };

    const onDrop  = (layout, event, layoutItem) => {
      const id = (state.layouts.lg.length + 1).toString();
      const newItems = layout.concat({
        ...layoutItem,
        i: id,
      });
      state.layouts = { lg: newItems };

      // Parse payload to decide which component to mount
      let payload;
      try {
        const text = event?.dataTransfer?.getData('text/plain');
        payload = text ? JSON.parse(text) : null;
      } catch (e) {
        payload = null;
      }
      if (!payload) {
        payload = getDragPayload();
      }
      if (payload?.type && widgetRegistry[payload.type]) {
        state.widgetsById[id] = widgetRegistry[payload.type];
        state.widgetTypes[id] = payload.type;
      }
    };
  
    const onDropDragOver  = (e) => {
      let payload;
      try {
        const text = e?.dataTransfer?.getData('text/plain');
        payload = text ? JSON.parse(text) : null;
      } catch (err) {
        payload = null;
      }
      if (!payload) {
        payload = getDragPayload();
      }
      if (payload && typeof payload.w === 'number' && typeof payload.h === 'number') {
        return { w: payload.w, h: payload.h };
      }
      return { w: 6, h: 5 };
    };
    const onDragStop  = (layout, oldLay, newLay) => {
      // sync after drag stop too, to be safe
      if (Array.isArray(layout)) {
        state.layouts = { lg: layout };
      }
    };

    return {
      state,
      exportLayout,
      resetLayout,
      selectAll,
      onBreakpointChange,
      onLayoutChange,
      onDrop,
      onDropDragOver,
      onDragStop
    }
  }
});
</script>
<style lang="scss">
@import './index.scss';
</style>