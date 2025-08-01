// @ts-nocheck
import { success } from 'zod/v4'
import { service } from './service' // 实例

/** 创建请求方法 */
function createRequestFunction(service) {
  return function (config) {
    const configDefault = {
      baseURL: 'http://localhost:3000',
      headers: {},
      timeout: 1000 * 15,
      // 成功的状态码
      successCodes: [1],
    }
    return service(Object.assign(configDefault, config))
  }
}

/** 用于网络请求的方法 */
export const fetch = createRequestFunction(service)
