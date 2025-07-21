import { defineStore } from "pinia";
import { ref ,onMounted} from "vue";
import { getUserProfile } from "@/api/api";
export const useUserStore = defineStore("user", () => {
  const userInfo = ref<any>({});
  const loading = ref(false);

  // 获取用户信息
  const fetchUserInfo = async () => {
    if (loading.value) return;
    try {
      loading.value = true;
      const user=JSON.parse(localStorage.getItem('user') as string)
      const res: any = await getUserProfile({ id: user.id });
      if (res.code === 0) {
        userInfo.value = res?.data;
        
      }
    } catch (error) {
      console.error("获取用户信息失败:", error);
    } finally {
      loading.value = false;
    }
  };
 // 初始化数据
 const initialize = async () => {
  try {
    await Promise.all([fetchUserInfo()]);
  } catch (error) {
    console.error("初始化数据失败:", error);
  }
};

  // 清除用户信息
  const clearUserInfo = () => {
    userInfo.value = null;
    localStorage.removeItem("userInfo");
  }; 
  onMounted(() => {
    // 立即初始化数据
    initialize();
  });


  return {
    userInfo,
    loading,
    fetchUserInfo,
    clearUserInfo,
  };
});
