import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Layout,
      children: [
        { path: '', name: 'forum', component: () => import('@/views/ForumList.vue') },
        { path: 'post/:id', name: 'post-detail', component: () => import('@/views/PostDetail.vue') },
        { path: 'vip', name: 'vip', component: () => import('@/views/VipPage.vue') },
      ]
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    // 如果有保存的位置且用户使用浏览器的前进/后退按钮
    if (savedPosition) {
      return savedPosition
    }
    return { 
      top: 0,
      // behavior: 'smooth' // 添加平滑滚动效果
    }
  }
})

export default router
