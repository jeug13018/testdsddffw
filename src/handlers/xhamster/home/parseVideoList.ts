// @ts-nocheck
export default async function($) {
  const res = {
    // 总页数
    totalPage: $('.desktop-pagination .page-limit-button--right .page-button-link').text() || 0
  }
  try {
    
  } catch (error) {
    // 
  }
  return res
}
