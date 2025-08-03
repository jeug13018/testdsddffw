import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { getUserInfo } from '@/api/base'

export const useUserStore = defineStore('user', () => {
  const isUserModalOpen = ref(false)
  // 用户信息
  const userInfo = useStorage('userInfo', {})
  // 更新用户信息
  const updateUserInfo = async (inviteCode = '') => {
    if (!inviteCode && !userInfo.value?.inviteCode) {
      console.warn('用户未登录，无法更新用户信息')
      return false
    }
    try {
      const response = await getUserInfo({ inviteCode: inviteCode || userInfo.value?.inviteCode })
      if (response) {
        userInfo.value = response
      }
      return true
    } catch (error) {
      return false
    }
  }

  return {
    isUserModalOpen,
    userInfo,
    updateUserInfo
  }
})
