<template>
  <component :is="Component" v-bind="finalProps" :content-class="''">
    <template v-if="isPopover" #reference>
      <slot></slot>
    </template>
    <template v-if="$slots.content">
        <slot name="content"></slot>
      </template>
    <slot v-if="!isPopover"></slot>
  </component>
</template>

<script>
import { computed, defineComponent, ref, useAttrs } from 'vue'
import { ElPopover, ElTooltip } from 'element-plus'
import { css } from '@emotion/css'
import { get } from 'lodash'

export default defineComponent({
  name: 'TooltipOrPopover',
  props: {
    title: {
      type: String,
    },
    content: {
      type: String,
    },
    trigger: {
      type: String,
      default: 'hover',
    },
    placement: {
      type: String,
      default: 'top',
    }
  },
  setup(props) {
    const attrs = useAttrs()
    /**
   *  默认props
   */
    const defaultProps = {
      trigger: 'hover',
      placement: 'top',
    }

    const titleClass = css`
      font-size: ${get(props, 'themeVars.fontSizeHeading5', '14')}px;
      margin-bottom: ${props.content ? '8px' : '0'};
      min-width: 177px;
    `

    const contentClass = css`
      font-size: ${props.themeVars?.fontSize || '14'}px;
      min-width: 177px;
      margin-bottom: 0;
    `

    const isPopover = computed(() => Boolean(props.title))
    const finalProps = ref({ ...defaultProps, ...attrs, ...props })
    const Component = computed(() => (isPopover.value ? ElPopover : ElTooltip))

    return {
      titleClass,
      contentClass,
      isPopover,
      finalProps,
      Component,
      title: props.title,
      content: props.content,
      attrs,
    }
  },
})
</script>