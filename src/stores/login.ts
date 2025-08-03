import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useLoginStore = defineStore('login', () => {
  // 登录框显示状态
  const isLoginModalOpen = ref(false)

  // 登录的回调
  const loginCallback = ref(null)
  
  // 显示登录框
  function showLoginModal() {
    isLoginModalOpen.value = true
  }
  
  // 隐藏登录框
  function hideLoginModal() {
    isLoginModalOpen.value = false
  }
  
  // 切换登录框显示状态
  function toggleLoginModal() {
    isLoginModalOpen.value = !isLoginModalOpen.value
  }

  return { 
    isLoginModalOpen, 
    loginCallback,
    showLoginModal, 
    hideLoginModal, 
    toggleLoginModal 
  }
})