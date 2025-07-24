<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getAllUsers, updateUser, deleteUser } from "../../api/api";
import { ElMessage, ElMessageBox } from "element-plus";
import type { User } from "../../types/user";

// 用户列表数据
const userList = ref<User[]>([]);
const filteredUserList = ref<User[]>([]);
const loading = ref(false);

// 搜索表单
const searchForm = ref({
  username: "",
  id: "",
});

// 编辑弹窗相关
const editDialogVisible = ref(false);
const editForm = ref({
  id: 0,
  username: "",
  password: "",
  avatar: "",
});
const editFormRules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 2, max: 20, message: "用户名长度在 2 到 20 个字符", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, max: 20, message: "密码长度在 6 到 20 个字符", trigger: "blur" },
  ],
  avatar: [
    { required: true, message: "请输入头像URL", trigger: "blur" },
  ],
};
const editFormRef = ref();

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true;
  try {
    const res: any = await getAllUsers();
    if (res && res.code === 0) {
      // 按ID升序排列
      const sortedData = (res.data || []).sort(
        (a: User, b: User) => a.id - b.id
      );
      userList.value = sortedData;
      filteredUserList.value = sortedData;
      ElMessage.success("获取用户列表成功");
    } else {
      ElMessage.error(res?.msg || "获取用户列表失败");
    }
  } catch (error) {
    console.error("获取用户列表失败:", error);
    ElMessage.error("获取用户列表失败");
  } finally {
    loading.value = false;
  }
};

// 搜索用户
const handleSearch = () => {
  if (!searchForm.value.username && !searchForm.value.id) {
    // 如果搜索条件为空，显示所有用户
    filteredUserList.value = userList.value;
    return;
  }

  filteredUserList.value = userList.value.filter((user) => {
    const matchUsername =
      !searchForm.value.username ||
      user.username
        .toLowerCase()
        .includes(searchForm.value.username.toLowerCase());
    const matchId =
      !searchForm.value.id || user.id.toString().includes(searchForm.value.id);

    return matchUsername && matchId;
  });
};

// 重置搜索
const handleReset = () => {
  searchForm.value = {
    username: "",
    id: "",
  };
  filteredUserList.value = userList.value;
};

// 编辑用户
const handleEdit = (id: number) => {
  const user = userList.value.find(u => u.id === id);
  if (user) {
    editForm.value = {
      id: user.id,
      username: user.username,
      password: "", // 密码不显示，需要重新输入
      avatar: user.avatar,
    };
    editDialogVisible.value = true;
  }
};

// 提交编辑
const handleEditSubmit = async () => {
  try {
    await editFormRef.value.validate();
    
    const res: any = await updateUser(editForm.value);
    if (res && res.code === 0) {
      ElMessage.success("编辑用户成功");
      editDialogVisible.value = false;
      // 重新获取用户列表
      await fetchUserList();
    } else {
      ElMessage.error(res?.msg || "编辑用户失败");
    }
  } catch (error) {
    console.error("编辑用户失败:", error);
    ElMessage.error("编辑用户失败");
  }
};

// 取消编辑
const handleEditCancel = () => {
  editDialogVisible.value = false;
  editFormRef.value?.resetFields();
};

// 删除用户
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm("确定要删除这个用户吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    const res: any = await deleteUser(id);
    if (res && res.code === 0) {
      ElMessage.success("删除用户成功");
      await fetchUserList();
    } else {
      ElMessage.error(res?.msg || "删除用户失败");
    }
  } catch {
    ElMessage.info("已取消删除");
  }
};

// 格式化时间
const formatTime = (timeStr: string) => {
  if (!timeStr) return "-";
  return new Date(timeStr).toLocaleString("zh-CN");
};

// 页面加载时获取用户列表
onMounted(() => {
  fetchUserList();
});
</script>

<template>
  <div class="user-management">
    <!-- 搜索卡片 -->
    <el-card class="search-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>用户搜索</span>
        </div>
      </template>

      <el-form :model="searchForm" inline>
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.username"
            placeholder="请输入用户名"
            clearable
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item label="用户ID">
          <el-input
            v-model="searchForm.id"
            placeholder="请输入用户ID"
            clearable
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch"> 搜索 </el-button>
          <el-button @click="handleReset"> 重置 </el-button>
          <el-button @click="fetchUserList" :loading="loading">
            刷新
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 用户表格 -->
    <el-card class="table-card" shadow="hover">
      <div class="table_card">
        <el-table
          :data="filteredUserList"
          v-loading="loading"
          stripe
          border
          style="width: 100%"
          height="100%"
          :max-height="500"
        >
          <el-table-column
            prop="id"
            label="ID"
            width="80"
            fixed="left"
            sortable
            align="center"
            header-align="center"
          />

          <el-table-column
            prop="username"
            label="用户名"
            min-width="120"
            sortable
            align="center"
            header-align="center"
          />

          <el-table-column
            prop="avatar"
            label="头像"
            width="100"
            align="center"
            header-align="center"
          >
            <template #default="scope">
              <el-avatar
                :src="scope.row.avatar"
                :size="40"
                :alt="scope.row.username"
              >
                <img
                  src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
                />
              </el-avatar>
            </template>
          </el-table-column>

          <el-table-column
            prop="createdAt"
            label="创建时间"
            min-width="160"
            sortable
            align="center"
            header-align="center"
          >
            <template #default="scope">
              {{ formatTime(scope.row.createdAt) }}
            </template>
          </el-table-column>

          <el-table-column
            label="操作"
            width="160"
            fixed="right"
            align="center"
            header-align="center"
          >
            <template #default="scope">
              <el-button
                size="small"
                type="primary"
                @click="handleEdit(scope.row.id)"
              >
                编辑
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click="handleDelete(scope.row.id)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 编辑用户弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑用户"
      width="500px"
      :before-close="handleEditCancel"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editFormRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="editForm.password" type="password" />
        </el-form-item>
        <el-form-item label="头像" prop="avatar">
          <el-input v-model="editForm.avatar" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleEditCancel">取消</el-button>
          <el-button type="primary" @click="handleEditSubmit">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.user-management {
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  
  .search-card {
    flex-shrink: 0;
    margin-bottom: 20px;
    
    :deep(.el-card__body) {
      padding: 10px;
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
  
  .table-card {
    // flex: 1;
    // display: flex;
    // flex-direction: column;
    .table_card{
        height: 530px;
    }
    :deep(.el-card__body) {
      flex: 1;
      padding: 10px;
      overflow: hidden;
    }
    
    .el-form-item {
      margin-bottom: 0;
    }
  }
}

// 编辑弹窗样式
:deep(.el-dialog) {
  border-radius: 8px;
  
  .el-dialog__header {
    padding: 20px 20px 10px;
    border-bottom: 1px solid #f0f0f0;
    
    .el-dialog__title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }
  
  .el-dialog__body {
    padding: 30px 20px;
    
    .el-form-item {
      margin-bottom: 24px;
      
      .el-form-item__label {
        font-weight: 500;
        color: #606266;
      }
      
      .el-input {
        .el-input__wrapper {
          border-radius: 6px;
        }
      }
    }
  }
  
  .el-dialog__footer {
    padding: 10px 20px 20px;
    border-top: 1px solid #f0f0f0;
    
    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      
      .el-button {
        border-radius: 6px;
        padding: 8px 20px;
      }
    }
  }
}
</style>