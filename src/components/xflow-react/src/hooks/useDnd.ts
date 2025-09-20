import { Dnd } from '@antv/x6-plugin-dnd';
import { useCallback, useEffect, useRef } from 'react';

import type { NodeOptions } from '../types';

import { useGraphInstance } from './useGraphInstance';

export const useDnd = (
  options?: Omit<Dnd.Options, 'target' | 'getDragNode' | 'getDropNode'>,
) => {
  const graph = useGraphInstance();
  const ref = useRef<Dnd>();

  useEffect(() => {
    if (graph && !ref.current) {
      ref.current = new Dnd({
        target: graph,
        getDragNode: (node) => node.clone({ keepId: true }),
        getDropNode: (node) => node.clone({ keepId: true }),
        ...options,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph]);

  const startDrag = useCallback(
    (n: NodeOptions, e: React.MouseEvent<Element, MouseEvent>) => {
      if (graph && ref.current) {
        e.persist();
        ref.current.start(graph.createNode(n), e.nativeEvent);
      }
    },
    [graph],
  );

  return { startDrag };
};
