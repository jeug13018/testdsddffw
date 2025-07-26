import { validateRequestHeaders, createResponse, createErrorResponse, storeDataInKV, getDataFromKV } from '../../utils/index.js';
import { VERCEL_BASE_URL } from '../../config/index.js';

export default async function(request, env) {
  try {
    // 校验请求头
    await validateRequestHeaders(request.headers, env);
    const url = new URL(request.url)
    // 获取所有的查询参数
    const params = Object.fromEntries(url.searchParams.entries())
    
    // 从参数中获取缓存时间（秒），默认为 1 小时
    const cacheTime = parseInt(params.cacheTime || '3600');
    
    // 使用 path 和 page 参数作为缓存键
    const path = params.path || '/';
    const page = params.page || '0';
    
    const cacheKey = `videoList:${path}:${page}`;
    
    // 尝试从 KV 中获取缓存数据
    const cachedData = await getDataFromKV(env, cacheKey);
    if (cachedData) {
      console.log(`命中缓存: ${cacheKey}, 直接返回缓存数据`);
      return createResponse(cachedData);
    }
    
    // 如果缓存不存在，则发起请求
    console.log(`缓存未命中: ${cacheKey}, 正在请求原始数据`);
    
    // 构建 URL 查询参数
    const queryString = new URLSearchParams(params).toString()
    const apiPath = '/api/videoList'
    const fullUrl = queryString ? `${apiPath}?${queryString}` : apiPath
    const response = await fetch(VERCEL_BASE_URL + fullUrl, {
      method: 'GET'
    });
    const data = await response.json()
    if (data.code != 0) {
      return createErrorResponse(data.message || '请求失败')
    }

    // 存储数据到 KV 缓存
    await storeDataInKV(env, cacheKey, data.data, cacheTime);
    console.log(`数据已缓存: ${cacheKey}, 过期时间: ${cacheTime}秒`);

    // 返回 JSON 格式的响应
    return createResponse(data.data)
  } catch (error) {
    console.error(`处理请求出错: ${error.message}`, error);
    return createErrorResponse(error.message);
  }
}