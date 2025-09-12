import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext, PointerSensor, useSensor } from '@dnd-kit/core';
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { history, useLocation } from '@umijs/max';
import type { TabsProps } from 'antd';
import { Tabs as AntdTabs } from 'antd';
import { createStyles, cx } from 'antd-style';
import { findIndex, sortBy } from 'lodash';
import React, { Suspense, useEffect, useMemo, useState } from 'react';

interface DraggableTabPaneProps extends React.HTMLAttributes<HTMLDivElement> {
  'data-node-key': string;
}

type TabItems = {
  key: string;
  label: string;
  children: React.ComponentType;
  props?: Record<string, any>;
}[];

interface EnhancedTabProps extends Omit<TabsProps, 'items'> {
  items: TabItems;
  onDragEnded?: (keys: string[]) => void;
  trackTabRecord?: boolean;
  draggable?: boolean;
  useUrlParams?: boolean; // 新增：是否使用URL参数来记录tab状态
  paramName?: string; // 新增：URL参数名称，默认为'tab'
}

interface ResolutionObject {
  default: React.ComponentType<any>;
}

const useStyles = createStyles(() => {
  return {
    tabContent: {},
  };
});

const DraggableTabNode = ({ ...props }: DraggableTabPaneProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: props['data-node-key'],
  });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return React.cloneElement(props.children as React.ReactElement, {
    ref: setNodeRef,
    style,
    ...attributes,
    ...listeners,
  });
};

const EnhancedTabs: React.FC<EnhancedTabProps> = ({
  items,
  trackTabRecord = true,
  onDragEnded = (keys: string[]) => keys,
  indicator = { size: (origin: number) => origin + 15, align: 'center' },
  draggable = false,
  useUrlParams = false, // 新增：默认不使用URL参数
  paramName = 'tab', // 新增：默认参数名为'tab'
  ...props
}) => {
  const location = useLocation();
  const { styles } = useStyles();

  // 获取初始 activeKey 的逻辑
  const getInitialActiveKey = () => {
    if (useUrlParams) {
      // 如果使用URL参数，优先从URL参数中获取
      const urlParams = new URLSearchParams(location.search);
      const tabFromUrl = urlParams.get(paramName);
      if (tabFromUrl && items.find((item) => item.key === tabFromUrl)) {
        return tabFromUrl;
      }
    }

    // 回退到原有的逻辑
    return trackTabRecord
      ? sessionStorage.getItem(location.pathname) || items[0]?.key
      : items[0]?.key;
  };

  const initialActiveKey = getInitialActiveKey();
  const [activeKey, setActiveKey] = useState(initialActiveKey);

  const renderTabContent = (
    Component: React.ComponentType,
    key: string,
    props: Record<string, any> = {},
  ) => {
    if (!Component || key !== activeKey) return null;

    const LazyComponent = React.lazy(
      () =>
        new Promise<ResolutionObject>((resolve) => {
          setTimeout(() => resolve({ default: Component }), 800);
        }),
    );
    return (
      <div className={cx(styles.tabContent)}>
        <Suspense>
          <LazyComponent {...props} />
        </Suspense>
      </div>
    );
  };

  const [tabsItems, setTabsItems] = useState(
    items.map((item) => ({
      ...item,
      children: item.children ? renderTabContent(item.children, item.key) : [],
    })),
  );

  const sortedItems = useMemo(() => {
    return sortBy(items, (item) => findIndex(tabsItems, { key: item.key }));
  }, [items, tabsItems]);

  useEffect(() => {
    const tabKey = sessionStorage.getItem(location.pathname);
    if (!tabKey) {
      sessionStorage.setItem(location.pathname, items[0]?.key);
    }
  }, [items]);

  // 新增：监听URL参数变化
  useEffect(() => {
    if (useUrlParams) {
      const urlParams = new URLSearchParams(location.search);
      const tabFromUrl = urlParams.get(paramName);
      if (tabFromUrl && items.find((item) => item.key === tabFromUrl) && tabFromUrl !== activeKey) {
        setActiveKey(tabFromUrl);
      }
    }
  }, [location.search, paramName, useUrlParams, items, activeKey]);

  // Update tabsItems in useEffect
  useEffect(() => {
    setTabsItems(
      sortedItems.map((item) => ({
        ...item,
        children: item.children ? renderTabContent(item.children, item.key, item.props) : [], // Pass props to renderTabContent
      })),
    );
  }, [activeKey, items]);

  useEffect(() => {
    return () => {
      if (trackTabRecord) {
        sessionStorage.removeItem(location.pathname);
      }
    };
  }, [history.location.pathname]);

  const handleTabChange = (key: string) => {
    setActiveKey(key);

    if (useUrlParams) {
      // 如果使用URL参数，更新URL
      const urlParams = new URLSearchParams(location.search);
      urlParams.set(paramName, key);
      const newUrl = `${location.pathname}?${urlParams.toString()}`;
      history.push(newUrl);
    }

    if (trackTabRecord) {
      sessionStorage.setItem(location.pathname, key);
    }
  };

  const sensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 } });

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!draggable) return; // If not draggable, return early

    if (active.id !== over?.id) {
      const prevItems = tabsItems;
      const activeIndex = prevItems.findIndex((i) => i.key === active.id);
      const overIndex = prevItems.findIndex((i) => i.key === over?.id);
      const newItems = arrayMove(prevItems, activeIndex, overIndex);

      const delay = !props.type || props.type === 'line' ? 200 : 0;
      setTimeout(() => {
        setTabsItems(newItems);
      }, delay);

      if (onDragEnded) {
        onDragEnded(newItems.map(({ key }) => key));
      }
    }
  };

  return (
    <AntdTabs
      {...props}
      size="large"
      activeKey={activeKey}
      onChange={handleTabChange}
      items={tabsItems}
      indicator={indicator}
      renderTabBar={(tabBarProps, DefaultTabBar) =>
        draggable ? ( // Only render DndContext if draggable
          <DndContext sensors={[sensor]} onDragEnd={onDragEnd}>
            <SortableContext
              items={tabsItems.map((i) => i.key)}
              strategy={horizontalListSortingStrategy}
            >
              <DefaultTabBar {...tabBarProps}>
                {(node) => (
                  <DraggableTabNode {...node.props} key={node.key}>
                    {node}
                  </DraggableTabNode>
                )}
              </DefaultTabBar>
            </SortableContext>
          </DndContext>
        ) : (
          <DefaultTabBar {...tabBarProps} />
        )
      }
    />
  );
};

export { EnhancedTabs as Tabs };
