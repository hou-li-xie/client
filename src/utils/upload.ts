import { FileType } from '@/types/upload';

/**
 * 检测文件类型
 * @param file 文件对象
 * @returns 文件类型
 */
export function getFileType(file: File): FileType {
  if (file.type.startsWith('image/')) return FileType.IMAGE;
  if (file.type.startsWith('video/')) return FileType.VIDEO;
  return FileType.OTHER;
}

/**
 * 获取文件类型名称
 * @param type 文件类型
 * @returns 文件类型名称
 */
export function getFileTypeName(type: string): string {
  if (type.startsWith('image/')) return '图片';
  if (type.startsWith('video/')) return '视频';
  return '其他';
}

/**
 * 获取文件类型标签样式
 * @param type 文件类型
 * @returns 标签类型
 */
export function getFileTypeTag(type: string): string {
  if (type.startsWith('image/')) return 'success';
  if (type.startsWith('video/')) return 'warning';
  return 'info';
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 获取进度条颜色
 * @param percentage 百分比
 * @returns 颜色值
 */
export function getProgressColor(percentage: number): string {
  if (percentage < 50) return '#67C23A';
  if (percentage < 80) return '#E6A23C';
  return '#F56C6C';
}

/**
 * 验证文件
 * @param file 文件对象
 * @param config 上传配置
 * @returns 错误信息数组
 */
export function validateFile(file: File, config: any): string[] {
  const errors: string[] = [];

  if (!config) {
    errors.push('配置信息不完整');
    return errors;
  }

  const fileType = getFileType(file);
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();

  if (fileType === FileType.OTHER) {
    errors.push(`不支持的文件类型: ${file.name}`);
    return errors;
  }

  const configForType = config[fileType];
  if (!configForType) {
    errors.push(`未找到文件类型配置: ${fileType}`);
    return errors;
  }

  // 添加调试信息
  console.log('文件验证信息:', {
    fileName: file.name,
    fileSize: file.size,
    fileSizeFormatted: formatFileSize(file.size),
    maxSize: configForType.maxSize,
    maxSizeFormatted: configForType.maxSizeFormatted,
    configForType
  });

  if (!configForType.allowedTypes.includes(ext)) {
    errors.push(`不支持的文件格式: ${file.name} (${ext})`);
    return errors;
  }

  // 处理 maxSize 可能的整数溢出问题
  let maxSizeInBytes = typeof configForType.maxSize === 'string'
      ? parseInt(configForType.maxSize, 10)
      : configForType.maxSize;

  // 检查是否发生了整数溢出（32位整数的最大值是 2147483647）
  // 如果 maxSize 是负数但 maxSizeFormatted 显示为较大的值（如 "2 GB"），则尝试从格式化字符串中解析
  if (maxSizeInBytes < 0 && configForType.maxSizeFormatted) {
    // 从 maxSizeFormatted 字符串中提取数值
    const formatted = configForType.maxSizeFormatted.toLowerCase();
    const match = formatted.match(/^([\d.]+)\s*([tgmk])b?$/);
    if (match) {
      const value = parseFloat(match[1]);
      const unit = match[2];
      switch (unit) {
        case 'k':
          maxSizeInBytes = value * 1024;
          break;
        case 'm':
          maxSizeInBytes = value * 1024 * 1024;
          break;
        case 'g':
          maxSizeInBytes = value * 1024 * 1024 * 1024;
          break;
        case 't':
          maxSizeInBytes = value * 1024 * 1024 * 1024 * 1024;
          break;
      }
    }
  }

  // 如果仍然无效，则使用默认值（例如 100MB）
  if (maxSizeInBytes <= 0) {
    maxSizeInBytes = 100 * 1024 * 1024; // 默认 100MB
  }

  if (file.size > maxSizeInBytes) {
    const maxSizeFormatted = configForType.maxSizeFormatted || formatFileSize(maxSizeInBytes);
    errors.push(`文件过大: ${file.name} (${formatFileSize(file.size)} > ${maxSizeFormatted})`);
    return errors;
  }

  return errors;
}


/**
 * 批量验证文件
 * @param files 文件数组
 * @param config 上传配置
 * @returns 错误信息数组
 */
export function validateFiles(files: File[], config: any): string[] {
  const errors: string[] = [];
  
  if (!config) {
    errors.push('配置信息不完整');
    return errors;
  }

  files.forEach(file => {
    const fileErrors = validateFile(file, config);
    console.log(fileErrors)
    errors.push(...fileErrors);
  });

  return errors;
}

/**
 * 计算分片数量
 * @param fileSize 文件大小
 * @param chunkSize 分片大小
 * @returns 分片数量
 */
export function calculateChunks(fileSize: number, chunkSize: number): number {
  return Math.ceil(fileSize / chunkSize);
}

/**
 * 创建分片
 * @param file 文件对象
 * @param chunkIndex 分片索引
 * @param chunkSize 分片大小
 * @returns 分片Blob
 */
export function createChunk(file: File, chunkIndex: number, chunkSize: number): Blob {
  const start = chunkIndex * chunkSize;
  const end = Math.min(start + chunkSize, file.size);
  return file.slice(start, end);
}

/**
 * 创建分片上传的FormData
 * @param file 文件对象
 * @param chunkIndex 分片索引
 * @param totalChunks 总分片数
 * @param fileType 文件类型
 * @param chunk 分片数据
 * @returns FormData对象
 */
export function createChunkFormData(
  file: File, 
  chunkIndex: number, 
  totalChunks: number, 
  fileType: string, 
  chunk: Blob
): FormData {
  const formData = new FormData();
  formData.append('fileType', fileType);
  formData.append('fileName', file.name);
  formData.append('chunkIndex', chunkIndex.toString());
  formData.append('totalChunks', totalChunks.toString());
  formData.append('fileSize', file.size.toString());
  formData.append('chunk', chunk);
  return formData;
}

/**
 * 创建批量上传的FormData
 * @param files 文件数组
 * @param fileType 文件类型（可选）
 * @returns FormData对象
 */
export function createBatchFormData(files: File[], fileType?: string): FormData {
  const formData = new FormData();
  
  if (fileType) {
    formData.append('fileType', fileType);
  }
  
  files.forEach(file => {
    formData.append('files', file);
  });
  
  return formData;
}

/**
 * 计算上传进度
 * @param uploaded 已上传数量
 * @param total 总数量
 * @returns 进度百分比
 */
export function calculateProgress(uploaded: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((uploaded / total) * 100);
}

/**
 * 生成文件唯一标识
 * @param file 文件对象
 * @returns 唯一标识
 */
export function generateFileId(file: File): string {
  return `${file.name}_${file.size}_${file.lastModified}`;
}

/**
 * 检查文件是否为图片
 * @param file 文件对象
 * @returns 是否为图片
 */
export function isImage(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * 检查文件是否为视频
 * @param file 文件对象
 * @returns 是否为视频
 */
export function isVideo(file: File): boolean {
  return file.type.startsWith('video/');
}

/**
 * 获取文件扩展名
 * @param filename 文件名
 * @returns 扩展名（包含点）
 */
export function getFileExtension(filename: string): string {
  return '.' + filename.split('.').pop()?.toLowerCase();
}

/**
 * 检查文件扩展名是否在允许列表中
 * @param filename 文件名
 * @param allowedExtensions 允许的扩展名列表
 * @returns 是否允许
 */
export function isAllowedExtension(filename: string, allowedExtensions: string[]): boolean {
  const ext = getFileExtension(filename);
  return allowedExtensions.includes(ext);
}

/**
 * 格式化上传时间
 * @param dateString 日期字符串
 * @returns 格式化的时间
 */
export function formatUploadTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param wait 等待时间
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param limit 限制时间
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
} 