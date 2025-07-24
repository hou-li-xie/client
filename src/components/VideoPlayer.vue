<!-- VideoPlayer.vue -->
<template>
  <div class="video-container">
    <!-- 视图切换 -->
    <div class="video-selector">
      <el-radio-group v-model="viewType" size="small" style="margin-bottom: 16px;">
        <el-radio-button label="grid">平铺视图</el-radio-button>
        <el-radio-button label="table">表格视图</el-radio-button>
      </el-radio-group>

      <el-button @click="reloadVideoList" type="primary" style="margin-left: 16px;">刷新列表</el-button>
    </div>

    <!-- 平铺视图 -->
    <div v-if="viewType === 'grid'">
      <!-- 状态信息 -->
      <div v-if="loading" class="status loading">视频列表加载中...</div>
      <div v-else-if="error" class="status error">{{ error }}</div>
      <div v-else-if="!videoList.length" class="status empty">暂无视频素材</div>

      <!-- 视频网格 -->
      <div v-else class="video-grid">
        <div
            v-for="video in videoList"
            :key="video.id"
            class="video-item"
        >
          <div class="video-thumbnail" @click="playVideo(video)">
            <div class="thumbnail-placeholder">
              <el-icon class="video-icon"><VideoCamera /></el-icon>
            </div>
            <div class="play-overlay">
              <el-icon class="play-icon"><VideoPlay /></el-icon>
            </div>
          </div>
          <div class="video-name">{{ video.fileName }}</div>
          <div class="video-meta">
            <span>{{ formatFileSize(video.fileSize) }}</span>
            <div class="video-actions">
              <el-button type="warning" size="small" @click="openEditDialog(video)">重命名</el-button>
              <el-button type="danger" size="small" @click="handleDelete(video)">删除</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 表格视图 -->
    <div v-else>
      <div v-if="loading" class="status loading">视频列表加载中...</div>
      <div v-else-if="error" class="status error">{{ error }}</div>
      <div v-else-if="!videoList.length" class="status empty">暂无视频素材</div>

      <el-table
          v-else
          :data="videoList"
          style="width: 100%"
          border
          stripe
          max-height="500"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column label="预览" width="120" align="center">
          <template #default="scope">
            <div class="table-video-preview" @click="playVideo(scope.row)">
              <div class="table-thumbnail-placeholder">
                <el-icon class="table-video-icon"><VideoCamera /></el-icon>
              </div>
              <div class="table-play-overlay">
                <el-icon class="table-play-icon"><VideoPlay /></el-icon>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="fileName" label="文件名" min-width="200" show-overflow-tooltip />
        <el-table-column prop="fileSize" label="大小" width="120" align="center">
          <template #default="scope">
            {{ formatFileSize(scope.row.fileSize) }}
          </template>
        </el-table-column>
        <el-table-column label="时长" width="100" align="center">
          <template #default="scope">
            {{ formatDuration(scope.row.duration) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template #default="scope">
            <el-button type="primary" size="small" @click="playVideo(scope.row)">播放</el-button>
            <el-button type="warning" size="small" @click="openEditDialog(scope.row)">重命名</el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 视频播放弹窗 -->
    <el-dialog
        v-model="playerDialogVisible"
        :title="`正在播放: ${currentPlayingVideo?.fileName || ''}`"
        width="60%"
        top="80px"
        :before-close="handlePlayerClose"
        destroy-on-close
    >
      <div v-if="currentPlayingVideo" class="video-player-wrapper">
        <video
            ref="videoPlayer"
            controls
            :src="`${API_BASE}${currentPlayingVideo.fileName}`"
            @loadedmetadata="onVideoLoaded"
            @error="onVideoError"
            class="video-player"
            style="width: 100%; height: auto; background: #000;"
        >
          您的浏览器不支持视频播放
        </video>

        <!-- 视频信息 -->
        <div v-if="videoInfo" class="video-info">
          <p>分辨率: {{ videoInfo.width }} × {{ videoInfo.height }}</p>
          <p>时长: {{ formatDuration(videoInfo.duration) }}</p>
        </div>
      </div>
    </el-dialog>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="editDialogVisible" title="重命名视频文件" width="400px">
      <el-form>
        <el-form-item label="文件名">
          <el-input v-model="editFileName" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleEditConfirm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { VideoPlay, VideoCamera } from "@element-plus/icons-vue";
import { getAllVideos, deleteImageById, renameMediaFile } from '@/api/api';

// API 配置
const API_BASE = "http://localhost:8080/videos/";

// 响应式数据
const videoList = ref([]);
const loading = ref(false);
const error = ref("");
const viewType = ref('grid'); // 'grid' 或 'table'

// 播放相关
const playerDialogVisible = ref(false);
const currentPlayingVideo = ref(null);
const videoPlayer = ref(null);
const videoInfo = ref(null);

// 编辑相关
const editDialogVisible = ref(false);
const editFileName = ref('');
const editRow = ref(null);

// 组件挂载时获取视频列表
onMounted(async () => {
  await loadVideoList();
});

// 加载视频列表
const loadVideoList = async () => {
  try {
    loading.value = true;
    error.value = "";

    const response = await getAllVideos();
    if (response.code !== 0) throw new Error("获取视频列表失败");

    videoList.value = response.data.map(video => ({
      ...video,
      duration: video.duration || 0
    }));
  } catch (err) {
    error.value = `错误: ${err.message}`;
    videoList.value = [];
    ElMessage.error('获取视频列表失败: ' + err.message);
  } finally {
    loading.value = false;
  }
};

// 重新加载视频列表
const reloadVideoList = async () => {
  await loadVideoList();
  ElMessage.success('视频列表已刷新');
};

// 播放视频
const playVideo = (video) => {
  currentPlayingVideo.value = video;
  videoInfo.value = null;
  playerDialogVisible.value = true;
};

// 关闭播放器
const handlePlayerClose = (done) => {
  if (videoPlayer.value) {
    videoPlayer.value.pause();
  }
  currentPlayingVideo.value = null;
  videoInfo.value = null;
  done();
};

// 打开编辑对话框
const openEditDialog = (row) => {
  editRow.value = row;
  editFileName.value = row.fileName;
  editDialogVisible.value = true;
};

// 确认编辑
const handleEditConfirm = async () => {
  if (editRow.value) {
    try {
      // 检查文件名是否为空
      if (!editFileName.value || editFileName.value.trim() === '') {
        ElMessage.warning('文件名不能为空');
        return;
      }

      await renameMediaFile(editRow.value.id, editFileName.value);

      // 更新成功后更新本地数据
      editRow.value.fileName = editFileName.value;

      ElMessage.success('文件名更新成功');
      editDialogVisible.value = false;
    } catch (error) {
      console.error('重命名失败:', error);
      ElMessage.error('文件名更新失败: ' + (error.message || '未知错误'));
    }
  } else {
    editDialogVisible.value = false;
  }
};

// 删除视频
const handleDelete = (row) => {
  ElMessageBox.confirm(
      `确定要删除视频 "${row.fileName}" 吗？此操作不可恢复！`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(async () => {
    try {
      await deleteImageById(row.id);
      videoList.value = videoList.value.filter(video => video.id !== row.id);
      ElMessage.success('删除成功');
    } catch (error) {
      ElMessage.error('删除失败: ' + (error.message || '未知错误'));
    }
  }).catch(() => {
    // 用户取消删除
  });
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
const onVideoError = (e) => {
  console.error('视频播放错误:', e);
  ElMessage.error("视频播放出错，请检查文件格式或网络连接");
};

// 格式化文件大小
function formatFileSize(bytes) {
  if (bytes === 0 || !bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 格式化时长
function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '0.00';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toFixed(2).padStart(5, '0')}`;
  }
  return `${minutes}:${secs.toFixed(2).padStart(5, '0')}`;
}
</script>

<style scoped lang="scss">
.video-container {
  width: 100%;
  min-height: 200px;
  padding: 16px;
  box-sizing: border-box;
}

.video-selector {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  justify-content: flex-start;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  max-height: 600px;
  overflow-y: auto;
  padding: 10px;
}

.video-item {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  background: #fff;

  &:hover {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }
}

.video-thumbnail {
  position: relative;
  width: 100%;
  height: 120px;
  background: #000;
  overflow: hidden;
  cursor: pointer;

  .thumbnail-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(45deg, #333, #666);

    .video-icon {
      font-size: 32px;
      color: #fff;
    }
  }

  .play-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;

    .play-icon {
      font-size: 32px;
      color: white;
    }
  }

  &:hover .play-overlay {
    opacity: 1;
  }
}

.video-name {
  padding: 10px;
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-bottom: 1px solid #f0f0f0;
}

.video-meta {
  display: flex;
  flex-direction: column;
  padding: 8px 10px;
  font-size: 12px;
  color: #909399;

  .video-actions {
    display: flex;
    gap: 5px;
    margin-top: 5px;

    .el-button {
      flex: 1;
      min-width: 0;
    }
  }
}

.table-video-preview {
  position: relative;
  display: inline-block;
  cursor: pointer;

  .table-thumbnail-placeholder {
    width: 80px;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(45deg, #333, #666);
    border-radius: 4px;
    margin: 0 auto;

    .table-video-icon {
      font-size: 20px;
      color: #fff;
    }
  }

  .table-play-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;

    .table-play-icon {
      font-size: 20px;
      color: white;
    }
  }

  &:hover .table-play-overlay {
    opacity: 1;
  }
}

.video-player-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.video-info {
  margin-top: 15px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
  width: 100%;
  text-align: center;

  p {
    margin: 5px 0;
    color: #606266;
  }
}

.status {
  text-align: center;
  padding: 40px 0;
  font-size: 16px;
}

.status.loading {
  color: #409eff;
}

.status.error {
  color: #f56c6c;
}

.status.empty {
  color: #909399;
}
</style>
