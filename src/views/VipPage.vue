<template>
  <div class="px-4 max-w-3xl mx-auto pb-20">
    <!-- 骨架屏加载状态 -->
    <template v-if="isLoading">
      <!-- 标题骨架 -->
      <div class="text-center mb-4">
        <Skeleton class="h-7 w-32 mx-auto mb-2" />
        <Skeleton class="h-4 w-64 mx-auto" />
      </div>

      <!-- 套餐选择骨架 -->
      <div class="mb-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div v-for="i in 3" :key="i" class="h-36 p-4 border-2 rounded-lg">
            <div class="flex justify-between items-center mb-2">
              <Skeleton class="h-5 w-24" />
            </div>
            <div class="mb-1">
              <Skeleton class="h-6 w-16" />
            </div>
            <div class="mt-auto">
              <Skeleton class="h-4 w-36" />
            </div>
          </div>
        </div>
      </div>

      <!-- 常见问题骨架 -->
      <div class="p-4 bg-white dark:bg-gray-800 mt-2 shadow-sm rounded-md mb-5">
        <div class="mb-4 flex items-center">
          <div class="w-1 h-4 bg-gradient-to-b rounded"></div>
          <Skeleton class="h-6 w-24 ml-1" />
        </div>
        
        <div v-for="i in 3" :key="i" class="mt-3 flex items-start">
          <Skeleton class="h-4 w-4 mr-2" />
          <Skeleton class="h-4 w-full" />
        </div>
      </div>

      <!-- 底部支付区域骨架 -->
      <div class="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-md z-10">
        <div class="max-w-3xl mx-auto flex justify-between items-center gap-4">
          <div>
            <Skeleton class="h-5 w-24 mb-1" />
            <Skeleton class="h-6 w-32" />
          </div>
          
          <Skeleton class="h-10 w-24" />
        </div>
      </div>
    </template>
    <!-- 实际内容 -->
    <template v-else>
      <div class="text-center mb-4">
        <h1 class="text-xl font-bold mb-2">开通会员</h1>
        <p class="text-neutral-500 text-sm">会员可<b>无限制</b>查看所有联系方式，享受更多特权</p>
      </div>
  
      <!-- 会员套餐选择 -->
      <div class="mb-4">
        <RadioGroup v-model="selectedPlan" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div v-for="plan in plans" :key="plan.id" class="h-full">
            <div class="relative h-full">
              <RadioGroupItem :id="plan.id" :value="plan.id" class="peer sr-only" />
              <Label 
                :for="plan.id"
                class="flex flex-col h-full p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-yellow-400 peer-data-[state=checked]:border-yellow-500 peer-data-[state=checked]:bg-yellow-50"
              >
                <div class="flex justify-between items-center mb-2">
                  <span class="font-medium">{{ plan.name }}</span>
                  <span class="text-neutral-500 text-xs">会员时效：{{ plan.day }}天</span>
                </div>
                
                <div class="flex items-baseline mb-1">
                  <span class="text-xl font-bold">¥{{ plan.price }}</span>
                </div>
                <div class="mt-auto text-sm text-neutral-600">
                  {{ plan.popular }}
                </div>
              </Label>
            </div>
          </div>
        </RadioGroup>
      </div>
  
      <!-- 常见问题 -->
      <div class="p-4 bg-white dark:bg-gray-800 mt-2 shadow-sm rounded-md mb-5">
        <div class="text-md font-black text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <div class="w-1 h-4 bg-gradient-to-b rounded"></div>
          <span class="text-xl">常见问题</span>
        </div>
        
        <div class="text-gray-600 dark:text-gray-400 text-sm mt-3 flex items-start">
          <span class="font-medium">1、</span>
          <span>每次充值请务必到此页面重新获取新的付款账号</span>
        </div>
        
        <div class="text-gray-600 dark:text-gray-400 text-sm mt-3 flex items-start">
          <span class="font-medium">2、</span>
          <span>支付成功一般10分钟内到账，如超过30分钟未到账，请保留支付凭证，并复制订单编号，联系客服处理</span>
        </div>
        
        <div class="text-gray-600 dark:text-gray-400 text-sm mt-3 flex items-start">
          <span class="font-medium">3、</span>
          <span>更多问题请点击查看
          </span>
        </div>
      </div>
  
      <!-- 底部支付区域 -->
      <div class="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-md z-10">
        <div class="max-w-3xl mx-auto flex justify-between items-center gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="font-medium">{{ selectedPlanDetails?.name || '未选择' }}</span>
            </div>
            <div class="flex items-baseline">
              <span class="text-neutral-600 mr-2">总计:</span>
              <span class="text-xl font-bold text-yellow-600">¥{{ selectedPlanDetails?.price || 0 }}</span>
            </div>
          </div>
          
          <Button 
            class="bg-yellow-500 hover:bg-yellow-600 text-white"
            size="lg"
            :disabled="!selectedPlan || payLoading"
            @click="handlePayment"
          >
            <svg v-if="payLoading" class="mr-2 animate-spin" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="15" height="15"><path d="M512 85.333333c235.648 0 426.666667 191.018667 426.666667 426.666667s-191.018667 426.666667-426.666667 426.666667S85.333333 747.648 85.333333 512 276.352 85.333333 512 85.333333z m0 128a298.666667 298.666667 0 1 0 0 597.333334 298.666667 298.666667 0 0 0 0-597.333334z" fill="#ffffff" fill-opacity=".05"></path><path d="M813.696 813.696c166.613333-166.613333 166.613333-436.778667 0-603.392-166.613333-166.613333-436.778667-166.613333-603.392 0A64 64 0 0 0 300.8 300.8a298.666667 298.666667 0 1 1 422.4 422.4 64 64 0 0 0 90.496 90.496z" fill="#ffffff"></path></svg>
            {{ payLoading ? '处理中...' : '确认支付' }}
          </Button>
        </div>
      </div>
    </template>

    <!-- 确认弹窗 -->
    <Dialog v-model:open="showConfirmDialog">
      <DialogContent class="max-w-xs">
        <DialogHeader>
          <DialogTitle>确认支付</DialogTitle>
          <DialogDescription>
            即将跳转到支付宝完成支付
          </DialogDescription>
        </DialogHeader>
        <div class="py-4">
          <div class="flex justify-between items-center mb-2">
            <span>套餐:</span>
            <span class="font-medium">{{ selectedPlanDetails?.name }}</span>
          </div>
          <div class="flex justify-between items-center mb-2">
            <span>金额:</span>
            <span class="text-lg font-bold text-yellow-600">¥{{ selectedPlanDetails?.price }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span>支付方式:</span>
            <span>支付宝</span>
          </div>
        </div>
        <DialogFooter>
          <Button class="bg-yellow-500 hover:bg-yellow-600 text-white" @click="confirmPayment">
            立即支付
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <!-- 确认弹窗 -->
    <Dialog v-model:open="confirmPayResultVisible">
      <DialogContent class="max-w-xs">
        <DialogHeader>
          <DialogTitle>确认支付结果</DialogTitle>
        </DialogHeader>
        <div class="flex gap-4 justify-center flex-col items-center">
          <Button class="w-full" @click="handlePaySuccess">支付成功</Button>
          <Button class="w-full" variant="outline" @click="handlePayFailed">未支付</Button>
        </div>
        <DialogFooter>
          <!-- 底部提示 -->
          <div class="text-center text-xs text-gray-500 dark:text-gray-400">
            如有支付问题，请联系客服处理
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  RadioGroup,
  RadioGroupItem
} from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useRouter } from 'vue-router'
import { getVipPackages, createPaymentOrder } from '@/api/base'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)
const router = useRouter()
const selectedPlan = ref(null)
const payLoading = ref(false)
const showConfirmDialog = ref(false)
const confirmPayResultVisible = ref(false)
const paymentUrl = ref('')
const isLoading = ref(true)

// 会员套餐数据（假设从接口获取）
const plans = ref([])

// 页面加载时模拟数据获取
onMounted(async () => {
  fetchPlans()
})

// 获取会员套餐数据
const fetchPlans = async () => {
  isLoading.value = true
  try {
    const response = await getVipPackages()
    selectedPlan.value = response[0]?.id // 假设API返回的数据格式与plans一致
    plans.value = response
    isLoading.value = false
  } catch (error) {
    toast.error(error?.response?.data?.message || '获取会员套餐失败，请稍后再试')
  }
}

// 获取当前选中的套餐详情
const selectedPlanDetails = computed(() => {
  return plans.value.find(plan => plan.id === selectedPlan.value)
})

// 处理支付
const handlePayment = async () => {
  if (!selectedPlan.value) {
    toast.info('请先选择套餐')
    return
  }

  payLoading.value = true;
  try {
    const response = await createPaymentOrder({
      priceId: selectedPlanDetails.value.id,
      userId: userInfo.value.id
    });
    if (response.payUrl) {
      paymentUrl.value = response.payUrl;
      showConfirmDialog.value = true; // 打开支付弹窗
    } else {
      toast.error('支付链接获取失败，请稍后再试');
    }
  } catch (error) {
    toast.error(error?.response?.data?.message || '支付链接获取失败，请稍后再试')
  } finally {
    payLoading.value = false;
  }
}

// 确认支付，跳转到支付链接
const confirmPayment = () => {
  if (paymentUrl.value) {
    // 在实际应用中，这会打开新窗口或跳转到支付页面
    window.open(paymentUrl.value, '_blank')
    showConfirmDialog.value = false
    confirmPayResultVisible.value = true
  } else {
    toast.error('支付链接无效，请重试')
  }
}

// 处理支付成功
const handlePaySuccess = () => {
  confirmPayResultVisible.value = false;
  router.go(-1)
};

// 处理支付失败
const handlePayFailed = () => {
  confirmPayResultVisible.value = false;
  toast.info('如需继续购买，请重新发起支付')
};
</script>