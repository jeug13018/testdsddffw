/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { LoadingBar } from '@varlet/ui'
import { useCssVar } from '@vueuse/core'
import axios from 'axios'
import CryptoJS from 'crypto-js'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

// 设置一个接口白名单，不显示加载进度条
const whiteList = ['/api/moments']

LoadingBar.setDefaultOptions({
  top: useCssVar('--app-bar-height'),
})

class RequestError extends Error {
  constructor(message, code, data) {
    super(message)
    this.code = code
    this.data = data
  }
}

// 固定字符串
const FIXED_STRING = 'o3GTG9eNV1RVpMr213MvntU11OGNY1hV'

// 生成 x-timestamp 和 x-hash
function generateHeaders() {
  const timestamp = Date.now().toString()
  const hash = CryptoJS.SHA256(timestamp + FIXED_STRING).toString(CryptoJS.enc.Hex)
  return {
    'x-timestamp': timestamp,
    'x-hash': hash,
  }
}

// 请求计数器
let requestCount = 0

// 显示加载进度条
const showLoading = (url) => {
  // 如果请求在白名单中，则不显示加载进度条
  if (whiteList.some((item) => item === url)) {
    return
  }
  if (requestCount === 0) {
    LoadingBar.start()
  }
  requestCount++
}

// 隐藏加载进度条
const hideLoading = (url) => {
  // 如果请求在白名单中，则不显示加载进度条
  if (whiteList.some((item) => item === url)) {
    return
  }
  requestCount--
  if (requestCount === 0) {
    LoadingBar.finish()
  }
}

/** 创建请求实例 */
function createService() {
  // 创建一个 Axios 实例
  const service = axios.create()
  // 请求拦截
  service.interceptors.request.use(
    (config) => {
      showLoading(config.url)
      const headers = generateHeaders()
      for (const key in headers) {
        config.headers[key] = headers[key]
      }
      // 如果用户信息存在，则添加 Authorization 头
      if (userInfo?.value?.token) {
        config.headers['Authorization'] = `Bearer ${userInfo.value.token}`
      }
      return config
    },
    // 发送失败
    (error) => {
      hideLoading(error.config.url)
      return Promise.reject(error)
    },
  )
  // 响应拦截（可根据具体业务作出相应的调整）
  service.interceptors.response.use(
    (response) => {
      const { status, data, config } = response
      console.log(config)
      hideLoading(config.url)
      if (status !== 200) {
        const message = '[Fetch]: 网络开了小差'
        return Promise.reject(new RequestError(message))
      }
      // config.successCodes
      if (data.code === 0 || data.code === 10000 || config.successCodes.includes(data.code)) {
        return Promise.resolve(data.data || data)
      } else {
        return Promise.reject(data)
      }
    },
    // 服务器状态码不是200的情况
    (error) => {
      hideLoading(error.config.url)
      // 处理401未授权错误
      if (error.response?.status === 401) {
        // 检查本地是否有用户信息
        if (userInfo?.value?.id && userInfo?.value?.inviteCode) {
          // 把inviteCode拼到url里然后刷新页面
          const inviteCode = userInfo.value.inviteCode
          userInfo.value = {}
          const url = window.location.origin
          window.location.href = `${url}/#/personal?code=${inviteCode}`
          // 强势刷新页面
          window.location.reload()
        }
      }
      return Promise.reject(error)
    },
  )
  return service
}

/** 用于网络请求的实例 */
export const service = createService()
