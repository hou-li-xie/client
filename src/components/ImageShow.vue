<template>
  <div class="image-show-container">
    <div v-if="loading" class="empty-tip">图片加载中...</div>
    <div v-else-if="error" class="empty-tip">{{ error }}</div>
    <div v-else-if="!images.length" class="empty-tip">暂无图片素材</div>
    <div v-else class="image-grid">
      <div v-for="(img, idx) in images" :key="idx" class="image-item">
        <img :src="API_BASE + img.url" :alt="img.name || '图片素材'" />
        <div class="image-name" v-if="img.name">{{ img.name }}</div>
        <div class="mark">
          <el-button type="primary" @click="handlePreview(API_BASE + img.url)"
            >预览</el-button
          >
        </div>
      </div>
    </div>
    <!-- 全屏图片预览层 -->
    <div
      v-if="previewVisible"
      class="img-preview-mask"
      @click.self="closePreview"
    >
      <img :src="previewImg" class="img-preview-full" />
      <el-button
        class="close-btn"
        circle
        @click="closePreview"
        type="danger"
        size="large"
        :icon="CloseBold"
      ></el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { CloseBold } from "@element-plus/icons-vue";
const API_BASE = "http://localhost:3000";
const IMAGE_LIST_API = `${API_BASE}/api/images`;

interface ImageItem {
  url: string;
  name?: string;
}

const images = ref<ImageItem[]>([]);
const loading = ref(false);
const error = ref("");
const previewVisible = ref(false);
const previewImg = ref("");
function handlePreview(img: string) {
  previewImg.value = img;
  previewVisible.value = true;
}
function closePreview() {
  previewVisible.value = false;
}
onMounted(async () => {
  loading.value = true;
  error.value = "";
  try {
    const response = await fetch(IMAGE_LIST_API);
    console.log(response);

    if (!response.ok) throw new Error("获取图片素材失败");
    images.value = await response.json();
  } catch (err: any) {
    error.value = err?.message || "图片加载失败";
    images.value = [];
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped lang="scss">
.image-show-container {
  width: 100%;
  min-height: 200px;
  padding: 16px;
  box-sizing: border-box;
}
.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  max-height: 660px;
  overflow-y: auto;
  padding-right: 8px;
}
.image-item {
  width: 180px;
  height: 180px;
  background: #fafbfc;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  img {
    width: 100%;
    height: 140px;
    object-fit: cover;
    border-radius: 8px 8px 0 0;
    background: #eee;
    transition: box-shadow 0.2s;
    cursor: pointer;
    &:hover {
      box-shadow: 0 0 0 2px #409eff;
    }
  }
  .image-name {
    width: 100%;
    text-align: center;
    font-size: 14px;
    color: #666;
    padding: 6px 0 0 0;
    background: #fff;
    border-radius: 0 0 8px 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .mark {
    display: none;
    position: absolute;
    left: 0; top: 0; right: 0; bottom: 0;
    width: 100%; height: 100%;
    background: rgba(80,80,80,0.35);
    align-items: center;
    justify-content: center;
    z-index: 2;
    transition: background 0.2s;
  }
  &:hover .mark {
    display: flex;
  }
}
.empty-tip {
  color: #bbb;
  font-size: 16px;
  text-align: center;
  padding: 40px 0;
}
.img-preview-mask {
  position: fixed;
  z-index: 9999;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  .img-preview-full {
    max-width: 90vw;
    max-height: 90vh;
    border-radius: 8px;
    box-shadow: 0 2px 16px #0008;
  }
  .close-btn {
    position: absolute;
    top: 40px;
    right: 60px;
    z-index: 10000;
  }
}
</style> 