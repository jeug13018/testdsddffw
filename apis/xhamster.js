/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { fetch } from '@/axios/xhamster'
// import { fetch as _fetch } from '@/axios/test'

export const getXhamster2Path = (params) => {
  return fetch({
    url: '/api/xhamster',
    method: 'get',
    params,
    // withCredentials: true
  })
}

// 获取推荐视频列表
export const getXhamsterRecommend = (params) => {
  return fetch({
    url: '/api/xhamster/related',
    method: 'get',
    params,
    // withCredentials: true
  })
}
