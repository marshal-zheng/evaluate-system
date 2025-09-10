/**
 * Axios数据处理类
 * 可根据项目需求进行配置
 */

/**
 * Axios转换抽象类
 * 定义了请求和响应的各种钩子函数
 */
export class AxiosTransform {
  /**
   * 请求之前处理配置
   * @param {object} config - axios配置
   * @param {object} options - 请求选项
   * @returns {object} 处理后的配置
   */
  beforeRequestHook(config, options) {
    return config
  }

  /**
   * 处理请求数据。如果数据不是预期格式，可直接抛出错误
   * @param {object} res - axios响应对象
   * @param {object} options - 请求选项
   * @returns {any} 处理后的数据
   */
  transformRequestHook(res, options) {
    return res
  }

  /**
   * 请求之前的拦截器
   * @param {object} config - axios配置
   * @param {object} options - 创建axios的选项
   * @returns {object} 处理后的配置
   */
  requestInterceptors(config, options) {
    return config
  }

  /**
   * 请求之后的拦截器
   * @param {object} res - axios响应对象
   * @returns {object} 处理后的响应
   */
  responseInterceptors(res) {
    return res
  }

  /**
   * 请求之后的拦截器错误处理
   * @param {Error} error - 错误对象
   */
  responseInterceptorsCatch(error) {
    // 错误处理逻辑
  }
}