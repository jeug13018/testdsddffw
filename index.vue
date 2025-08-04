<template>
  <div class="app-wrapper">
    <section class="app-content" :style="{
      'padding-top': ['/shortVideo'].includes(route.path) ? '0' : 'var(--app-bar-height)'
    }">
      <router-view v-slot="{ Component }">
        <!-- <transition name="fade-transformX" mode="out-in"> -->
          <!-- <keep-alive :include="['Home', 'LiveList', 'Personal']"> -->
            <component :is="Component" :key="key" />
          <!-- </keep-alive> -->
        <!-- </transition> -->
      </router-view>
    </section>
    <div class="footer-bar" v-if="['/home', '/vipZone', '/liveList', '/personal', '/shortVideo'].includes(route.path)">
      <var-bottom-navigation v-model:active="active" safe-area fixed>
        <var-bottom-navigation-item
          v-for="item in tabs"
          :key="item.label"
          :label="item.label"
          :name="item.path"
          :namespace="item.namespace"
          @click="() => to(item.path)"
        >
          <template #icon>
            <!-- svg组件 -->
            <component :is="item.svg" :width="20" :height="20" />
          </template>
        </var-bottom-navigation-item>
      </var-bottom-navigation>
    </div>
    <var-popup
      v-model:show="isShowLoginDialog"
      position="center" 
      :overlay="true" 
      :close-on-click-overlay="false"
    >
      <div class="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-800 dark:via-gray-700 dark:to-indigo-900 rounded-xl w-[85vw] max-w-md overflow-hidden shadow-lg p-6 pt-3 relative">
        <div class="flex items-center justify-between">
          <div>
            <var-icon v-if="loginStep !== 1" @click="loginStep = 1" size="25" name="chevron-left" />
          </div>
          <var-icon @click="isShowLoginDialog = false" size="20" name="window-close" />
        </div>

        <h3 class="text-center font-medium text-lg text-gray-800 dark:text-white m-0 mb-4"></h3>
        <div v-if="loginStep === 1">
          <!-- 游客登录按钮 - 更加醒目 -->
          <var-button 
            type="primary" 
            block
            :loading="loginBtnLoading"
            loading-type="cube"
            @click="guestLogin" 
            class="mb-3"
          >
            游客登录
          </var-button>
          
          <!-- 邮箱登录按钮 -->
          <var-button 
            type="primary" 
            block 
            @click="toEmailLogin" 
            class="mb-4"
            text
            outline
          >
            邮箱登录(已绑定邮箱)
          </var-button>
          
          <!-- 分隔线 -->
          <div class="flex items-center justify-center my-4">
            <div class="h-px bg-gray-300 dark:bg-gray-600 flex-grow"></div>
            <span class="px-2 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">或者</span>
            <div class="h-px bg-gray-300 dark:bg-gray-600 flex-grow"></div>
          </div>
          
          <!-- 扫码提示 -->
          <div class="text-center text-sm text-gray-600 dark:text-gray-300 flex items-center justify-center">
            <var-icon name="qrcode-scan" class="mr-1 text-purple-500" />
            <span>浏览器扫一扫用户凭证快速登录老账号</span>
          </div>
        </div>
        <template v-else>
          <var-form ref="formRef">
            <var-auto-complete
              v-model="form.email"
              variant="outlined"
              placeholder="请输入邮箱"
              :rules="[v => !!v || '邮箱不能为空', z.string().email('邮箱格式有误').max(50, '邮箱不能超过50位')]"
              :options="emailSuggestions"
              size="small"
            >
              <template #prepend-icon>
                <var-icon class="sign-in-form-input-icon pr-2" name="email" />
              </template>
            </var-auto-complete>
          </var-form>
          <div class="flex items-center mt-2">
            <var-button type="primary" block :loading="loginBtnLoading" loading-type="cube" @click="emailLoginBtn">登录</var-button>
          </div>
        </template>
      </div>
    </var-popup>
    <var-dialog v-if="false" v-model:show="isShowLoginDialog" dialog-class="login-dialog" :close-on-click-overlay="false">
      <var-style-provider :style-vars="loginDialogStyleVars">
        <var-button class="close-btn" type="primary" text  round icon-container @click="closeDialog">
          <var-icon name="window-close" />
        </var-button>
        <div class="tab-content">
          <var-tabs v-model:active="loginTab">
            <var-tab>登录</var-tab>
            <var-tab>注册</var-tab>
          </var-tabs>
        </div>
        <var-tabs-items v-model:active="loginTab">
          <var-tab-item>
            <!-- <div ref="signInTurnstileRef" class="turnstile-wrap"></div> -->
            <var-form ref="signInFormRef" class="pt-5 pb-2">
              <var-space direction="column" :size="['3vmin', 0]">
                <var-auto-complete
                  v-model="signInForm.email"
                  variant="outlined"
                  placeholder="请输入邮箱"
                  :rules="[v => !!v || '邮箱不能为空', z.string().email('邮箱格式有误').max(50, '邮箱不能超过50位')]"
                  :options="emailSuggestions"
                  size="small"
                >
                  <template #prepend-icon>
                    <var-icon class="sign-in-form-input-icon pr-2" name="email" />
                  </template>
                </var-auto-complete>
  
                <var-input
                  v-model="signInForm.password"
                  type="password"
                  variant="outlined"
                  placeholder="请输入密码"
                  :rules="[v => !!v || '密码不能为空', z.string().max(20, '密码不能超过20位').min(6, '密码不能少于6位')]"
                  size="small"
                >
                  <template #prepend-icon>
                    <var-icon class="sign-in-form-input-icon pr-2" name="lock" />
                  </template>
                  <!-- <template #extra-message>
                    忘记密码?
                  </template> -->
                </var-input>
  
                <var-button type="primary" block :loading="loginBtnLoading" loading-type="cube" @click="loginBtn">登录</var-button>
              </var-space>
            </var-form>
          </var-tab-item>
          <var-tab-item>
            <var-form ref="signUpFormRef" class="pt-5 pb-2">
              <var-space direction="column" :size="['3vmin', 0]">
                <var-auto-complete
                  v-model="signUpForm.email"
                  variant="outlined"
                  placeholder="请输入邮箱"
                  :rules="[v => !!v || '邮箱不能为空', z.string().email('邮箱格式有误').max(50, '邮箱不能超过50位')]"
                  :options="emailSuggestionsSignUp"
                  size="small"
                >
                  <template #prepend-icon>
                    <var-icon class="sign-in-form-input-icon pr-2" name="email" />
                  </template>
                </var-auto-complete>
  
                <!-- 邮箱验证码输入框和发送按钮，120秒倒计时 -->
                 <!-- 验证码只能是数字 -->
                <div class="flex justify-between items-start gap-2">
                  <var-input
                    v-model="signUpForm.verifyCode"
                    variant="outlined"
                    placeholder="请输入验证码"
                    :rules="[v => !!v || '验证码不能为空', z.string().regex(/^\d+$/, '验证码只能是数字').length(6, '验证码必须为6位')]"
                    type="number"
                    size="small"
                    class="flex-1"
                  >
                    <template #prepend-icon>
                      <var-icon class="sign-in-form-input-icon pr-2" name="message-processing-outline" />
                    </template>
                  </var-input>
                  <var-button
                    type="primary"
                    text
                    outline
                    :loading="isSending"
                    loading-type="cube"
                    :disabled="countdown > 0 || isSending"
                    @click="sendVerifyCode"
                  >
                    {{ countdown > 0 ? `${countdown}秒后重试` : '发送验证码' }}
                  </var-button>
                </div>
  
                <var-input
                  v-model="signUpForm.password"
                  class="w-full"
                  type="password"
                  variant="outlined"
                  placeholder=" 请输入密码"
                  :rules="[v => !!v || '密码不能为空', z.string().max(20, '密码不能超过20位').min(6, '密码不能少于6位')]"
                  size="small"
                >
                  <template #prepend-icon>
                    <var-icon class="sign-in-form-input-icon pr-2" name="lock" />
                  </template>
                </var-input>

                <!-- 只允许输入数字 -->
                <var-input
                  v-model="signUpForm.inviteCode"
                  class="w-full"
                  variant="outlined"
                  :rules="[
                    v => !v || /^\d+$/.test(v) || '邀请码只能是数字', 
                    v => !v || v.length <= 7 || '邀请码不能超过7位'
                  ]"
                  type="number"
                  placeholder="邀请码（可选）"
                  :disabled="isInviteCodeReadonly"
                  size="small"
                >
                  <template #prepend-icon>
                    <var-icon class="sign-in-form-input-icon pr-2" name="barcode-scan" />
                  </template>
                </var-input>
  
                <var-button type="primary" block :loading="signUpBtnLoading" loading-type="cube" @click="signUpBtn">注册</var-button>
              </var-space>
            </var-form>
          </var-tab-item>
        </var-tabs-items>
      </var-style-provider>
    </var-dialog>
    <!-- 提示用户，vip专区已修复完成，已为账号增加2天时长 -->
    <var-popup
      v-model:show="isShowTipsDialog"
      position="center" 
      :overlay="true" 
      :close-on-click-overlay="false"
    >
      <div class="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-800 dark:via-gray-700 dark:to-indigo-900 rounded-xl w-[85vw] max-w-md overflow-hidden shadow-lg p-6 pt-1 relative">
        <h3 class="text-lg font-bold text-indigo-700 dark:text-indigo-300 text-center mb-1">系统通知</h3>
        
        <div class="flex items-start space-x-3 mb-4">
          <div>
            <p class="text-gray-800 dark:text-gray-200 font-medium mb-2">付费VIP专区已升级完成</p>
            <p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-2">
              因2025-07-25日付费VIP专区系统升级，导致VIP内容暂时无法访问，非常抱歉给您带来不便。
            </p>
            <p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              为表歉意，我们已经为<b>原未到期付费VIP用户</b>额外增加了<span class="text-amber-500 dark:text-amber-400 font-bold">2天付费VIP会员</span>时长，感谢您的理解与支持！
            </p>
          </div>
        </div>
        
        <div class="flex justify-center">
          <var-button 
            type="primary" 
            block
            @click="closeTipsDialog"
            class="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 shadow-md hover:shadow-lg transition-shadow"
          >
            <div class="flex items-center justify-center">
              <var-icon name="video" class="mr-1" />
              <span>我知道了</span>
            </div>
          </var-button>
        </div>
      </div>
    </var-popup>
    <!-- 全国修车网广告弹窗 -->
    <var-popup
      v-model:show="showCarRepairAd"
      position="center" 
      :overlay="true" 
      :close-on-click-overlay="false"
    >
      <div class="bg-white dark:bg-gray-800 rounded-xl w-[85vw] max-w-md overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700">
        <!-- 顶部渐变条 -->
        <div class="h-1 bg-gradient-to-r from-blue-500 to-teal-400"></div>
        
        <!-- 关闭按钮 -->
        <div class="absolute top-2 right-2">
          <var-button round text size="mini" @click="closeCarRepairAd">
            <var-icon name="window-close" :size="18" />
          </var-button>
        </div>
        
        <!-- 头部 -->
        <div class="px-5 pt-4 pb-2 flex items-center border-b border-gray-100 dark:border-gray-700">
          <div class="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900 flex items-center justify-center mr-3 flex-shrink-0">
            <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="25" height="25"><path d="M161.28 478.72c12.8 5.12 25.6 15.36 35.84 23.04 5.12 5.12 51.2 87.04 76.8 120.32 58.88 74.24 135.68 115.2 240.64 115.2 104.96 0 181.76-43.52 240.64-115.2 25.6-33.28 74.24-115.2 76.8-120.32 10.24-10.24 23.04-17.92 35.84-23.04-25.6-12.8-43.52-25.6-53.76-33.28l-107.52-89.6c-51.2-43.52-99.84-46.08-156.16-5.12L512 381.44l-38.4-30.72c-53.76-40.96-102.4-38.4-156.16 5.12l-107.52 92.16c-5.12 5.12-23.04 15.36-48.64 30.72z m378.88-151.04c64-48.64 125.44-46.08 186.88 5.12l107.52 89.6c10.24 7.68 35.84 23.04 74.24 43.52l33.28 15.36-35.84 7.68c-20.48 5.12-38.4 15.36-53.76 28.16 0 0-46.08 81.92-74.24 117.76-64 79.36-148.48 125.44-261.12 125.44-112.64 0-197.12-46.08-261.12-125.44-30.72-30.72-76.8-112.64-76.8-112.64-15.36-15.36-33.28-23.04-53.76-28.16L89.6 486.4l33.28-15.36c38.4-20.48 64-33.28 74.24-43.52l107.52-92.16c61.44-51.2 122.88-53.76 186.88-5.12l23.04 17.92 25.6-20.48z m-184.32 174.08c94.72 58.88 215.04 58.88 309.76 0-94.72-53.76-212.48-53.76-309.76 0z m343.04 10.24c-112.64 79.36-261.12 79.36-373.76 0l-15.36-10.24 15.36-10.24c112.64-74.24 258.56-74.24 371.2 0l15.36 10.24-12.8 10.24z" fill="#222222"></path><path d="M161.28 478.72c25.6-12.8 43.52-23.04 53.76-33.28l107.52-92.16c51.2-43.52 99.84-46.08 156.16-5.12l38.4 30.72 38.4-30.72c53.76-40.96 102.4-38.4 156.16 5.12l107.52 89.6c10.24 7.68 28.16 17.92 53.76 33.28-12.8 5.12-25.6 15.36-35.84 23.04-5.12 5.12-51.2 87.04-76.8 120.32-58.88 74.24-135.68 115.2-240.64 115.2-104.96 0-181.76-43.52-240.64-115.2-25.6-33.28-74.24-115.2-76.8-120.32-17.92-7.68-28.16-15.36-40.96-20.48z m537.6 33.28l15.36-10.24-15.36-10.24c-112.64-74.24-258.56-74.24-371.2 0l-15.36 10.24 15.36 10.24c110.08 79.36 258.56 79.36 371.2 0z" fill="#F23030"></path></svg>
          </div>
          <div>
            <h3 class="text-base font-medium colorful-text leading-tight">全国修车网</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">专业的全国楼凤、站街资源论坛</p>
          </div>
        </div>
        
        <!-- 内容区域 -->
        <div class="p-5">
          <div class="flex mb-4">
            <div>
              <h4 class="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">已稳定运营4年</h4>
              <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                信息覆盖全国300+城市，每天24小时采集电报频道最新资源。
              </p>
            </div>
          </div>
          
          <div class="space-y-2">
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span class="text-xs text-gray-700 dark:text-gray-300">覆盖城市全面</span>
            </div>
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span class="text-xs text-gray-700 dark:text-gray-300">信息更新及时</span>
            </div>
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span class="text-xs text-gray-700 dark:text-gray-300">每个楼凤都有暗号和狼友的出击报告</span>
            </div>
          </div>
          
          <div class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div class="flex gap-2">
              <var-button
                class="flex-1 h-9 text-xs"
                type="primary"
                text
                outline
                @click="closeCarRepairAd"
              >
                以后再说
              </var-button>
              <var-button 
                class="flex-1 h-9 text-xs"
                @click="openCarRepairApp"
                color="#3b82f6"
                text-color="#fff"
              >
                看看怎么个事
              </var-button>
            </div>
          </div>
        </div>
      </div>
    </var-popup>
  </div>
</template>

<script setup>
import { onMounted, onBeforeMount, computed, ref, watch, useTemplateRef, onUnmounted } from 'vue'
import { Snackbar } from '@varlet/ui'
import { useRoute } from 'vue-router'
import router from '@/router'
import { z } from 'zod'
import { autoRegister, autoLogin, register, sendCode, login } from '@/apis/base'
import { useGlobalStore } from '@/stores/useGlobalStore'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import LongVideoSvg from './svg/longVideo.vue'
import LiveSvg from './svg/live.vue'
import VipSvg from './svg/vip.vue'
import DouyinSvg from './svg/douyin.vue'
import PersonalSvg from './svg/personal.vue'
import { xiucheUrl } from '@/const'

// 控制广告弹窗显示
const showCarRepairAd = ref(false);
const isShowTipsDialog = ref(false)
const store = useGlobalStore()
const userStore = useUserStore()
const { isShowLoginDialog, loginCallback } = storeToRefs(store)
const { userInfo } = storeToRefs(userStore)
const route = useRoute()
const active = ref(route.path)
const loginBtnLoading = ref(false)
const signUpBtnLoading = ref(false)
const formRef = useTemplateRef('formRef')
const signInFormRef = useTemplateRef('signInFormRef')
const signUpFormRef = useTemplateRef('signUpFormRef')
const signInTurnstileRef = useTemplateRef('signInTurnstileRef')
const loginStep = ref(1) // 登录步骤，1，2邮箱登录
// 用于控制邀请码输入框是否禁用
const isInviteCodeReadonly = ref(false)
const loginTab = ref(0)
const form = ref({
  email: '',
})
const signInForm = ref({
  email: '',
  password: '',
})
const signUpForm = ref({
  email: '',
  password: '',
  verifyCode: '',
  inviteCode: '',
})
const countdown = ref(0) // 倒计时秒数
const isSending = ref(false) // 是否正在发送验证码
let countdownTimer = null // 倒计时定时器
const loginDialogStyleVars = {
  "--button-normal-height": "40px",
  "--tab-font-size": "var(--font-size-lg)",
  "--tab-active-font-size": "var(--font-size-lg)",
  "--tab-font-weight": "600",
  "--tab-active-font-weight": "600",
  "--field-decorator-placeholder-size": "14px",
  "--input-input-font-size": "14px",
  "--field-decorator-icon-size": "18px",
};
// 记录--bottom-navigation-height的值
// const bottomNavigationHeight = ref(useCssVar('--bottom-navigation-height') || '0')
// console.log(useCssVar)

const key = computed(() => {
  return route.path
})

const tabs = ref([
  {
    label: '短视频',
    path: '/shortVideo',
    svg: DouyinSvg,
  },
  {
    label: '点播',
    path: '/home',
    svg: LongVideoSvg,
  },
  {
    label: '直播',
    icon: '15',
    path: '/liveList',
    svg: LiveSvg,
  },
  {
    label: '付费专区',
    path: '/vipZone',
    svg: VipSvg,
  },
  {
    label: '我的',
    path: '/personal',
    svg: PersonalSvg,
  },
])

onMounted(() => {
  // 获取url里有没有inviteCode字段，有的话就存在本地
  const query = route.query
  if (query.inviteCode) {
    localStorage.setItem('inviteCode', query.inviteCode)
  }
  
  checkStoredCountdown()

  if (!userInfo.value?.id && query.code) {
    autoLoginMethod()
    return
  }

  // 判断本地有没有userInfo.value.id，如果有则说明已经登录过了,如果没有就走自动注册流程
  // if (!userInfo.value?.id && !document.cookie.includes('autoRegistered=true')) {
  //   autoRegisterMethod()
  //   return
  // }

  if (userInfo.value?.id) {
    // 如果已经登录过了
    document.cookie = `autoRegistered=true; max-age=${12 * 60 * 60}; path=/`
  }
  // 检查是否显示VIP故障提示
  checkShowTipsDialog()

  // 检查本地存储中是否已经关闭过广告
  const adDismissed = localStorage.getItem('carRepairAdDismissed');
  
  // 如果没有关闭过，则显示广告
  if (!adDismissed) {
    showCarRepairAd.value = true;
  }
})

// 关闭广告并记住选择
const closeCarRepairAd = () => {
  showCarRepairAd.value = false;
  
  // 在本地存储中记录已关闭状态，设置有效期为30天
  localStorage.setItem('carRepairAdDismissed', 'true');
};

// 打开修车网应用
const openCarRepairApp = () => {
  closeCarRepairAd();
  window.open(xiucheUrl, '_blank');
};

// 添加检查是否显示提示的方法
const checkShowTipsDialog = () => {
  localStorage.removeItem('vipTipsDialogDismissed') // 清除上次的标识
  // 检查本地存储中是否有标识，没有则显示提示
  const hasDismissed = localStorage.getItem('vipTipsDialogDismissed-2')
  if (!hasDismissed) {
    isShowTipsDialog.value = true
  }
}

// 添加关闭提示对话框的方法
const closeTipsDialog = () => {
  // 存储标识到本地存储
  localStorage.setItem('vipTipsDialogDismissed-2', 'true')
  isShowTipsDialog.value = false
}

// 从URL或本地存储中获取邀请码
const getInviteCodeFromStorage = () => {
  return localStorage.getItem('inviteCode') || ''
}

const to = (path) => {
  router.push(path)
}

// 刷新页面
const refreshBtn = () => {
  window.location.reload();
}

const emailSuggestions = computed(() =>
  ['@qq.com', '@163.com', '@139.com'].map((suffix) => {
    // const [prefix] = signInForm.value.email?.split('@')
    const [prefix] = form.value.email?.split('@')
    return {
      label: prefix + suffix,
      value: prefix + suffix,
    }
  })
)

const emailSuggestionsSignUp = computed(() =>
  ['@qq.com', '@163.com', '@139.com'].map((suffix) => {
    const [prefix] = signUpForm.value.email?.split('@')
    return {
      label: prefix + suffix,
      value: prefix + suffix,
    }
  })
)

const autoLoginMethod = async () => {
  try {
    // 调用自动登录接口
    const params = {
      inviteCode: route.query.code,
    }
    const res = await autoLogin(params)
    userInfo.value = res
    // 更新cookie里的autoRegistered标志
    document.cookie = `autoRegistered=true; max-age=${12 * 60 * 60}; path=/`
  } catch (error) {
    if (error?.response?.data?.message) {
      Snackbar.error(error.response.data.message)
    } else {
      Snackbar.error('自动登录失败，请稍后再试')
    }
  }
}

const autoRegisterMethod = async () => {
  try {
    // 调用自动注册接口
    let params = {
      inviteCode: getInviteCodeFromStorage()
    }
    if (!params.inviteCode) {
      delete params.inviteCode // 如果邀请码为空，则不传递
    }
    const res = await autoRegister(params)
    userInfo.value = res
    // 往cookie里面存一个标志，表示已经自动注册过了，有效期是0.5天
    document.cookie = `autoRegistered=true; max-age=${12 * 60 * 60}; path=/`
  } catch (error) {
    // 
  }
}

// 游客登录
const guestLogin = async () => {
  if (document.cookie.includes('autoRegistered=true')) {
    Snackbar.info('请明天再使用游客登录！')
    return
  }
  try {
    // 调用自动注册接口
    let params = {
      inviteCode: getInviteCodeFromStorage()
    }
    if (!params.inviteCode) {
      delete params.inviteCode // 如果邀请码为空，则不传递
    }
    loginBtnLoading.value = true;
    const res = await autoRegister(params)
    userInfo.value = res
    // 往cookie里面存一个标志，表示已经自动注册过了，有效期是0.5天
    document.cookie = `autoRegistered=true; max-age=${12 * 60 * 60}; path=/`
    loginBtnLoading.value = false;
    isShowLoginDialog.value = false;
    
    // 如果有登录回调，执行它
    if (Object.prototype.toString.call(loginCallback.value) === '[object Function]') {
      loginCallback.value()
      loginCallback.value = null
    }
    Snackbar.success('登录成功！')
  } catch (error) {
    loginBtnLoading.value = false;
    if (error?.response?.data?.message) {
      Snackbar.error(error.response.data.message)
    } else {
      Snackbar.error('登录失败，请稍后再试')
    }
  }
}

// 切换到邮箱登录
const toEmailLogin = () => {
  loginStep.value = 2
}

// 邮箱登录
const emailLoginBtn = async () => {
  const isOk = await formRef.value.validate()
  if (isOk) {
    loginBtnLoading.value = true;
    try {
      // 调用自动登录接口
      const res = await autoLogin(form.value)
      userInfo.value = res
      // 更新cookie里的autoRegistered标志
      document.cookie = `autoRegistered=true; max-age=${12 * 60 * 60}; path=/`
      Snackbar.success('登录成功！')
      isShowLoginDialog.value = false;

      // 如果有登录回调，执行它
      if (Object.prototype.toString.call(loginCallback.value) === '[object Function]') {
        loginCallback.value()
        loginCallback.value = null
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        Snackbar.error(error.response.data.message)
      } else {
        Snackbar.error('绑定失败，请稍后再试')
      }
    } finally {
      loginBtnLoading.value = false
    }
  }
}

// 登录按钮
const loginBtn = async () => {
  const form = await signInFormRef.value.validate()
  if (form) {
    try {
      loginBtnLoading.value = true
      const res = await login(signInForm.value)
      userInfo.value = res
      // 关闭登录对话框
      isShowLoginDialog.value = false
      if (Object.prototype.toString.call(loginCallback.value) === '[object Function]') {
        loginCallback.value()
        loginCallback.value = null // 调用后清空回调，避免重复调用
      }
      Snackbar.success('登录成功！')
    } catch (error) {
      if (error?.response?.data?.message) {
        Snackbar.error(error.response.data.message)
      } else {
        Snackbar.error('登录失败，请稍后再试')
      }
    } finally {
      loginBtnLoading.value = false
    }
  }
}

const signUpBtn = async () => {
  const form = await signUpFormRef.value.validate()
  if (form) {
    try {
      signUpBtnLoading.value = true
      const params = {
        ...signUpForm.value,
        confirmPassword: signUpForm.value.password, // 假设注册接口需要确认密码
      }
      if (!params.inviteCode) {
        delete params.inviteCode // 如果邀请码为空，则不传递
      }
      const res = await register(params)
      userInfo.value = res
      // 注册成功后，清除本地存储的邀请码
      localStorage.removeItem('inviteCode')
      // 关闭注册对话框
      isShowLoginDialog.value = false
      if (Object.prototype.toString.call(loginCallback.value) === '[object Function]') {
        loginCallback.value()
        loginCallback.value = null // 调用后清空回调，避免重复调用
      }
      Snackbar.success('注册成功！')
    } catch (error) {
      if (error?.response?.data?.message) {
        Snackbar.error(error.response.data.message)
      } else {
        Snackbar.error('注册失败，请稍后再试')
      }
    } finally {
      signUpBtnLoading.value = false
    }
  }
}

const closeDialog = () => {
  if (signUpBtnLoading.value || loginBtnLoading.value) {
    Snackbar.warning('请等待当前操作完成后再关闭对话框')
    return
  }
  isShowLoginDialog.value = false
  loginCallback.value = null
}

// 发送验证码函数
const sendVerifyCode = async () => {
  // 邮箱格式验证
  if (!signUpForm.value.email) {
    Snackbar.error('请先输入邮箱')
    return
  }

  // 使用zod进行邮箱格式验证
  const emailSchema = z.string().email('请输入正确的邮箱格式')
  try {
    emailSchema.parse(signUpForm.value.email)
  } catch (error) {
    Snackbar.error(error.errors[0].message)
    return
  }
  
  try {
    isSending.value = true
    
    await sendCode({
      email: signUpForm.value.email,
    })

    // 开始倒计时
    const currentTime = Date.now()
    localStorage.setItem('verifyCodeSentTime', currentTime.toString())
    
    // 开始倒计时
    countdown.value = 119 // 120秒倒计时
    startCountdown()
    
    Snackbar.success('验证码已发送，请查收邮箱')
  } catch (error) {
    if (error?.response?.data?.message) {
      Snackbar.error(error.response.data.message)
    } else {
      Snackbar.error('发送验证码失败，请稍后再试')
    }
  } finally {
    isSending.value = false
  }
}

// 检查本地存储中的验证码发送时间并设置倒计时
const checkStoredCountdown = () => {
  const storedTime = localStorage.getItem('verifyCodeSentTime')
  
  if (storedTime) {
    const sentTime = parseInt(storedTime)
    const expiryTime = sentTime + 120000 // 120秒后过期
    const currentTime = Date.now()
    const remainingTime = Math.floor((expiryTime - currentTime) / 1000)
    
    if (remainingTime > 0) {
      // 倒计时还未结束，继续倒计时
      countdown.value = remainingTime
      startCountdown()
    } else {
      // 倒计时已结束，清除存储
      localStorage.removeItem('verifyCodeSentTime')
      countdown.value = 0
    }
  }
}

// 倒计时逻辑
const startCountdown = () => {
  // 清除可能存在的定时器
  clearInterval(countdownTimer)
  
  countdownTimer = setInterval(() => {
    countdown.value--
    
    if (countdown.value <= 0) {
      clearInterval(countdownTimer)
      countdown.value = 0
      // 倒计时已结束，清除存储
      localStorage.removeItem('verifyCodeSentTime')
    }
  }, 1000)
}

// 组件卸载时清理定时器
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})

watch(
  () => route.path,
  (newValue, oldVal) => {
    active.value = newValue
    // window.scrollTo(0, 0)
    // 仅在路由地址等于tabs中的path时才显示var-bottom-navigation
    // if (tabs.value.some((item) => item.path === newValue)) {
    //   useCssVar('--bottom-navigation-height', bottomNavigationHeight.value)
    // } else {
    //   useCssVar('--bottom-navigation-height', '0')
    // }
  },
  { immediate: true },
)

watch(
  isShowLoginDialog,
  (newValue) => {
    if (newValue) {
      // 对话框打开时，检查是否有保存的邀请码
      const storedInviteCode = getInviteCodeFromStorage()
      if (storedInviteCode) {
        // 自动切换到注册选项卡
        loginTab.value = 1
        // 设置邀请码并禁止修改
        signUpForm.value.inviteCode = storedInviteCode
        isInviteCodeReadonly.value = true
      } else {
        isInviteCodeReadonly.value = false
      }
    } else {
      // 对话框关闭时重置表单
      signUpFormRef?.value?.reset()
      signInFormRef?.value?.reset()
    }
  },
)
</script>

<style lang="less" scoped>
.app-wrapper {
  height: var(--app-height);
  // overflow: hidden;
  display: flex;
  flex-direction: column;
  .app-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding-top: var(--app-bar-height);
  }
  .footer-bar {
    height: var(--bottom-navigation-height);
    background-color: #f5f5f5;
  }
}
</style>

<style lang="less">
.login-dialog {
  // width: 340px;
  // --dialog-width: 95vmin !important;
  .var-dialog__title,
  .var-dialog__actions {
    display: none;
  }
  .var-dialog__message {
    position: relative;
    // padding-top: 0;
    .close-btn {
      position: absolute;
      top: 10px;
      right: 10px;
    }
    .tab-content {
      box-sizing: border-box;
      padding: 0 30px;
      .var-tabs {
        background: transparent;
      }
    }
  }
  .turnstile-wrap {
    width: 100%;
    display: block;
    flex-flow: row;
    & > div {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
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

