<template>
  <div>
    <Drawer v-model:open="isOpen">
      <DrawerContent>
        <div class="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>防骗指南</DrawerTitle>
            <DrawerDescription>
              了解常见骗术，保护自己的财产安全
            </DrawerDescription>
          </DrawerHeader>
          <div class="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            <div class="space-y-3">
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                <div>
                  <div class="font-medium text-sm mb-1 text-red-600">怎么辨别和鉴定虚假联系方式？骗子有一些显著特征呢?</div>
                  <div class="text-xs text-neutral-600">
                    1、当你对联系对方有所顾虑的时候，请您尝试百度一下这个联系方式，进行多方的比对。<br />
                    2、<span class="text-red-600">凡是</span>要求付路费/红包/定金/保证金/照片验证/视频验证等任何提前付费的行为，基本都是<span class="text-red-600">骗子</span> 。<br />
                    3、<span class="text-red-600">凡是</span>裸聊、发视频验证、下载APP的，都是来骗钱或窃取个人资料的，请勿上当。<br />
                    4、<span class="text-red-600">凡是</span>进入服务场所后没有提供服务就一直推荐办卡都是<span class="text-red-600">骗子</span> 。<br />
                    5、<span class="text-red-600">凡是</span>对服务项目含糊其辞的，都是有些猫腻的，事前一定要在手机上问清楚。<br />
                    6、<span class="text-red-600">凡是</span>要求见面地方在交通方便的车站附近的，基本不靠谱。
                  </div>
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
import { computed } from 'vue'
import { useAntiFraudGuideStore } from '@/stores/antiFraudGuide'

const antiFraudGuideStore = useAntiFraudGuideStore()

// 使用计算属性实现双向绑定
const isOpen = computed({
  get: () => antiFraudGuideStore.isAntiFraudGuideModalOpen,
  set: (value) => { antiFraudGuideStore.isAntiFraudGuideModalOpen = value }
})

// 关闭抽屉的方法
const close = () => {
  isOpen.value = false
}
</script>
