/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { fetch } from '@/axios/xlive'

export const getRecommend = (params) => {
  return fetch({
    url: '/api/live/recommend',
    method: 'get',
    params,
  })
}

// 获取标签列表
export const getTagList = (params) => {
  return fetch({
    url: '/api/live/liveTags',
    method: 'get',
    params,
  })
}

export const getRoomList = (data) => {
  return fetch({
    url: '/api/live/roomlist',
    method: 'post',
    data,
  })
}

export const getLiveDetail = (params) => {
  return fetch({
    url: '/api/live/roomDetail',
    method: 'get',
    params,
  })
}

// 获取关联的直播房间
export const getRelated = (params) => {
  return fetch({
    url: '/api/live/related',
    method: 'get',
    params,
  })
}
