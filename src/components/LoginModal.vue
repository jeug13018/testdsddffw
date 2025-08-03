<template>
  <Dialog v-model:open="isOpen" class="max-w-xs">
    <DialogContent class="max-w-xs p-6">
      <div class="text-center mb-4 text-sm font-bold">登录</div>
      <div class="flex flex-col gap-2">
        <Button class="w-full text-xs" @click="handleGuestLogin" :disabled="isLoading">
          <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
          {{ isLoading ? '登录中...' : '一键游客登录' }}
        </Button>
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <span class="w-full border-t"></span>
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-background px-2 text-muted-foreground">或者</span>
          </div>
        </div>
        
        <!-- 用户凭证登录 -->
        <div class="flex flex-col gap-2">
          <Button 
            variant="outline" 
            class="w-full text-xs relative"
            :disabled="isVerifying"
            @click="triggerFileInput"
          >
            <Loader2 v-if="isVerifying" class="mr-2 h-4 w-4 animate-spin" />
            <span v-if="isVerifying">验证中...</span>
            <span v-else>用户凭证登录</span>
            
            <input 
              type="file" 
              ref="fileInput"
              class="hidden" 
              accept="image/*"
              @change="handleFileChange" 
            />
          </Button>
          <!-- <p class="text-xs text-center text-gray-500">请上传身份凭证图片(≤5MB)</p> -->
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
// @ts-nocheck
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { computed, ref } from 'vue'
import { useLoginStore } from '@/stores/login'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { autoRegister, qrCodeLogin } from '@/api/base'
import Cookies from 'js-cookie'
import { Loader2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const loginStore = useLoginStore()
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)
const isLoading = ref(false)
const isVerifying = ref(false)
const fileInput = ref(null)
const selectedFile = ref(null)

// 使用计算属性实现双向绑定
const isOpen = computed({
  get: () => loginStore.isLoginModalOpen,
  set: (value) => { loginStore.isLoginModalOpen = value }
})

// 一键游客登录
const handleGuestLogin = async () => {
  if (isLoading.value) return

  if (document.cookie.includes('autoRegistered=true')) {
    toast.info('请明天再游客登录吧')
    return
  }
  
  isLoading.value = true
  try {
    const response = await autoRegister()
    userInfo.value = response
    // 往cookie里面存一个标志，表示已经自动注册过了，有效期是0.5天
    Cookies.set('autoRegistered', 'true', { expires: 0.5 }) // expires 接受天数，可以是小数
    
    // 关闭登录弹窗
    isOpen.value = false
    
    // 显示成功提示
    toast.success('登录成功')
    if (Object.prototype.toString.call(loginStore.loginCallback) === '[object Function]') {
      loginStore.loginCallback()
      loginStore.loginCallback = null
    }
  } catch (error) {
    toast.error(error?.response?.data?.message || '登录失败，请重试')
  } finally {
    isLoading.value = false
  }
}

// 触发文件选择
const triggerFileInput = () => {
  if (isVerifying.value) return
  fileInput.value.click()
}

// 处理文件选择
const handleFileChange = async (event) => {
  const file = event.target.files[0]
  
  if (!file) {
    selectedFile.value = null
    return
  }
  
  // 检查文件类型
  if (!file.type.startsWith('image/')) {
    toast.error('只能上传图片文件')
    selectedFile.value = null
    resetFileInput()
    return
  }
  
  // 检查文件大小 (5MB = 5 * 1024 * 1024 bytes)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    toast.error('文件大小不能超过5MB')
    selectedFile.value = null
    resetFileInput()
    return
  }
  
  selectedFile.value = file
  
  // 自动开始上传验证
  await verifyCredentialFile()
}

// 重置文件输入
const resetFileInput = () => {
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 验证凭证文件
const verifyCredentialFile = async () => {
  if (!selectedFile.value || isVerifying.value) return
  
  isVerifying.value = true
  
  try {
    // 创建FormData对象
    const formData = new FormData()
    formData.append('image', selectedFile.value)
    
    // 调用API验证凭证
    const response = await qrCodeLogin(formData)
    
    // 验证成功，设置用户信息
    userInfo.value = response
    
    // 往cookie里面存一个标志，表示已经验证登录过了，有效期是0.5天
    Cookies.set('autoRegistered', 'true', { expires: 0.5 })
    
    // 关闭登录弹窗
    isOpen.value = false
    
    // 显示成功提示
    toast.success('登录成功')
  } catch (error) {
    selectedFile.value = null
    toast.error(error?.response?.data?.message || '凭证验证失败，请重试')
    resetFileInput()
  } finally {
    isVerifying.value = false
  }
}
</script>