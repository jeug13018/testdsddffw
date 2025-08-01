// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { service } from './service' // 实例

/** 创建请求方法 */
function createRequestFunction(service) {
  return function (config) {
    const configDefault = {
      baseURL: 'https://resource.4vip.xyz',
      // baseURL: 'http://192.168.1.2:1234',
      headers: {},
      timeout: 1000 * 15,
    }
    return service(Object.assign(configDefault, config))
  }
}

/** 用于网络请求的方法 */
export const fetch = createRequestFunction(service)
