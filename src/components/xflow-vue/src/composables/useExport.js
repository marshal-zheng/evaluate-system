import { useGraphInstance } from './useGraphInstance';

export function useExport(graphInstance = null) {
  let graph;
  
  try {
    graph = graphInstance || useGraphInstance();
  } catch (error) {
    graph = graphInstance;
  }
  
  const exportPNG = (options = {}) => {
    const g = graph?.value || graph;
    if (g) {
      return g.exportPNG(options);
    }
    return null;
  };
  
  const exportJPEG = (options = {}) => {
    const g = graph?.value || graph;
    if (g) {
      return g.exportJPEG(options);
    }
    return null;
  };
  
  const exportSVG = (options = {}) => {
    const g = graph?.value || graph;
    if (g) {
      return g.exportSVG(options);
    }
    return null;
  };
  
  const toDataURL = (type = 'image/png', options = {}) => {
    const g = graph?.value || graph;
    if (g) {
      return g.toDataURL(type, options);
    }
    return null;
  };
  
  return {
    exportPNG,
    exportJPEG,
    exportSVG,
    toDataURL,
  };
}
