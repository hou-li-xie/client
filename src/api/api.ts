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
  return request.post('/api/smart-upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

// 分片上传接口
export function chunkUpload(formData: FormData): Promise<{ data: ChunkUploadResponse }> {
  return request.post('/api/chunk-upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

// 合并分片接口
export function mergeChunks(data: { fileType: string; fileName: string; totalChunks: number }): Promise<{ data: MergeChunksResponse }> {
  return request.post('/api/merge-chunks', data);
}

// 获取上传进度接口
export function getUploadProgress(fileName: string): Promise<{ data: UploadProgress }> {
  return request.get(`/api/upload-progress/${fileName}`);
}

// 获取上传配置接口
export function getUploadConfig(): Promise<{ data: UploadConfig }> {
  return request.get('/api/config');
}

// 获取磁盘空间信息接口
export function getDiskInfo(): Promise<{ data: DiskInfo }> {
  return request.get('/api/disk-info');
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
