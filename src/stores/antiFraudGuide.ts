import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAntiFraudGuideStore = defineStore('antiFraudGuide', () => {
  // 防诈骗引导框显示状态
  const isAntiFraudGuideModalOpen = ref(false)
  return { 
    isAntiFraudGuideModalOpen,
  }
})