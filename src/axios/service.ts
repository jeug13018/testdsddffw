/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import axios from 'axios'
import { useUserStore } from '@/stores/user'

class RequestError extends Error {
  constructor(message, code, data) {
    super(message)
    this.code = code
    this.data = data
  }
}

/** 创建请求实例 */
function createService() {
  // 创建一个 Axios 实例
  const service = axios.create()
  // 请求拦截
  service.interceptors.request.use(
    (config) => {
      // 在拦截器内部获取 store，确保 Pinia 已初始化
      const userStore = useUserStore()
      // 如果用户信息存在，则添加 Authorization 头
      if (userStore.userInfo?.token) {
        config.headers['Authorization'] = `Bearer ${userStore.userInfo.token}`
      }
      return config
    },
    // 发送失败
    (error) => {
      return Promise.reject(error)
    },
  )
  // 响应拦截（可根据具体业务作出相应的调整）
  service.interceptors.response.use(
    (response) => {
      const { status, data, config } = response
      if (status !== 200) {
        const message = '[Fetch]: 网络开了小差'
        return Promise.reject(new RequestError(message))
      }
      if (data.ok || data.code === 10000) {
        return Promise.resolve(data.data)
      } else {
        return Promise.reject(data)
      }
    },
    // 服务器状态码不是200的情况
    (error) => {
      // 处理401未授权错误
      if (error.response?.status === 401) {
        // 在拦截器内部获取 store
        const userStore = useUserStore()
        // 检查本地是否有用户信息
        if (userStore.userInfo?.id && userStore.userInfo?.inviteCode) {
          // 把inviteCode拼到url里然后刷新页面
          const inviteCode = userStore.userInfo.inviteCode
          userStore.userInfo = {}
          const url = window.location.origin
          window.location.href = `${url}?code=${inviteCode}`
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