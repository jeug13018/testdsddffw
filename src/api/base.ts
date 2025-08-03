/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { fetch } from '@/axios/base'

// 一键注册
export const autoRegister = (params) => {
  return fetch({
    url: '/api/auto/register',
    method: 'get',
    params,
  })
}

// 凭证登录
export const qrCodeLogin = (data) => {
  return fetch({
    url: '/api/auto/qrCodeLogin',
    method: 'post',
    data,
  })
}

// 获取用户信息
export const getUserInfo = (data) => {
  return fetch({
    url: '/api/auto/login',
    method: 'post',
    data,
  })
}

// 获取地址列表
export const getAddressList = (params) => {
  return fetch({
    url: '/api/msg/area-options',
    method: 'get',
    params,
  })
}

// 获取帖子类型
export const getPostTypes = (params) => {
  return fetch({
    url: '/api/msg/type-options',
    method: 'get',
    params,
  })
}

// 获取帖子列表
export const getPosts = (params) => {
  return fetch({
    url: '/api/msg/list',
    method: 'get',
    params,
  })
}

// 获取帖子详情
export const getPostDetail = (params) => {
  return fetch({
    url: '/api/msg/detail',
    method: 'get',
    params,
  })
}

// 获取vip套餐
export const getVipPackages = (params) => {
  return fetch({
    url: '/api/vip/prices',
    method: 'get',
    params,
  })
}

// 创建支付订单
export const createPaymentOrder = (data) => {
  return fetch({
    url: '/api/vip/order',
    method: 'post',
    data,
  })
}
