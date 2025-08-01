/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { fetch } from '@/axios/xvideo'
// import { fetch as _fetch } from '@/axios/test'

export const getVideoList = (params) => {
  return fetch({
    url: '/api/videoList',
    method: 'get',
    params,
  })
}

export const getComposerData = (params) => {
  return fetch({
    url: '/api/composer/xvideos',
    method: 'get',
    params,
  })
}

// 获取视频详情
export const getVideoDetail = (params) => {
  return fetch({
    url: '/api/detail',
    method: 'get',
    params,
  })
}

// 获取短视频列表
// export const getShortVideoList = (params) => {
//   return fetch({
//     url: '/api/moments',
//     // url: '',
//     method: 'get',
//     params,
//   })
// }
export const getShortVideoList = (params) => {
  return fetch({
    url: '/api/avrebo',
    // url: '',
    method: 'get',
    params,
  })
}
