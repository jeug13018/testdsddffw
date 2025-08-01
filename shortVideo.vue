<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from "vue";
import { useGlobalStore } from "@/stores/useGlobalStore";
import { Snackbar } from "@varlet/ui";
import { getShortVideoList } from "@/apis/home";
import { isVip as _isVipFetch } from "@/apis/base";
import { getHsckzy } from "@/apis/hsckzy";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import router from '@/router'

// 定义组件名称
defineOptions({
  name: "ShortVideo",
});

const store = useGlobalStore();
const userStore = useUserStore();
const { isShowLoginDialog, loginCallback } = storeToRefs(store);
const { userInfo } = storeToRefs(userStore);

let swiperInstance = null;
const videoList = ref([]);
const swiperRef = ref(null);
// 视频实例映射对象
const videoInstances = {};
const loading = ref(false);
const page = ref(1);
const hasNextPage = ref(true);
const isMuted = ref(true);
// 重试次数
let retryCount = 0;
const maxRetryCount = 3; // 最大重试次数
// 添加视频计数器
const videoViewCount = ref(0);

// 添加 tab 相关的状态
const activeTab = ref('free'); // 默认选中免费专区
const tabOptions = [
  { key: 'free', label: '免费专区' },
  { key: 'vip', label: 'VIP专区' }
];

const videoPlayerConfig = {
  autoplay: true, // 自动播放
  controls: false, // 显示控制栏
  // responsive: true, // 响应式
  // poster: videoDetail.value?.image,
  // 循环播放
  loop: true,
  preload: "auto", // 预加载
  muted: isMuted.value, // 静音
  playsinline: true, // 行内播放
  fluid: true,
  html5: {
    vhs: {
      overrideNative: true, // 覆盖原生播放器
      // withCredentials: false, // 跨域设置
      // enableLowInitialPlaylist: false, // 从最低质量开始
      limitRenditionByPlayerDimensions: false, // 根据播放器尺寸限制清晰度
      smoothQualityChange: true, // 平滑切换清晰度
      // handleManifestRedirects: true, // 处理重定向
    },
    nativeVideoAttributes: {
      referrerpolicy: 'no-referrer'
    },
    nativeAudioTracks: false, // 禁用原生音频轨道
    nativeVideoTracks: false, // 禁用原生视频轨道
  },
  sources: [], // 视频源
};

const showLoginPopup = ref(false);

// 切换 tab
const switchTab = (tab) => {
  // 正在加载中就不执行
  if (loading.value) {
    Snackbar.warning("正在加载中，请稍后再试");
    return;
  }
  if (tab !== activeTab.value) {
    activeTab.value = tab;
    // 切换 tab 后重新加载视频数据
    reloadVideos();
  }
};

// 销毁数据
const destroyData = () => {
  // 清空当前视频列表
  videoList.value = [];
  // 重置页码
  page.value = 1;
  // 重置是否有下一页
  hasNextPage.value = true;
  // 销毁当前所有视频实例
  destroyVideoInstances();

  // 移除全局播放/暂停点击处理函数
  delete window.handlePlayPauseClick;
  
  // 如果 Swiper 已经初始化，则销毁并重新创建
  if (swiperInstance) {
    swiperInstance.destroy();
    swiperInstance = null;
  }

  // 把swiper-wrapper的内容清空
  const swiperWrapper = swiperRef.value.querySelector('.swiper-wrapper');
  if (swiperWrapper) {
    swiperWrapper.innerHTML = '';
  }
}

// 重新加载视频数据
const reloadVideos = () => {
  // 正在加载中就不执行
  if (loading.value) {
    Snackbar.warning("正在加载中，请稍后再试");
    return;
  }
  destroyData();

  if (activeTab.value === 'vip') {
    getVipVideos();
  } else {
    // 重新获取免费专区
    getFreeVideos();
  }
};

const fetchFreeVideoList = async () => {
  // 如果正在加载或已经没有更多数据，则不执行
  if (loading.value || !hasNextPage.value) return;

  // 设置加载状态为true
  loading.value = true;

  try {

    // 调用API获取数据
    const response = await getShortVideoList();

    // 处理API返回的数据
    if (response && Array.isArray(response)) {
      const formattedData = response
        .map((item) => {
          return {
            ...item,
            sources: [
              {
                src: item.videoUrl,
                type: "video/mp4",
              }
            ],
          };
        })

      videoList.value.push(...formattedData);

      // 更新hasNextPage状态
      // hasNextPage.value = response.hasNextPage;

      // 页码自增，为下次请求做准备
      // page.value += 1;

      // 更新Swiper虚拟滚动的slides
      if (swiperInstance && swiperInstance.virtual) {
        swiperInstance.virtual.slides = videoList.value;
        // swiperInstance.updateSlides();
      }

      // 设置加载状态为false
      loading.value = false;

      if (checkLoadMore() && retryCount < maxRetryCount) {
        // 如果当前索引接近最后两个索引，则加载更多数据
        console.log("加载更多数据");
        retryCount++;
        fetchFreeVideoList();
      } else {
        retryCount = 0; // 重置重试次数
      }
    } else {
      Snackbar.error("获取视频数据失败，请稍后再试");
    }
  } catch (error) {
    console.error("获取视频列表失败", error);
    Snackbar.error("网络异常，请稍后再试");
    // 无论成功失败，最后都设置加载状态为false
    loading.value = false;
  }
};

const fetchVipVideoList = async () => {
  // 如果正在加载或已经没有更多数据，则不执行
  if (loading.value || !hasNextPage.value) return;

  // 设置加载状态为true
  loading.value = true;

  try {

    // 调用API获取数据
    const response = await getHsckzy({
      t: 31,
      pg: page.value,
      pagesize: 10,
      ac: 'detail'
    });

    console.log("获取VIP视频列表", response);

    // 处理API返回的数据
    if (response && response.list && Array.isArray(response.list)) {
      const formattedData = response.list.map((item) => {
        // 数据是`"反差婊前台妹子轻松拿下，口交足交各种体位X爱自拍流出！！$https://hsm3.fhu3hh.com/20250728/9FP3JAcV/index.m3u8"`这样的，我需要按`$https://`分割来获取视频地址，然后根据视频地址后缀来确定是什么格式的视频
        const videoUrl = item.vod_play_url.split('$')[1];
        return {
          ...item,
          title: item.vod_name,
          thumbnailUrl: item.vod_pic,
          posterUrl: item.vod_pic,
          sources: [
            {
              src: videoUrl,
              type: videoUrl.endsWith('.mp4') ? 'video/mp4' : 'application/x-mpegURL',
            }
          ],
        };
        
      })

      videoList.value.push(...formattedData);

      // 更新hasNextPage状态
      hasNextPage.value = response.pagecount > page.value;

      // 页码自增，为下次请求做准备
      page.value += 1;

      // 更新Swiper虚拟滚动的slides
      if (swiperInstance && swiperInstance.virtual) {
        swiperInstance.virtual.slides = videoList.value;
        // swiperInstance.updateSlides();
      }

      // 设置加载状态为false
      loading.value = false;

      if (checkLoadMore() && retryCount < maxRetryCount) {
        // 如果当前索引接近最后两个索引，则加载更多数据
        console.log("加载更多数据");
        retryCount++;
        fetchVipVideoList();
      } else {
        retryCount = 0; // 重置重试次数
      }
    } else {
      Snackbar.error("获取视频数据失败，请稍后再试");
    }
  } catch (error) {
    console.error("获取视频列表失败", error);
    Snackbar.error("网络异常，请稍后再试");
    // 无论成功失败，最后都设置加载状态为false
    loading.value = false;
  }
};

const createVideoInstance = (index, config = {}) => {
  if (activeTab.value === 'vip' && !userInfo.value?.isBuyVip && !userInfo.value?.isVip) {
    // 如果是VIP专区但用户未购买VIP，则不创建视频实例
    console.warn("用户未购买VIP，无法创建视频实例");
    return;
  }
  let videoElement = document.getElementById(`video-${index}`);
  if (!videoElement) {
    // 如果没有找到视频元素，则创建一个新的
    const videoHtml = generateVideoJsHtml(index);
    const videoContainer = document.querySelector(
      `.video-wrap[data-index="${index}"]`
    );
    if (videoContainer) {
      console.log("创建视频元素", videoContainer);
      // 往容器中的前面插入视频元素
      videoContainer.insertAdjacentHTML("afterbegin", videoHtml);
      videoElement = document.getElementById(`video-${index}`);
    }
  }
  // console.log('创建视频实例', index, videoElement)
  // 合并公共配置和自定义配置
  config.sources = config.sources || toRaw(videoList.value[index].sources);
  const finalConfig = { ...videoPlayerConfig, ...config };
  console.log(finalConfig);
  videoInstances[index] = new window.videojs(videoElement, finalConfig);
  // 监听缓冲状态
  videoInstances[index].on("waiting", function () {
    console.log(`视频 ${index} waiting...`);
  });

  // 视频元数据已加载完成，现在可以获取视频时长、宽高等信息
  videoInstances[index].on("loadedmetadata", function () {
    console.log(
      `视频 ${index} 元数据已加载，视频时长:`,
      videoInstances[index].duration()
    );
    // 可以在这里获取视频时长等信息
    const duration = this.duration();
    const durationDisplay = document.getElementById(`duration-${index}`);
    if (durationDisplay) {
      durationDisplay.innerText = formatTime(duration);
    }
  });

  videoInstances[index].on("timeupdate", function () {
    // 可以用来更新进度条等UI
    const progress = (this.currentTime() / this.duration()) * 100;
    // console.log(`视频 ${index} 播放进度: ${progress.toFixed(2)}%`);
    const progressBar = document.getElementById(`progress-bar-${index}`);
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
    const currentTimeDisplay = document.getElementById(
      `current-time-${index}`
    );
    const durationDisplay = document.getElementById(`duration-${index}`);
    if (currentTimeDisplay && durationDisplay) {
      currentTimeDisplay.innerText = formatTime(this.currentTime());
      durationDisplay.innerText = formatTime(this.duration());
    }
  });

  videoInstances[index].on("ended", function () {
    console.log(`视频 ${index} 已播放完毕`);
    // 可以在这里添加视频结束后的逻辑，比如自动滑到下一个视频
  });

  // 视频已经缓冲到可以播放的程度
  videoInstances[index].on("loadeddata", function () {
    console.log(`视频 ${index} 已经缓冲到可以播放的程度`);
  });

  // 当浏览器正在下载视频数据时触发
  videoInstances[index].on("progress", function () {
    console.log(`视频 ${index} 正在下载视频数据`);
  });

  // 播放器卡住需要缓冲时触发
  videoInstances[index].on("stalled", function () {
    console.log(`视频 ${index} 播放器卡住了`);
  });

  // 监听网络状态变化
  videoInstances[index].on("suspend", function () {
    console.log(`视频 ${index} 媒体数据加载已暂停`);
  });

  videoInstances[index].on("abort", function () {
    console.log(`视频 ${index} 媒体数据下载已中止`);
  });
  // 当开始寻址操作时触发
  videoInstances[index].on("seeking", function () {
    console.log(`视频 ${index} 开始寻址`);
  });

  // 当视频寻址完成后触发
  videoInstances[index].on("seeked", function () {
    console.log(`视频 ${index} 已完成寻址`);
  });

  videoInstances[index].on("canplay", function () {
    console.log(`视频 ${index} 可以开始播放`);
  });

  // 监听播放状态
  videoInstances[index].on("playing", function () {
    console.log(`视频 ${index} 正在播放`);
    togglePlayButton(index, false);
  });

  // 监听暂停状态
  videoInstances[index].on("pause", function () {
    console.log(`视频 ${index} 已暂停`);
    togglePlayButton(index, true);
  });

  videoInstances[index].on("canplaythrough", function () {
    console.log(`视频 ${index} 可以流畅播放`);
  });

  // 添加错误监听
  videoInstances[index].on("error", function (e) {
    console.error(`视频 ${index} 播放器错误:`, videoInstances[index].error());
  });

  // 监听播放器准备就绪事件
  videoInstances[index].ready(() => {
    console.log(`视频 ${index} 播放器初始化完成`);

    // 监听 HLS 片段加载错误
    videoInstances[index].tech().on("mediaerror", function (e) {
      console.error(`视频 ${index} 媒体错误:`, e);
    });

    // 监听 HTTP 错误
    videoInstances[index].tech().on("xhr", function (event, data) {
      if (data.response && data.response.status >= 400) {
        console.error(
          `视频 ${index} HTTP 错误: ${data.response.status} - ${data.response.statusText}`
        );
      }
    });

    // 监听 videojs-http-streaming 的错误
    videoInstances[index].tech().on("error", function (event) {
      console.error(`视频 ${index} videojs-http-streaming 错误:`, event);
    });
  });
};

/**
 * 格式化时间为 mm:ss 格式
 * 
 * @param {number} seconds - 秒数
 * @returns {string} - 格式化后的时间字符串
 */
 const formatTime = (seconds) => {
  if (isNaN(seconds)) return '00:00'
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * 切换视频的播放/暂停状态
 *
 * @param {number} index - 视频索引
 */
const togglePlayPause = (index) => {
  const player = videoInstances[index];
  if (!player) return;

  if (player.paused()) {
    // 如果视频暂停，则播放
    player.play().catch((error) => {
      console.log("视频播放失败", error);
      // 显示播放按钮
      if (playPauseIcon) {
        playPauseIcon.style.display = "flex";
      }
    });
  } else {
    // 如果视频播放，则暂停
    player.pause();
  }
};

/**
 * 生成 video-js HTML 片段
 * @param {number} index - 视频索引
 * @returns {string} - 返回 video-js HTML 字符串
 */
const generateVideoJsHtml = (index) => {
  return `
    <video-js
      id="video-${index}" 
      width="100%"
      height="100%"
      poster="${videoList.value[index]?.posterUrl || ""}"
      x5-playsinline="true"
      playsinline="true"
      webkit-playsinline="true"
      x-webkit-airplay="true"
      x5-video-orientation="portraint"
      class="video-js"
      width="100%"
      preload="auto"
      data-setup="{}"
    >
    </video-js>
  `;
};

/**
 * 初始化Swiper
 * 创建Swiper实例并配置虚拟滑动和事件处理
 */
const initSwiper = () => {
  // 使用虚拟滚动的Swiper
  swiperInstance = new Swiper(swiperRef.value, {
    direction: "vertical", // 垂直方向滑动
    loop: false, // 不循环
    initialSlide: 0, // 初始显示第一个视频
    speed: 300, // 滑动速度
    mousewheel: true, // 支持鼠标滚轮
    keyboard: {
      enabled: true, // 支持键盘控制
    },
    // 虚拟滑动配置
    virtual: {
      addSlidesBefore: 1,
      addSlidesAfter: 1,
      slides: videoList.value,
      renderSlide: (slide, index) => {
        if (activeTab.value === 'vip') {
          if (userInfo.value?.isBuyVip || userInfo.value?.isVip) {
            return `
              <div class="swiper-slide" data-index="${index}">
                <div class="video-container" data-index="${index}">
                  <div class="video-wrap" data-index="${index}" onclick="window.handlePlayPauseClick(${index}, event)">
                    ${generateVideoJsHtml(index)}
                    <div class="play-pause-icon" id="play-pause-icon-${index}">
                      <i class="icon-play"></i>
                    </div>
                  </div>
                  <div class="video-info">
                    <div class="video-author">
                      <img style="display: inline-block" src="/logo.png" />
                      <span>4vip.xyz</span>
                    </div>
                    <div class="video-desc">${slide.title || '暂无描述'}</div>
                  </div>
                  <div class="custom-controls">
                    <div class="time-display">
                      <span id="current-time-${index}">00:00</span>
                      <span class="time-separator">/</span>
                      <span id="duration-${index}">00:00</span>
                    </div>
                    <div class="progress-container">
                      <div class="progress-bar" id="progress-bar-${index}"></div>
                    </div>
                  </div>
                </div>
              </div>
            `;
          }
          // VIP专区的渲染逻辑
          return `
            <div class="swiper-slide" data-index="${index}">
              <div class="video-container" data-index="${index}">
                <div class="video-wrap" data-index="${index}" onclick="window.handlePlayPauseClick(${index}, event)" data-reload="true">
                  <div class="play-pause-icon" id="play-pause-icon-${index}">
                    <i class="icon-play"></i>
                  </div>
                </div>
                <img src="${slide.thumbnailUrl || ''}" class="video-thumbnail" />
                <div class="video-info">
                  <div class="video-author">
                    <img style="display: inline-block" src="/logo.png" />
                    <span>4vip.xyz</span>
                  </div>
                  <div class="video-desc">${slide.title || '暂无描述'}</div>
                </div>
              </div>
            </div>
          `
        } else {
          return `
            <div class="swiper-slide" data-index="${index}">
              <div class="video-container" data-index="${index}">
                <div class="video-wrap" data-index="${index}" onclick="window.handlePlayPauseClick(${index}, event)">
                  ${generateVideoJsHtml(index)}
                  <div class="play-pause-icon" id="play-pause-icon-${index}">
                    <i class="icon-play"></i>
                  </div>
                </div>
                <div class="video-info">
                  <div class="video-author">
                    <img style="display: inline-block" src="/logo.png" />
                    <span>4vip.xyz</span>
                  </div>
                  <div class="video-desc">${slide.title || '暂无描述'}</div>
                </div>
                <div class="custom-controls">
                  <div class="time-display">
                    <span id="current-time-${index}">00:00</span>
                    <span class="time-separator">/</span>
                    <span id="duration-${index}">00:00</span>
                  </div>
                  <div class="progress-container">
                    <div class="progress-bar" id="progress-bar-${index}"></div>
                  </div>
                </div>
              </div>
            </div>
          `;
        }
      },
    },
    // 事件回调
    on: {
      init: () => {
        console.log("Swiper初始化完成");
        createVideoInstance(0);
      },
      // 滑动切换事件
      slideChange: (swiper) => {},
      // 滑动切换完成事件
      slideChangeTransitionEnd: (swiper) => {
        console.log("当前索引:", swiper.activeIndex);

        // 增加计数器
        videoViewCount.value++;

        // 每滑动5个视频，显示登录弹窗
        if (videoViewCount.value % 5 === 0 && !userInfo.value?.id) {
          router.push('/personal');
          isShowLoginDialog.value = true;
          loginCallback.value = () => {
            router.push('/shortVideo');
          };
          Snackbar.warning('登录后可无限观看短视频');
        }

        // 暂停上一个视频
        if (videoInstances[swiper.activeIndex - 1]) {
          videoInstances[swiper.activeIndex - 1].pause();
        } else {
          // 如果上一个视频实例不存在，则创建一个新的实例
          if (swiper.activeIndex - 1 >= 0) {
            createVideoInstance(swiper.activeIndex - 1, {
              autoplay: false,
            });
          }
        }
        // 创建并播放当前视频
        if (videoInstances[swiper.activeIndex]) {
          videoInstances[swiper.activeIndex].play();
        } else {
          createVideoInstance(swiper.activeIndex);
        }
        // 暂停下一个视频
        if (videoInstances[swiper.activeIndex + 1]) {
          videoInstances[swiper.activeIndex + 1].pause();
        } else {
          // 如果下一个视频实例不存在，则创建一个新的实例
          if (swiper.activeIndex + 1 < videoList.value.length) {
            createVideoInstance(swiper.activeIndex + 1, {
              autoplay: false,
            });
          }
        }
        // 销毁上上一个视频实例
        const prevIndex = swiper.activeIndex - 2;
        if (prevIndex >= 0 && videoInstances[prevIndex]) {
          console.log("销毁上上一个视频实例", prevIndex);
          destroyVideoInstances(prevIndex);
          togglePlayButton(prevIndex, false);
        }
        // 销毁下下个视频实例
        const nextNextIndex = swiper.activeIndex + 2;
        if (
          nextNextIndex < videoList.value.length &&
          videoInstances[nextNextIndex]
        ) {
          console.log("销毁下下个视频实例", nextNextIndex);
          destroyVideoInstances(nextNextIndex);
          togglePlayButton(nextNextIndex, false);
        }
      },
      // 触摸到结尾释放就执行
      touchEnd: () => {
        if (checkLoadMore()) {
          // 如果当前索引接近最后两个索引，则加载更多数据
          console.log("加载更多数据");
          if (activeTab.value === 'vip') {
            fetchVipVideoList();
          } else {
            fetchFreeVideoList();
          }
        }
      },
    },
  });
};

// 写个方法判断一下是否需要加载数据，activeIndex是否快接近最后2个
const checkLoadMore = () => {
  if (!swiperInstance) return false;
  const activeIndex = swiperInstance.activeIndex;
  const slidesLength = videoList.value.length;
  // 如果当前索引接近最后两个索引，则加载更多数据
  if (activeIndex >= slidesLength - 3 && hasNextPage.value && !loading.value) {
    return true;
  } else {
    return false;
  }
};

/**
 * 控制播放按钮的显示/隐藏
 * @param {number} index - 视频索引
 * @param {boolean} show - 是否显示播放按钮
 */
const togglePlayButton = (index, show) => {
  const playPauseIcon = document.getElementById(`play-pause-icon-${index}`);
  if (playPauseIcon) {
    playPauseIcon.style.display = show ? "flex" : "none";
  }
};

/**
 * 切换静音状态
 * 切换所有视频的静音状态
 */
const toggleMute = () => {
  // 切换静音状态
  isMuted.value = !isMuted.value;

  videoPlayerConfig.muted = isMuted.value;

  // 更新所有视频实例的静音状态
  for (const key in videoInstances) {
    if (videoInstances[key]) {
      videoInstances[key].muted(isMuted.value);
    }
  }
};

/**
 * 释放视频实例资源
 * 防止内存泄漏
 * @param {number} index - 视频索引，如果提供则只释放指定索引的视频
 */
const destroyVideoInstances = (index) => {
  if (index !== undefined) {
    if (videoInstances[index]) {
      videoInstances[index].dispose();
      delete videoInstances[index];
    }
  } else {
    for (const key in videoInstances) {
      if (videoInstances[key]) {
        videoInstances[key].dispose();
        delete videoInstances[key];
      }
    }
  }
};

// 打开登录弹窗
const openLoginPopup = () => {
  isShowLoginDialog.value = true;
  showLoginPopup.value = false; // 关闭当前的登录弹窗
};

const getFreeVideos = async () => {
  await fetchFreeVideoList();

  if (videoList.value.length) {
    // 初始化Swiper
    initSwiper();
  } else {
    Snackbar.error("无数据，请点击重试");
  }

  // 定义全局播放/暂停点击处理函数
  window.handlePlayPauseClick = (index, event) => {
    togglePlayPause(index);
  };
};

const getVipVideos = async (isFetch = true) => {
  if (isFetch) {
    await fetchVipVideoList();
  }

  if (videoList.value.length) {
    // 初始化Swiper
    initSwiper();
  } else {
    Snackbar.error("无数据，请点击重试");
  }

  // 定义全局播放/暂停点击处理函数
  window.handlePlayPauseClick = (index, event) => {
    if (!userInfo.value?.isBuyVip && !userInfo.value?.isVip) {
      Snackbar.warning('仅VIP用户可观看');
      return;
    } else {
      const videoContainer = document.querySelector(
        `.video-wrap[data-reload="true"][data-index="${index}"]`
      );
      if (videoContainer) {
        swiperInstance.destroy();
        swiperInstance = null;
        // 把swiper-wrapper的内容清空
        const swiperWrapper = swiperRef.value.querySelector('.swiper-wrapper');
        if (swiperWrapper) {
          swiperWrapper.innerHTML = '';
        }
        getVipVideos(false)
        return;
      }
    }
    togglePlayPause(index);
  };
}

onMounted(async () => {
  getFreeVideos();
});

onBeforeUnmount(() => {
  // 先销毁所有视频实例
  destroyVideoInstances();
  // 移除全局播放/暂停点击处理函数
  delete window.handlePlayPauseClick;
  // 销毁Swiper实例
  if (swiperInstance) {
    swiperInstance.destroy();
    swiperInstance = null;
  }
});

// 监听用户信息，有 email 时获取详细用户信息
watch(
  () => userInfo.value?.id,
  async (id) => {
    if (id) {
      try {
        // 检查用户是否是VIP
        let res = {}
        if (userInfo.value?.id) {
          res = await _isVipFetch(userInfo.value.id);
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
    }
  },
  { immediate: true } // 初始化时执行一次
);
</script>

<template>
  <!-- 短视频容器 -->
  <div class="short-video-container">
    <!-- 悬浮 tab: "免费专区"，"VIP专区" -->
    <div class="floating-tabs">
      <div 
        v-for="tab in tabOptions" 
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @click="switchTab(tab.key)"
      >
        {{ tab.label }}
      </div>
    </div>
    <!-- Swiper容器 -->
    <div class="swiper" ref="swiperRef">
      <!-- Swiper会自动注入内容到这个wrapper中 -->
      <div class="swiper-wrapper"></div>
    </div>
    <!-- 加载状态提示 -->
    <div class="loading-overlay" v-if="loading">
      <var-loading type="wave" />
    </div>

    <!-- 到达底部提示 -->
    <div
      class="end-overlay"
      v-if="!hasNextPage && videoList.length > 0 && !loading"
    >
      已经到底了
    </div>

    <!-- 无数据状态提示 -->
    <div class="empty-overlay" v-if="videoList.length === 0 && !loading">
      暂无视频
    </div>
    <!-- 左上角重试按钮 -->
    <div class="retry-button" v-ripple @click="reloadVideos">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#fff" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
        <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
      </svg>
    </div>
    <!-- 静音控制按钮 -->
    <div class="mute-control" v-ripple @click="toggleMute">
      <transition name="slide-up" mode="out-in">
        <i
          v-if="isMuted"
          class="iconfont-video iconfont-video-shengyinguanbi"
        ></i>
        <i v-else class="iconfont-video iconfont-video-shengyin_shiti"></i>
      </transition>
    </div>
  </div>

  <!-- 去登录弹窗，有两个按钮：以后再说，登录/注册 -->
  <var-popup
    v-model:show="showLoginPopup"
    position="center" 
    :overlay="true" 
    :close-on-click-overlay="false"
  >
    <div class="rounded-xl bg-white dark:bg-gray-800 shadow-xl overflow-hidden">
      <!-- 顶部装饰条 -->
      <div class="h-1 bg-gradient-to-r from-[#6751A4] to-[#9980FF]"></div>
      
      <!-- 内容区域 -->
      <div class="p-6">
        <!-- 图标 -->
        <div class="flex justify-center mb-4">
          <div class="w-16 h-16 rounded-full bg-[#f0ebff] dark:bg-[#6751A4]/30 flex items-center justify-center">
            <svg class="h-8 w-8 text-[#6751A4] dark:text-purple-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
        
        <!-- 文字提示 -->
        <div class="text-center mb-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">登录以享受完整体验</h3>
          <p class="text-sm text-gray-600 dark:text-gray-300">
            登录后可解锁更多高清视频内容，每日多次观看特权
          </p>
        </div>
        
        <!-- 按钮区域 -->
        <div class="flex flex-col gap-3">
          <button
            @click="openLoginPopup"
            class="w-full py-2.5 bg-[#6751A4] hover:bg-[#5a4790] text-white font-medium rounded-lg transition-colors shadow-sm flex items-center justify-center"
          >
            <svg class="w-5 h-5 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            登录 / 注册
          </button>
          
          <button
            @click="showLoginPopup = false"
            class="w-full py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
          >
            以后再说
          </button>
        </div>
      </div>
    </div>
  </var-popup>
</template>

<style scoped lang="less">
/* 短视频容器样式 */
.short-video-container {
  width: 100%;
  height: 100%; /* 占满整个视口高度 */
  position: relative;
  background-color: #000; /* 黑色背景 */
  overflow: hidden;

  /* 新增悬浮 tab 样式 */
  .floating-tabs {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    background-color: rgba(0, 0, 0, 0.4); /* 降低背景不透明度 */
    border-radius: 20px;
    padding: 4px;
    z-index: 30;
    backdrop-filter: blur(8px); /* 增强模糊效果 */
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.1); /* 添加细微边框 */
    
    .tab-item {
      padding: 2px 16px;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.8);
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;
      
      &.active {
        background-color: rgba(255, 255, 255, 0.25);
        color: white;
        box-shadow: 0 2px 8px rgba(103, 81, 164, 0.3);
      }
      
      &:not(.active):hover {
        background-color: rgba(255, 255, 255, 0.15);
        color: white;
      }
    }
  }

  /* Swiper容器样式 */
  .swiper {
    width: 100%;
    height: 100%;
  }

  /* Swiper滑动项样式 */
  .swiper-slide {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
  }
  :deep(.video-container) {
    height: 100%;
    width: 100%;
    color: #fff;
    .video-wrap {
      position: relative;
      height: 100%;
      width: 100%;
      pointer-events: auto; /* 确保点击事件被捕获 */
      .video-js {
        height: 100% !important;
        width: 100% !important;
        pointer-events: none; /* 防止 video-js 内部元素拦截点击 */
      }
      .play-pause-icon {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 60px;
        height: 60px;
        background-color: rgba(0, 0, 0, 0.5);
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 20;
        cursor: pointer;
        transition:
          background-color 0.3s,
          transform 0.2s;

        /* 播放图标 */
        .icon-play {
          display: inline-block;
          width: 30px;
          height: 30px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M8 5v14l11-7z'/%3E%3C/svg%3E");
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
        }
      }
    }
    .video-thumbnail {
      width: 100%;
      position: absolute;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
    }
    .video-info {
      position: absolute;
      bottom: 20px;
      left: 12px;
      right: 80px;
      color: #fff; /* 白色文字 */
      z-index: 10; /* 确保显示在视频上方 */
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5); /* 文字阴影增加可读性 */
      
      /* 作者名称样式 */
      .video-author {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 8px;
        img {
          width: 30px;
          height: 30px;
          display: inline-block;
          vertical-align: middle;
          border-radius: 4px;
          margin-right: 8px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }
        span {
          flex: 1;
        }
      }
      
      /* 视频描述样式 */
      .video-desc {
        font-size: 14px;
        opacity: 0.9;
        line-height: 1.4;
        max-height: 80px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 3; /* 最多显示3行 */
        -webkit-box-orient: vertical;
        margin-bottom: 12px;
      }
    }
    .custom-controls {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
      z-index: 10;

      /* 进度条容器 */
      .progress-container {
        width: 100%;
        height: 3px;
        background-color: rgba(255, 255, 255, 0.3);
        border-radius: 1.5px;
        overflow: hidden;

        /* 进度条 */
        .progress-bar {
          height: 100%;
          background-color: #fff;
          border-radius: 1.5px;
          width: 0;
          transition: width 0.3s ease-out;
        }
      }

      /* 时间显示 */
      .time-display {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        color: #fff;
        font-size: 12px;
        padding: 4px 8px;

        .time-separator {
          margin: 0 4px;
          opacity: 0.7;
        }
      }
    }
  }

  .loading-overlay,
  .end-overlay,
  .empty-overlay {
    position: absolute;
    bottom: 20px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    padding: 10px;
    z-index: 9; /* 确保显示在最上层 */
    font-size: 14px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }

  /* 新增重试按钮样式 */
  .retry-button {
    position: absolute;
    top: 20px;
    left: 20px;
    width: 40px;
    height: 40px;
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 30;
    cursor: pointer;
    transition: transform 0.3s ease;
    &:hover {
      transform: rotate(30deg);
    }
    
    &:active {
      transform: rotate(180deg);
    }
  }

  .mute-control {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 30;
    cursor: pointer;
    i {
      color: #fff;
      font-size: 20px;
    }
  }
}

/* 淡入淡出过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
