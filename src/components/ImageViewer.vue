<template>
  <Teleport to="body">
    <div v-if="visible" class="image-viewer-container">
      <!-- 顶部操作栏 -->
      <div class="image-viewer-header">
        <div class="image-count">{{ currentIndex + 1 }} / {{ images.length }}</div>
        <div class="close-button" @click="close">×</div>
      </div>
  
      <!-- 图片展示区 -->
      <div class="image-viewer-content">
        <!-- 图片轮播 -->
        <div class="image-carousel" ref="carouselRef">
          <div 
            v-for="(image, index) in images" 
            :key="index"
            class="carousel-item"
            :class="{ active: currentIndex === index }"
          >
            <BlurredImage
              :image-url="image.url"
              :blurAmount="blurAmount"
              height="100%"
              width="100%"
            />
          </div>
        </div>
        
        <!-- 左右箭头 -->
        <div 
          v-if="images.length > 1" 
          class="arrow arrow-left" 
          @click="prev"
        >
          <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M778.965749 128.759549l-383.064442 383.063419 388.097062 388.096039-0.070608 0.033769c12.709463 13.137205 20.529569 31.024597 20.529569 50.731428 0 40.376593-32.736589 73.112158-73.115228 73.112158-19.705807 0-37.591153-7.819083-50.730405-20.528546l-0.034792 0.035816L241.890654 564.622498l0.035816-0.035816c-13.779841-13.281491-22.3838-31.915897-22.3838-52.585659 0-0.071631 0-0.106424 0-0.178055 0-0.072655 0-0.10847 0-0.144286 0-20.669762 8.603959-39.341007 22.3838-52.622498l-0.035816-0.034792L680.573835 20.337187l0.180102 0.179079c13.139252-12.5662 30.950919-20.313651 50.587142-20.313651 40.378639 0 73.115228 32.736589 73.115228 73.114205C804.455283 95.485725 794.567076 115.334795 778.965749 128.759549z" fill="#ffffff"></path></svg>
        </div>
        <div 
          v-if="images.length > 1" 
          class="arrow arrow-right" 
          @click="next"
        >
          <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" style="transform: scaleX(-1);"><path d="M778.965749 128.759549l-383.064442 383.063419 388.097062 388.096039-0.070608 0.033769c12.709463 13.137205 20.529569 31.024597 20.529569 50.731428 0 40.376593-32.736589 73.112158-73.115228 73.112158-19.705807 0-37.591153-7.819083-50.730405-20.528546l-0.034792 0.035816L241.890654 564.622498l0.035816-0.035816c-13.779841-13.281491-22.3838-31.915897-22.3838-52.585659 0-0.071631 0-0.106424 0-0.178055 0-0.072655 0-0.10847 0-0.144286 0-20.669762 8.603959-39.341007 22.3838-52.622498l-0.035816-0.034792L680.573835 20.337187l0.180102 0.179079c13.139252-12.5662 30.950919-20.313651 50.587142-20.313651 40.378639 0 73.115228 32.736589 73.115228 73.114205C804.455283 95.485725 794.567076 115.334795 778.965749 128.759549z" fill="#ffffff"></path></svg>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import BlurredImage from './BlurredImage.vue';

// 定义组件接收的属性
const props = withDefaults(defineProps<{
  /** 图片数组 */
  images: Array<{ url: string; [key: string]: any }>;
  /** 初始展示的图片索引 */
  initialIndex?: number;
  /** 是否显示图片查看器 */
  visible: boolean;
  blurAmount?: number;
}>(), {
  // 设置默认值
  blurAmount: 5,
});

// 定义事件
const emit = defineEmits<{
  /** 关闭查看器事件 */
  (e: 'update:visible', value: boolean): void;
  /** 图片切换事件 */
  (e: 'change', index: number): void;
}>();

// 当前显示的图片索引
const currentIndex = ref(props.initialIndex || 0);

// 轮播容器引用
const carouselRef = ref<HTMLDivElement | null>(null);

// 初始化时设置当前索引
watch(() => props.initialIndex, (newVal) => {
  if (newVal !== undefined) {
    currentIndex.value = newVal;
  }
});

// 监听可见性变化
watch(() => props.visible, (newVal) => {
  if (newVal) {
    // 打开时锁定滚动
    document.body.style.overflow = 'hidden';
  } else {
    // 关闭时恢复滚动
    document.body.style.overflow = '';
  }
});

// 关闭查看器
const close = () => {
  emit('update:visible', false);
};

// 下一张图片
const next = () => {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++;
  } else {
    currentIndex.value = 0; // 循环到第一张
  }
  emit('change', currentIndex.value);
};

// 上一张图片
const prev = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  } else {
    currentIndex.value = props.images.length - 1; // 循环到最后一张
  }
  emit('change', currentIndex.value);
};

// 键盘事件处理
const handleKeyDown = (e: KeyboardEvent) => {
  if (!props.visible) return;
  
  switch (e.key) {
    case 'ArrowRight':
      next();
      break;
    case 'ArrowLeft':
      prev();
      break;
    case 'Escape':
      close();
      break;
  }
};

// 触摸相关变量和处理方法
let touchStartX = 0;
let touchEndX = 0;

const handleTouchStart = (e: TouchEvent) => {
  touchStartX = e.touches[0].clientX;
};

const handleTouchEnd = (e: TouchEvent) => {
  touchEndX = e.changedTouches[0].clientX;
  
  // 计算滑动距离
  const diffX = touchEndX - touchStartX;
  
  // 判断滑动方向并触发相应操作
  if (Math.abs(diffX) > 50) { // 滑动距离超过50px才触发
    if (diffX > 0) {
      prev(); // 向右滑动，显示上一张
    } else {
      next(); // 向左滑动，显示下一张
    }
  }
};

onMounted(() => {
  // 添加键盘事件监听
  window.addEventListener('keydown', handleKeyDown);
  
  // 添加触摸事件监听
  if (carouselRef.value) {
    carouselRef.value.addEventListener('touchstart', handleTouchStart);
    carouselRef.value.addEventListener('touchend', handleTouchEnd);
  }
  
  // 如果一开始就是可见的，锁定滚动
  if (props.visible) {
    document.body.style.overflow = 'hidden';
  }
});

onBeforeUnmount(() => {
  // 移除事件监听
  window.removeEventListener('keydown', handleKeyDown);
  
  if (carouselRef.value) {
    carouselRef.value.removeEventListener('touchstart', handleTouchStart);
    carouselRef.value.removeEventListener('touchend', handleTouchEnd);
  }
  
  // 恢复滚动
  document.body.style.overflow = '';
});
</script>

<style scoped>
.image-viewer-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  user-select: none;
}

.image-viewer-header {
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  color: white;
}

.image-count {
  font-size: 16px;
}

.close-button {
  font-size: 30px;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.close-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.image-viewer-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.image-carousel {
  width: 100%;
  height: 100%;
}

.carousel-item {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.carousel-item.active {
  opacity: 1;
  z-index: 1;
  pointer-events: all;
}

.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  z-index: 2;
  transition: background-color 0.3s;
}

.arrow:hover {
  background-color: rgba(0, 0, 0, 0.8);
}

.arrow-left {
  left: 20px;
}

.arrow-right {
  right: 20px;
}
</style>