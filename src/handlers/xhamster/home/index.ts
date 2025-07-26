// @ts-nocheck
import { validateRequestHeaders, createResponse, createErrorResponse, getDefaultHeaders, storeDataInKV, getDataFromKV } from '../../../utils/index.js';
import { XHAMSTER_BASE_URL } from '../../../config/index.js';
import parseResponse from './parseResponse.js';

export default async function(c) {
  try {
    // 获取单个查询参数
    const path = c.req.query('path') || '/'

    // // 从参数中获取缓存时间（秒），默认为 1 小时
    // const cacheTime = parseInt(params.cacheTime || '3600');
    // console.log(`请求路径: ${path}, 缓存时间: ${cacheTime}秒`);
    
    // // 使用 path 作为缓存的键值
    // const cacheKey = `xhamster:${path}`;
    
    // // 尝试从 KV 中获取缓存数据
    // const cachedData = await getDataFromKV(env, cacheKey);
    // if (cachedData) {
    //   console.log(`命中缓存: ${cacheKey}, 直接返回缓存数据`);
    //   return createResponse(cachedData);
    // }
    console.log(XHAMSTER_BASE_URL)
    // // 如果缓存不存在，则发起请求
    // console.log(`缓存未命中: ${cacheKey}, 正在请求原始数据`);
    const response = await fetch(XHAMSTER_BASE_URL + path, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'zh-HK,zh;q=0.9,en;q=0.8,zh-CN;q=0.7',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'CF-IPCountry': 'HK',
        'Connection': 'keep-alive',
        'Referer': XHAMSTER_BASE_URL + '/',
        'Cookie': `cookie_accept_v2=%7B%22e%22%3A1%2C%22f%22%3A1%2C%22t%22%3A1%2C%22a%22%3A1%7D; x_viewes=%5B23333665%5D; x_content_preference_index=straight; _cfg=c07f8967230283ebb242cae35a03f149; h_v4_straight=%7B%22v%22%3A%5B%5D%2C%22l%22%3A%5B%5D%2C%22f%22%3A%5B%5D%2C%22pv%22%3A%5B23333665%5D%7D; settings=eyJpc1dlYnBTdXBwb3J0ZWQiOnRydWUsImlzV2VibVN1cHBvcnRlZCI6dHJ1ZSwiZXh0RGV0ZWN0ZWRWMiI6bnVsbCwibW9tZW50c0lzSGlkZGVuIjpudWxsLCJleHBpcmVzIjpbXSwidHNTcG90Q291bnRlcnMiOlt7InNwb3QiOiJtYXN0ZXJfZm9vdGVyIiwidGltZSI6MTc1MTQ2MDg4OSwiY291bnQiOjF9LHsic3BvdCI6Im1hc3Rlcl9wbGF5ZXJfcGF1c2UiLCJ0aW1lIjoxNzUxNDYwODg5LCJjb3VudCI6MX1dfQ%3D%3D; parental-control=yes`
      },
    });
    
    console.log(`原始数据请求完成，开始解析数据`);
    const data = await response.text()
    const parsedData = await parseResponse(c, { data });
    // console.log(`数据解析完成，准备存储到 KV 缓存`);
    
    // // 将解析后的数据存储到 KV 中，使用参数指定的缓存时间
    // await storeDataInKV(env, cacheKey, parsedData, cacheTime);

    // 创建响应对象
    const clientResponse = createResponse(parsedData);

    return c.json(clientResponse)
  } catch (error) {
    console.log(error)
    return c.json(createErrorResponse(error.message))
  }
}

