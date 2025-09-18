// useModal Hook 使用示例
// 展示如何使用转换后的 Element Plus 版本的 useModal

import { defineComponent } from 'vue'
import useModal from './useModal'

export default defineComponent({
  name: 'ModalExample',
  setup() {
    const { openModal, openDeleteModal } = useModal()

    // 基础信息弹窗
    const showInfoModal = () => {
      openModal({
        type: 'info',
        title: '信息提示',
        message: '这是一个信息提示弹窗',
        size: 'medium'
      })
    }

    // 确认弹窗（带异步操作）
    const showConfirmModal = () => {
      openModal({
        type: 'warning',
        title: '确认操作',
        message: '确定要执行此操作吗？',
        size: 'small',
        onBeforeOk: async () => {
          // 模拟异步操作
          return new Promise((resolve) => {
            setTimeout(() => {
              console.log('操作完成')
              resolve(undefined)
            }, 2000)
          })
        }
      }).then(() => {
        console.log('用户确认并完成操作')
      }).catch(() => {
        console.log('用户取消操作')
      })
    }

    // 删除确认弹窗
    const showDeleteModal = () => {
      openDeleteModal({
        title: '删除确认',
        message: '确定要删除这个项目吗？此操作不可撤销。',
        onBeforeOk: async () => {
          // 模拟删除操作
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              const success = Math.random() > 0.3 // 70% 成功率
              if (success) {
                console.log('删除成功')
                resolve(undefined)
              } else {
                console.error('删除失败')
                reject(new Error('删除失败'))
              }
            }, 1500)
          })
        }
      }).then(() => {
        console.log('删除操作完成')
      }).catch(() => {
        console.log('删除操作取消或失败')
      })
    }

    // 弱模式样式弹窗
    const showWeakModal = () => {
      openModal({
        type: 'success',
        title: '成功提示',
        message: '操作成功完成！',
        mode: 'weak',
        size: 'large'
      })
    }

    return {
      showInfoModal,
      showConfirmModal,
      showDeleteModal,
      showWeakModal
    }
  }
})