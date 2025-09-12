import { h } from 'vue';
import { defineStore } from 'pinia';
import { ElMessage, ElNotification } from 'element-plus';

import BackstageMsg from '../components/ZXHL/comp/pure/ZxUpload/backstageMsg.vue';
import { UploadStatus } from '../components/ZXHL/comp/pure/ZxUpload/iconMap.js';

import { AxiosCanceler } from '../components/ZXHL/api/http/axiosCancel.js';
import router from '../router/index.js';

// 简化的国际化函数
const useI18n = () => {
  const t = (key, params = {}) => {
    const translations = {
      'asyncTask.uploadFileProgress': `上传进度: ${params.percent}, 成功: ${params.done}, 失败: ${params.fail}`,
      'asyncTask.uploadFileSuccessTitle': '文件上传完成',
      'asyncTask.uploadFileSuccess': `上传完成，成功: ${params.done}, 失败: ${params.fail}`
    };
    return translations[key] || key;
  };
  return { t };
};

const axiosCanceler = new AxiosCanceler();

// 全局异步任务 store，用于一些后台运行或者耗时任务展示任务的进度提示，例如：文件上传的后台上传任务、耗时的导出操作等。注意：每次只能执行一个任务。TODO: 后续可以考虑支持多个任务
export const useAsyncTaskStore = defineStore('asyncTask', {
  state: () => ({
    uploadFileTask: {
      // 上传文件的任务
      isBackstageUpload: false, // 是否后台上传，后台上传会展示全局提示类型的进度提示
      isHideMessage: false, // 后台上传时展示的消息提示在点击关闭后无需再弹
      fileList: [], // 文件总队列，包含已经上传的历史记录（不做持久化存储，刷新丢失）
      uploadFunc: undefined, // 上传文件时，自定义上传方法
      requestParams: undefined, // 上传文件时，额外的请求参数
      uploadQueue: [], // 每次添加的上传队列，用于展示每次任务的进度使用
      eachTaskQueue: [], // 上传队列，每个文件上传完成后会从队列中移除，初始值为上传队列的副本
      singleProgress: 0, // 单个上传文件的上传进度，非总进度，是每个文件在上传时的模拟进度
      timer: null, // 上传进度定时器
      finishedTime: null, // 任务完成时间
    },
  }),
  getters: {
    // totalXXX 为文件总队列计算出的数量，包含历史记录
    totalWaitingFileList: (state) => {
      return state.uploadFileTask.fileList.filter(
        (e) => e.status && (e.status === UploadStatus.init || e.status === UploadStatus.uploading)
      );
    },
    totalSuccessFileList: (state) => {
      return state.uploadFileTask.fileList.filter((e) => e.status && e.status === UploadStatus.done);
    },
    totalFailFileList: (state) => {
      return state.uploadFileTask.fileList.filter((e) => e.status && e.status === UploadStatus.error);
    },
    // 下面的是每次上传任务计算的数量
    eachWaitingFileList: (state) => {
      return state.uploadFileTask.eachTaskQueue.filter(
        (e) => e.status && (e.status === UploadStatus.init || e.status === UploadStatus.uploading)
      );
    },
    eachSuccessFileList: (state) => {
      return state.uploadFileTask.eachTaskQueue.filter((e) => e.status && e.status === UploadStatus.done);
    },
    eachFailFileList: (state) => {
      return state.uploadFileTask.eachTaskQueue.filter((e) => e.status && e.status === UploadStatus.error);
    },
    eachUploadTaskProgress() {
      // 每次上传任务的总进度
      const { uploadFileTask } = this;
      const { eachTaskQueue } = uploadFileTask;
      const total = eachTaskQueue.length;
      if (total === 0) {
        return 0;
      }
      return Math.floor(((this.eachSuccessFileList.length + this.eachFailFileList.length) / total) * 100);
    },
  },
  actions: {
    setUploadFunc(uploadFunc, requestParams) {
      this.$patch({
        uploadFileTask: {
          uploadFunc,
          requestParams,
        },
      });
    },
    beforeEachUpload(fileItem, route, routeQuery) {
      const { t } = useI18n();
      const { uploadFileTask } = this;
      if (uploadFileTask.isBackstageUpload && !uploadFileTask.isHideMessage) {
        // 开启了后台下载模式，展示全局的进度提示，不模拟进度条
        ElMessage({
          id: 'asyncTaskUploadFile',
          message: () =>
            h(BackstageMsg, {
              content: t('asyncTask.uploadFileProgress', {
                percent: `${uploadFileTask.eachTaskQueue.length - this.eachWaitingFileList.length} / ${
                  uploadFileTask.eachTaskQueue.length
                }`,
                done: this.eachSuccessFileList.length,
                fail: this.eachFailFileList.length,
              }),
              onGoDetail() {
                router.push({
                  name: route,
                  query: routeQuery,
                });
                ElMessage.closeAll();
                uploadFileTask.isBackstageUpload = false;
              },
            }),
          duration: 0, // 一直展示，除非手动关闭
          showClose: true,
          onClose() {
            uploadFileTask.isHideMessage = true;
          },
        });
      } else if (uploadFileTask.timer === null) {
        // 模拟上传进度
        uploadFileTask.timer = setInterval(() => {
          if (uploadFileTask.singleProgress < 50) {
            // 进度在0-50%之间较快
            const randomIncrement = Math.floor(Math.random() * 10) + 1; // 随机增加 5-10 的百分比
            uploadFileTask.singleProgress += randomIncrement;
          } else if (uploadFileTask.singleProgress < 100) {
            // 进度在50%-100%之间较慢
            const randomIncrement = Math.floor(Math.random() * 10) + 1; // 随机增加 1-5 的百分比
            uploadFileTask.singleProgress = Math.min(uploadFileTask.singleProgress + randomIncrement, 99);
          } else {
            clearInterval(uploadFileTask.timer);
            uploadFileTask.timer = null;
          }
        }, 100); // 定时器间隔为 100 毫秒
      }
      if (fileItem) {
        fileItem.status = UploadStatus.uploading; // 设置文件状态为上传中
      }
      uploadFileTask.finishedTime = null; // 重置任务完成时间
    },
    afterEachUploadTask(route, routeQuery) {
      const { t } = useI18n();
      const { uploadFileTask } = this;
      if (uploadFileTask.timer) {
        uploadFileTask.singleProgress = 0;
        clearInterval(uploadFileTask.timer);
        uploadFileTask.timer = null;
      }
      if (uploadFileTask.uploadQueue.length > 0) {
        // 如果待上传队列中还有文件，继续上传
        this.uploadFileFromQueue(uploadFileTask.uploadQueue.shift(), route, routeQuery);
      } else {
        uploadFileTask.finishedTime = Date.now();
        ElMessage.closeAll(); // 清除全局提示
        if (uploadFileTask.isBackstageUpload) {
          ElNotification({
            title: t('asyncTask.uploadFileSuccessTitle'),
            message: () =>
              h(BackstageMsg, {
                content: t('asyncTask.uploadFileSuccess', {
                  done: this.eachSuccessFileList.length,
                  fail: this.eachFailFileList.length,
                }),
                onGoDetail() {
                  router.push({
                    name: route,
                    query: routeQuery,
                  });
                  ElNotification.closeAll();
                  uploadFileTask.isBackstageUpload = false;
                },
              }),
            type: 'success',
            duration: 3000,
          });
        }
        this.$patch({
          uploadFileTask: {
            isBackstageUpload: false,
            isHideMessage: false,
            uploadFunc: undefined,
            requestParams: undefined,
          },
        });
      }
    },
    async uploadFileFromQueue(fileItem, route, routeQuery) {
      this.beforeEachUpload(fileItem, route, routeQuery);
      try {
        if (this.uploadFileTask.uploadFunc) {
          await this.uploadFileTask.uploadFunc({
            request: { ...this.uploadFileTask.requestParams, enable: fileItem?.enable },
            file: fileItem?.file,
          });
        } else {
          throw new Error('uploadFunc is not defined');
        }
        if (fileItem) {
          fileItem.status = UploadStatus.done;
          fileItem.uploadedTime = Date.now();
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        if (fileItem) {
          fileItem.status = UploadStatus.error;
          fileItem.errMsg = error;
        }
      } finally {
        // 上传完成/失败，重置进度和定时器
        this.afterEachUploadTask(route, routeQuery);
      }
    },
    startUpload(fileList, route, routeQuery) {
      // 正式开始上传任务之前，同步一次文件列表，取出所有状态为 init 的文件
      const totalWaitingFileList = fileList.filter((item) => item.status === UploadStatus.init);
      this.$patch({
        uploadFileTask: {
          fileList,
          uploadQueue: totalWaitingFileList,
          eachTaskQueue: [...totalWaitingFileList],
        },
      });
      this.uploadFileFromQueue(this.uploadFileTask.uploadQueue.shift(), route, routeQuery);
    },
    cancelUpload() {
      clearInterval(this.uploadFileTask.timer);
      const uploadingFileList = this.uploadFileTask.eachTaskQueue.filter(
        (e) => e.status && e.status === UploadStatus.uploading
      );
      if (uploadingFileList.length > 0) {
        // 取消上传时，如果有文件正在上传，需要取消请求
        axiosCanceler.removePending({});
      }
      this.$patch({
        uploadFileTask: {
          isBackstageUpload: false,
          isHideMessage: false,
          timer: null,
          eachTaskQueue: [],
          fileList: [],
          uploadQueue: [],
          singleProgress: 0,
          uploadFunc: undefined,
          requestParams: undefined,
        },
      });
    },
  },
});

export default useAsyncTaskStore;