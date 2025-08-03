// @ts-nocheck
// 相对时间函数：将时间戳转换为"多久前"的格式
export function formatRelativeTime(timestamp: number | string): string {
  // 如果是字符串时间戳，转为数字
  const time = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
  const now = Date.now();
  const diff = now - time;

  // 转换为秒、分钟、小时、天、周、月、年
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  // 根据时间差返回不同的文本
  if (seconds < 10) {
    return '刚刚';
  } else if (seconds < 60) {
    return `${seconds}秒前`;
  } else if (minutes < 60) {
    return `${minutes}分钟前`;
  } else if (hours < 24) {
    return `${hours}小时前`;
  } else if (days < 7) {
    return `${days}天前`;
  } else if (days < 30) {
    return `${Math.floor(days / 7)}周前`;
  } else if (months < 12) {
    return `${months}个月前`;
  } else {
    return `${years}年前`;
  }
}

// 格式化时间函数：将时间戳格式化为指定格式
export function formatDate(timestamp: number | string, format: string = 'YYYY-MM-DD'): string {
  // 如果是字符串时间戳，转为数字
  const time = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
  const date = new Date(time);
  
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  
  // 补零函数
  const padZero = (num: number): string => {
    return num < 10 ? `0${num}` : `${num}`;
  };
  
  // 替换格式中的年、月、日、时、分、秒
  return format
    .replace(/YYYY/g, `${year}`)
    .replace(/YY/g, `${year}`.slice(-2))
    .replace(/MM/g, padZero(month))
    .replace(/M/g, `${month}`)
    .replace(/DD/g, padZero(day))
    .replace(/D/g, `${day}`)
    .replace(/HH/g, padZero(hour))
    .replace(/H/g, `${hour}`)
    .replace(/hh/g, padZero(hour > 12 ? hour - 12 : hour))
    .replace(/h/g, `${hour > 12 ? hour - 12 : hour}`)
    .replace(/mm/g, padZero(minute))
    .replace(/m/g, `${minute}`)
    .replace(/ss/g, padZero(second))
    .replace(/s/g, `${second}`)
    .replace(/A/g, hour >= 12 ? 'PM' : 'AM')
    .replace(/a/g, hour >= 12 ? 'pm' : 'am');
}

// 智能时间格式化：结合相对时间和固定格式
export function formatSmartTime(timestamp: number | string): string {
  // 如果是字符串时间戳，转为数字
  const time = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
  const now = Date.now();
  const diff = now - time;
  
  // 超过30天显示具体日期，否则显示相对时间
  if (diff > 30 * 24 * 60 * 60 * 1000) {
    return formatDate(time, 'YYYY-MM-DD');
  } else {
    return formatRelativeTime(time);
  }
}