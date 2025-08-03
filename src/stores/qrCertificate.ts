import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useQrCertificateStore = defineStore('qrCertificate', () => {
  // 二维码凭证弹窗显示状态
  const isQrCertificateModalOpen = ref(false)
  return { 
    isQrCertificateModalOpen,
  }
})