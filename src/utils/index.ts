// @ts-nocheck
import { userAgents, FETCH_CODE } from '../config/index.js';
const IS_VALIDATE = false
export async function validateRequestHeaders(headers, env) {
  if (IS_VALIDATE) {
    const timestamp = headers.get('x-timestamp');
    const hash = headers.get('x-hash');
  
    if (!timestamp || !hash) {
      console.log('headers:', headers);
      throw new Error('缺少必要的请求头信息');
    }
  
    // 校验时间戳和固定字符串的 SHA-256 值
    const currentTimestamp = Date.now();
    if (Math.abs(currentTimestamp - timestamp) > 300000) { // 5分钟内有效
      throw new Error('请求已过期');
    }
  
    const validHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(timestamp + 'o3GTG9eNV1RVpMr213MvntU11OGNY1hV')
    ).then(buffer => {
      return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
    });
  
    if (hash !== validHash) {
      throw new Error('无效的校验信息');
    }
  } else {
    console.log('跳过请求头校验');
  }
}

export function createResponse(data, message = '成功', code = FETCH_CODE.SUCCESS) {
  return { code, data, message }
}

export function createErrorResponse(message, code = FETCH_CODE.INVALID_REQUEST) {
  return { code, message }
}

// 获取随机UA的函数
export function getRandomUA() {
  const randomIndex = Math.floor(Math.random() * userAgents.length);
  return userAgents[randomIndex];
};

export const getDefaultHeaders = () => {
  return {
    'User-Agent': getRandomUA(),  // 使用随机UA
    'Accept-Language': 'zh-HK,zh;q=0.9,en;q=0.8,zh-CN;q=0.7',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'CF-IPCountry': 'HK',
    'Connection': 'keep-alive',
  }
}

// 将数据存储到 KV 中，支持自定义过期时间
export async function storeDataInKV(env, key, data, expirationTtl = 86400) {
  try {
    console.log(`正在存储数据到 KV，键: ${key}，过期时间: ${expirationTtl}秒`);
    await env.kv_html.put(key, JSON.stringify(data), { expirationTtl });
    console.log(`数据成功存储到 KV，键: ${key}`);
    return true;
  } catch (error) {
    console.error(`存储数据到 KV 失败，键: ${key}，错误:`, error);
    return false;
  }
}

// 从 KV 中获取数据
export async function getDataFromKV(env, key) {
  try {
    console.log(`尝试从 KV 获取数据，键: ${key}`);
    const data = await env.kv_html.get(key);
    if (data) {
      console.log(`从 KV 成功获取数据，键: ${key}`);
      return JSON.parse(data);
    } else {
      console.log(`KV 中不存在数据，键: ${key}`);
      return null;
    }
  } catch (error) {
    console.error(`从 KV 获取数据失败，键: ${key}，错误:`, error);
    return null;
  }
}
