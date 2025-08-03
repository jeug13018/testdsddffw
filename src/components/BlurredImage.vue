<template>
  <div
    class="blurred-image-container"
    :style="isMobile ? {
      filter: `blur(${blurAmount}px)`,
      WebkitFilter: `blur(${blurAmount}px)` // 为 Safari 添加前缀
    } : {}"
    ref="containerRef"
  >
    <!-- 隐藏的图片用于加载 -->
    <img 
      :src="imageUrl" 
      @load="handleImageLoaded" 
      class="hidden" 
      ref="imageRef"
      alt="预加载图片"
    />
    <!-- 显示模糊效果的Canvas -->
    <canvas 
      ref="canvasRef"
      class="w-full h-full"
    ></canvas>
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-indicator">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';

// 定义组件接收的属性
const props = withDefaults(defineProps<{
  /** 图片URL */
  imageUrl: string;
  /** 模糊程度 (px) */
  blurAmount?: number;
  /** object-fit 样式 */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  /** 容器高度 */
  height?: string | number;
  /** 容器宽度 */
  width?: string | number;
}>(), {
  // 设置默认值
  blurAmount: 3,
  objectFit: 'contain'
});

// 引用DOM元素
const imageRef = ref<HTMLImageElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);
const loading = ref(true);

// 检测设备类型
const isMobile = ref(false);
const detectMobileDevice = () => {
  const userAgent = navigator.userAgent || navigator.vendor;
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  isMobile.value = mobileRegex.test(userAgent);
};

// 处理图片加载完成事件
const handleImageLoaded = async () => {
  if (!imageRef.value || !canvasRef.value) return;
  
  // 等待下一个DOM更新周期
  await nextTick();
  
  const img = imageRef.value;
  const canvas = canvasRef.value;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return;
  
  // 设置canvas尺寸以适应容器
  if (containerRef.value) {
    canvas.width = containerRef.value.clientWidth;
    canvas.height = containerRef.value.clientHeight;
  }
  
  // 应用模糊效果
  ctx.filter = `blur(${props.blurAmount}px)`;
  
  // 根据object-fit绘制图片，只显示90%的高度
  const drawHeight = img.height * 0.9; // 90%的高度
  
  // 根据不同的objectFit绘制
  switch (props.objectFit) {
    case 'cover':
      drawImageCover(ctx, img, 0, 0, canvas.width, canvas.height, drawHeight);
      break;
    case 'contain':
      drawImageContain(ctx, img, 0, 0, canvas.width, canvas.height, drawHeight);
      break;
    case 'fill':
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      break;
    case 'scale-down':
      drawImageScaleDown(ctx, img, 0, 0, canvas.width, canvas.height, drawHeight);
      break;
    case 'none':
    default:
      // 居中显示
      // eslint-disable-next-line no-case-declarations
      const x = (canvas.width - img.width) / 2;
      // eslint-disable-next-line no-case-declarations
      const y = (canvas.height - drawHeight) / 2;
      ctx.drawImage(img, 0, 0, img.width, drawHeight, x, y, img.width, drawHeight);
      break;
  }
  
  loading.value = false;
};

// 实现cover效果
const drawImageCover = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number, drawHeight: number) => {
  // 计算宽高比
  const imgRatio = img.width / drawHeight;
  const containerRatio = w / h;
  
  let drawWidth = img.width;
  let sx = 0;
  let sy = 0;
  let sWidth = img.width;
  let sHeight = drawHeight;
  
  // 根据宽高比裁剪
  if (imgRatio > containerRatio) {
    drawWidth = drawHeight * containerRatio;
    sx = (img.width - drawWidth) / 2;
    sWidth = drawWidth;
  }
  
  ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
};

// 实现contain效果
const drawImageContain = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number, drawHeight: number) => {
  const imgRatio = img.width / drawHeight;
  const containerRatio = w / h;
  
  let newWidth, newHeight;
  
  if (imgRatio > containerRatio) {
    newWidth = w;
    newHeight = w / imgRatio;
  } else {
    newHeight = h;
    newWidth = h * imgRatio;
  }
  
  const cx = x + (w - newWidth) / 2;
  const cy = y + (h - newHeight) / 2;
  
  ctx.drawImage(img, 0, 0, img.width, drawHeight, cx, cy, newWidth, newHeight);
};

// 实现scale-down效果
const drawImageScaleDown = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number, drawHeight: number) => {
  if (img.width <= w && drawHeight <= h) {
    // 如果图像尺寸小于容器，以原始尺寸显示（类似于none）
    const cx = x + (w - img.width) / 2;
    const cy = y + (h - drawHeight) / 2;
    ctx.drawImage(img, 0, 0, img.width, drawHeight, cx, cy, img.width, drawHeight);
  } else {
    // 否则，使用contain逻辑
    drawImageContain(ctx, img, x, y, w, h, drawHeight);
  }
};

// 当属性变化时重新渲染
watch(() => props.imageUrl, () => {
  loading.value = true;
  if (imageRef.value) {
    imageRef.value.src = props.imageUrl;
  }
});

watch(() => props.blurAmount, () => {
  if (imageRef.value) handleImageLoaded();
});

watch(() => props.objectFit, () => {
  if (imageRef.value) handleImageLoaded();
});

// 处理窗口大小变化
const handleResize = () => {
  if (imageRef.value) handleImageLoaded();
};

onMounted(() => {
  // 检测设备类型
  detectMobileDevice();
  window.addEventListener('resize', handleResize);
});

// 清理事件监听
onMounted(() => {
  return () => {
    window.removeEventListener('resize', handleResize);
  };
});
</script>

<style scoped>
.blurred-image-container {
  position: relative;
  width: v-bind('props.width ? (typeof props.width === "number" ? props.width + "px" : props.width) : "100%"');
  height: v-bind('props.height ? (typeof props.height === "number" ? props.height + "px" : props.height) : "100%"');
  overflow: hidden;
}

.hidden {
  position: absolute;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.loading-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>