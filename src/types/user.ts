// 用户类型定义
export interface User {
  id: number
  username: string
  avatar: string
  created_at: string
}

// API 响应类型
export interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
} 