/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { fetch } from '@/axios/base'
// import { fetch as _fetch } from '@/axios/test'

export const register = (data) => {
  return fetch({
    url: '/api/user/register',
    method: 'post',
    data,
  })
}

export const autoRegister = (params) => {
  return fetch({
    url: '/api/auto/register',
    method: 'get',
    params,
  })
}

export const bindEmail = (data) => {
  return fetch({
    url: '/api/auto/bindEmail',
    method: 'post',
    data,
  })
}

export const sendCode = (data) => {
  return fetch({
    url: '/api/user/sendCode',
    method: 'post',
    data,
  })
}

export const login = (data) => {
  return fetch({
    url: '/api/user/login',
    method: 'post',
    data,
  })
}

export const autoLogin = (data) => {
  return fetch({
    url: '/api/auto/login',
    method: 'post',
    data,
  })
}

export const getUserInfo = (data) => {
  return fetch({
    url: '/api/user/getByEmail',
    method: 'post',
    data,
  })
}

// 判断用户是否是vip
export const isVip = (userId) => {
  return fetch({
    url: `/api/user/${userId}/isVip`,
    method: 'get',
  })
}

// 获取成功邀请用户的列表
export const successfulInviters = (params) => {
  return fetch({
    url: `/api/user/successfulInviters`,
    method: 'get',
    params
  })
}

// 获取登录用户的24小时内的播放次数
export const get24hCount = (params) => {
  return fetch({
    url: `/api/playHistory/24h-count`,
    method: 'get',
    params
  })
}

// 创建播放记录（也会消耗用户的观看次数）
export const createPlayHistory = (data) => {
  return fetch({
    url: '/api/playHistory',
    method: 'post',
    data,
  })
}
