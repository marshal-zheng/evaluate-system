/**
 * HTTP请求封装主入口
 * 基于Axios的统一请求配置，适配Element Plus
 */
import { ElMessage, ElMessageBox } from 'element-plus'

import { ZXAxios } from './Axios.js'
import { AxiosTransform } from './axiosTransform.js'
import checkStatus from './checkStatus.js'
import { joinTimestamp } from './helper.js'

/**
 * 请求方法枚举
 */
const RequestEnum = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
}

/**
 * 内容类型枚举
 */
const ContentTypeEnum = {
  // json
  JSON: 'application/json;charset=UTF-8',
  // form data
  FORM_URLENCODED: 'application/x-www-form-urlencoded;charset=UTF-8',
  // form data
  FORM_DATA: 'multipart/form-data;charset=UTF-8',
}

/**
 * 判断是否为字符串
 * @param {any} val - 待判断的值
 * @returns {boolean} 是否为字符串
 */
function isString(val) {
  return typeof val === 'string'
}

/**
 * 深度合并对象
 * @param {object} target - 目标对象
 * @param {...object} sources - 源对象
 * @returns {object} 合并后的对象
 */
function deepMerge(target, ...sources) {
  if (!sources.length) return target
  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        deepMerge(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return deepMerge(target, ...sources)
}

/**
 * 判断是否为对象
 * @param {any} val - 待判断的值
 * @returns {boolean} 是否为对象
 */
function isObject(val) {
  return val !== null && typeof val === 'object'
}

/**
 * 将对象转换为URL参数
 * @param {object} obj - 对象
 * @returns {string} URL参数字符串
 */
function setObjToUrlParams(obj) {
  const params = new URLSearchParams()
  for (const key in obj) {
    if (obj[key] !== undefined && obj[key] !== null) {
      params.append(key, obj[key])
    }
  }
  return params.toString()
}

/**
 * 获取token
 * @returns {string} token值
 */
function getToken() {
  return localStorage.getItem('token') || ''
}

/**
 * 数据处理，方便区分多种处理方式
 */
const transform = new AxiosTransform()

/**
 * 请求之前处理config
 */
transform.beforeRequestHook = (config, options) => {
  const { joinParamsToUrl, joinTime = true } = options

  const params = config.params || {}
  const data = config.data || false
  
  if (config.method?.toUpperCase() === RequestEnum.GET) {
    if (!isString(params)) {
      // 给 get 请求加上时间戳参数，避免从缓存中拿数据。
      config.params = Object.assign(params || {}, joinTimestamp(joinTime, false))
    } else {
      // 兼容restful风格
      config.url = `${config.url}/${params}${joinTimestamp(joinTime, true)}`
      config.params = undefined
    }
  } else if (isString(params)) {
    // 兼容restful风格
    config.url += params
    config.params = undefined
  } else {
    const test =
      Reflect.has(config, 'data') &&
      config.data &&
      (Object.keys(config.data).length > 0 || Array.isArray(config.data))
    
    if (!test) {
      config.data = params || {}
      config.params = undefined
    }
    
    if (joinParamsToUrl) {
      config.url = setObjToUrlParams(config.url, Object.assign({}, config.params, config.data))
    }
  }
  return config
}

/**
 * 处理响应数据
 */
transform.transformRequestHook = (res, options) => {
  const { isTransformResponse, isReturnNativeResponse } = options
  
  // 是否返回原生响应头 比如：需要获取响应头时使用该属性
  if (isReturnNativeResponse) {
    return res
  }
  
  // 不进行任何处理，直接返回
  // 用于页面代码可能需要直接获取code，data，message这些信息时开启
  if (!isTransformResponse) {
    return res.data
  }
  
  // 错误的时候返回
  const { data } = res
  if (!data) {
    throw new Error('请求出错，请稍候重试')
  }
  
  // 优先兼容第三方常见返回：{ success, data, msg/message }
  if (Reflect.has(data, 'success')) {
    const ok = data.success
    if (ok) {
      // 成功直接返回内部数据
      return data.data !== undefined ? data.data : (data.result !== undefined ? data.result : data)
    }
    const errMsg = data.msg || data.message || '请求出错，请稍候重试'
    if (options.errorMessageMode === 'modal') {
      ElMessageBox.alert(errMsg, '错误', { type: 'error' })
    } else if (options.errorMessageMode === 'message') {
      ElMessage.error(errMsg)
    }
    throw new Error(errMsg)
  }

  // 其次兼容 { code, result, message } 风格
  const { code, result, message } = data
  const hasCodeSuccess = data && Reflect.has(data, 'code') && (code === 200 || code === 0)
  if (hasCodeSuccess) {
    return result !== undefined ? result : data
  }

  // 在此处根据自己项目的实际情况对不同的code执行不同的操作
  // 如果不希望中断当前请求，请return数据，否则直接抛出异常即可
  let timeoutMsg = ''
  switch (code) {
    case 401:
      timeoutMsg = '用户没有权限（令牌、用户名、密码错误）!'
      // 清除token并跳转登录页
      localStorage.removeItem('token')
      break
    case 403:
      timeoutMsg = '用户得到授权，但是访问是被禁止的。!'
      break
    case 404:
      timeoutMsg = '网络请求错误,未找到该资源!'
      break
    case 408:
      timeoutMsg = '网络请求超时!'
      break
    case 500:
      timeoutMsg = '服务器错误,请联系管理员!'
      break
    case 501:
      timeoutMsg = '网络未实现!'
      break
    case 502:
      timeoutMsg = '网络错误!'
      break
    case 503:
      timeoutMsg = '服务不可用，服务器暂时过载或维护!'
      break
    case 504:
      timeoutMsg = '网络超时!'
      break
    case 505:
      timeoutMsg = 'http版本不支持该请求!'
      break
    default:
  }

  if (timeoutMsg) {
    if (options.errorMessageMode === 'modal') {
      ElMessageBox.alert(timeoutMsg, '错误', { type: 'error' })
    } else if (options.errorMessageMode === 'message') {
      ElMessage.error(timeoutMsg)
    }
    throw new Error(timeoutMsg || '请求出错，请稍候重试')
  }

  // 未匹配到已知包裹结构，直接返回数据本体
  if (!Reflect.has(data, 'code') && !Reflect.has(data, 'success')) {
    return data
  }

  throw new Error(message || '请求出错，请稍候重试')
}

/**
 * 请求拦截器处理
 */
transform.requestInterceptors = (config, options) => {
  // 请求之前处理config
  const token = getToken()
  if (token && config?.requestOptions?.withToken !== false) {
    // jwt token
  config.headers.Authorization = options?.authenticationScheme
      ? `${options.authenticationScheme} ${token}`
      : token
  }
  return config
}

/**
 * 响应拦截器处理
 */
transform.responseInterceptors = (res) => {
  return res
}

/**
 * 响应错误处理
 */
transform.responseInterceptorsCatch = (error) => {
  const { response, code, message, config } = error || {}
  const errorMessageMode = config?.requestOptions?.errorMessageMode || 'none'
  const msg = response?.data?.error?.message ?? ''
  const err = error?.toString?.()
  let errMessage = ''

  try {
    if (code === 'ECONNABORTED' && message.indexOf('timeout') !== -1) {
      errMessage = '接口请求超时,请刷新页面重试!'
    }
    if (err?.includes('Network Error')) {
      errMessage = '网络异常，请检查您的网络连接是否正常!'
    }

    if (errMessage) {
      if (errorMessageMode === 'modal') {
        ElMessageBox.alert(errMessage, '错误', { type: 'error' })
      } else if (errorMessageMode === 'message') {
        ElMessage.error(errMessage)
      }
      return Promise.reject(error)
    }
  } catch (error) {
    throw new Error(error)
  }

  checkStatus(error?.response?.status, msg, error?.response?.data?.code, errorMessageMode)
  return Promise.reject(error)
}

/**
 * 创建axios实例
 * @param {object} opt - 配置选项
 * @returns {ZXAxios} axios实例
 */
function createAxios(opt) {
  return new ZXAxios(
    deepMerge(
      {
        // 认证方案，例如: Bearer
        authenticationScheme: 'Bearer',
        timeout: 10 * 1000,
        // 基础接口地址
        baseURL: '/api',
        headers: { 'Content-Type': ContentTypeEnum.JSON },
        // 如果是form-data格式
        // headers: { 'Content-Type': ContentTypeEnum.FORM_URLENCODED },
        // 数据处理方式
        transform: transform,
        // 配置项，下面的选项都可以在独立的接口请求中覆盖
        requestOptions: {
          // 默认将prefix 添加到url
          joinPrefix: true,
          // 是否返回原生响应头 比如：需要获取响应头时使用该属性
          isReturnNativeResponse: false,
          // 需要对返回数据进行处理
          // 开启后 API 返回的结果将是后端 data/result 的纯数据，不包含 success/code 包裹
          isTransformResponse: true,
          // post请求的时候添加参数到url
          joinParamsToUrl: false,
          // 格式化提交参数时间
          formatDate: true,
          // 消息提示类型
          errorMessageMode: 'message',
          // 接口地址
          apiUrl: '/api',
          // 接口拼接地址
          urlPrefix: '',
          //  是否加入时间戳
          joinTime: true,
          // 忽略重复请求
          ignoreCancelToken: true,
          // 是否携带token
          withToken: true,
          // 成功消息提示模式
          successMessageMode: 'none',
        },
      },
      opt || {}
    )
  )
}

// 创建默认实例
const ZXR = createAxios()

// 导出默认实例
export default ZXR
