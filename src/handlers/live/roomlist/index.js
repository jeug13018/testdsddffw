import { validateRequestHeaders, createResponse, createErrorResponse } from '../../../utils/index.js';
import { XHAMSTERLIVE_BASE_URL } from '../../../config/index.js';
import { getDefaultHeaders } from '../../../utils/index.js';

const fetchData = async (url, params = {}, headers = {}) => {
  // 配置请求选项
  const options = {
    method: 'POST', // 明确指定 GET 方法
    headers: {
      ...getDefaultHeaders(),
      Referer: XHAMSTERLIVE_BASE_URL + '/',
      ...headers, // 合并自定义请求头
    },
    body: JSON.stringify(params)
  }

  // 发送请求
  const response = await fetch(XHAMSTERLIVE_BASE_URL + url, options)

  // 处理响应
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`)
  }

  return await response.json() // 或其他适当的方法，如 .text()
}


export default async function(request, env) {
  try {
    // 校验请求头
    await validateRequestHeaders(request.headers, env);
    const body = await request.json()
    const url = '/api/front/models/get-list'

    const data = await fetchData(url, body)
    // 返回 JSON 格式的响应
    return createResponse(data)
  } catch (error) {
    return createErrorResponse(error.message);
  }
}