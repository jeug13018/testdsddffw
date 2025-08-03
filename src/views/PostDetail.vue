<template>
  <div class="p-4 max-w-3xl mx-auto text-xs">
    <!-- 骨架屏加载状态 -->
    <template v-if="isLoading">
      <!-- 标题骨架 -->
      <Skeleton class="h-6 w-3/4 mb-2" />
      <!-- 城市和时间骨架 -->
      <Skeleton class="h-4 w-1/2 mb-2" />
      <!-- 内容骨架 -->
      <Skeleton class="h-20 w-full mb-4" />
      
      <!-- 表格骨架 -->
      <div class="mb-4 overflow-x-auto">
        <table class="w-full border-collapse">
          <tbody>
            <tr v-for="i in 8" :key="i" class="border-b border-gray-200">
              <td class="py-2 pr-4 w-1/4 bg-gray-50">
                <Skeleton class="h-4 w-16" />
              </td>
              <td class="py-2 pl-4">
                <Skeleton class="h-4 w-32" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 安全提示骨架 -->
      <Skeleton class="h-12 w-full mb-4" />
      
      <!-- 图片网格骨架 -->
      <div class="mt-4">
        <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
          <Skeleton v-for="i in 6" :key="i" class="aspect-square" />
        </div>
      </div>
    </template>
    <template v-else>
      <div class="mb-2 flex items-center">
        <div 
          class="text-xs font-medium shadow-sm mr-2 w-8 text-center"
          style="border-radius: 4px;" 
          :class="{
            'bg-red-500 text-white': post.type !== '站街',
            'bg-blue-500 text-white': post.type === '站街'
          }"
        >
          {{ post.type }}
        </div>
        <div class="font-bold text-lg flex-1">
          {{ post.title }}
        </div>
      </div>
      <!-- <div class="mb-2 text-lg font-bold">{{ post.title }}</div> -->
      <div class="mb-2 text-neutral-500">{{ formatSmartTime(post.create_time) }}</div>
      <div v-if="post.content" class="mb-4 p-4 bg-white border-l-4 border-l-pink-400 border-t border-r border-b border-gray-200 rounded-md text-sm leading-6 shadow-md">{{ post.content }}</div>
      <!-- 站街VIP提示 -->
      <div v-if="post.type === '站街' && !post.isVip" class="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
        <div class="flex items-center justify-between">
          <!-- <div class="text-yellow-800">💎 站街信息仅对VIP会员开放</div> -->
          <div class="text-yellow-800 font-medium">💎 站街信息仅对会员开放</div>
          <Button @click="goVip" class="bg-gradient-to-r from-yellow-400 to-amber-500 flex items-center justify-center p-1 text-xs h-7">
            立即开通会员
          </Button>
        </div>
      </div>
      
      <!-- 信息表格 -->
      <div class="mb-4 overflow-x-auto">
        <table class="w-full border-collapse">
          <tbody>
            <tr class="border-b border-gray-200">
              <td class="py-2 pr-4 font-semibold bg-gray-50 w-[50px]">地区</td>
              <td class="py-2 pl-4" v-if="post.city || post.area">
                {{ post.city }} <span v-if="post.area"> · {{ post.area }}</span>
              </td>
              <td class="py-2 pl-4" v-else>暂无信息</td>
            </tr>
            <tr class="border-b border-gray-200" v-if="post.type !== '站街'">
              <td class="py-2 pr-4 font-semibold bg-gray-50 w-[50px]">年龄</td>
              <td class="py-2 pl-4">{{ post.age || '暂无信息' }}</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="py-2 pr-4 font-semibold bg-gray-50 w-[50px]">颜值</td>
              <td class="py-2 pl-4">{{ post.appearance || '暂无信息' }}</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="py-2 pr-4 font-semibold bg-gray-50 w-[50px]">价格</td>
              <td class="py-2 pl-4">{{ post.price || '暂无信息' }}</td>
            </tr>
            <tr class="border-b border-gray-200">
              <td class="py-2 pr-4 font-semibold bg-gray-50 w-[50px]">服务</td>
              <td class="py-2 pl-4">{{ post.service || '暂无信息' }}</td>
            </tr>
            <tr class="border-b border-gray-200" v-if="post.type !== '站街'">
              <td class="py-2 pr-4 font-semibold bg-gray-50 w-[50px]">微信</td>
              <td class="py-2 pl-4">
                <div class="flex items-center gap-2">
                  <span v-if="post.isVip">{{ post.wechat || '暂无信息' }}</span>
                  <span v-else class="text-yellow-400 underline cursor-pointer" @click="goVip">仅会员可见</span>
                  <Button v-if="post.wechat" size="sm" variant="outline" class="h-6 px-2 py-0 text-xs" @click="copyBtn(post.wechat)">
                    复制
                  </Button>
                </div>
              </td>
            </tr>
            <tr class="border-b border-gray-200" v-if="post.type !== '站街'">
              <td class="py-2 pr-4 font-semibold bg-gray-50 w-[50px]">QQ</td>
              <td class="py-2 pl-4">
                <div class="flex items-center gap-2">
                  <span v-if="post.isVip">{{ post.qq || '暂无信息' }}</span>
                  <span v-else class="text-yellow-400 underline cursor-pointer" @click="goVip">仅会员可见</span>
                  <Button v-if="post.qq" size="sm" variant="outline" class="h-6 px-2 py-0 text-xs" @click="copyBtn(post.qq)">
                    复制
                  </Button>
                </div>
              </td>
            </tr>
            <tr class="border-b border-gray-200" v-if="post.type !== '站街'">
              <td class="py-2 pr-4 font-semibold bg-gray-50 w-[50px]">电话</td>
              <td class="py-2 pl-4">
                <div class="flex items-center gap-2">
                  <span v-if="post.isVip">{{ post.phone || '暂无信息' }}</span>
                  <span v-else class="text-yellow-400 underline cursor-pointer" @click="goVip">仅会员可见</span>
                  <Button v-if="post.phone" size="sm" variant="outline" class="h-6 px-2 py-0 text-xs" @click="copyBtn(post.phone)">
                    复制
                  </Button>
                </div>
              </td>
            </tr>
            <tr class="border-b border-gray-200" v-if="post.type !== '站街'">
              <td class="py-2 pr-4 font-semibold bg-gray-50 w-[50px]">暗号</td>
              <td class="py-2 pl-4">
                <div class="flex items-center gap-2">
                  <span v-if="post.isVip">{{ post.secretCode || '暂无信息' }}</span>
                  <span v-else class="text-yellow-400 underline cursor-pointer" @click="goVip">仅会员可见</span>
                  <Button v-if="post.secretCode" size="sm" variant="outline" class="h-6 px-2 py-0 text-xs" @click="copyBtn(post.secretCode)">
                    复制
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- 安全提示 -->
      <div class="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700">
        <div class="flex flex-col">
          <!-- 标题和警告图标 -->
          <div class="flex items-center mb-2">
            <span class="mr-2 text-lg">⚠️</span>
            <span class="font-semibold">操作提示</span>
          </div>
          
          <!-- 主要提示内容 -->
          <p class="mb-3 text-xs">
            本站不会向任何人收取押金或预付款！！！
          </p>
          
          <!-- 安全指南按钮组 -->
          <div class="grid grid-cols-2 gap-2">
            <Button 
              @click="antiFraudGuideStore.isAntiFraudGuideModalOpen = true" 
              class="bg-red-500 hover:bg-red-600 flex items-center justify-center p-1 text-xs"
            >
              👉 防骗指南，必看
            </Button>
            <Button 
              @click="qaStore.isQaModalOpen = true" 
              class="bg-blue-500 hover:bg-blue-600 flex items-center justify-center p-1 text-xs"
            >
              ❓ 常见问题
            </Button>
            <Button 
              @click="isNewbieGuideOpen = true" 
              class="bg-green-500 hover:bg-green-600 flex items-center justify-center p-1 text-xs"
            >
              💡 新手指南
            </Button>
            <Button 
              @click="isTermExplanationOpen = true" 
              class="bg-orange-500 hover:bg-orange-600 flex items-center justify-center p-1 text-xs"
            >
              🔒 暗语(黑话)解释
            </Button>
          </div>
        </div>
      </div>
      
      <!-- 网格布局图片展示 -->
      <div v-if="post.media && post.media.length" class="mt-4">
        <!-- <div v-if="post.type === '站街'" class="mb-4 py-2 px-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700">
          <span class="mr-2 text-lg">⚠️</span>
          <span class="font-semibold">站街图片需要"魔法网络"才能观看</span>
        </div> -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
          <div v-for="(img, idx) in post.media" :key="idx" class="aspect-square cursor-pointer" @click="showImg(idx)">
            <BlurredImage
              :imageUrl="img.url"
              height="100%"
              width="100%"
            />
          </div>
        </div>
      </div>
    </template>
    <ImageViewer v-model:visible="imgDialog" :images="post.media" :blurAmount="post.type === '站街' ? 3 : 5" :initialIndex="initialIndex" />
    <!-- 新手指南 -->
    <Drawer v-model:open="isNewbieGuideOpen">
      <DrawerContent>
        <div class="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>新手指南</DrawerTitle>
          </DrawerHeader>
          <div class="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            <div class="space-y-3">
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                <div>
                  <div class="font-medium text-sm mb-1 text-red-600">怎么加联系方式?</div>
                  <div class="text-xs text-neutral-600">
                    1、添加联系方式的时候发送暗语<br />
                  </div>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                <div>
                  <div class="font-medium text-sm mb-1 text-red-600">加上了联系方式第一句话怎么说？</div>
                  <div class="text-xs text-neutral-600">
                    1、可以直接问 <b>“在上班吗，课表和价格发一下”</b> <br />
                    2、切记不要出现<span class="text-red-600">定金/保证金/红包/路费</span>等任何提前付费的行为，一定要见到人看到脸再做决定
                  </div>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                <div>
                  <div class="font-medium text-sm mb-1 text-red-600">人照不符怎么办？</div>
                  <div class="text-xs text-neutral-600">
                    1、见面之后发现人照不符，直接走人，不要不好意思，难以下咽就不要硬吃<br />
                    3、根据经验：便宜的没好货，好货的不便宜
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DrawerFooter>
            <Button @click="isNewbieGuideOpen = false">
              我知道了
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
    <!-- 名词解释 -->
     <Drawer v-model:open="isTermExplanationOpen">
      <DrawerContent>
        <div class="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>暗语(黑话)解释</DrawerTitle>
          </DrawerHeader>
          <div class="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            <div class="space-y-3">
              <div class="flex items-start gap-3">
                <div>
                  <div class="font-medium text-sm mb-1 text-red-600">站街</div>
                  <div class="text-xs text-neutral-600">
                    在一些小巷子里招揽生意的女孩，一般价格在100-300元不等
                  </div>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div>
                  <div class="font-medium text-sm mb-1 text-red-600">楼凤</div>
                  <div class="text-xs text-neutral-600">
                    所谓楼凤，一楼一凤，就是在自己家里或公寓提供服务的女孩(一般称她们为老师，找她们服务称为上课)。一般是400-1000为正常价，超过就不值。
                  </div>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div>
                  <div class="font-medium text-sm mb-1 text-red-600">外围</div>
                  <div class="text-xs text-neutral-600">
                    分大圈、中圈、小圈，一般在会所或者公寓提供服务的女孩，一般价格在2000-4000为正常价，超过就不值，低于2000元的就不是外围的水准。
                  </div>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div>
                  <div class="font-medium text-sm mb-1 text-red-600">p、pp</div>
                  <div class="text-xs text-neutral-600">
                    xx p就是xx钱一炮，xx pp就是xx钱两炮
                  </div>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div>
                  <div class="font-medium text-sm mb-1 text-red-600">92(抓龙筋)</div>
                  <div class="text-xs text-neutral-600">
                    一般在外表正规的按摩店，提供打飞机服务，有些女孩衣服不全脱，价格在300-500为正常价，超过就不值。
                  </div>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div>
                  <div class="font-medium text-sm mb-1 text-red-600">95</div>
                  <div class="text-xs text-neutral-600">
                    一般在外表正规的按摩店，提供口爆服务(射嘴里)，价格在300-500为正常价，超过就不值。
                  </div>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div>
                  <div class="font-medium text-sm mb-1 text-red-600">98</div>
                  <div class="text-xs text-neutral-600">
                    一般在外表正规的按摩店，提供全套服务，价格在400-1000为正常价，超过就不值。
                  </div>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div>
                  <div class="font-medium text-sm mb-1 text-red-600">4T</div>
                  <div class="text-xs text-neutral-600">
                    也叫4推：胸推、臀推、手推、脚推，最后一般是臀推射出来，价格在300-500为正常价，超过就不值。
                  </div>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div>
                  <div class="font-medium text-sm mb-1 text-red-600">莎莎舞</div>
                  <div class="text-xs text-neutral-600">
                    黑灯瞎火的跳舞摸摸这摸摸那。
                  </div>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div>
                  <div class="font-medium text-sm mb-1 text-red-600">mmc</div>
                  <div class="text-xs text-neutral-600">
                    俗称摸摸唱，ktv里面边唱歌喝酒边摸摸这摸摸那。
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DrawerFooter>
            <Button @click="isTermExplanationOpen = false">
              我知道了
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { useQaStore } from '@/stores/qa'
import { useAntiFraudGuideStore } from '@/stores/antiFraudGuide'
import { getPostDetail } from '@/api/base'
import { useUserStore } from '@/stores/user'
import { useLoginStore } from '@/stores/login'
import { storeToRefs } from 'pinia'
import { Copy } from 'lucide-vue-next'
import { formatSmartTime, copyToClipboard } from '@/utils/index'
import { Skeleton } from '@/components/ui/skeleton'
import BlurredImage from '@/components/BlurredImage.vue';
import ImageViewer from '@/components/ImageViewer.vue'
import { toast } from 'vue-sonner'

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)
const loginStore = useLoginStore()
const qaStore = useQaStore()
const antiFraudGuideStore = useAntiFraudGuideStore()

const route = useRoute()
const router = useRouter()
const isVip = false
const post = ref({})
const imgDialog = ref(false)
const initialIndex = ref(0)
const isLoading = ref(true)
// 新手指南抽屉状态
const isNewbieGuideOpen = ref(false)
// 名词解释抽屉状态
const isTermExplanationOpen = ref(false)

onMounted(() => {
  fetchPostDetail()
})

// 获取帖子详情
async function fetchPostDetail() {
  isLoading.value = true
  if (!userInfo.value?.inviteCode) {
    toast.info('请先登录')
    loginStore.isLoginModalOpen = true
    loginStore.loginCallback = () => {
      // 刷新帖子详情
      fetchPostDetail()
    }
    return
  }
  try {
    const response = await getPostDetail({
      id: route.params.id,
      inviteCode: userInfo.value?.inviteCode
    })
    post.value = response || {}
    isLoading.value = false
  } catch (error) {
    toast.error(error?.response?.data?.message || '获取详情失败，请重试')
  }
}

async function copyBtn(text) {
  antiFraudGuideStore.isAntiFraudGuideModalOpen = true
  try {
    await copyToClipboard(text)
    toast.success('已复制到剪贴板')
  } catch (error) {
    toast.error('复制失败，请手动复制')
  }
}

function showImg(idx) {
  initialIndex.value = idx
  imgDialog.value = true
}
function goVip() {
  if (userInfo.value.id) {
    router.push({ name: 'vip' })
  } else {
    loginStore.isLoginModalOpen = true
    loginStore.loginCallback = () => {
      // 刷新帖子详情
      fetchPostDetail()
    }
  }
}
</script>