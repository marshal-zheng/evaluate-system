import { useGraphInstance } from './useGraphInstance';

export function useExport(graphInstance = null) {
  let graph;
  
  try {
    graph = graphInstance || useGraphInstance();
  } catch (error) {
    graph = graphInstance;
  }
  
  const normalizeArgs = (fileNameOrOptions, maybeOptions) => {
    if (typeof fileNameOrOptions === 'string' || typeof fileNameOrOptions === 'number') {
      return [fileNameOrOptions, maybeOptions];
    }
    if (fileNameOrOptions && typeof fileNameOrOptions === 'object') {
      return [undefined, fileNameOrOptions];
    }
    return [fileNameOrOptions, maybeOptions];
  };
  
  const exportPNG = (fileNameOrOptions, options = {}) => {
    const g = graph?.value || graph;
    if (g?.exportPNG) {
      const [fileName, exportOptions] = normalizeArgs(fileNameOrOptions, options);
      return g.exportPNG(fileName, exportOptions);
    }
    return null;
  };
  
  const exportJPEG = (fileNameOrOptions, options = {}) => {
    const g = graph?.value || graph;
    if (g?.exportJPEG) {
      const [fileName, exportOptions] = normalizeArgs(fileNameOrOptions, options);
      return g.exportJPEG(fileName, exportOptions);
    }
    return null;
  };
  
  const exportSVG = (fileNameOrOptions, options = {}) => {
    const g = graph?.value || graph;
    if (g?.exportSVG) {
      const [fileName, exportOptions] = normalizeArgs(fileNameOrOptions, options);
      return g.exportSVG(fileName, exportOptions);
    }
    return null;
  };
  
  const toDataURL = (type = 'image/png', options = {}) => {
    const g = graph?.value || graph;
    if (g?.toDataURL) {
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
