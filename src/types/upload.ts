// 上传配置类型
export interface UploadConfig {
  video: {
    allowedTypes: string[];
    maxSize: number;
    maxSizeFormatted: string;
    maxFiles: number;
    chunkSize: number;
    chunkSizeFormatted: string;
    folder: string;
  };
  image: {
    allowedTypes: string[];
    maxSize: number;
    maxSizeFormatted: string;
    maxFiles: number;
    chunkSize: number;
    chunkSizeFormatted: string;
    folder: string;
  };
}

// 磁盘信息类型
export interface DiskInfo {
  video: {
    total: number;
    free: number;
    used: number;
    totalFormatted: string;
    freeFormatted: string;
    usedFormatted: string;
    usagePercent: string;
  };
  image: {
    total: number;
    free: number;
    used: number;
    totalFormatted: string;
    freeFormatted: string;
    usedFormatted: string;
    usagePercent: string;
  };
}

// 上传文件信息类型
export interface UploadedFile {
  originalName: string;
  savedName: string;
  size: number;
  sizeFormatted: string;
  path: string;
  mimeType: string;
  uploadedAt: string;
  chunks?: number;
}

// 上传错误信息类型
export interface UploadError {
  filename: string;
  error: string;
}

// 上传摘要信息类型
export interface UploadSummary {
  total: number;
  success: number;
  failed: number;
  totalSize: number;
  totalSizeFormatted: string;
}

// 上传响应类型
export interface UploadResponse {
  success: boolean;
  uploaded?: UploadedFile[];
  errors?: UploadError[];
  summary?: UploadSummary;
}

// 分片上传响应类型
export interface ChunkUploadResponse {
  success: boolean;
  fileName: string;
  chunkIndex: number;
  uploadedChunks: number;
  totalChunks: number;
}

// 合并分片响应类型
export interface MergeChunksResponse {
  success: boolean;
  originalName: string;
  savedName: string;
  size: number;
  sizeFormatted: string;
  path: string;
  mimeType: string;
  uploadedAt: string;
  chunks: number;
}

// 上传进度类型
export interface UploadProgress {
  fileName: string;
  uploadedChunks: number;
  totalChunks: number;
  progress: number;
}

// 文件类型枚举
export enum FileType {
  IMAGE = 'image',
  VIDEO = 'video',
  OTHER = 'other'
}

// 上传方式枚举
export enum UploadMethod {
  SMART = 'smart',
  MULTIPLE = 'multiple',
  CHUNK = 'chunk'
} 