// @ts-nocheck
import { load } from 'cheerio';
import parseVideoList from './parseVideoList.js';

const getInitials = ($) => {
  try {
    return $('#initials-script')[0].children[0].data.trim();
  } catch (error) {
    return null
  }
}

// 获取所属地区
const getRegion = ($) => {
  try {
    return $('.header-preference-hint')[0].children[0].data.trim();
  } catch (error) {
    return null
  }
}

export default async function(c, { data }) {
  const res = {
    initials: null,
    region: null,
  }
  // 获取所有的查询参数
  const params = c.req.queries()
  try {
    const $ = load(data);
    res['region'] = getRegion($);
    res['initials'] = getInitials($);
    if (params.type === 'videoList') {
      // 处理视频列表页
      const videoListRes = await parseVideoList($);
      Object.assign(res, videoListRes);
    }
  } catch (error) {
    // 
  }
  return res;
}
