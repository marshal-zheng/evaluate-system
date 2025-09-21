import { ref, watch, onMounted, onUnmounted } from 'vue';
import { Export } from '@antv/x6-plugin-export';
import { useGraphInstance } from './useGraphInstance';

/**
 * 导出功能的 composable
 * @param {Object} options - 导出配置选项
 * @returns {Object} 导出相关方法
 */
export function useExport(options = {}) {
  const graph = useGraphInstance();
  const exportPlugin = ref(null);
  const isExporting = ref(false);
  const currentGraph = ref(null);
  
  // 初始化导出插件
  const initExport = () => {
    if (!graph.value) {
      return;
    }

    if (exportPlugin.value && graph.value === currentGraph.value) {
      return;
    }

    if (exportPlugin.value && currentGraph.value) {
      exportPlugin.value.dispose();
      exportPlugin.value = null;
    }

    exportPlugin.value = new Export({
      ...options
    });

    graph.value.use(exportPlugin.value);
    currentGraph.value = graph.value;
  };
  
  /**
   * 导出为 PNG 格式
   * @param {string} fileName - 文件名
   * @param {Object} exportOptions - 导出选项
   * @returns {Promise} 导出操作的Promise
   */
  const exportPNG = async (fileName = 'graph.png', exportOptions = {}) => {
    if (!graph.value) {
      console.warn('图实例未初始化');
      return Promise.reject(new Error('图实例未初始化'));
    }
    
    try {
      isExporting.value = true;
      
      const dataUri = await graph.value.exportPNG(fileName, {
        backgroundColor: '#ffffff',
        padding: 10,
        quality: 1,
        ...exportOptions
      });
      
      return dataUri;
    } catch (error) {
      console.error('导出 PNG 失败:', error);
      throw error;
    } finally {
      isExporting.value = false;
    }
  };
  
  /**
   * 导出为 JPEG 格式
   * @param {string} fileName - 文件名
   * @param {Object} exportOptions - 导出选项
   * @returns {Promise} 导出操作的Promise
   */
  const exportJPEG = async (fileName = 'graph.jpg', exportOptions = {}) => {
    if (!graph.value) {
      console.warn('图实例未初始化');
      return Promise.reject(new Error('图实例未初始化'));
    }
    
    try {
      isExporting.value = true;
      
      const dataUri = await graph.value.exportJPEG(fileName, {
        backgroundColor: '#ffffff',
        padding: 10,
        quality: 1,
        ...exportOptions
      });
      
      return dataUri;
    } catch (error) {
      console.error('导出 JPEG 失败:', error);
      throw error;
    } finally {
      isExporting.value = false;
    }
  };
  
  /**
   * 导出为 SVG 格式
   * @param {string} fileName - 文件名
   * @param {Object} exportOptions - 导出选项
   * @returns {Promise} 导出操作的Promise
   */
  const exportSVG = async (fileName = 'graph.svg', exportOptions = {}) => {
    if (!graph.value) {
      console.warn('图实例未初始化');
      return Promise.reject(new Error('图实例未初始化'));
    }
    
    try {
      isExporting.value = true;
      
      const svgString = await graph.value.exportSVG(fileName, {
        preserveDimensions: true,
        viewBox: null,
        ...exportOptions
      });
      
      return svgString;
    } catch (error) {
      console.error('导出 SVG 失败:', error);
      throw error;
    } finally {
      isExporting.value = false;
    }
  };
  
  /**
   * 下载导出的文件
   * @param {string} dataUri - 数据URI或SVG字符串
   * @param {string} fileName - 文件名
   * @param {string} mimeType - MIME类型
   */
  const downloadFile = (dataUri, fileName, mimeType = 'application/octet-stream') => {
    try {
      const link = document.createElement('a');
      
      if (mimeType === 'image/svg+xml') {
        // SVG 文件特殊处理
        const blob = new Blob([dataUri], { type: mimeType });
        const url = URL.createObjectURL(blob);
        link.href = url;
      } else {
        // PNG/JPEG 文件
        link.href = dataUri;
      }
      
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 清理对象URL
      if (mimeType === 'image/svg+xml') {
        URL.revokeObjectURL(link.href);
      }
    } catch (error) {
      console.error('下载文件失败:', error);
    }
  };
  
  /**
   * 导出并下载 PNG
   * @param {string} fileName - 文件名
   * @param {Object} exportOptions - 导出选项
   */
  const exportAndDownloadPNG = async (fileName = 'graph.png', exportOptions = {}) => {
    try {
      const dataUri = await exportPNG(fileName, exportOptions);
      downloadFile(dataUri, fileName, 'image/png');
    } catch (error) {
      console.error('导出并下载 PNG 失败:', error);
    }
  };
  
  /**
   * 导出并下载 JPEG
   * @param {string} fileName - 文件名
   * @param {Object} exportOptions - 导出选项
   */
  const exportAndDownloadJPEG = async (fileName = 'graph.jpg', exportOptions = {}) => {
    try {
      const dataUri = await exportJPEG(fileName, exportOptions);
      downloadFile(dataUri, fileName, 'image/jpeg');
    } catch (error) {
      console.error('导出并下载 JPEG 失败:', error);
    }
  };
  
  /**
   * 导出并下载 SVG
   * @param {string} fileName - 文件名
   * @param {Object} exportOptions - 导出选项
   */
  const exportAndDownloadSVG = async (fileName = 'graph.svg', exportOptions = {}) => {
    try {
      const svgString = await exportSVG(fileName, exportOptions);
      downloadFile(svgString, fileName, 'image/svg+xml');
    } catch (error) {
      console.error('导出并下载 SVG 失败:', error);
    }
  };
  
  onMounted(() => {
    initExport();
  });

  watch(
    () => graph.value,
    () => {
      initExport();
    },
    { immediate: true },
  );

  onUnmounted(() => {
    if (exportPlugin.value) {
      exportPlugin.value.dispose();
      exportPlugin.value = null;
    }
    currentGraph.value = null;
  });
  
  return {
    exportPlugin,
    isExporting,
    exportPNG,
    exportJPEG,
    exportSVG,
    downloadFile,
    exportAndDownloadPNG,
    exportAndDownloadJPEG,
    exportAndDownloadSVG
  };
}
