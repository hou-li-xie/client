import request from "@/utils/request";
import type { 
  UploadConfig, 
  DiskInfo, 
  UploadResponse, 
  ChunkUploadResponse, 
  MergeChunksResponse, 
  UploadProgress 
} from "@/types/upload";

// 注册接口
type RegisterParams = {
  username: string;
  password: string;
};
export function register(data: RegisterParams) {
  return request.post("/register", data);
}

// 登录接口
type LoginParams = {
  username: string;
  password: string;
};
export function login(data: LoginParams) {
  return request.post("/login", data);
}

// 菜单接口
export function menu() {
  return request.get("/menu");
}

// 获取用户信息接口
type getUserProfileParams = {
  id: string;
};
export function getUserProfile(data: getUserProfileParams) {
  return request.get(`/user/${data.id}`);
}

// 获取所有用户接口
export function getAllUsers() {
  return request.get("/users");
}

// 编辑用户接口
type UpdateUserParams = {
  id: number;
  username: string;
  password: string;
  avatar: string;
};
export function updateUser(data: UpdateUserParams) {
  return request.put(`/user/${data.id}`, {
    username: data.username,
    password: data.password,
    avatar: data.avatar
  });
}

// 删除用户接口
export function deleteUser(id: number) {
  return request.delete(`/user/${id}`);
}

// ========== 批量上传相关接口 ==========

// 多选上传接口
export function multipleUpload(formData: FormData): Promise<{ data: UploadResponse }> {
  
  
  return request.post('/api/multiple-upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

// 智能上传接口（自动检测文件类型）
export function smartUpload(formData: FormData): Promise<{ data: UploadResponse }> {
  return request.post('/smart-upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

// 分片上传接口
export function chunkUpload(formData: FormData): Promise<{ data: ChunkUploadResponse }> {
  return request.post('/chunk-upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

// 合并分片接口
export function mergeChunks(data: { fileType: string; fileName: string; totalChunks: number }): Promise<{ data: MergeChunksResponse }> {
  return request.post('/merge-chunks', data);
}

// 获取上传进度接口
export function getUploadProgress(fileName: string): Promise<{ data: UploadProgress }> {
  return request.get(`/upload-progress/${fileName}`);
}

// 获取上传配置接口
export function getUploadConfig(): Promise<{ data: UploadConfig }> {
  return request.get('/config');
}

// 获取磁盘空间信息接口
export function getDiskInfo(): Promise<{ data: DiskInfo }> {
  return request.get('/disk-info');
}

export function runCmd(cmd: string) {
  return request.post('/tools/run-cmd', {cmd});
}


export function getAllImages() {
  return request.get('/tools/images');
}

export function getAllVideos() {
  return request.get('/tools/videos');
}
// ========== 兼容旧接口 ==========

// 上传分片（旧接口，保持兼容）
export function uploadMaterialChunk(data: FormData) {
  return request.post('/api/upload', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

// 合并分片（旧接口，保持兼容）
export function mergeMaterialChunks(data: any) {
  return request.post('/api/merge', data);
}
// runCmd

// 删除图片接口
export function deleteImageById(id: number | string) {
  return request.delete(`/tools/delete-media/${id}`);
}

// 添加重命名媒体文件接口
export function renameMediaFile(id: number, newName: string) {
  return request.put(`/tools/rename-media/${id}`, { newName });
}
// CSV上传接口
export function uploadCSV(formData: FormData): Promise<{ data: any }> {
  return request.post('/csv/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

// 数据获取接口
export function getCsvData(startDate: string, endDate: string): Promise<{ data: any }> {
  return request.get('/csv/data', {
    params: {
      startDate,
      endDate
    }
  });
}


// 数据获取接口
export function getExpenseCategoryAmount(): Promise<{ data: any }> {
  return request.get('/csv/expense-category-amount');
}
// getExpenseCategoryRanking

// 数据获取接口
export function getExpenseCategoryRanking(): Promise<{ data: any }> {
  return request.get('/csv/expense-category-ranking');
}