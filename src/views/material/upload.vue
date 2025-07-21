<template>
  <div class="batch-upload-page">
    <!-- 磁盘空间信息 -->
    <el-card class="disk-info-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>磁盘空间信息</span>
          <el-button type="primary" size="small" @click="refreshDiskInfo" :loading="diskInfoLoading">
            刷新
          </el-button>
        </div>
      </template>
      <div class="disk-info-content" v-loading="diskInfoLoading">
        <div class="disk-section">
          <h4>视频存储</h4>
          <el-progress 
            :percentage="Number(diskInfo.video?.usagePercent || 0)" 
            :color="getProgressColor(Number(diskInfo.video?.usagePercent || 0))"
          />
          <p>已用: {{ diskInfo.video?.usedFormatted || '0 B' }} / {{ diskInfo.video?.totalFormatted || '0 B' }}</p>
        </div>
        <div class="disk-section">
          <h4>图片存储</h4>
          <el-progress 
            :percentage="Number(diskInfo.image?.usagePercent || 0)" 
            :color="getProgressColor(Number(diskInfo.image?.usagePercent || 0))"
          />
          <p>已用: {{ diskInfo.image?.usedFormatted || '0 B' }} / {{ diskInfo.image?.totalFormatted || '0 B' }}</p>
        </div>
      </div>
    </el-card>

    <!-- 上传配置信息 -->
    <el-card class="config-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>上传配置</span>
          <el-button type="primary" size="small" @click="refreshConfig" :loading="configLoading">
            刷新
          </el-button>
        </div>
      </template>
      <div class="config-content" v-loading="configLoading">
        <el-row :gutter="20">
          <el-col :span="12">
            <h4>视频文件</h4>
            <ul>
              <li>支持格式: {{ config.video?.allowedTypes?.join(', ') || '无' }}</li>
              <li>最大文件: {{ config.video?.maxSizeFormatted || '0 B' }}</li>
              <li>单次最多: {{ config.video?.maxFiles || 0 }} 个文件</li>
              <li>分片大小: {{ config.video?.chunkSizeFormatted || '0 B' }}</li>
            </ul>
          </el-col>
          <el-col :span="12">
            <h4>图片文件</h4>
            <ul>
              <li>支持格式: {{ config.image?.allowedTypes?.join(', ') || '无' }}</li>
              <li>最大文件: {{ config.image?.maxSizeFormatted || '0 B' }}</li>
              <li>单次最多: {{ config.image?.maxFiles || 0 }} 个文件</li>
              <li>分片大小: {{ config.image?.chunkSizeFormatted || '0 B' }}</li>
            </ul>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- index.m3u8 扫描盒子 -->
    <el-card class="config-card" shadow="hover" style="margin-top: 24px;">
      <template #header>
        <div class="card-header">
          <span>m3u8批量扫描并转换</span>
        </div>
      </template>
      <div style="padding: 16px 0;">
        <div class="m3u8-scan-row">
          <el-input
            v-model="diskRoot"
            style="width: 320px;"
            clearable
          />
          <el-button type="primary" @click="triggerDirInput" class="m3u8-btn">选择文件夹</el-button>
          <input
            ref="dirInputRef"
            type="file"
            webkitdirectory
            directory
            multiple
            style="display: none"
            @change="handleM3u8DirChange"
          />
          <el-button type="primary" size="small" @click="clearM3u8Result" class="m3u8-btn" :disabled="converting">清空结果</el-button>
          <el-button type="success" size="small" class="m3u8-btn" :disabled="m3u8Cmds.length === 0 || converting" @click="handleSmartConvert">智能转换</el-button>
        </div>
        <el-progress v-if="converting" :percentage="convertProgress" status="success" style="margin-bottom: 8px; width: 100%;" />
        <div v-if="m3u8Paths.length" style="margin-top: 16px;">
          <div style="font-size: 14px; color: #666; margin-bottom: 8px;">找到的index.m3u8文件路径：</div>
          <ul style="max-height: 200px; overflow-y: auto; background: #fafbfc; border-radius: 4px; padding: 12px;">
            <li v-for="(path, idx) in m3u8Paths" :key="idx" style="font-size: 13px; color: #333; line-height: 1.8;">
              {{ diskRoot ? (diskRoot.replace(/[\\/]+$/, '') + '/' + path) : path }}
            </li>
          </ul>
        </div>
        <div v-else style="margin-top: 16px; color: #bbb; font-size: 13px;">未找到任何index.m3u8文件</div>
        <div v-if="m3u8Cmds.length" style="margin-top: 16px;">
          <div style="font-size: 14px; color: #666; margin-bottom: 8px;">批量ffmpeg命令：</div>
          <ul style="max-height: 200px; overflow-y: auto; background: #fafbfc; border-radius: 4px; padding: 12px;">
            <li v-for="(cmd, idx) in m3u8Cmds" :key="idx" style="font-size: 13px; color: #333; line-height: 1.8;">
              {{ cmd }}
            </li>
          </ul>
        </div>
      </div>
    </el-card>

    <!-- 上传方式选择 -->
    <el-card class="upload-method-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>上传方式</span>
        </div>
      </template>
      <el-radio-group v-model="uploadMethod" size="large">
        <el-radio-button label="smart">智能上传（推荐）</el-radio-button>
        <el-radio-button label="multiple">多选上传</el-radio-button>
        <el-radio-button label="chunk">分片上传</el-radio-button>
      </el-radio-group>
      
      <div class="method-description">
        <p v-if="uploadMethod === 'smart'">
          <el-icon><InfoFilled /></el-icon>
          自动检测文件类型，支持混合上传（视频和图片同时上传）
        </p>
        <p v-if="uploadMethod === 'multiple'">
          <el-icon><InfoFilled /></el-icon>
          指定文件类型，批量上传同类型文件
        </p>
        <p v-if="uploadMethod === 'chunk'">
          <el-icon><InfoFilled /></el-icon>
          大文件分片上传，支持断点续传和进度监控
        </p>
      </div>
    </el-card>

    <!-- 文件类型选择（仅多选上传时显示） -->
    <el-card v-if="uploadMethod === 'multiple'" class="file-type-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>文件类型</span>
        </div>
      </template>
      <el-radio-group v-model="fileType" size="large">
        <el-radio-button label="image">图片文件</el-radio-button>
        <el-radio-button label="video">视频文件</el-radio-button>
      </el-radio-group>
    </el-card>

    <!-- 文件上传区域 -->
    <el-card class="upload-area-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>文件上传</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleUpload" :disabled="!selectedFiles.length" :loading="uploading">
              开始上传
            </el-button>
            <el-button @click="clearFiles">清空文件</el-button>
          </div>
        </div>
      </template>

      <!-- 拖拽上传区域 -->
      <el-upload
        ref="uploadRef"
        class="upload-uploader"
        :auto-upload="false"
        :show-file-list="false"
        :multiple="true"
        :on-change="handleFileChange"
        :before-remove="handleRemove"
        drag
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或 <em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            <p v-if="uploadMethod === 'smart'">
              支持视频和图片文件混合上传，自动检测文件类型
            </p>
            <p v-else-if="uploadMethod === 'multiple'">
              仅支持 {{ fileType === 'image' ? '图片' : 'video' === 'video' ? '视频' : '图片' }} 文件
            </p>
            <p v-else>
              支持大文件分片上传，建议用于视频文件
            </p>
          </div>
        </template>
      </el-upload>

      <!-- 文件列表 -->
      <div v-if="selectedFiles.length" class="file-list">
        <h4>已选择的文件 ({{ selectedFiles.length }})</h4>
        <el-table :data="selectedFiles" style="width: 100%">
          <el-table-column prop="name" label="文件名" min-width="200" />
          <el-table-column prop="size" label="大小" width="120">
            <template #default="scope">
              {{ formatFileSize(scope.row.size) }}
            </template>
          </el-table-column>
          <el-table-column prop="type" label="类型" width="100">
            <template #default="scope">
              <el-tag :type="getFileTypeTag(scope.row.type)">
                {{ getFileTypeName(scope.row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="scope">
              <el-button size="small" type="danger" @click="removeFile(scope.$index)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 上传进度 -->
    <el-card v-if="uploading || uploadResults.length" class="progress-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>上传进度</span>
          <el-button v-if="uploadResults.length" type="primary" size="small" @click="clearResults">
            清空结果
          </el-button>
        </div>
      </template>

      <!-- 总体进度 -->
      <div v-if="uploading" class="overall-progress">
        <h4>总体进度</h4>
        <el-progress 
          :percentage="overallProgress" 
          :status="overallProgress === 100 ? 'success' : ''"
        />
        <p>已上传: {{ uploadedCount }} / {{ totalFiles }}</p>
      </div>

      <!-- 单个文件进度 -->
      <div v-if="uploading" class="file-progress">
        <h4>当前文件: {{ currentFileName }}</h4>
        <el-progress 
          :percentage="currentFileProgress.toFixed(2)" 
          :status="currentFileProgress === 100 ? 'success' : ''"
        />
      </div>

      <!-- 上传结果 -->
      <div v-if="uploadResults.length" class="upload-results">
        <h4>上传结果</h4>
        <el-tabs v-model="activeResultTab">
          <el-tab-pane label="成功" name="success">
            <div v-if="successResults.length" class="result-list">
              <div v-for="(result, index) in successResults" :key="index" class="result-item success">
                <el-icon><CircleCheckFilled /></el-icon>
                <span>{{ result.originalName || result.filename || result.fileName || result.name || '未知文件' }}</span>
                <span class="file-size">{{ result.sizeFormatted }}</span>
              </div>
            </div>
            <el-empty v-else description="暂无成功上传的文件" />
          </el-tab-pane>
          <el-tab-pane label="失败" name="failed">
            <div v-if="failedResults.length" class="result-list">
              <div v-for="(result, index) in failedResults" :key="index" class="result-item failed">
                <el-icon><CircleCloseFilled /></el-icon>
                <span>{{ result.filename }}</span>
                <span class="error-msg">{{ result.error }}</span>
              </div>
            </div>
            <el-empty v-else description="暂无上传失败的文件" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  UploadFilled, 
  InfoFilled, 
  CircleCheckFilled, 
  CircleCloseFilled 
} from '@element-plus/icons-vue';
import { 
  multipleUpload, 
  smartUpload, 
  chunkUpload, 
  mergeChunks, 
  getUploadProgress, 
  getUploadConfig, 
  getDiskInfo 
} from '../../api/api';
import {
  getFileType,
  getFileTypeName,
  getFileTypeTag,
  formatFileSize,
  getProgressColor,
  validateFiles as validateFilesUtil,
  createBatchFormData,
  createChunkFormData,
  calculateChunks
} from '../../utils/upload';
import request from '../../utils/request'
const converting = ref(false)
const convertProgress = ref(0)

// 响应式数据
const uploadMethod = ref<'smart' | 'multiple' | 'chunk'>('smart');
const fileType = ref<'image' | 'video'>('image');
const selectedFiles = ref<File[]>([]);
const uploadRef = ref();
const uploading = ref(false);
const uploadResults = ref<any[]>([]);
const currentFileName = ref('');
const currentFileProgress = ref(0);
const overallProgress = ref(0);
const uploadedCount = ref(0);
const totalFiles = ref(0);
const activeResultTab = ref('success');
const diskRoot = ref('D:/软件')
const dirInputRef = ref<HTMLInputElement | null>(null)
const m3u8Paths = ref<string[]>([])
const m3u8Cmds = ref<string[]>([])

function triggerDirInput() {
  if (!diskRoot.value.trim()) {
    ElMessage.warning('请先输入磁盘路径，否则无法扫描！')
    return
  }
  dirInputRef.value && dirInputRef.value.click()
}

function handleM3u8DirChange(event: Event) {
  const files = Array.from((event.target as HTMLInputElement).files || [])
  const folderMap: Record<string, File[]> = {}
  files.forEach(file => {
    const parts = file.webkitRelativePath.split('/')
    if (parts.length >= 2) {
      const folder = parts.slice(0, -1).join('/')
      if (!folderMap[folder]) folderMap[folder] = []
      folderMap[folder].push(file)
    }
  })
  const found: string[] = []
  const cmds: string[] = []
  Object.entries(folderMap).forEach(([folder, fileList]) => {
    const indexFile = fileList.find(f => f.name === 'index.m3u8')
    if (indexFile) {
      found.push(indexFile.webkitRelativePath)
      // 拼接命令
      const absPath = diskRoot.value.replace(/[\\/]+$/, '') + '/' + indexFile.webkitRelativePath
      const folderParts = indexFile.webkitRelativePath.split('/')
      let parentFolder = folderParts.length >= 2 ? folderParts[folderParts.length - 2] : 'output'
      // 去除.m3u8后缀
      if (parentFolder.endsWith('.m3u8')) {
        parentFolder = parentFolder.slice(0, -5)
      }
      let outputMp4 = diskRoot.value.replace(/[\\/]+$/, '') + '/' + parentFolder + '.mp4'
      outputMp4 = outputMp4.replace(/\s+/g, '') // 剔除所有空格
      // outputMp4 = outputMp4.replace('D:/软件', 'D:/软件/Downloads') // 只替换outputMp4中的D:/软件
      outputMp4 = outputMp4.replace('D:/软件', 'D:/软件/编程/视频素材存储') // 只替换outputMp4中的D:/软件
      const cmd = `ffmpeg -i "${absPath}" -c copy ${outputMp4}`
      cmds.push(cmd)
    }
  })
  m3u8Paths.value = found
  m3u8Cmds.value = cmds
}
function clearM3u8Result() {
  m3u8Paths.value = []
  m3u8Cmds.value = []
}

async function handleSmartConvert() {
  if (m3u8Cmds.value.length === 0) return
  converting.value = true
  convertProgress.value = 0
  let success = 0
  let fail = 0
  const total = m3u8Cmds.value.length
  let finished = 0
  const concurrency = 5
  let idx = 0
  async function runOne(cmd: string) {
    try {
      const res = await request.post('/tools/run-cmd', { cmd })
      const { code } = res.data ? res.data : res
      if (code === 0) {
        success++
      } else {
        fail++
      }
    } catch (e) {
      fail++
    } finally {
      finished++
      convertProgress.value = Math.round((finished / total) * 100)
    }
  }
  const queue: Promise<void>[] = []
  function next() {
    if (idx >= total) return
    const cmd = m3u8Cmds.value[idx++]
    const p = runOne(cmd).then(() => next())
    queue.push(p)
  }
  for (let i = 0; i < Math.min(concurrency, total); i++) {
    next()
  }
  await Promise.all(queue)
  converting.value = false
  if (fail === 0) {
    ElMessage.success(`全部${success}项转换成功！`)
  } else {
    ElMessage.warning(`成功${success}项，失败${fail}项！`)
  }
}


// 配置信息
const config = ref<any>({});
const configLoading = ref(false);
const diskInfo = ref<any>({});
const diskInfoLoading = ref(false);

// 计算属性
const successResults = computed(() => 
  uploadResults.value.filter(result => !result.error)
);

const failedResults = computed(() => 
  uploadResults.value.filter(result => result.error)
);

// 文件处理
function handleFileChange(file: any, fileList: any[]) {
  const newFiles = fileList.map(f => f.raw || f);
  selectedFiles.value = newFiles;
}

function handleRemove(file: any, fileList: any[]) {
  selectedFiles.value = fileList.map(f => f.raw || f);
}

function removeFile(index: number) {
  selectedFiles.value.splice(index, 1);
}

function clearFiles() {
  selectedFiles.value = [];
  uploadRef.value?.clearFiles();
}

function clearResults() {
  uploadResults.value = [];
  activeResultTab.value = 'success';
}


// 配置和磁盘信息
async function refreshConfig() {
  configLoading.value = true;
  try {
    const response = await getUploadConfig();
    // 这里加一行打印
    console.log('上传配置', response);
    // 关键：根据实际返回结构赋值
    const res: any = response;
    if (res.video && res.image) {
      config.value = res;
    } else if (res.data && res.data.video && res.data.image) {
      config.value = res.data;
    } else {
      config.value = {};
    }
  } catch (error) {
    console.error('获取配置失败:', error);
    ElMessage.error('获取上传配置失败');
  } finally {
    configLoading.value = false;
  }
}

async function refreshDiskInfo() {
  diskInfoLoading.value = true;
  try {
    const response = await getDiskInfo();
    diskInfo.value = (response as any).data || response || {};
  } catch (error) {
    console.error('获取磁盘信息失败:', error);
    ElMessage.error('获取磁盘信息失败');
  } finally {
    diskInfoLoading.value = false;
  }
}

// 上传处理
async function handleUpload() {
  if (!selectedFiles.value.length) {
    ElMessage.warning('请先选择文件');
    return;
  }

  // 验证文件
  const validationErrors = await validateFiles();
  if (validationErrors.length > 0) {
    ElMessage.error(`文件验证失败: ${validationErrors.join(', ')}`);
    return;
  }

  uploading.value = true;
  uploadResults.value = [];
  uploadedCount.value = 0;
  totalFiles.value = selectedFiles.value.length;
  overallProgress.value = 0;
  console.log(uploadMethod.value);
  
  try {
    if (uploadMethod.value === 'smart') {
      await smartUploadFiles();
    } else if (uploadMethod.value === 'multiple') {
      await multipleUploadFiles();
    } else if (uploadMethod.value === 'chunk') {
      await chunkUploadFiles();
    }
  } catch (error) {
    console.error('上传失败:', error);
    ElMessage.error('上传失败');
  } finally {
    uploading.value = false;
  }
}

async function validateFiles(): Promise<string[]> {
  return validateFilesUtil(selectedFiles.value, config.value);
}

async function smartUploadFiles() {
  const imageFiles = selectedFiles.value.filter(file => getFileType(file) === 'image');
  const videoFiles = selectedFiles.value.filter(file => getFileType(file) === 'video');
  let allResults: any[] = [];

  // 1. 图片批量上传
  if (imageFiles.length > 0) {
    const formData = new FormData();
    imageFiles.forEach(file => formData.append('files', file));
    const response = await smartUpload(formData);
    const result = (response as any).data || response;
    if (result.success) {
      allResults = allResults.concat(result.uploaded || [], result.errors || []);
      // 新增：图片每上传一个都算一个文件
      uploadedCount.value += (result.uploaded ? result.uploaded.length : 0);
      overallProgress.value = (uploadedCount.value / totalFiles.value) * 100;
      if (result.summary) {
        ElMessage.success(`图片上传完成: 成功 ${result.summary.success} 个，失败 ${result.summary.failed} 个`);
      } else {
        ElMessage.success('图片上传完成');
      }
    } else {
      throw new Error('图片智能上传失败');
    }
  }

  // 2. 视频分片上传
  if (videoFiles.length > 0) {
    for (const file of videoFiles) {
      try {
        await uploadFileWithChunks(file);
        // uploadFileWithChunks 内部已处理结果和消息
      } catch (error: any) {
        uploadResults.value.push({
          filename: file.name,
          error: error?.message || '分片上传失败'
        });
      }
    }
  }

  // 3. 合并结果
  if (allResults.length > 0) {
    uploadResults.value = uploadResults.value.concat(allResults);
  }
}

async function multipleUploadFiles() {
  const formData = new FormData();
  formData.append('fileType', fileType.value);
  
  selectedFiles.value.forEach(file => {
    formData.append('files', file);
  });

  const response = await multipleUpload(formData);
  const result = (response as any).data || response;
  
  if (result.success) {
    uploadResults.value = [
      ...(result.uploaded || []),
      ...(result.errors || [])
    ];
    
    if (result.summary) {
      ElMessage.success(`多选上传完成: 成功 ${result.summary.success} 个，失败 ${result.summary.failed} 个`);
    } else {
      ElMessage.success('多选上传完成');
    }
  } else {
    throw new Error('多选上传失败');
  }
}

async function chunkUploadFiles() {
  for (let i = 0; i < selectedFiles.value.length; i++) {
    const file = selectedFiles.value[i];
    currentFileName.value = file.name;
    currentFileProgress.value = 0;
    
    try {
      await uploadFileWithChunks(file);
      uploadedCount.value++;
      overallProgress.value = (uploadedCount.value / totalFiles.value) * 100;
    } catch (error: any) {
      console.error(`文件 ${file.name} 上传失败:`, error);
      uploadResults.value.push({
        filename: file.name,
        error: error?.message || '上传失败'
      });
    }
  }
}

async function uploadFileWithChunks(file: File) {
  const fileType = getFileType(file);
  const configForType = config.value[fileType];
  const chunkSize = configForType.chunkSize || 2 * 1024 * 1024; // 默认2MB
  const totalChunks = Math.ceil(file.size / chunkSize);
  
  // 上传所有分片
  for (let i = 0; i < totalChunks; i++) {
    const chunkBlob = file.slice(i * chunkSize, (i + 1) * chunkSize);
    const formData = new FormData();
    
    formData.append('fileType', fileType);
    formData.append('fileName', file.name);
    formData.append('chunkIndex', i.toString());
    formData.append('totalChunks', totalChunks.toString());
    formData.append('fileSize', file.size.toString());
    formData.append('chunk', chunkBlob);
    
    await chunkUpload(formData);
    
    currentFileProgress.value = ((i + 1) / totalChunks) * 100;
  }
  
  // 合并分片，传递所有必需参数
  const mergeResponse = await mergeChunks({
    fileType,
    fileName: file.name,
    totalChunks
  });
  const mergeResult = (mergeResponse as any).data || mergeResponse;
  
  if (mergeResult.success) {
    uploadResults.value.push(mergeResult);
    uploadedCount.value++;
    overallProgress.value = (uploadedCount.value / totalFiles.value) * 100;
    ElMessage.success(`文件 ${file.name} 分片上传完成`);
  } else {
    throw new Error('分片合并失败');
  }
}

// 初始化
onMounted(() => {
  refreshConfig();
  refreshDiskInfo();
});
</script>

<style scoped lang="scss">
.batch-upload-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
  
  .el-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}

.disk-info-card {
  .disk-info-content {
    display: flex;
    gap: 40px;
    
    .disk-section {
      flex: 1;
      
      h4 {
        margin: 0 0 10px 0;
        color: #303133;
      }
      
      p {
        margin: 10px 0 0 0;
        color: #606266;
        font-size: 14px;
      }
    }
  }
}

.config-card {
  .config-content {
    h4 {
      margin: 0 0 10px 0;
      color: #303133;
    }
    
    ul {
      margin: 0;
      padding-left: 20px;
      color: #606266;
      
      li {
        margin-bottom: 5px;
      }
    }
  }
}

.upload-method-card {
  .method-description {
    margin-top: 15px;
    
    p {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 5px 0;
      color: #606266;
      
      .el-icon {
        color: #409EFF;
      }
    }
  }
}

.upload-area-card {
  .header-actions {
    display: flex;
    gap: 10px;
  }
  
  .upload-uploader {
    margin-bottom: 20px;
  }
  
  .file-list {
    margin-top: 20px;
    
    h4 {
      margin: 0 0 15px 0;
      color: #303133;
    }
  }
}

.progress-card {
  .overall-progress,
  .file-progress {
    margin-bottom: 20px;
    
    h4 {
      margin: 0 0 10px 0;
      color: #303133;
    }
    
    p {
      margin: 10px 0 0 0;
      color: #606266;
    }
  }
  
  .upload-results {
    h4 {
      margin: 0 0 15px 0;
      color: #303133;
    }
    
    .result-list {
      .result-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px;
        margin-bottom: 8px;
        border-radius: 4px;
        background: #f5f7fa;
        
        &.success {
          background: #f0f9ff;
          color: #67C23A;
        }
        
        &.failed {
          background: #fef0f0;
          color: #F56C6C;
        }
        
        .file-size {
          margin-left: auto;
          font-size: 12px;
          color: #909399;
        }
        
        .error-msg {
          margin-left: auto;
          font-size: 12px;
          color: #F56C6C;
        }
      }
    }
  }
}

.m3u8-scan-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}
.m3u8-btn {
  min-width: 96px;
}
@media (max-width: 600px) {
  .m3u8-scan-row {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  .m3u8-btn {
    width: 100%;
    min-width: 0;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .batch-upload-page {
    padding: 10px;
  }
  
  .disk-info-content {
    flex-direction: column;
    gap: 20px;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 5px;
  }
}
</style>