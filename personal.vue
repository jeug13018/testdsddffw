<script setup>
import { useGlobalStore } from "@/stores/useGlobalStore";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import router from '@/router'
import { Snackbar } from "@varlet/ui";
import Crown from "@/components/svg/crown.vue";
import VipComparisonModal from "@/components/VipComparisonModal.vue";
import { isVip as _isVipFetch } from "@/apis/base";
import { formatVipTime } from "@/utils/elements";
import { maxDailyViews, xiucheUrl } from "@/const";

const store = useGlobalStore();
const userStore = useUserStore();
const { isShowLoginDialog, loginCallback } = storeToRefs(store);
const { userInfo } = storeToRefs(userStore);
const formattedVipTime = ref(''); // 用于存储格式化后的VIP时间
const showVipComparison = ref(false)
const showQrCertificate = ref(false); // 用于控制二维码弹窗的显示状态
const isVip = ref(false); // 用于存储用户是否是免费VIP
const isBuyVip = ref(false); // 用于存储用户是否是付费VIP

// 判断用户是不是VIP
const checkIsVip = async (id) => {
  try {
    const res = await _isVipFetch(id);
    isVip.value = res.isVip;
    isBuyVip.value = res.isBuyVip;
  } catch (error) {
    isVip.value = false;
    isBuyVip.value = false;
    Snackbar.error("检查VIP状态失败，请稍后再试");
  }
};

// 去推广页面
const goShare = () => {
  if (!userInfo.value?.id) {
    isShowLoginDialog.value = true;
    loginCallback.value = () => {
      router.push('/personal/share');
    };
    Snackbar.warning('请先登录');
    return;
  }
  router.push('/personal/share');
};

// 去常见问题页面
const goQa = () => {
  router.push('/personal/faq');
};

// 前往设置页面
const goSetting = () => {
  router.push('/personal/setting');
};

const goXiuche = () => {
  window.open(xiucheUrl, '_blank');
}

// 去购买会员页面
const goBuyVip = () => {
  if (!userInfo.value?.id) {
    isShowLoginDialog.value = true;
    loginCallback.value = () => {
      router.push('/personal/vipMenu');
    };
    Snackbar.warning('请先登录');
    return;
  }
  router.push('/personal/vipMenu');
};

// 去客服页面
const goContactUs = () => {
  router.push('/personal/contactUs');
};

// 监听用户信息，有 email 时获取详细用户信息
watch(
  () => userInfo.value?.id,
  async (id) => {
    if (id) {
      try {
        // 检查用户是否是VIP
        let res = {}
        if (userInfo.value?.id) {
          res = await checkIsVip(userInfo.value.id);
        }
        // 更新用户的VIP时间显示
        // 优先显示付费会员时间
        if (res?.buy_vip_time) {
          formattedVipTime.value = formatVipTime(res.buy_vip_time);
        } else if (res?.vip_time) {
          // 免费会员时间
          formattedVipTime.value = formatVipTime(res.vip_time);
        } else {
          formattedVipTime.value = '';
        }
        // 更新到userInfo
        for (const key in res) {
          if (res.hasOwnProperty(key)) {
            userInfo.value[key] = res[key];
          }
        }
      } catch (error) {
        console.log('获取用户详细信息失败:', error);
      }
    } else {
      formattedVipTime.value = '';
    }
  },
  { immediate: true } // 初始化时执行一次
);
</script>

<template>
  <div class="profile">
    <app-header>
      <template #content>
        <div :class="{
          'bg-gradient-to-r': true,
          'overflow-hidden': true,
          'from-[#876218]': isBuyVip,
          'to-[#e9b949]': isBuyVip,
          'from-[#2b1c5a]': isVip,
          'to-[#4b319a]': isVip,
        }" style="border-radius: 0 0 16px 16px;">
          <!-- 装饰元素 -->
          <div class="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/5"></div>
          <div class="absolute right-20 -bottom-10 w-24 h-24 rounded-full bg-white/5"></div>
          <div class="absolute right-5 top-3 opacity-20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L14.4697 9.2584L20.2434 10.0451L15.878 14.0479L17.027 19.7549L12 16.887L6.97296 19.7549L8.12197 14.0479L3.75659 10.0451L9.53035 9.2584L12 4Z" fill="white" stroke="white" stroke-width="1.5"/>
            </svg>
            
          </div>
          <div class="flex items-center h-[var(--app-bar-height)] px-4">
            <div v-if="isBuyVip || isVip" class="flex items-center bg-white/20 rounded-full px-2 py-0.5">
              <Crown v-if="isBuyVip" width="12" height="24" class="mr-1" />
              <Svip v-else width="12" class="text-yellow-300 mr-1" />
              <span class="text-xs font-bold text-white">
                {{ isBuyVip ? '付费' : '免费' }}VIP会员
              </span>
            </div>
            <div class="flex-1"></div>
            <div v-if="(isBuyVip || isVip) && formattedVipTime" class="text-xs text-white/70">
              会员有效期至：{{ formattedVipTime }}
            </div>
            <div v-else-if="!isBuyVip && !isBuyVip && formattedVipTime" class="text-xs text-white/70">
              会员于 {{ formattedVipTime }} 已过期
            </div>
            <app-theme-switch />
          </div>
          <div class="flex items-center justify-between px-[20px] relative">
            <div class="flex items-center">
              <span class="inline-block rounded-full bg-white flex items-center justify-center" :class="[
                isBuyVip ? 'vip-avatar' : ''
              ]">
                <!-- <var-avatar
                  :class="[
                    'bg-[#fff!important]',
                  ]"
                  src="/favicon.ico"
                  fit="none"
                  size="22vmin"
                  :bordered="isBuyVip"
                /> -->
                <div class="w-[22vmin] h-[22vmin] rounded-full overflow-hidden flex items-center justify-center font-bold bg-[#fff] text-xl">
                  <!-- 4 设置斜体 -->
                  <span class="italic text-red mr-1">4</span><span class="text-black">vip.xyz</span>
                </div>
              </span>
              <!-- <Crown v-if="isBuyVip && userInfo?.id" width="40" class="absolute top-0 left-2 -rotate-45 z-12" /> -->
              <div class="ml-[14px]" v-if="userInfo?.id">
                <!-- <div class="text-2xl">用户ID：{{ userInfo?.id }}</div> -->
                <div class="text-[#ccc] pt-[4px] text-sm">用户ID：{{ userInfo?.id }}</div>
                <div class="text-[#ccc] pt-[4px] text-sm">邀请码：{{ userInfo?.inviteCode }}</div>
              </div>
              <div class="ml-[14px]" v-else>
                <div class="text-xl" @click="isShowLoginDialog = true">
                  登录 | 注册
                </div>
              </div>
            </div>
            <button 
              @click="showQrCertificate = true" 
              v-if="userInfo?.id"
              class="flex items-center justify-center px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 active:bg-white/15 transition-all duration-200"
            >
              <var-icon color="#fff" size="13" name="view-outline" />
              <span class="text-white text-sm font-medium ml-1">用户凭证</span>
            </button>
          </div>
          <div class="flex items-center justify-between px-[40px] py-[10px]">
            <div class="flex items-center justify-center flex-col">
              <div>
                <b class="text-2xl mr-[3px]">无限</b>
                <span class="text-sm text-[#ddd]">次</span>
              </div>
              <div class="text-md text-[#ddd]">短视频</div>
            </div>
            <div class="flex items-center justify-center flex-col">
              <div>
                <template v-if="isBuyVip || isVip">
                  <b class="text-2xl mr-[3px]">无限</b>
                </template>
                <template v-else>
                  <span class="text-sm text-[#ddd]">每日</span>
                  <b class="text-2xl mx-[3px]">{{ maxDailyViews }}</b>
                </template>
                <span class="text-sm text-[#ddd]">次</span>
              </div>
              <div class="text-md text-[#ddd]">点播</div>
            </div>
            <div class="flex items-center justify-center flex-col">
              <div>
                <b class="text-2xl mr-[3px]">{{ (isBuyVip || isVip) ? '无限' : 0 }}</b>
                <span class="text-sm text-[#ddd]">次</span>
              </div>
              <div class="text-md text-[#ddd]">直播</div>
            </div>
            <div class="flex items-center justify-center flex-col">
              <div>
                <b class="text-2xl mr-[3px]">{{ isBuyVip ? '无限' : 0 }}</b>
                <span class="text-sm text-[#ddd]">次</span>
              </div>
              <div class="text-md text-[#ddd] relative">
                <Crown width="15" height="15" class="absolute top-0 left-0 transform -translate-x-2/2 -rotate-45" />
                付费专区
              </div>
            </div>
          </div>
        </div>
      </template>
    </app-header>
    
    <div class="px-2 grid grid-cols-2 gap-2">
      <!-- 购买会员按钮 -->
      <div
        @click="goBuyVip"
        class="flex items-center rounded-lg bg-gradient-to-r from-[#876218] to-[#e9b949] p-2 shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <div
          class="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20"
        >
          <Crown width="24" />
        </div>
        <span class="font-medium text-white">购买会员</span>
      </div>

      <!-- 分享送会员按钮 -->
      <div
        @click="goShare"
        class="flex items-center rounded-lg rounded-lg bg-gradient-to-r from-purple-500 to-[#6751A4] p-2 shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <div
          class="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20"
        >
          <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
            <path d="M859.8528 431.4624l-321.9968 214.016c-15.7696 10.496-35.8912 10.496-51.712 0l-321.9968-214.016c-32.1024-21.3504-74.0352 2.816-74.0352 42.5984V783.36c0 66.9184 51.8144 121.1392 115.7632 121.1392h612.2496c63.9488 0 115.7632-54.2208 115.7632-121.1392V474.0608c0-39.7824-41.9328-63.8976-74.0352-42.5984z" fill="#FACC31"></path>
            <path d="M818.1248 930.1504H205.8752c-77.9776 0-141.3632-65.8432-141.3632-146.7392V474.0608c0-28.4672 15.2576-54.3232 39.7824-67.4816 23.808-12.7488 51.5072-11.4176 74.0352 3.584l321.9968 214.016c7.2192 4.8128 16.128 4.8128 23.3472 0l321.9968-214.016c22.5792-15.0016 50.2784-16.3328 74.0352-3.584 24.5248 13.1584 39.7824 39.0144 39.7824 67.4816V783.36c0 80.9472-63.3856 146.7904-141.3632 146.7904zM138.4448 449.1264c-4.1984 0-7.7312 1.3824-9.984 2.6112-7.9872 4.3008-12.7488 12.6464-12.7488 22.3744V783.36c0 52.6848 40.448 95.5392 90.1632 95.5392h612.2496c49.7152 0 90.1632-42.8544 90.1632-95.5392V474.0608c0-9.728-4.7616-18.0736-12.7488-22.3744-4.096-2.2016-12.3904-4.9664-21.5552 1.0752l-321.9968 214.016a72.0384 72.0384 0 0 1-80.0256 0l-321.9968-214.016c-4.1472-2.7136-8.0896-3.6352-11.52-3.6352zM811.52 385.28c-14.1312 0-25.6-11.4688-25.6-25.6V195.7376c0-34.4576-26.2656-62.5152-58.624-62.5152H294.8608c-32.3072 0-58.624 28.0576-58.624 62.5152v163.9424c0 14.1312-11.4688 25.6-25.6 25.6s-25.6-11.4688-25.6-25.6V195.7376c0-62.72 49.2544-113.7152 109.824-113.7152h432.4352c60.5696 0 109.824 50.9952 109.824 113.7152v163.9424c0 14.1312-11.4688 25.6-25.6 25.6z" fill="#191919"></path>
            <path d="M645.0176 259.2256H366.8992c-14.1312 0-25.6-11.4688-25.6-25.6s11.4688-25.6 25.6-25.6h278.1184c14.1312 0 25.6 11.4688 25.6 25.6s-11.4688 25.6-25.6 25.6zM569.8048 379.2896H366.8992c-14.1312 0-25.6-11.4688-25.6-25.6s11.4688-25.6 25.6-25.6h202.9056c14.1312 0 25.6 11.4688 25.6 25.6s-11.4688 25.6-25.6 25.6z" fill="#191919"></path>
          </svg>
        </div>
        <div class="flex flex-col items-start">
          <span class="font-medium text-white">分享送会员</span>
          <span class="mt-1 text-sm text-white/80">推广成功获得2天会员</span>
        </div>
      </div>
    </div>


    <div class="mt-4">
      <var-cell border ripple @click="showVipComparison = true">
        <template #icon>
          <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="25" height="25">
            <path d="M608.131879 870.105212c-180.565333 55.202909-371.696485-40.323879-437.899637-214.450424l-0.139636-0.44994c-42.821818-181.434182 62.262303-367.848727 242.982788-423.098181s372.084364 40.541091 438.039273 214.900363l0.139636 0.44994c42.480485 181.356606-62.541576 367.429818-243.122424 422.648242z" fill="#FFDA44"></path><path d="M512 139.636364C289.512727 139.636364 108.606061 320.54303 108.606061 543.030303s180.906667 403.393939 403.393939 403.393939 403.393939-180.906667 403.393939-403.393939S734.487273 139.636364 512 139.636364z m0 760.242424c-5.585455 0-11.170909-0.155152-16.601212-0.465455-2.172121 0-4.189091-0.155152-6.206061-0.310303h-0.465454C302.700606 887.001212 155.151515 732.004848 155.151515 543.030303S302.700606 199.059394 488.727273 186.957576h0.465454c2.01697-0.155152 4.033939-0.310303 6.206061-0.310303 5.430303-0.310303 11.015758-0.465455 16.601212-0.465455 196.732121 0 356.848485 160.116364 356.848485 356.848485S708.732121 899.878788 512 899.878788z" fill="#14145B"></path><path d="M617.208242 884.25503c-188.136727 57.514667-388.06497-48.795152-445.595151-236.916363a290.288485 290.288485 0 0 1-4.406303-16.011637c-0.636121-2.07903-1.070545-4.049455-1.520485-6.019878 66.218667 174.126545 257.334303 269.653333 437.899636 214.450424 180.565333-55.202909 285.602909-241.276121 243.122425-422.663758 0.744727 1.877333 1.473939 3.770182 2.11006 5.849212 1.877333 5.104485 3.661576 10.395152 5.290667 15.732364 57.545697 188.136727-48.764121 388.06497-236.900849 445.579636z" fill="#FFC145"></path><path d="M371.665455 514.777212V385.086061a16.213333 16.213333 0 0 1 32.426666 0v129.691151a16.213333 16.213333 0 0 1-32.426666 0z" fill="#15185B"></path><path d="M306.827636 449.939394c0-8.952242 7.261091-16.213333 16.213334-16.213333h129.691151a16.213333 16.213333 0 0 1 0 32.426666h-129.691151A16.213333 16.213333 0 0 1 306.827636 449.939394zM619.907879 514.777212V385.086061a16.213333 16.213333 0 0 1 32.426666 0v129.691151a16.213333 16.213333 0 0 1-32.426666 0z" fill="#15185B"></path><path d="M555.070061 449.939394c0-8.952242 7.261091-16.213333 16.213333-16.213333h129.691151a16.213333 16.213333 0 0 1 0 32.426666h-129.691151A16.213333 16.213333 0 0 1 555.070061 449.939394z" fill="#15185B"></path><path d="M450.746182 672.271515c52.720485 35.203879 99.483152 15.034182 122.94206-0.387879a23.179636 23.179636 0 0 1 29.63394 3.242667l0.217212 0.232727a23.241697 23.241697 0 0 1-4.344242 35.545212c-40.075636 26.08097-106.821818 45.459394-174.685091-0.170666-11.74497-7.897212-14.165333-24.188121-4.825213-34.800485l0.155152-0.170667c7.881697-8.921212 21.007515-10.100364 30.906182-3.490909z" fill="#14145B"></path><path d="M620.342303 620.606061c9.479758 0 16.958061 8.331636 15.623758 17.640727C627.324121 698.445576 575.115636 744.727273 512 744.727273s-115.324121-46.281697-123.966061-106.480485c-1.334303-9.309091 6.144-17.640727 15.623758-17.640727h216.684606z" fill="#FFFFFF"></path><path d="M512 760.242424c-69.616485 0-129.520485-51.494788-139.326061-119.792485a30.72 30.72 0 0 1 7.261091-24.529454 31.433697 31.433697 0 0 1 23.738182-10.829576h216.669091c9.107394 0 17.764848 3.956364 23.738182 10.829576 5.864727 6.795636 8.517818 15.716848 7.261091 24.513939C641.536 708.747636 581.632 760.242424 512 760.242424z m-108.326788-124.121212c7.354182 53.030788 54.039273 93.090909 108.326788 93.090909 54.30303 0 100.988121-40.060121 108.606061-93.168485l-0.279273 0.077576H403.673212z" fill="#14145B"></path><path d="M1024 201.69697a15.515152 15.515152 0 0 1-15.515152 15.515151h-62.060606a15.515152 15.515152 0 0 1 0-31.030303h62.060606a15.515152 15.515152 0 0 1 15.515152 15.515152z" fill="#FFAD44"></path><path d="M992.969697 232.727273a15.515152 15.515152 0 0 1-31.030303 0V170.666667a15.515152 15.515152 0 0 1 31.030303 0v62.060606z" fill="#FFAD44"></path><path d="M93.090909 837.818182a15.515152 15.515152 0 0 1-15.515151 15.515151H15.515152a15.515152 15.515152 0 0 1 0-31.030303h62.060606a15.515152 15.515152 0 0 1 15.515151 15.515152z" fill="#FFDA44"></path><path d="M62.060606 868.848485a15.515152 15.515152 0 0 1-31.030303 0v-62.060606a15.515152 15.515152 0 0 1 31.030303 0v62.060606z" fill="#FFDA44"></path><path d="M139.636364 186.181818c-51.324121 0-93.090909-41.766788-93.090909-93.090909s41.766788-93.090909 93.090909-93.090909 93.090909 41.766788 93.090909 93.090909-41.766788 93.090909-93.090909 93.090909z m0-143.220363c-27.632485 0-50.129455 22.49697-50.129455 50.129454S112.003879 143.220364 139.636364 143.220364 189.765818 120.723394 189.765818 93.090909 167.268848 42.961455 139.636364 42.961455z" fill="#549BE2"></path><path d="M977.454545 977.454545m-46.545454 0a46.545455 46.545455 0 1 0 93.090909 0 46.545455 46.545455 0 1 0-93.090909 0Z" fill="#F44336"></path></svg>
        </template>
        用户权益说明
        <template #extra>
          <var-icon name="chevron-right" />
        </template>
      </var-cell>
      <var-cell border ripple @click="goQa">
        <template #icon>
          <svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="25" height="25">
            <path d="M673.684211 134.736842a80.842105 80.842105 0 0 1 80.842105 80.842105v377.263158a80.842105 80.842105 0 0 1-80.842105 80.842106H417.684211l-126.72 93.857684A13.473684 13.473684 0 0 1 269.473684 756.722526V673.684211h-26.947368a80.842105 80.842105 0 0 1-80.842105-80.842106V215.578947a80.842105 80.842105 0 0 1 80.842105-80.842105h431.157895z m0 53.894737H242.526316a26.947368 26.947368 0 0 0-26.947369 26.947368v377.263158a26.947368 26.947368 0 0 0 26.947369 26.947369h80.842105v56.683789l62.248421-46.093474L399.898947 619.789474H673.684211a26.947368 26.947368 0 0 0 26.947368-26.947369V215.578947a26.947368 26.947368 0 0 0-26.947368-26.947368z" fill="#555555"></path>
            <path d="M814.012632 392.730947a80.842105 80.842105 0 0 1 80.842105 80.842106v252.483368a80.842105 80.842105 0 0 1-80.842105 80.842105h-1.980632v57.613474a13.473684 13.473684 0 0 1-21.504 10.819368l-92.389053-68.446315H520.124632a80.842105 80.842105 0 0 1-80.842106-80.842106V673.684211h53.894737v52.385684a26.947368 26.947368 0 0 0 24.926316 26.866526l2.021053 0.080842h195.799579l14.282105 10.576842 27.930947 20.682106v-31.258948h55.875369a26.947368 26.947368 0 0 0 26.947368-26.947368V473.573053a26.947368 26.947368 0 0 0-26.947368-26.947369H754.526316v-53.894737z" fill="#F44A0D"></path>
            <path d="M428.409263 538.947368v-51.146105h53.854316V538.947368h-53.854316z m1.347369-74.859789v-13.716211c-1.792-23.282526 9.876211-43.250526 35.004631-59.890526 24.239158-17.461895 35.907368-34.088421 35.004632-49.893053-0.889263-24.117895-13.460211-37.012211-37.685895-38.669473-26.031158 0.821895-42.186105 17.879579-48.478316 51.146105H363.789474C372.762947 297.337263 405.072842 269.473684 460.732632 269.473684c58.341053 1.657263 88.858947 24.535579 91.54021 68.621474 1.805474 25.775158-13.460211 49.071158-45.770105 69.861053-18.849684 13.298526-27.823158 28.698947-26.920421 46.160842v9.970526h-49.825684z" fill="#666666"></path>
          </svg>
        </template>
        常见问题
        <template #extra>
          <var-icon name="chevron-right" />
        </template>
      </var-cell>
      <var-cell border ripple @click="goContactUs">
        <template #icon>
          <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="25" height="25">
            <path d="M512 127.0272c-133.4144 0-192.4864 72.1792-192.4864 192.4864V656.384h384.9856V319.5136c-0.0128-120.3072-78.72-192.4864-192.4992-192.4864z" fill="#A67C52"></path>
            <path d="M560.128 487.9488h-96.256l-24.0512 96.2432v312.8064h144.3584V584.192z" fill="#DBB59A"></path>
            <path d="M223.2576 704.4992c-45.2352 45.2352-48.128 192.4864-48.128 192.4864H512L415.7568 608.256s-169.8944 73.6256-192.4992 96.2432z m577.4848 0C778.112 681.8688 608.256 608.256 608.256 608.256L512 896.9984h336.8576s-2.88-147.264-48.1152-192.4992z" fill="#48A0DC"></path><path d="M584.1792 584.192L512 896.9984h24.064l72.1792-168.4352 120.3072-24.064-144.3712-120.3072z m-288.7296 120.3072l120.3072 24.064 72.1792 168.4352H512L439.8208 584.192l-144.3712 120.3072z" fill="#FFFFFF"></path>
            <path d="M578.2144 270.976c-18.8288 41.6384-83.7888 72.6016-162.4576 72.6016h-47.7824c1.0496 47.1424 5.44 83.7248 23.7312 120.3072 24.064 48.128 73.1648 96.2432 120.3072 96.2432S608.256 512 632.32 463.8848c21.4272-42.8416 23.7696-85.696 24.0256-145.5232-1.4208-27.0464-52.48-47.3856-78.1312-47.3856z" fill="#F6CBAD"></path>
            <path d="M723.6864 283.8912c-21.0176-75.904-107.8016-132.8-211.6864-132.8s-190.6688 56.896-211.6864 132.8c-16.0512 8.8064-28.928 21.504-28.928 35.6224v48.128c0 26.5728 45.6064 48.128 72.1792 48.128v-96.2432c0-66.4448 75.4048-120.3072 168.4352-120.3072s168.4352 53.8624 168.4352 120.3072v48.128c0 51.5712-32.448 95.552-78.0288 112.6656-6.4384-9.8816-17.5872-16.4224-30.2464-16.4224h-48.128c-19.9296 0-36.096 16.1664-36.096 36.096 0 19.9296 16.1664 36.096 36.096 36.096H572.16c3.52 0 6.912-0.512 10.1248-1.4464 70.9888-9.3312 128.0512-62.8608 142.6432-132.0576 15.4752-8.768 27.6992-21.1712 27.6992-34.9184v-48.128c-0.0128-14.144-12.8896-26.8416-28.9408-35.648z" fill="#4D4D4D"></path>
          </svg>
        </template>
        联系客服
        <template #extra>
          <var-icon name="chevron-right" />
        </template>
      </var-cell>
      <var-cell border ripple v-if="false">
        <template #icon>
          <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="25" height="25">
            <path d="M662.272 605.0816m-179.0976 0a179.0976 179.0976 0 1 0 358.1952 0 179.0976 179.0976 0 1 0-358.1952 0Z" fill="#B0FFB4"></path>
            <path d="M553.4208 122.2144a388.2496 388.2496 0 0 0-387.84 387.84c0 11.1104 0.5632 22.1696 1.4848 33.1776L122.88 511.5904a35.84 35.84 0 0 0-41.6768 58.2656l120.5248 86.272a36.1984 36.1984 0 0 0 20.8896 6.656 35.4816 35.4816 0 0 0 29.44-15.36l78.4384-113.5104A35.84 35.84 0 1 0 271.36 493.056l-32.7168 47.3088c-0.9728-10.24-1.4848-20.1728-1.4848-30.3104A316.2112 316.2112 0 1 1 328.2432 732.16a35.84 35.84 0 0 0-51.2 50.2784 387.84 387.84 0 1 0 276.48-660.0192z" fill="#34332E"></path>
            <path d="M543.1808 285.6448a35.84 35.84 0 0 0-35.84 35.84v192.1536a35.84 35.84 0 0 0 15.36 29.3376l136.0896 95.4368a35.4816 35.4816 0 0 0 20.48 6.5024 35.84 35.84 0 0 0 20.48-65.1776l-120.7296-84.736V321.4848a35.84 35.84 0 0 0-35.84-35.84z" fill="#34332E"></path>
        </svg>
        </template>
        播放记录
        <template #extra>
          <var-icon name="chevron-right" />
        </template>
      </var-cell>
      <var-cell border ripple @click="goShare">
        <template #icon>
          <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="25" height="25">
            <path d="M648.704 170.496H375.296C281.6 170.496 204.8 247.296 204.8 341.504v341.504c0 93.696 76.8 170.496 170.496 170.496h272.896c93.696 0 170.496-76.8 170.496-170.496V341.504c0.512-94.208-76.288-171.008-169.984-171.008z" fill="#CCDAFF"></path>
            <path d="M384 333.312h85.504c13.824 0 25.6 11.776 25.6 25.6 0 14.336-11.776 25.6-25.6 25.6H384c-13.824 0-25.6-11.264-25.6-25.6s11.776-25.6 25.6-25.6zM640 690.688H384c-13.824 0-25.6-11.776-25.6-25.6 0-14.336 11.776-25.6 25.6-25.6h256c13.824 0 25.6 11.264 25.6 25.6s-11.776 25.6-25.6 25.6zM640 537.088H384c-13.824 0-25.6-11.776-25.6-25.6 0-14.336 11.776-25.6 25.6-25.6h256c13.824 0 25.6 11.264 25.6 25.6s-11.776 25.6-25.6 25.6z" fill="#7A7AF9"></path>
          </svg>
        </template>
        推广记录
        <template #extra>
          <var-icon name="chevron-right" />
        </template>
      </var-cell>
      <var-cell border ripple @click="goXiuche">
        <template #icon>
          <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="25" height="25"><path d="M161.28 478.72c12.8 5.12 25.6 15.36 35.84 23.04 5.12 5.12 51.2 87.04 76.8 120.32 58.88 74.24 135.68 115.2 240.64 115.2 104.96 0 181.76-43.52 240.64-115.2 25.6-33.28 74.24-115.2 76.8-120.32 10.24-10.24 23.04-17.92 35.84-23.04-25.6-12.8-43.52-25.6-53.76-33.28l-107.52-89.6c-51.2-43.52-99.84-46.08-156.16-5.12L512 381.44l-38.4-30.72c-53.76-40.96-102.4-38.4-156.16 5.12l-107.52 92.16c-5.12 5.12-23.04 15.36-48.64 30.72z m378.88-151.04c64-48.64 125.44-46.08 186.88 5.12l107.52 89.6c10.24 7.68 35.84 23.04 74.24 43.52l33.28 15.36-35.84 7.68c-20.48 5.12-38.4 15.36-53.76 28.16 0 0-46.08 81.92-74.24 117.76-64 79.36-148.48 125.44-261.12 125.44-112.64 0-197.12-46.08-261.12-125.44-30.72-30.72-76.8-112.64-76.8-112.64-15.36-15.36-33.28-23.04-53.76-28.16L89.6 486.4l33.28-15.36c38.4-20.48 64-33.28 74.24-43.52l107.52-92.16c61.44-51.2 122.88-53.76 186.88-5.12l23.04 17.92 25.6-20.48z m-184.32 174.08c94.72 58.88 215.04 58.88 309.76 0-94.72-53.76-212.48-53.76-309.76 0z m343.04 10.24c-112.64 79.36-261.12 79.36-373.76 0l-15.36-10.24 15.36-10.24c112.64-74.24 258.56-74.24 371.2 0l15.36 10.24-12.8 10.24z" fill="#222222"></path><path d="M161.28 478.72c25.6-12.8 43.52-23.04 53.76-33.28l107.52-92.16c51.2-43.52 99.84-46.08 156.16-5.12l38.4 30.72 38.4-30.72c53.76-40.96 102.4-38.4 156.16 5.12l107.52 89.6c10.24 7.68 28.16 17.92 53.76 33.28-12.8 5.12-25.6 15.36-35.84 23.04-5.12 5.12-51.2 87.04-76.8 120.32-58.88 74.24-135.68 115.2-240.64 115.2-104.96 0-181.76-43.52-240.64-115.2-25.6-33.28-74.24-115.2-76.8-120.32-17.92-7.68-28.16-15.36-40.96-20.48z m537.6 33.28l15.36-10.24-15.36-10.24c-112.64-74.24-258.56-74.24-371.2 0l-15.36 10.24 15.36 10.24c110.08 79.36 258.56 79.36 371.2 0z" fill="#F23030"></path></svg>
        </template>
        <span class="colorful-text">修车网</span>
        <template #extra>
          <var-icon name="chevron-right" />
        </template>
      </var-cell>
      <var-cell border ripple @click="goSetting">
        <template #icon>
          <svg t="1749648306624" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="74974" width="25" height="25"><path d="M740.55 359l-43.43-114.68L606.21 267a232 232 0 0 0-27.69-28.18l28.58-90.29-111.83-50.39-50.9 84.8c-11-0.88-21.26 1-32.37 1.68l-46.47-84-114 45.3 24 93.44c-8 6.72-15.82 12.89-22.73 20.51L153.63 228l-50.51 111.59 89.6 53.7a233.81 233.81 0 0 0-1.18 29.39L99 470.75l43.4 114.68 98.8-24.65a232.93 232.93 0 0 0 21.71 24.1l-30.51 96.31 111.82 50.42 49.82-83c15.11 2.09 32.72 8.31 48.19 7.36l45.86 85 114-45.3-24.91-92.88c8.53-7 15.36-17.39 22.73-25.44l86.72 26.23 50.12-112.48L658.7 444a234.23 234.23 0 0 0 1-42.74z m-211 16.24a111.66 111.66 0 1 1-145-62.52 111.64 111.64 0 0 1 145.01 62.55z" fill="#246ACE" p-id="74975"></path><path d="M807.24 895.72l69.45-60.52L837 777.1a174.36 174.36 0 0 0 12.62-26.85l71-3.45 6.38-91.91-73-13.71c-2.24-8-6.25-14.72-9.63-22.36l47-54.66-61.65-68.45L770.19 537c-6.81-3.85-13.2-7.78-20.37-10.66l-3.48-78.18-91.77-6.45-14.43 77.12a176.31 176.31 0 0 0-21 6.84l-58-52.65-69.44 60.49 43.15 63.15a174.72 174.72 0 0 0-11.31 21.58l-75.79 3.67-6.32 91.91 71.44 13.43c2.48 11.19 2.69 25.22 7.4 35.86l-47.93 54.5L534 886.07l58.92-41.79c7.18 4.17 16.26 6.28 23.85 9.37l4.16 67.92 92.33 5.94 12.83-67.27a175.86 175.86 0 0 0 30.36-10.47z m-66.5-144.35a83.86 83.86 0 1 1 6.19-118.44 83.87 83.87 0 0 1-6.19 118.44z" fill="#FFB612" p-id="74976"></path></svg>
        </template>
        设置
        <template #extra>
          <var-icon name="chevron-right" />
        </template>
      </var-cell>
    </div>
    <vip-comparison-modal v-model:show="showVipComparison" />
    <qr-certificate v-model:show="showQrCertificate" />
  </div>
</template>

<style lang="less" scoped>
.profile {
  --profile-header-height: 175px;
  padding-top: calc(var(--profile-header-height));
  :deep(.var-app-bar) {
    border-radius: 0 0 16px 16px;
    overflow: hidden;
    .var-app-bar__toolbar {
      display: none;
    }
  }
}
/* VIP头像样式 */
.vip-avatar {
  position: relative;
  z-index: 1;
  border-radius: 50%;
  box-shadow: 0 0 0 3px #fff, 
              0 0 0 5px transparent;
  animation: pulse-gold 2s infinite;
  
  &::before {
    content: "";
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    border-radius: 50%;
    background: linear-gradient(45deg, 
      #ffe259, #ffa751, #ffcc33, #ffd700, 
      #f8b500, #ffcc33, #ffa751, #ffe259);
    background-size: 400% 400%;
    z-index: -1;
    animation: gradient-rotate 3s ease infinite;
    box-shadow: 
      0 0 10px #ffd700,
      0 0 20px rgba(255, 215, 0, 0.5),
      inset 0 0 6px rgba(255, 255, 255, 0.8);
  }
}

/* 边框渐变动画 */
@keyframes gradient-rotate {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* 脉冲光效果 */
@keyframes pulse-gold {
  0% {
    box-shadow: 0 0 0 3px #fff, 0 0 0 5px rgba(255, 215, 0, 0.7);
  }
  70% {
    box-shadow: 0 0 0 3px #fff, 0 0 0 8px rgba(255, 215, 0, 0.3);
  }
  100% {
    box-shadow: 0 0 0 3px #fff, 0 0 0 5px rgba(255, 215, 0, 0.7);
  }
}
</style>
