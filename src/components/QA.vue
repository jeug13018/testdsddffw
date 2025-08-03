<template>
  <div>
    <Drawer v-model:open="isOpen">
      <DrawerContent>
        <div class="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>常见问题</DrawerTitle>
            <DrawerDescription>
              更多问题请联系客服
            </DrawerDescription>
          </DrawerHeader>
          <div class="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            <div class="space-y-3">
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                <div>
                  <div class="font-medium text-sm mb-1 text-red-600">你们的信息是哪里来的?</div>
                  <div class="text-xs text-neutral-600">我们的信息主要来自我们的电报频道，会用魔法网络的也可以直接加入我们的电报群<a :href="TG_CHANNEL_URL" target="_blank" class="text-blue-600 cursor-pointer underline">全国修车指南针2群</a></div>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                <div>
                  <div class="font-medium text-sm mb-1 text-red-600">为什么网站有一些信息过时了?</div>
                  <div class="text-xs text-neutral-600">由于行业的特殊性，如果这条信息发布时间半年多了，过时了也正常，但请放心，本站每日大量更新全国信息，我们也建议你更多关注最新的信息。</div>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                <div>
                  <div class="font-medium text-sm mb-1 text-red-600">为什么有些信息的联系方式无效？</div>
                  <div class="text-xs text-neutral-600">由于行业的特殊性，楼凤小姐或者商家联系方式更换比较频繁，同时如果这条信息被很多狼友浏览和添加，也会导致微信或者QQ联系方式被暂时屏蔽或者直接被封。如果你无法搜索QQ和微信，这个时候请你尝试一下手机联系方式，如果长期没回复或者联系方式失效且无法添加，请关注我们同城的其它最新信息即可，我们每日更新大量全国信息，通过我们的最新信息，总会帮你找到快乐和性福。</div>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                <div>
                  <div class="font-medium text-sm mb-1 text-red-600">图片为什么模糊不清？</div>
                  <div class="text-xs text-neutral-600">因为需要避免一些隐私问题。</div>
                </div>
              </div>
            </div>
          </div>
          <DrawerFooter>
            <Button @click="close">
              我知道了
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  </div>
</template>

<script setup lang="ts">
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { TG_CHANNEL_URL } from '@/config/index'
import { computed } from 'vue'
import { useQaStore } from '@/stores/qa'

const qaStore = useQaStore()

// 使用计算属性实现双向绑定
const isOpen = computed({
  get: () => qaStore.isQaModalOpen,
  set: (value) => { qaStore.isQaModalOpen = value }
})

// 关闭抽屉的方法
const close = () => {
  isOpen.value = false
}
</script>