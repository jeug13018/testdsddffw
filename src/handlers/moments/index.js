import { validateRequestHeaders, createResponse, createErrorResponse } from '../../utils/index.js';
import { XHAMSTER_BASE_URL } from '../../config/index.js';
import { getDefaultHeaders } from '../../utils/index.js';

const fetchData = async (url, params = {}, headers = {}) => {
  // 构建 URL 查询参数
  const queryString = new URLSearchParams(params).toString()
  const fullUrl = queryString ? `${url}?${queryString}` : url

  // 配置请求选项
  const options = {
    method: 'GET', // 明确指定 GET 方法
    headers: {
      ...getDefaultHeaders(),
      Referer: XHAMSTER_BASE_URL + '/',
      ...headers, // 合并自定义请求头
    },
  }

  // 发送请求
  const response = await fetch(XHAMSTER_BASE_URL + fullUrl, options)

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
    const url = new URL(request.url)
    // const path = url.searchParams.get('url')
    // 获取所有的查询参数
    const params = Object.fromEntries(url.searchParams.entries())

    const data = await fetchData('/api/v1/moments/', params)

    return createResponse(data)
  } catch (error) {
    return createErrorResponse(error.message);
  }
}