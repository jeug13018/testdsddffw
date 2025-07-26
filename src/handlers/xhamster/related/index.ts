// @ts-nocheck
import { validateRequestHeaders, createResponse, createErrorResponse, getDefaultHeaders, storeDataInKV, getDataFromKV } from '../../../utils/index.js';
import { XHAMSTER_BASE_URL } from '../../../config/index.js';

export default async function(c) {
  try {
    // 获取所有的查询参数
    const params = c.req.queries()
    
    // 从参数中获取缓存时间（秒），默认为 1 小时
    const cacheTime = parseInt(params.cacheTime || '3600');
    
    // 使用 params 参数作为缓存键
    // const relatedParams = params.params || '';
    // if (!relatedParams) {
    //   return createErrorResponse('params 参数不能为空');
    // }
    
    // 为了避免键值过长，可以使用 params 的哈希值作为键的一部分
    // 但为了便于调试，这里直接使用完整的 params
    // const cacheKey = `xhamster:related:${relatedParams}`;
    
    // // 尝试从 KV 中获取缓存数据
    // const cachedData = await getDataFromKV(env, cacheKey);
    // if (cachedData) {
    //   console.log(`命中缓存: ${cacheKey}, 直接返回缓存数据`);
    //   return createResponse(cachedData);
    // }
    
    // // 如果缓存不存在，则发起请求
    // console.log(`缓存未命中: ${cacheKey}, 正在请求原始数据`);
    
    const path = `/api/front/video/related?params=${params.params}`
    const response = await fetch(XHAMSTER_BASE_URL + path, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'zh-HK,zh;q=0.9,en;q=0.8,zh-CN;q=0.7',
        'Accept': '*/*',
        'CF-IPCountry': 'HK',
        'Connection': 'keep-alive',
        'Content-Type': 'application/json',
        'Referer': XHAMSTER_BASE_URL + '/',
        'sec-ch-ua': '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
        'sec-ch-ua-arch': '"x86"',
        'sec-ch-ua-bitness': '"64"',
        'sec-ch-ua-full-version': '"137.0.7151.120"',
        'sec-ch-ua-full-version-list': '"Google Chrome";v="137.0.7151.120", "Chromium";v="137.0.7151.120", "Not/A)Brand";v="24.0.0.0"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-model': '',
        'sec-ch-ua-platform': '"Windows"',
        'sec-ch-ua-platform-version': '"10.0.0"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'Cookie': `cookie_accept_v2=%7B%22e%22%3A1%2C%22f%22%3A1%2C%22t%22%3A1%2C%22a%22%3A1%7D; x_viewes=%5B23333665%5D; x_content_preference_index=straight; _cfg=c07f8967230283ebb242cae35a03f149; h_v4_straight=%7B%22v%22%3A%5B%5D%2C%22l%22%3A%5B%5D%2C%22f%22%3A%5B%5D%2C%22pv%22%3A%5B23333665%5D%7D; settings=eyJpc1dlYnBTdXBwb3J0ZWQiOnRydWUsImlzV2VibVN1cHBvcnRlZCI6dHJ1ZSwiZXh0RGV0ZWN0ZWRWMiI6bnVsbCwibW9tZW50c0lzSGlkZGVuIjpudWxsLCJleHBpcmVzIjpbXSwidHNTcG90Q291bnRlcnMiOlt7InNwb3QiOiJtYXN0ZXJfZm9vdGVyIiwidGltZSI6MTc1MTQ2MDg4OSwiY291bnQiOjF9LHsic3BvdCI6Im1hc3Rlcl9wbGF5ZXJfcGF1c2UiLCJ0aW1lIjoxNzUxNDYwODg5LCJjb3VudCI6MX1dfQ%3D%3D; parental-control=yes`
      },
    });
    
    const data = await response.json()
    
    // 存储数据到 KV 缓存
    // await storeDataInKV(env, cacheKey, data, cacheTime);
    // console.log(`数据已缓存: ${cacheKey}, 过期时间: ${cacheTime}秒`);
    
    return c.json(createResponse(data))
  } catch (error) {
    console.error(`处理请求出错: ${error.message}`, error);
    return c.json(createErrorResponse(error.message))
  }
}
