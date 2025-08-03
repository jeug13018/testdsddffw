<template>
  <Teleport to="body">
    <div v-if="isOpen" class="certificate-container">
      <div class="max-w-xs bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-800 dark:via-gray-700 dark:to-indigo-900 p-6 relative rounded-lg overflow-hidden">
        
        <!-- 装饰元素 -->
        <div class="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/5"></div>
        <div class="absolute right-20 -bottom-10 w-24 h-24 rounded-full bg-white/5"></div>
        <div class="absolute left-5 top-3 opacity-20">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4L14.4697 9.2584L20.2434 10.0451L15.878 14.0479L17.027 19.7549L12 16.887L6.97296 19.7549L8.12197 14.0479L3.75659 10.0451L9.53035 9.2584L12 4Z" fill="white" stroke="white" stroke-width="1.5"/>
          </svg>
          
        </div>
        <!-- 关闭按钮 -->
        <button 
          @click.stop="isOpen = false;" 
          class="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 dark:bg-gray-700/30 dark:hover:bg-gray-700/50 flex items-center justify-center transition-colors z-10"
          aria-label="关闭"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
        <!-- 标题 -->
        <h3 class="text-center font-medium text-lg text-gray-800 dark:text-white m-0 mb-2">当前用户凭证</h3>

        <!-- 用户信息 -->
        <div class="m-0 mb-2 text-center">
          <p class="text-xs text-gray-500 dark:text-gray-400">凭证编号：{{ userInfo?.id }}</p>
        </div>

        <!-- 二维码区域 -->
        <div class="bg-white dark:bg-gray-700 p-4 rounded-lg flex items-center justify-center mb-5 shadow-sm mx-auto max-w-[200px]">
          <div class="p-2 bg-white rounded-lg">
            <QRCode
              :value="qrValue"
              :size="160"
              level="H"
              render-as="svg"
            />
          </div>
        </div>

        <!-- 凭证使用说明 -->
        <div class="bg-blue-50/70 dark:bg-gray-700/70 border border-blue-100 dark:border-gray-600 rounded-md p-2 mb-2">
          <div class="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-5 text-[#000] dark:text-[#fff] mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
            <div>
              <p class="text-sm text-[#000] dark:text-[#fff] font-bold m-0">凭证使用方法</p>
              <p class="text-xs text-[#000] dark:text-[#fff] mt-1">可用任意浏览器的扫一扫功能打开网页</p>
              <p class="text-xs text-[#000] dark:text-[#fff]">iPhone用户可在相册长按图片识别打开网页</p>
            </div>
          </div>
        </div>

        <!-- 显示客服邮箱 -->
        <div class="mb-2">
          <div class="flex items-center justify-center">
            <span class="text-sm text-gray-300 dark:text-gray-600">客服邮箱：{{ supportEmail }}</span>
          </div>
        </div>
        <!-- 截图提示信息 -->
        <div class="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-md p-2 mb-2">
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
            <span class="text-xs font-medium text-yellow-700 dark:text-yellow-400 m-0">请截图保存电子凭证</span>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
// @ts-nocheck
import { computed } from 'vue';
import { supportEmail, homeUrl } from '@/config/index';
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import QRCode from 'qrcode.vue';
import { useQrCertificateStore } from '@/stores/qrCertificate'

const qrCertificateStore = useQrCertificateStore()

// 使用计算属性实现双向绑定
const isOpen = computed({
  get: () => qrCertificateStore.isQrCertificateModalOpen,
  set: (value) => { qrCertificateStore.isQrCertificateModalOpen = value }
})

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

// 生成二维码的网址，包含用户ID和时间戳参数
const qrValue = computed(() => {
  const baseUrl = homeUrl
  const code = userInfo.value?.inviteCode || '';
  
  // 构建带有用户ID和时间戳的URL
  return `${baseUrl}?code=${code}&type=xiuche`;
});
</script>

<style scoped>
.certificate-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* user-select: none; */
}
</style>
