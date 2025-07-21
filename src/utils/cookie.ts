// 设置cookie
export function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

// 获取cookie
export function getCookie(name: string): string | null {
  const match = document.cookie.match('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)');
  return match ? decodeURIComponent(match[1]) : null;
} 

// 删除 cookie
export function removeCookie(name: string) {
  setCookie(name, '', -1)
} 