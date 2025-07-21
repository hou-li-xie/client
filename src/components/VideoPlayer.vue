<!-- VideoPlayer.vue -->
<template>
  <div class="video-container">
    <!-- <h1>视频播放器</h1> -->

    <!-- 视频选择器 -->
    <div class="video-selector">
      <label for="videoSelect">选择素材视频: </label>
      <el-select v-model="selectedVideoName" placeholder="请选择视频" @change="changeVideo" style="width: 260px">
        <el-option
          v-for="video in videoList"
          :key="video.name"
          :label="`${video.name} (${formatFileSize(video.size)})`"
          :value="video.name"
        />
      </el-select>
      <el-button @click="reloadVideo" type="primary">重新加载</el-button>
    </div>

    <!-- 状态信息 -->
    <div v-if="loading" class="status loading">加载中...</div>
    <div v-if="error" class="status error">{{ error }}</div>

    <!-- 视频播放器 -->
    <!-- 视频封面 -->
    <!-- poster="https://img95.699pic.com/element/40097/9420.png_860.png" -->
    <!-- "D:\软件\编程\Code\server\videos\1.mp4" -->
    <video
      ref="videoPlayer"
      controls
      :src="videoSrc || '../../public/videos/1.mp4'"
      @loadedmetadata="onVideoLoaded"
      @error="onVideoError"
      @waiting="onVideoWaiting"
      @playing="onVideoPlaying"
      class="video-player large"
    >
      您的浏览器不支持视频播放
    </video>

    <!-- 视频信息 -->
    <div v-if="videoInfo" class="video-info">
      <p>分辨率: {{ videoInfo.width }} × {{ videoInfo.height }}</p>
      <p>时长: {{ formatDuration(videoInfo.duration) }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { ElMessage } from "element-plus";

// API 配置
const API_BASE = "http://localhost:3000";
const VIDEO_LIST_API = `${API_BASE}/api/videos`;

// 响应式数据
const videoList = ref([]);
const selectedVideo = ref(null);
const selectedVideoName = ref('');
const videoSrc = ref("");
const videoPlayer = ref(null);
const videoInfo = ref(null);
const loading = ref(false);
const error = ref("");

// 组件挂载时获取视频列表
onMounted(async () => {
  try {
    loading.value = true;
    const response = await fetch(VIDEO_LIST_API);
    if (!response.ok) throw new Error("获取视频列表失败");
    videoList.value = await response.json();
    if (videoList.value.length > 0) {
      selectedVideo.value = videoList.value[0];
      selectedVideoName.value = videoList.value[0].name;
      videoSrc.value = `${API_BASE}${selectedVideo.value.url}`;
    }
  } catch (err) {
    error.value = `错误: ${err.message}`;
  } finally {
    loading.value = false;
  }
});

// 切换视频
const changeVideo = (name) => {
  const video = videoList.value.find(v => v.name === name);
  selectedVideo.value = video;
  if (video) {
    videoSrc.value = `${API_BASE}${video.url}`;
    videoInfo.value = null;
    error.value = "";
    nextTick(() => {
      if (videoPlayer.value) {
        videoPlayer.value.load();
      }
    });
  }
};

// 重新加载视频
const reloadVideo = () => {
  if (videoPlayer.value) {
    videoPlayer.value.load();
    videoPlayer.value.play().catch((e) => {
      ElMessage.error("播放失败: " + e.message);
    });
  }
};

// 视频加载完成
const onVideoLoaded = () => {
  if (videoPlayer.value) {
    videoInfo.value = {
      width: videoPlayer.value.videoWidth,
      height: videoPlayer.value.videoHeight,
      duration: videoPlayer.value.duration,
    };
  }
};

// 视频错误处理
const onVideoError = () => {
  if (videoPlayer.value) {
    const errorCode = videoPlayer.value.error;
    let message = "视频加载错误";
    switch (errorCode?.code) {
      case 1:
        message = "视频加载中断";
        break;
      case 2:
        message = "网络错误";
        break;
      case 3:
        message = "视频解码错误";
        break;
      case 4:
        message = "视频格式不支持";
        break;
    }
    error.value = message;
  }
};

// 视频等待中
const onVideoWaiting = () => {};
const onVideoPlaying = () => {};

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDuration(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}
</script>

<style scoped lang="scss">
.video-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 24px;
}
.video-selector {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  justify-content: flex-start;
}
:deep(.el-select-dropdown__item) {
  justify-content: flex-start !important;
  text-align: left !important;
}
.video-player {
  width: 100%;
  max-width: 1400px;
  height: auto;
  max-height: 70vh;
  background: #000;
  border-radius: 8px;
  margin-bottom: 16px;
  display: block;
  aspect-ratio: 16 / 9;
}
.video-player.large {
  aspect-ratio: 16 / 9;
  max-width: 100%;
  height: auto;
  max-height: 70vh;
}
.status {
  margin-bottom: 12px;
  font-size: 16px;
}
.status.loading {
  color: #409eff;
}
.status.error {
  color: #f56c6c;
}
.video-info {
  margin-top: 12px;
  font-size: 15px;
  color: #606266;
}
</style>