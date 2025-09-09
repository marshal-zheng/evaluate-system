import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox, ElNotification, ElLoading } from 'element-plus'

/**
 * Element Plus Message utilities
 */
export function useMessage() {
  const showMessage = (message, type = 'info', options = {}) => {
    return ElMessage({
      message,
      type,
      duration: 3000,
      showClose: true,
      ...options
    })
  }

  const showSuccess = (message, options = {}) => showMessage(message, 'success', options)
  const showWarning = (message, options = {}) => showMessage(message, 'warning', options)
  const showError = (message, options = {}) => showMessage(message, 'error', options)
  const showInfo = (message, options = {}) => showMessage(message, 'info', options)

  return {
    showMessage,
    showSuccess,
    showWarning,
    showError,
    showInfo
  }
}

/**
 * Element Plus MessageBox utilities
 */
export function useMessageBox() {
  const showConfirm = (title, message, options = {}) => {
    return ElMessageBox.confirm(message, title, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      ...options
    })
  }

  const showAlert = (title, message, options = {}) => {
    return ElMessageBox.alert(message, title, {
      confirmButtonText: '确定',
      type: 'info',
      ...options
    })
  }

  const showPrompt = (title, message, options = {}) => {
    return ElMessageBox.prompt(message, title, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputType: 'text',
      ...options
    })
  }

  return {
    showConfirm,
    showAlert,
    showPrompt
  }
}

/**
 * Element Plus Notification utilities
 */
export function useNotification() {
  const showNotification = (title, message, type = 'info', options = {}) => {
    return ElNotification({
      title,
      message,
      type,
      duration: 4500,
      position: 'top-right',
      ...options
    })
  }

  const showSuccess = (title, message, options = {}) => 
    showNotification(title, message, 'success', options)
  
  const showWarning = (title, message, options = {}) => 
    showNotification(title, message, 'warning', options)
  
  const showError = (title, message, options = {}) => 
    showNotification(title, message, 'error', options)
  
  const showInfo = (title, message, options = {}) => 
    showNotification(title, message, 'info', options)

  return {
    showNotification,
    showSuccess,
    showWarning,
    showError,
    showInfo
  }
}

/**
 * Element Plus Loading utilities
 */
export function useLoading() {
  const loading = ref(false)

  const showLoading = (options = {}) => {
    loading.value = true
    return ElLoading.service({
      lock: true,
      text: '加载中...',
      background: 'rgba(0, 0, 0, 0.7)',
      ...options
    })
  }

  const hideLoading = (loadingInstance) => {
    loading.value = false
    if (loadingInstance) {
      loadingInstance.close()
    }
  }

  return {
    loading: computed(() => loading.value),
    showLoading,
    hideLoading
  }
}

/**
 * Element Plus Table utilities
 */
export function useTable() {
  const tableData = ref([])
  const loading = ref(false)
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const multipleSelection = ref([])

  const pagination = reactive({
    currentPage: 1,
    pageSize: 10,
    total: 0,
    pageSizes: [10, 20, 50, 100],
    layout: 'total, sizes, prev, pager, next, jumper'
  })

  const handleSelectionChange = (selection) => {
    multipleSelection.value = selection
  }

  const handlePageChange = (page) => {
    currentPage.value = page
    pagination.currentPage = page
  }

  const handleSizeChange = (size) => {
    pageSize.value = size
    pagination.pageSize = size
    currentPage.value = 1
    pagination.currentPage = 1
  }

  const resetPagination = () => {
    currentPage.value = 1
    pageSize.value = 10
    pagination.currentPage = 1
    pagination.pageSize = 10
  }

  return {
    tableData,
    loading,
    total,
    currentPage,
    pageSize,
    multipleSelection,
    pagination,
    handleSelectionChange,
    handlePageChange,
    handleSizeChange,
    resetPagination
  }
}

/**
 * Element Plus Form utilities
 */
export function useForm(initialForm = {}) {
  const form = reactive({ ...initialForm })
  const formRef = ref(null)
  const loading = ref(false)

  const validateForm = async () => {
    if (!formRef.value) return false
    try {
      await formRef.value.validate()
      return true
    } catch (error) {
      return false
    }
  }

  const resetForm = () => {
    if (formRef.value) {
      formRef.value.resetFields()
    }
    Object.assign(form, initialForm)
  }

  const clearValidation = () => {
    if (formRef.value) {
      formRef.value.clearValidate()
    }
  }

  const validateField = (field) => {
    if (formRef.value) {
      formRef.value.validateField(field)
    }
  }

  return {
    form,
    formRef,
    loading,
    validateForm,
    resetForm,
    clearValidation,
    validateField
  }
}

/**
 * Element Plus Dialog utilities
 */
export function useDialog() {
  const visible = ref(false)
  const loading = ref(false)

  const openDialog = () => {
    visible.value = true
  }

  const closeDialog = () => {
    visible.value = false
    loading.value = false
  }

  const handleConfirm = async (callback) => {
    if (typeof callback === 'function') {
      loading.value = true
      try {
        await callback()
        closeDialog()
      } catch (error) {
        console.error('Dialog confirm error:', error)
      } finally {
        loading.value = false
      }
    } else {
      closeDialog()
    }
  }

  return {
    visible,
    loading,
    openDialog,
    closeDialog,
    handleConfirm
  }
}

/**
 * Element Plus Theme utilities
 */
export function useTheme() {
  const isDark = ref(false)

  const toggleTheme = () => {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('dark', isDark.value)
  }

  const setDarkTheme = (dark) => {
    isDark.value = dark
    document.documentElement.classList.toggle('dark', dark)
  }

  return {
    isDark,
    toggleTheme,
    setDarkTheme
  }
}

/**
 * Element Plus Drawer utilities
 */
export function useDrawer() {
  const visible = ref(false)
  const loading = ref(false)

  const openDrawer = () => {
    visible.value = true
  }

  const closeDrawer = () => {
    visible.value = false
    loading.value = false
  }

  return {
    visible,
    loading,
    openDrawer,
    closeDrawer
  }
}