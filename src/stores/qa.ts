import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useQaStore = defineStore('qa', () => {
  // 防诈骗引导框显示状态
  const isQaModalOpen = ref(false)
  return { 
    isQaModalOpen,
  }
})
