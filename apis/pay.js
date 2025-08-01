/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { fetch } from '@/axios/base'

export const getPrices = (params) => {
  return fetch({
    url: '/api/vip/prices',
    method: 'get',
    params,
  })
}

export const getOrder = (data) => {
  return fetch({
    url: '/api/vip/order',
    method: 'post',
    data,
  })
}