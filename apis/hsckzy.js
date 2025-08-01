/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { fetch } from '@/axios/hsckzy'
// import { fetch as _fetch } from '@/axios/test'

export const getHsckzy = (params) => {
  return fetch({
    url: '/api/hsckzy',
    method: 'get',
    params
  })
}
