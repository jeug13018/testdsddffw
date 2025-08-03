<template>
  <div class="min-h-screen bg-neutral-50 text-xs font-sans">
    <header class="fixed top-0 left-0 right-0 z-20 bg-white shadow-sm mb-4">
      <div class="max-w-3xl mx-auto flex items-center justify-between px-4 py-2">
        <!-- 根据路由显示logo或返回按钮 -->
        <div>
          <div v-if="isHomePage" class="text-base font-bold tracking-wide flex items-center">
            <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="25" height="25"><path d="M161.28 478.72c12.8 5.12 25.6 15.36 35.84 23.04 5.12 5.12 51.2 87.04 76.8 120.32 58.88 74.24 135.68 115.2 240.64 115.2 104.96 0 181.76-43.52 240.64-115.2 25.6-33.28 74.24-115.2 76.8-120.32 10.24-10.24 23.04-17.92 35.84-23.04-25.6-12.8-43.52-25.6-53.76-33.28l-107.52-89.6c-51.2-43.52-99.84-46.08-156.16-5.12L512 381.44l-38.4-30.72c-53.76-40.96-102.4-38.4-156.16 5.12l-107.52 92.16c-5.12 5.12-23.04 15.36-48.64 30.72z m378.88-151.04c64-48.64 125.44-46.08 186.88 5.12l107.52 89.6c10.24 7.68 35.84 23.04 74.24 43.52l33.28 15.36-35.84 7.68c-20.48 5.12-38.4 15.36-53.76 28.16 0 0-46.08 81.92-74.24 117.76-64 79.36-148.48 125.44-261.12 125.44-112.64 0-197.12-46.08-261.12-125.44-30.72-30.72-76.8-112.64-76.8-112.64-15.36-15.36-33.28-23.04-53.76-28.16L89.6 486.4l33.28-15.36c38.4-20.48 64-33.28 74.24-43.52l107.52-92.16c61.44-51.2 122.88-53.76 186.88-5.12l23.04 17.92 25.6-20.48z m-184.32 174.08c94.72 58.88 215.04 58.88 309.76 0-94.72-53.76-212.48-53.76-309.76 0z m343.04 10.24c-112.64 79.36-261.12 79.36-373.76 0l-15.36-10.24 15.36-10.24c112.64-74.24 258.56-74.24 371.2 0l15.36 10.24-12.8 10.24z" fill="#222222"></path><path d="M161.28 478.72c25.6-12.8 43.52-23.04 53.76-33.28l107.52-92.16c51.2-43.52 99.84-46.08 156.16-5.12l38.4 30.72 38.4-30.72c53.76-40.96 102.4-38.4 156.16 5.12l107.52 89.6c10.24 7.68 28.16 17.92 53.76 33.28-12.8 5.12-25.6 15.36-35.84 23.04-5.12 5.12-51.2 87.04-76.8 120.32-58.88 74.24-135.68 115.2-240.64 115.2-104.96 0-181.76-43.52-240.64-115.2-25.6-33.28-74.24-115.2-76.8-120.32-17.92-7.68-28.16-15.36-40.96-20.48z m537.6 33.28l15.36-10.24-15.36-10.24c-112.64-74.24-258.56-74.24-371.2 0l-15.36 10.24 15.36 10.24c110.08 79.36 258.56 79.36 371.2 0z" fill="#F23030"></path></svg><span class="ml-1 colorful-text">修车网</span>
          </div>
          <div v-else @click="goBack" class="cursor-pointer">
            <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="15" height="15"><path d="M738.0992 33.87392c11.8784 0 23.87968 4.58752 33.42336 13.9264 9.6256 9.37984 14.336 21.13536 14.336 32.80896 0 11.71456-4.7104 23.47008-14.45888 32.9728L355.69664 505.856l413.16352 389.81632c9.6256 9.4208 14.336 21.13536 14.336 32.84992 0 11.55072-4.54656 23.1424-13.9264 32.48128-9.6256 12.16512-22.28224 15.5648-35.14368 15.5648-13.23008 0-25.8048-3.97312-32.5632-13.1072L253.62432 540.0576c-9.54368-9.29792-15.64672-21.79072-15.64672-34.11968 0-12.36992 6.144-24.82176 15.7696-34.24256l450.9696-423.89504c9.50272-9.29792 21.46304-13.88544 33.3824-13.88544z" fill="#262626"></path></svg>
          </div>
        </div>
        <svg v-if="userInfo.id" @click="userStore.isUserModalOpen = true" class="cursor-pointer" viewBox="0 0 1025 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="25" height="25"><path d="M582.352706 568.885667c-3.173009-1.033003-23.208068-10.067029-10.688031-48.126141l-0.173001 0c32.628096-33.602098 57.568169-87.703257 57.568169-140.945413 0-81.88124-54.45416-124.788366-117.727345-124.788366-63.311185 0-117.455344 42.908126-117.455344 124.788366 0 53.458157 24.803073 107.775316 57.627169 141.295414 12.792037 33.563098-10.08603 46.021135-14.873044 47.77614-66.271194 23.96307-144.009422 67.648198-144.009422 110.771325l0 16.157047c0 58.755172 113.910334 72.111211 219.332643 72.111211 105.578309 0 218.047639-13.356039 218.047639-72.111211l0-16.157047C730.001139 635.229861 651.87491 591.897734 582.352706 568.885667L582.352706 568.885667zM582.352706 568.885667" fill="#262626"></path><path d="M511.308498 958.895809c-246.714723 0-447.417311-200.702588-447.417311-447.423311 0-246.714723 200.702588-447.417311 447.417311-447.417311 246.721723 0 447.423311 200.702588 447.423311 447.417311C958.731809 758.194221 758.029221 958.895809 511.308498 958.895809L511.308498 958.895809zM511.308498 128.259376c-211.307619 0-383.213123 171.905504-383.213123 383.213123 0 211.279619 171.905504 383.219123 383.213123 383.219123 211.279619 0 383.219123-171.939504 383.219123-383.219123C894.527621 300.165879 722.588117 128.259376 511.308498 128.259376L511.308498 128.259376zM511.308498 128.259376" fill="#262626"></path></svg>
        <button v-else class="px-3 py-1 rounded bg-neutral-800 text-white text-xs" @click="loginStore.showLoginModal()">登录</button>
      </div>
    </header>
    <div class="pt-14">
      
      <router-view v-slot="{ Component, route }">
        <keep-alive :include="['forum']">
          <component :is="Component" :key="route.path" />
        </keep-alive>
      </router-view>
    </div>
  </div>
</template>

<script setup lang="ts">

import { useLoginStore } from '@/stores/login'
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)
const loginStore = useLoginStore()
const route = useRoute()
const router = useRouter()

// 在组件挂载时检查URL中是否有code参数
onMounted(async () => {
  let code = route.query.code
  
  if (code) {
    // 判断code里面是不是以`xc_`开头，是的话去掉
    if (typeof code === 'string' && code.startsWith('xc_')) {
      code = code.slice(3)
    }
    // 调用获取用户详情的接口
    await userStore.updateUserInfo(code.toString())
    // 清除URL中的code参数
    const query = { ...route.query }
    delete query.code
    
    // 使用replace方法更新路由，不会新增历史记录
    router.replace({
      path: route.path,
      query,
      hash: route.hash
    })
  }
})

// 判断是否是首页
const isHomePage = computed(() => {
  return route.path === '/' || route.name === 'home'
})

// 返回上一页
const goBack = () => {
  router.back()
}
</script>

<style scoped>
.colorful-text {
  background-image: linear-gradient(to right, #f00, #f90, #00f);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: rainbow 6s linear infinite;
}

@keyframes rainbow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
</style>