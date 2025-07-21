<template>
  <div class="showPage">
    <el-card>
      <el-tabs tab-position="left" style="height: 675px" class="demo-tabs">
        <el-tab-pane style="margin-bottom: 20px" label="图片素材">
          
        <ImageShow/>
          <!-- <div class="imgSuCai">
            <div
              class="imgSuCai_item"
              v-for="(item, index) in images"
              :key="index"
            >
              <img :src="item" alt="" />
              <div class="mark">
                <el-button type="primary" @click="handlePreview(item)"
                  >预览</el-button
                >
              </div>
            </div>
          </div> -->
        </el-tab-pane>
        <el-tab-pane label="视频素材">
          <VideoPlayer />
          <!-- <div class="videoSuCai">
            <div
              class="videoSuCai_item"
              v-for="(item, index) in videos"
              :key="index"
            >
              <video
                :src="item"
                style="width: 100%; height: 100%; object-fit: fill"
                controls
                poster="https://img95.699pic.com/element/40097/9420.png_860.png"
              ></video>
            </div>
          </div> -->
        </el-tab-pane>
      </el-tabs>
    </el-card>
    
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

import VideoPlayer from '../../components/VideoPlayer.vue';
import ImageShow from '../../components/ImageShow.vue';

const images = [
  "../../../public/images/1.jpg",
  "../../../public/images/2.jpg",
  "../../../public/images/3.jpg",
  "../../../public/images/4.jpg",
  "../../../public/images/5.jpg",
  "../../../public/images/6.jpg",
  "../../../public/images/7.jpg",
  "../../../public/images/8.jpg",
  "../../../public/images/9.jpg",
  "../../../public/images/11.jpg",
  "../../../public/images/12.jpg",
  "../../../public/images/13.jpg",
  "../../../public/images/14.jpg",
  "../../../public/images/15.jpg",
  "../../../public/images/16.jpg",
  "../../../public/images/17.jpg",
  "../../../public/images/18.jpg",
  "../../../public/images/19.jpg",
  "../../../public/images/20.jpg",
  "../../../public/images/21.jpg",
  "../../../public/images/22.jpg",
  "../../../public/images/23.jpg",
  "../../../public/images/24.jpg",
  "../../../public/images/25.jpg",
  "../../../public/images/26.jpg",
  "../../../public/images/27.jpg",
  "../../../public/images/28.jpg",
  "../../../public/images/29.jpg",
  "../../../public/images/30.jpg",
  "../../../public/images/31.jpg",
  "../../../public/images/32.jpg",
  "../../../public/images/33.jpg",
];
const videos = [
  "../../../public/videos/1.mp4",
  "../../../public/videos/2.mp4",
  "../../../public/videos/3.mp4",
  "../../../public/videos/4.mp4",
  "../../../public/videos/5.mp4",
  "../../../public/videos/6.mp4",
  "../../../public/videos/7.mp4",
  "../../../public/videos/8.mp4",
];
const previewVisible = ref(false);
const previewImg = ref("");

function handlePreview(img: string) {
  previewImg.value = img;
  previewVisible.value = true;
}

</script>

<style scoped lang="scss">
.imgSuCai {
  width: 100%;
  height: 675px;
  padding: 10px;
  overflow-y: scroll;
  display: flex;
  flex-wrap: wrap;
  .imgSuCai_item {
    width: 24%;
    margin: 2px;
    height: 300px;
    position: relative;
    img {
      width: 100%;
      height: 100%;
    }
    .mark {
      width: 100%;
      height: 100%;
      display: none;
      align-items: center;
      justify-content: center;
      background-color: rgba(0, 0, 0, 0.696);
      position: absolute;
      z-index: 99;
      top: 0;
      left: 0;
    }
    &:hover .mark {
      display: flex !important;
    }
  }
}
.videoSuCai {
  width: 100%;
  height: 675px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  padding: 10px;
  .videoSuCai_item {
    width: 24%;
    margin: 2px;
    height: 300px;
    video {
      width: 100%;
      height: 100%;
    }
  }
}
:deep() {
  .el-tabs__item {
    padding: 15px 20px;
  }
  .is-left {
    height: 100px;
  }
}
.showPage {
  width: 100%;
  height: 100%;
}
.el-card {
  height: 100%;
  width: 100%;
}

</style>