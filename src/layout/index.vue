<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { menu } from "../api/api";
import { useRoute, useRouter } from "vue-router";
import {removeCookie} from '../utils/cookie'
import { useUserStore } from "../stores/user";
import { Setting, Refresh, Fold, Expand,FullScreen } from "@element-plus/icons-vue";
const store = useUserStore();
const route = useRoute();
const router = useRouter();
const menuList: any = ref([]);
async function getMenu() {
  const res: any = await menu();
  if (res && res.code === 0) {
    menuList.value = res.data;
  }
}
const getIcon = (name: string | undefined,txt:string) => {
  const glob: any = import.meta.glob(`@/assets/menuIcons/**/*`, {
    eager: true,
  });
  // console.log(glob);
  // 假设传入的name为bg.jpg 输出的就是图片路径/src/assets/images/bg.jpg
  // console.log( glob[`/src/assets/images/bg.jpg`]["default"])
  return glob[`/src/assets/menuIcons/${name}`]["default"];
};
// 刷新页面
const refreshPage = () => {
  window.location.reload();
};
// 折叠/展开侧边栏

const isCollapse = ref(false);
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value;
};
// 面包屑数据f
const breadcrumb = computed(() => {
  const currentRoute = route.matched;
  return currentRoute.map((item) => item.meta?.title || item.name);
});

// 全屏功能
const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};

// 切换暗色主题
const isDark = ref(false);
const toggleDark = () => {
  isDark.value = !isDark.value;
  document.documentElement.classList.toggle("dark");
  // 保存主题设置到本地存储
  localStorage.setItem("theme", isDark.value ? "dark" : "light");
};

// 主题图标
const themeIcon = computed(() =>
  isDark.value
    ? `
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M12.1,22c-0.3,0-0.6,0-0.9,0c-5.5-0.5-9.5-5.4-9-10.9c0.4-4.8,4.2-8.6,9-9c0.4,0,0.8,0.2,1,0.5c0.2,0.3,0.2,0.8-0.1,1.1c-2,2.7-1.4,6.4,1.3,8.4c2.1,1.6,5,1.6,7.1,0c0.3-0.2,0.7-0.3,1.1-0.1c0.3,0.2,0.5,0.6,0.5,1c-0.2,2.7-1.5,5.1-3.6,6.8C16.6,21.2,14.4,22,12.1,22zM9.3,4.4c-2.9,1-5,3.6-5.2,6.8c-0.4,4.4,2.8,8.3,7.2,8.7c2.1,0.2,4.2-0.4,5.8-1.8c1.1-0.9,1.9-2.1,2.4-3.4c-2.5,0.9-5.3,0.5-7.5-1.1C9.2,11.4,8.1,7.7,9.3,4.4z"/>
  </svg>
`
    : `
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M12,18c-3.3,0-6-2.7-6-6s2.7-6,6-6s6,2.7,6,6S15.3,18,12,18zM12,8c-2.2,0-4,1.8-4,4c0,2.2,1.8,4,4,4c2.2,0,4-1.8,4-4C16,9.8,14.2,8,12,8z"/>
    <path d="M12,4c-0.6,0-1-0.4-1-1V1c0-0.6,0.4-1,1-1s1,0.4,1,1v2C13,3.6,12.6,4,12,4z"/>
    <path d="M12,24c-0.6,0-1-0.4-1-1v-2c0-0.6,0.4-1,1-1s1,0.4,1,1v2C13,23.6,12.6,24,12,24z"/>
    <path d="M5.6,6.6c-0.3,0-0.5-0.1-0.7-0.3L3.5,4.9c-0.4-0.4-0.4-1,0-1.4s1-0.4,1.4,0l1.4,1.4c0.4,0.4,0.4,1,0,1.4C6.1,6.5,5.8,6.6,5.6,6.6z"/>
    <path d="M19.8,20.8c-0.3,0-0.5-0.1-0.7-0.3l-1.4-1.4c-0.4-0.4-0.4-1,0-1.4s1-0.4,1.4,0l1.4,1.4c0.4,0.4,0.4,1,0,1.4C20.3,20.7,20,20.8,19.8,20.8z"/>
    <path d="M3,13H1c-0.6,0-1-0.4-1-1s0.4-1,1-1h2c0.6,0,1,0.4,1,1S3.6,13,3,13z"/>
    <path d="M23,13h-2c-0.6,0-1-0.4-1-1s0.4-1,1-1h2c0.6,0,1,0.4,1,1S23.6,13,23,13z"/>
    <path d="M4.2,20.8c-0.3,0-0.5-0.1-0.7-0.3c-0.4-0.4-0.4-1,0-1.4l1.4-1.4c0.4-0.4,1-0.4,1.4,0s0.4,1,0,1.4l-1.4,1.4C4.7,20.7,4.5,20.8,4.2,20.8z"/>
    <path d="M18.4,6.6c-0.3,0-0.5-0.1-0.7-0.3c-0.4-0.4-0.4-1,0-1.4l1.4-1.4c0.4-0.4,1-0.4,1.4,0s0.4,1,0,1.4l-1.4,1.4C18.9,6.5,18.6,6.6,18.4,6.6z"/>
  </svg>
`
);
const handleLogout = () => {
  removeCookie("token");
  store.clearUserInfo();
  router.push("/login");
};

onMounted(() => {
  getMenu();
});
</script>

<template>
  <div class="layout">
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="logo">
          <img src="../assets/logo.jpeg" alt="" />
          <p v-if="!isCollapse">这女人厚礼蟹</p>
        </div>
        <div class="haveMenu" v-if="!isCollapse">
          <el-menu
            active-text-color="#eff6fe"
            background-color="#001428"
            class="el-menu-vertical-demo"
            :default-active="$route.path"
            text-color="#fff"
            router
          >
            <template v-for="menu in menuList" :key="menu.path">
              <el-sub-menu v-if="menu.children" :index="menu.path">
                <template #title>
                  <!-- <img :src="getIcon(menu.icon)" alt="" /> -->
                  <span>{{ menu.title }}</span>
                </template>
                <template v-for="child in menu.children" :key="child.path">
                  <el-menu-item :index="menu.path + child.path">
                    <!-- <img :src="getIcon(child.icon)" alt="" /> -->
                    <span>{{ child.title }}</span>
                  </el-menu-item>
                </template>
              </el-sub-menu>
              <el-menu-item v-else :index="menu.path">
                <!-- <img :src="getIcon(menu.icon)" alt="" /> -->
                <span>{{ menu.title }}</span>
              </el-menu-item>
            </template>
          </el-menu>
        </div>
      </el-aside>

      <el-container>
        <!-- 头部 -->
        <el-header class="header">
          <div class="header-left">
            <el-icon class="menu-icon" @click="toggleSidebar">
              <component :is="isCollapse ? 'Expand' : 'Fold'" />
              <Fold v-if="isCollapse" />
              <Expand v-else />
            </el-icon>
            <el-icon @click="refreshPage" class="refresh-icon"
              ><Refresh
            /></el-icon>
            <div class="breadcrumb">
              <template v-for="(item, index) in breadcrumb" :key="index">
                <span>{{ item }}</span>
                <span v-if="index < breadcrumb.length - 1" class="separator"
                  >/</span
                >
              </template>
            </div>
          </div>
          <div class="header-right">
            <div class="header-icons">
              <el-icon @click="toggleFullScreen"><FullScreen /></el-icon>
              <el-icon
                @click="toggleDark"
                class="theme-icon"
                v-html="themeIcon"
              >
              </el-icon>
              <el-icon><Setting /></el-icon>
            </div>
            <div class="user-info">
              <el-avatar :size="32" :src="store.userInfo?.avatar || ''" />
              <el-dropdown trigger="click"> 
                <span class="user-name">{{
                  store.userInfo?.username || "Admin"
                }}</span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item> 更新头像 </el-dropdown-item>
                    <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </el-header>

        <!-- 主要内容区 -->
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped lang="scss">
.crop-dialog {
  :deep(.el-dialog__body) {
    padding: 0;
  }
}

.avatar-upload {
  display: flex;
  height: 500px;

  .main-area {
    flex: 1;
    height: 100%;
    background-color: #000;
    position: relative;
    overflow: hidden;

    :deep(.vue-cropper) {
      height: 100% !important;
    }
  }

  .preview-area {
    width: 180px;
    padding: 20px;
    border-left: 1px solid var(--el-border-color-lighter);
    background-color: #fff;

    .preview-box {
      margin-bottom: 30px;

      .preview-title {
        font-size: 14px;
        color: var(--el-text-color-regular);
        margin-bottom: 12px;
      }

      .preview-square {
        width: 140px;
        height: 140px;
        border: 1px solid var(--el-border-color);
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      .preview-circle {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        border: 1px solid var(--el-border-color);
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
  }
}
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background-color: #f5f7fa;
  border-top: 1px solid var(--el-border-color-lighter);

  .left-tools {
    display: flex;
    gap: 8px;
  }

  .right-tools {
    display: flex;
    gap: 12px;
  }
}

// 暗黑模式适配
:root.dark {
  .avatar-upload {
    .preview-area {
      background-color: var(--el-bg-color);
      border-left-color: var(--el-border-color);
    }
  }

  .toolbar {
    background-color: var(--el-bg-color);
    border-top-color: var(--el-border-color);
  }
}
.el-menu-item.is-active {
  background-color: #2d8cf0 !important;
  color: #fff;
  span {
    color: #fff !important;
  }
}
.layout {
  height: 100vh;

  &.is-collapse {
    .el-aside {
      width: 64px;
      transition: width 0.3s;
    }
  }

  .el-container {
    height: 100%;
  }

  .el-aside {
    background-color: #001428;
    transition: width 0.3s;

    .logo {
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #001428;
      padding: 10px;
      overflow: hidden;
      img {
        width: 40px;
        height: 40px;
        border-radius: 50%;
      }
      p {
        color: #fff;
        font-size: 15px;
        margin-left: 10px;
      }
      h1 {
        height: 32px;
        color: #fff;
        font-size: 20px;
        font-weight: 600;
        line-height: 32px;
        transition: all 0.3s;

        &.is-collapse {
          font-size: 16px;
        }
      }
    }

    .el-menu {
      border-right: none;
      background-color: #001428;
      img {
        width: 15px;
        height: 15px;
        margin-right: 5px;
      }
      &:not(.el-menu--collapse) {
        width: 200px;
      }

      .el-sub-menu__title {
        &:hover {
          background-color: #001f42;
        }
      }

      .el-menu-item {
        border-radius: 4px;
        width: 90%;
        margin: 0 auto;
        display: flex;
        align-items: center;
        height: 40px;
        &:hover,
        &.is-active {
          background-color: #001f42;
        }
      }

      .el-menu-item,
      .el-sub-menu__title {
        .el-icon {
          margin-right: 16px;
          width: 16px;
          height: 16px;
        }
      }
    }
  }

  .header {
    height: 48px;
    background-color: #18181c;
    border-bottom: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    color: #fff;

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;

      .menu-icon,
      .refresh-icon {
        font-size: 18px;
        cursor: pointer;
        color: #ffffff;
        transition: transform 0.3s;

        &:hover {
          color: #409eff;
        }
      }

      .refresh-icon:hover {
        transform: rotate(180deg);
      }

      .breadcrumb {
        font-size: 14px;
        color: #909399;

        .separator {
          margin: 0 8px;
          color: #606266;
        }
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 24px;

      .header-icons {
        display: flex;
        align-items: center;
        gap: 16px;

        .el-icon {
          font-size: 18px;
          cursor: pointer;
          color: #ffffff;
          transition: all 0.3s;

          &:hover {
            color: #409eff;
          }

          &.is-active {
            color: #409eff;
          }
        }

        .message-badge {
          :deep(.el-badge__content) {
            background-color: #f56c6c;
            border: none;
          }
        }
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;

        .el-avatar {
          border: 2px solid #ffffff30;
          transition: transform 0.3s;

          &:hover {
            transform: scale(1.1);
          }
        }

        .user-name {
          font-size: 14px;
          color: #ffffff;
        }
      }
    }
  }

  .el-main {
    background-color: #f0f2f5;
    padding: 20px;
  }
}

// 暗色主题样式
:root.dark {
  .el-main {
    background-color: #141414;
  }

  .el-card {
    background-color: #1f1f1f;
    border-color: #303030;
    color: #fff;
  }
}

.theme-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    transition: transform 0.3s;
  }

  &:hover svg {
    transform: rotate(30deg);
  }
}

.welcome-info {
  margin-bottom: 16px;

  .workbench {
    .user-info {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 16px;

      .info {
        h2 {
          font-size: 16px;
          font-weight: normal;
          color: var(--el-text-color-primary);
          margin-bottom: 8px;
        }

        p {
          color: #909399;
          font-size: 13px;
          line-height: 1.5;
        }
      }
    }
  }
}

.avatar-upload {
  .cropper-container {
    height: 350px;
    background-color: #f5f7fa;
  }

  .preview-container {
    margin-top: 20px;
    text-align: center;

    .preview-img {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      border: 2px solid var(--el-border-color);
    }
  }

  .upload-actions {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    gap: 20px;
  }
}

:deep(.vue-cropper) {
  background-color: transparent !important;
}
</style> 