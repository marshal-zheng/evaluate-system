/**
 * ZxGridList 网格列表管理 Hook
 * 
 * 替代传统的 ref-based loadData 模式，提供更优雅的响应式状态管理
 * 
 * 功能特性：
 * - 统一的分页、搜索、排序状态管理
 * - 自动加载和刷新机制
 * - 防抖搜索和请求去重
 * - URL状态同步（可选）
 * - 错误处理和重试机制
 * - TypeScript友好的类型推断
 */

import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick, readonly } from 'vue'
import { debounce, cloneDeep } from 'lodash-es'

/**
 * 创建网格列表管理Hook
 * @param {Object} options 配置选项
 * @param {Function} options.loadData 数据加载函数，必须返回 Promise
 * @param {Object} options.initialQuery 初始查询参数
 * @param {Object} options.initialPager 初始分页参数
 * @param {Boolean} options.loadOnMounted 是否在挂载时自动加载
 * @param {Boolean} options.pageFrom0 分页是否从0开始
 * @param {Number} options.defaultPageSize 默认分页大小
 * @param {Number} options.debounceDelay 防抖延迟时间
 * @param {Boolean} options.autoRefresh 是否自动刷新
 * @param {Number} options.refreshInterval 自动刷新间隔
 * @param {Function} options.queryTransform 查询参数转换函数
 * @param {Function} options.paramsTransform 参数预处理函数
 * @returns {Object} Hook返回的状态和方法
 */
export function useGridList(options = {}) {
  const {
    loadData,
    initialQuery = {},
    initialPager = {},
    loadOnMounted = true,
    pageFrom0 = false,
    defaultPageSize = 20,
    debounceDelay = 300,
    autoRefresh = false,
    refreshInterval = 30000,
    queryTransform = (query) => query,
    paramsTransform = (params) => params,
    onBeforeLoad,
    onDataLoaded,
    onLoadError,
    onStateChange
  } = options

  if (!loadData || typeof loadData !== 'function') {
    throw new Error('useGridList: loadData function is required')
  }

  // 核心状态
  const state = reactive({
    // 查询参数
    query: { ...initialQuery },
    
    // 分页信息
    pager: {
      page: pageFrom0 ? 0 : 1,
      size: defaultPageSize,
      total: 0,
      ...initialPager
    },
    
    // 列表数据
    list: [],
    
    // 加载状态
    loading: false,
    silentLoading: false,
    
    // 错误信息
    error: null,
    
    // 最后加载时间
    lastLoadTime: null,
    
    // 选中项（如果需要）
    selection: []
  })

  // 内部状态
  const requestId = ref('')
  const autoRefreshTimer = ref(null)

  // 计算属性
  const hasData = computed(() => Array.isArray(state.list) && state.list.length > 0)
  const hasError = computed(() => !!state.error)
  const isEmpty = computed(() => !state.loading && !hasData.value)
  const totalPages = computed(() => Math.ceil(state.pager.total / state.pager.size) || 1)
  const currentPage = computed(() => pageFrom0 ? state.pager.page + 1 : state.pager.page)

  // 生成请求ID，用于防止并发请求问题
  const generateRequestId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // 获取状态快照
  const getStateSnapshot = () => {
    return cloneDeep({
      query: state.query,
      pager: {
        page: state.pager.page,
        size: state.pager.size,
        total: state.pager.total
      },
      list: state.list,
      loading: state.loading,
      error: state.error,
      lastLoadTime: state.lastLoadTime
    })
  }

  // 状态变更通知
  const notifyStateChange = () => {
    if (onStateChange) {
      onStateChange(getStateSnapshot())
    }
  }

  // 核心数据加载函数
  const loadDataInternal = async (params = {}, silent = false) => {
    const currentRequestId = generateRequestId()
    requestId.value = currentRequestId

    try {
      // 合并参数
      const mergedParams = {
        query: { ...state.query, ...params.query },
        pager: { ...state.pager, ...params.pager }
      }

      // 参数转换
      if (mergedParams.query) {
        mergedParams.query = queryTransform(mergedParams.query)
      }
      const processedParams = paramsTransform(mergedParams)

      // 更新状态
      Object.assign(state, {
        ...processedParams,
        loading: !silent,
        silentLoading: silent,
        error: null
      })

      notifyStateChange()

      // 触发加载前回调
      if (onBeforeLoad) {
        onBeforeLoad(processedParams)
      }

      // 执行数据加载
      const response = await loadData(processedParams)

      // 检查请求是否还有效
      if (requestId.value !== currentRequestId) {
        console.warn('Request outdated, ignoring response')
        return response
      }

      // 处理响应数据
      const responseData = response || {}
      // 兼容常见返回格式：{ list, pager } 或 { data: { list, pager } } 或 { data: [...] }
      const nestedData = responseData && responseData.data
      const newPager = (responseData.pager 
        || (nestedData && nestedData.pager)
        || {})

      // 更新分页信息
      if (processedParams.pager) {
        state.pager = {
          page: newPager.page ?? processedParams.pager.page,
          size: newPager.size ?? processedParams.pager.size,
          total: newPager.total ?? 0
        }
      }

      // 更新列表数据（确保一定是数组）
      const resolvedList = Array.isArray(responseData.list)
        ? responseData.list
        : Array.isArray(nestedData)
          ? nestedData
          : Array.isArray(nestedData?.list)
            ? nestedData.list
            : Array.isArray(responseData.items)
              ? responseData.items
              : Array.isArray(responseData.records)
                ? responseData.records
                : Array.isArray(responseData.rows)
                  ? responseData.rows
                  : []
      state.list = resolvedList
      state.lastLoadTime = Date.now()
      state.error = null

      notifyStateChange()

      // 触发加载完成回调
      if (onDataLoaded) {
        onDataLoaded(responseData)
      }

      return responseData

    } catch (error) {
      console.error('Grid data loading error:', error)
      
      // 只有当前请求才更新错误状态
      if (requestId.value === currentRequestId) {
        state.error = error.message || 'Loading failed'
        state.list = []
        notifyStateChange()

        if (onLoadError) {
          onLoadError(error)
        }
      }

      throw error
    } finally {
      // 只有当前请求才清除加载状态
      if (requestId.value === currentRequestId) {
        state.loading = false
        state.silentLoading = false
        notifyStateChange()
      }
    }
  }

  // 防抖加载函数
  const debouncedLoad = debounce(loadDataInternal, debounceDelay)

  // 公开的加载方法
  const load = (params = {}, immediate = false) => {
    if (immediate) {
      return loadDataInternal(params, false)
    }
    return debouncedLoad(params, false)
  }

  // 静默加载（用于自动刷新）
  const silentLoad = (params = {}) => {
    return loadDataInternal(params, true)
  }

  // 刷新方法
  const refresh = (immediate = true) => {
    return load({}, immediate)
  }

  // 搜索方法
  const search = (query = {}, immediate = false) => {
    // 搜索时重置到第一页
    const resetPage = pageFrom0 ? 0 : 1
    return load({
      query,
      pager: { page: resetPage }
    }, immediate)
  }

  // 重置搜索
  const resetSearch = (immediate = true) => {
    const resetPage = pageFrom0 ? 0 : 1
    return load({
      query: { ...initialQuery },
      pager: { page: resetPage }
    }, immediate)
  }

  // 分页方法
  const changePage = (page) => {
    const targetPage = pageFrom0 ? page - 1 : page
    state.pager.page = targetPage
    return load({}, true)
  }

  const changePageSize = (size) => {
    const resetPage = pageFrom0 ? 0 : 1
    state.pager.size = size
    state.pager.page = resetPage
    return load({}, true)
  }

  // 排序方法
  const sort = (sortBy, sortOrder) => {
    const resetPage = pageFrom0 ? 0 : 1
    const sortQuery = {
      sortBy: sortOrder ? sortBy : undefined,
      sortOrder: sortOrder || undefined
    }
    
    return load({
      query: { ...state.query, ...sortQuery },
      pager: { page: resetPage }
    }, true)
  }

  // 更新查询参数
  const updateQuery = (newQuery, immediate = false) => {
    Object.assign(state.query, newQuery)
    return load({}, immediate)
  }

  // 重置状态
  const reset = () => {
    Object.assign(state, {
      query: { ...initialQuery },
      pager: {
        page: pageFrom0 ? 0 : 1,
        size: defaultPageSize,
        total: 0,
        ...initialPager
      },
      list: [],
      loading: false,
      silentLoading: false,
      error: null,
      lastLoadTime: null,
      selection: []
    })
    notifyStateChange()
  }

  // 设置自动刷新
  const setupAutoRefresh = () => {
    if (!autoRefresh) return

    const refreshTimer = setInterval(() => {
      if (!state.loading && state.lastLoadTime) {
        const timeSinceLastLoad = Date.now() - state.lastLoadTime
        if (timeSinceLastLoad >= refreshInterval) {
          silentLoad()
        }
      }
    }, refreshInterval)

    autoRefreshTimer.value = refreshTimer
  }

  // 清理自动刷新
  const clearAutoRefresh = () => {
    if (autoRefreshTimer.value) {
      clearInterval(autoRefreshTimer.value)
      autoRefreshTimer.value = null
    }
  }

  // 选择管理（可选功能）
  const setSelection = (selection) => {
    state.selection = Array.isArray(selection) ? [...selection] : []
    notifyStateChange()
  }

  const clearSelection = () => {
    state.selection = []
    notifyStateChange()
  }

  // 生命周期管理
  onMounted(() => {
    if (loadOnMounted) {
      load({}, true)
    }
    setupAutoRefresh()
  })

  onUnmounted(() => {
    clearAutoRefresh()
  })

  // 监听状态变化，可用于URL同步等
  watch(
    () => getStateSnapshot(),
    notifyStateChange,
    { deep: true }
  )

  // 返回 Hook API
  return {
    // 响应式状态
    state: readonly(state),
    
    // 计算属性
    hasData,
    hasError,
    isEmpty,
    totalPages,
    currentPage,
    
    // 核心方法
    load,
    refresh,
    search,
    resetSearch,
    
    // 分页方法
    changePage,
    changePageSize,
    
    // 排序方法
    sort,
    
    // 状态管理
    updateQuery,
    reset,
    getStateSnapshot,
    
    // 选择管理
    setSelection,
    clearSelection,
    
    // 自动刷新控制
    setupAutoRefresh,
    clearAutoRefresh
  }
}

/**
 * 简化版的网格列表Hook，适用于简单场景
 * @param {Function} loadData 数据加载函数
 * @param {Object} options 配置选项
 * @returns {Object} 简化的Hook API
 */
export function useSimpleGridList(loadData, options = {}) {
  const hook = useGridList({
    loadData,
    ...options
  })

  // 返回简化的API
  return {
    // 基础状态
    list: computed(() => Array.isArray(hook.state.list) ? hook.state.list : []),
    loading: computed(() => hook.state.loading),
    error: computed(() => hook.state.error),
    
    // 分页状态
    page: computed(() => hook.currentPage || 1),
    pageSize: computed(() => hook.state.pager.size || 10),
    total: computed(() => hook.state.pager.total || 0),
    
    // 基础方法
    load: hook.load,
    refresh: hook.refresh,
    search: hook.search,
    changePage: hook.changePage,
    changePageSize: hook.changePageSize
  }
}
