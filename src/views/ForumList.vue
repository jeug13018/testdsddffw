<template>
  <div class="p-4 max-w-3xl mx-auto z-10">
    <div class="mb-2 bg-white rounded-lg shadow-sm border p-4">
      <div class="mb-2 font-semibold text-sm text-neutral-800">公告</div>
      <div class="space-y-1">
        <div class="flex items-start gap-3 p-1 rounded hover:bg-neutral-50 cursor-pointer" @click="antiFraudGuideStore.isAntiFraudGuideModalOpen = true">
          <div class="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
          <div class="flex-1 min-w-0 flex items-center justify-between">
            <div class="text-sm font-medium text-neutral-800 mb-1">防骗指南！必看！！！👈🏻</div>
            <div class="text-xs text-neutral-500">2021-05-08</div>
          </div>
        </div>
        <div class="flex items-start gap-3 p-1 rounded hover:bg-neutral-50 cursor-pointer" @click="joinTGChannel">
          <div class="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
          <div class="flex-1 min-w-0 flex items-center justify-between">
            <div class="text-sm font-medium text-neutral-800 mb-1">加入电报群【信息更及时准确】</div>
            <div class="text-xs text-neutral-500">2021-06-17</div>
          </div>
        </div>
        <div class="flex items-start gap-3 p-1 rounded hover:bg-neutral-50 cursor-pointer" @click="qaStore.isQaModalOpen = true">
          <div class="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
          <div class="flex-1 min-w-0 flex items-center justify-between">
            <div class="text-sm font-medium text-neutral-800 mb-1">常见问题解答</div>
            <div class="text-xs text-neutral-500">2024-03-14</div>
          </div>
        </div>
      </div>
    </div>
    <div class="mb-4">
      <!-- 类型部分 -->
      <div class="mb-2 font-semibold text-sm">类型</div>
      <div class="flex gap-2 flex-wrap mb-2">
        <!-- 类型骨架屏 -->
        <template v-if="isTypesLoading">
          <Skeleton v-for="i in 3" :key="i" class="h-8 w-16 rounded" />
        </template>
        <!-- 实际类型按钮 -->
        <template v-else>
          <button
            v-for="type in types"
            :key="type"
            @click="onTypeChange(type)"
            :class="[
              'px-3 py-1 rounded text-xs',
              selectedType === type ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-700'
            ]"
          >
            {{ type }}
          </button>
        </template>
      </div>
      <!-- 城市部分 -->
      <div class="mb-2 font-semibold text-sm">城市</div>
      <div class="flex gap-2 flex-wrap mb-2">
        <!-- 城市骨架屏 -->
        <template v-if="isAddressLoading">
          <Skeleton class="h-8 w-16 rounded" />
          <Skeleton class="h-8 w-24 rounded" />
        </template>
        <!-- 实际城市按钮 -->
        <template v-else>
          <button class="px-3 py-1 rounded text-xs bg-neutral-800 text-white">
            {{ selectedCity || '全国' }}
          </button>
          <button
            v-if="!showAllCities"
            class="px-3 py-1 rounded text-xs bg-blue-100 text-blue-700 border border-blue-200"
            @click="showAllCities = true"
          >
            更多城市
          </button>
          <button
            v-if="showAllCities"
            class="px-3 py-1 rounded text-xs bg-blue-100 text-blue-700 border border-blue-200"
            @click="showAllCities = false"
          >
            收起
          </button>
        </template>
      </div>
      <!-- <div v-if="showAllCities" class="max-h-96 overflow-y-auto border rounded p-2 bg-white shadow"> -->
      <div v-if="showAllCities" class="border rounded p-2 bg-white shadow">
        <div v-for="(cities, province) in provinceCityMap" :key="province" class="mb-3">
          <div 
            class="font-semibold text-neutral-700 mb-2 cursor-pointer hover:bg-neutral-50 p-2 rounded"
            @click="province === '全国' ? onCityChange('全国') : toggleProvince(province)"
          >
            <span class="mr-2" v-if="province !== '全国'">{{ expandedProvinces.includes(province) ? '▼' : '▶' }}</span>
            <span class="mr-2" v-else>🌎</span>
            {{ province }}
          </div>
          <div v-if="expandedProvinces.includes(province)" class="flex gap-2 flex-wrap ml-6">
            <button
              @click="onCityChange(province)"
              :class="[
                'px-3 py-1 rounded text-xs',
                selectedCity === province + '_全部' ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-700'
              ]"
            >
              全部
            </button>
            <button
              v-for="city in cities"
              :key="city"
              @click="onAreaChange(province, city)"
              :class="[
                'px-3 py-1 rounded text-xs',
                selectedCity === city ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-700'
              ]"
            >
              {{ city }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- 骨架屏加载状态 -->
    <template v-if="isPostsLoading">
      <div class="grid gap-4">
        <div v-for="i in 5" :key="i" class="bg-white rounded shadow-sm py-4 px-3">
          <div class="flex items-center justify-between">
            <div style="flex: 1;">
              <Skeleton class="h-5 w-3/4 mb-2" />
              <div class="flex items-center gap-2 mb-2">
                <Skeleton class="h-4 w-24" />
                <Skeleton class="h-4 w-32" />
              </div>
              <Skeleton class="h-4 w-full mb-1" />
              <Skeleton class="h-4 w-2/3" />
            </div>
            <div class="w-[96px] h-[96px] flex-shrink-0">
              <Skeleton class="h-full w-full" />
            </div>
          </div>
        </div>
      </div>
    </template>
    <div class="grid gap-4" v-else-if="posts.length > 0">
      <div
        v-for="post in posts"
        :key="post.id"
        class="flex items-center justify-between bg-white rounded shadow-sm py-4 px-3 transition-all hover:bg-accent bg-muted cursor-pointer relative"
        @click="goDetail(post.id)"
      >
        <div 
          class="absolute top-0 right-0 px-2 text-xs font-medium shadow-sm"
          style="border-radius: 0px 4px 0px 8px;" 
          :class="{
            'bg-red-500 text-white': post.type !== '站街',
            'bg-blue-500 text-white': post.type === '站街'
          }"
        >
          {{ post.type }}
        </div>
        <div class="flex flex-col justify-between h-full" style="flex: 1;">
          <div class="font-bold text-sm max-w-full block" style="display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;">
            {{ post.title }}
          </div>
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs">{{ post.province }}<span v-if="post.city"> · {{ post.city }}</span> </span>
            <span class="px-2 py-0.5 rounded bg-gray-100 text-gray-500 text-xs truncate">{{ formatSmartTime(post.create_time) }}</span>
          </div>
          <div class="text-neutral-500 text-xs max-w-full line-clamp-2" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">{{ post.content }}</div>
        </div>
        <div class="w-[96px] h-[96px] rounded overflow-hidden flex-shrink-0">
          <BlurredImage
            v-if="post.show_image"
            :imageUrl="post.show_image"
            height="100%"
            width="100%"
          />
          <div v-else class="text-neutral-400 text-xs">无图</div>
        </div>
      </div>
      <Pagination v-slot="{ page }" :items-per-page="pageSize" :total="total" :showEdges="true" :siblingCount="1" :default-page="current" @update:page="updatePage" class="text-sm">
        <PaginationContent v-slot="{ items }">
          <PaginationPrevious class="text-xs h-8">上一页</PaginationPrevious>

          <template v-for="(item, index) in items" :key="index">
            <PaginationItem
              v-if="item.type === 'page'"
              :value="item.value"
              :is-active="item.value === page"
              class="h-8 w-8 text-xs"
            >
              {{ item.value }}
            </PaginationItem>
          </template>

          <!-- <PaginationEllipsis :index="4" class="h-8" /> -->

          <PaginationNext class="text-xs h-8">下一页</PaginationNext>
        </PaginationContent>
      </Pagination>
    </div>
    <div v-else class="flex items-center justify-center h-60 flex-col">
      <nodata width="96" height="96" />
      <div class="text-neutral-500 text-sm mt-2">暂无帖子</div>
    </div>
  </div>
</template>

<script lang="ts">
// 定义组件名称，用于 keep-alive
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'forum'
}
</script>

<script setup lang="ts">
// @ts-nocheck
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getPosts, getAddressList, getPostTypes } from '@/api/base'
import { TG_CHANNEL_URL } from '@/config'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import BlurredImage from '@/components/BlurredImage.vue';
import { useAntiFraudGuideStore } from '@/stores/antiFraudGuide'
import { useQaStore } from '@/stores/qa'
import nodata from '@/components/svg/nodata.vue'
import { formatSmartTime } from '@/utils/index'
import { toast } from 'vue-sonner'

const qaStore = useQaStore()
const antiFraudGuideStore = useAntiFraudGuideStore()
const router = useRouter()
// const hotCities = ['北京', '上海', '广州', '深圳', '杭州', '成都']
const types = ref([])
const provinceCityMap: Record<string, string[]> = {}
const selectedCity = ref('全国')
const selectedType = ref('')
const showAllCities = ref(false)
const expandedProvinces = ref<string[]>([])
const isTypesLoading = ref(false)
const isAddressLoading = ref(false)
const isPostsLoading = ref(false)
const current = ref(1)
const pageSize = ref(10)
const total = ref(0)
const posts = ref([])

onMounted(() => {
  fetchPostTypes()
  fetchAddressList()
  fetchPosts()
})

// 获取帖子类型
async function fetchPostTypes() {
  isTypesLoading.value = true
  try {
    const response = await getPostTypes()
    types.value = response || []
    types.value.unshift('全部') // 添加“全部”选项
    selectedType.value = types.value[0] || ''
  } catch (error) {
    toast.error(error?.response?.data?.message || '获取帖子类型失败')
  } finally {
    isTypesLoading.value = false
  }
}

// 获取地址
async function fetchAddressList() {
  isAddressLoading.value = true
  try {
    const response = await getAddressList()
    response.forEach(item => {
      provinceCityMap['全国'] = ['全国']
      if (item.province) {
        provinceCityMap[item.province] = item.cities || [item.province]
      }
    })
  } catch (error) {
    toast.error(error?.response?.data?.message || '获取地址列表失败')
  } finally {
    isAddressLoading.value = false
  }
}

function updatePage(page) {
  current.value = page
  fetchPosts()
}

// 获取帖子列表
async function fetchPosts() {
  isPostsLoading.value = true
  try {
    const params = {
      page: current.value,
      pageSize: pageSize.value,
    }
    if (selectedType.value && selectedType.value !== '全部') {
      params.type = selectedType.value
    }
    if (selectedCity.value && selectedCity.value !== '全国') {
      const [province, city] = selectedCity.value.split('_')
      params.province = province
      if (city && city !== '全部') {
        params.city = city
      }
    }
    const response = await getPosts(params)
    posts.value = response.list || []
    total.value = response.total || 0
    // 滚动到页面顶部
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // 使用平滑滚动效果
    })
  } catch (error) {
    toast.error(error?.response?.data?.message || '获取帖子列表失败')
  } finally {
    isPostsLoading.value = false
  }
}

// 类型变化
function onTypeChange(type: string) {
  selectedType.value = type
  current.value = 1
  fetchPosts()
}

// 城市变化(选择了全部城市)
function onCityChange(city: string) {
  if (city === '全国') {
    selectedCity.value = city;
  } else {
    selectedCity.value = city + '_全部';
  }
  showAllCities.value = false
  current.value = 1
  fetchPosts()
}

// 区域变化
function onAreaChange(city, area) {
  selectedCity.value = city + '_' + area;
  showAllCities.value = false
  current.value = 1
  fetchPosts()
}

// 加入tg频道
function joinTGChannel() {
  window.open(TG_CHANNEL_URL, '_blank')
}

function toggleProvince(province: string) {
  const index = expandedProvinces.value.indexOf(province)
  if (index > -1) {
    expandedProvinces.value.splice(index, 1)
  } else {
    expandedProvinces.value.push(province)
  }
}

function goDetail(id: number) {
  router.push({ name: 'post-detail', params: { id } })
}
</script> 