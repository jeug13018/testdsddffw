import { validateRequestHeaders, createResponse, createErrorResponse } from '../../utils/index.js';
import { AVREBO_BASE_URL } from '../../config/index.js';
import { getDefaultHeaders } from '../../utils/index.js';

function parseXmlDataWithRegex(xmlString) {
  const result = [];
  
  // 使用正则表达式提取每个 list 标签的内容
  const listRegex = /<list>([\s\S]*?)<\/list>/g;
  let listMatch;
  
  while ((listMatch = listRegex.exec(xmlString)) !== null) {
    const listContent = listMatch[1];
    
    // 提取每个标签的内容
    const id = extractTag(listContent, 'id');
    const title = extractTag(listContent, 'title');
    const posterUrl = extractTag(listContent, 'thumb');
    const videoUrl = extractTag(listContent, 'video_url');
    
    result.push({
      id,
      title,
      posterUrl,
      videoUrl
    });
  }
  
  return result;
}

// 辅助函数：提取指定标签内容
function extractTag(content, tagName) {
  const regex = new RegExp(`<${tagName}>(.*?)<\/${tagName}>`, 's');
  const match = content.match(regex);
  return match ? match[1] : '';
}

const fetchData = async (url, params = {}, headers = {}) => {

  // 配置请求选项
  const options = {
    method: 'GET', // 明确指定 GET 方法
    headers: {
      ...getDefaultHeaders(),
      Locale: 'zh-CN',
      Origin: AVREBO_BASE_URL,
      Referer: AVREBO_BASE_URL + '/',
      ...headers, // 合并自定义请求头
    },
  }

  // 发送请求
  const response = await fetch('https://api.avrebo.net' + `${url}?limit=5`, options)

  // 处理响应
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`)
  }

  return await response.text() // 或其他适当的方法，如 .text()
}

export default async function(request, env) {
  try {
    // 校验请求头
    await validateRequestHeaders(request.headers, env);
    const url = '/api/v1/video/listRandom'

    const data = await fetchData(url)
    console.log(data)
    // 解析 XML 数据
    const parsedData = parseXmlDataWithRegex(data);
    // if (data.code !== 0) {
    //   return createErrorResponse(data.message || '请求失败')
    // }

    // 返回 JSON 格式的响应
    return createResponse(parsedData)
  } catch (error) {
    return createErrorResponse(error.message);
  }
}
