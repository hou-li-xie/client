<template>
  <div class="image-show-container">
    <el-radio-group v-model="viewType" size="small" style="margin-bottom: 16px;">
      <el-radio-button label="grid">平铺视图</el-radio-button>
      <el-radio-button label="table">表格视图</el-radio-button>
    </el-radio-group>

    <div v-if="viewType === 'grid'">
      <div v-if="loading" class="empty-tip">图片加载中...</div>
      <div v-else-if="error" class="empty-tip">{{ error }}</div>
      <div v-else-if="!images.length" class="empty-tip">暂无图片素材</div>
      <div v-else class="image-grid">
        <div v-for="(img, idx) in images" :key="idx" class="image-item">
          <img :src="API_BASE + img.fileName" :alt="img.name || '图片素材'" />
          <div class="image-name" v-if="img.fileName">{{ img.fileName }}</div>
          <div class="mark">
            <el-button type="primary" @click="handlePreview(API_BASE + img.fileName)">预览</el-button>
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <el-table :data="images" style="width: 100%; max-height: 520px; overflow-y: auto;" border stripe height="520">
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column label="预览" width="120" align="center">
          <template #default="scope">
            <img :src="API_BASE + scope.row.fileName" style="width: 80px; height: 60px; object-fit: cover; border-radius: 6px; box-shadow: 0 2px 8px #eee; border: 1px solid #f0f0f0;" />
          </template>
        </el-table-column>
        <el-table-column prop="fileName" label="文件名" min-width="220" show-overflow-tooltip align="center" />
        <el-table-column label="操作" width="200" align="center">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handlePreview(API_BASE + scope.row.fileName)">预览</el-button>
            <el-button type="warning" size="small" @click="openEditDialog(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="editDialogVisible" title="编辑文件名" width="400px">
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
import { getAllImages, deleteImageById,renameMediaFile } from '@/api/api'
import { ElMessage,ElMessageBox } from 'element-plus'
const API_BASE = "http://localhost:8080/images/";

const images = ref<any[]>([]);
const loading = ref(false);
const error:any = ref("");
const previewVisible = ref(false);
const previewImg = ref("");
const viewType = ref<'grid' | 'table'>('grid');

// 编辑弹窗相关
const editDialogVisible = ref(false);
const editFileName = ref('');
const editRow = ref<any>(null);

function openEditDialog(row: any) {
  editRow.value = row;
  editFileName.value = row.fileName;
  editDialogVisible.value = true;
}
async function handleEditConfirm() {
  if (editRow.value) {
    // 检查文件名是否为空
    if (!editFileName.value || editFileName.value.trim() === '') {
      ElMessage.warning('文件名不能为空');
      return;
    }

    try {
      // 调用重命名接口
      const response = await renameMediaFile(editRow.value.id, editFileName.value);
      console.log('重命名响应:', response);

      // 更新成功后更新本地数据
      editRow.value.fileName = editFileName.value;
      ElMessage.success('文件名更新成功');
      editDialogVisible.value = false;
    } catch (error: any) {
      console.error('重命名失败:', error);

      // 根据错误状态码显示不同信息
      if (error.response) {
        switch (error.response.status) {
          case 400:
            ElMessage.error('请求参数错误，请检查文件名格式');
            break;
          case 404:
            ElMessage.error('文件未找到');
            break;
          case 409:
            ElMessage.error('文件名已存在');
            break;
          default:
            ElMessage.error('文件名更新失败: ' + (error.message || '未知错误'));
        }
      } else {
        ElMessage.error('网络错误，请稍后重试');
      }
    }
  } else {
    editDialogVisible.value = false;
  }
}
async function handleDelete(row: any) {
  try {
    await deleteImageById(row.id);
    images.value = images.value.filter(img => img.id !== row.id);
    ElMessage.success('删除成功');
  } catch (e) {
    ElMessage.error('删除失败');
  }
}

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
    const response:any = await getAllImages();
    if (response?.code!==0) throw new Error("获取图片素材失败");
    images.value =  response.data;
  } catch (err: any) {
    error.value = !(!err?.message && !"图片加载失败");
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