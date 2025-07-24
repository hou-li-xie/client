import axios from 'axios';
import { getCookie } from './cookie';

// 创建axios实例
const service = axios.create({
  baseURL: '/api', // 通过vite代理转发
  // timeout: 5000, // 请求超时时间
});

// 请求拦截器
service.interceptors.request.use(
  config => {
    //这里可以添加token等操作
    const token = getCookie('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    // 请求错误处理
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 可以根据后端返回格式处理数据
    return response.data;
  },
  error => {
    // 响应错误处理
    return Promise.reject(error);
  }
);

export default service;
