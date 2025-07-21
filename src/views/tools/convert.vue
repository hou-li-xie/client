<template>
  <el-card class="convert-card">
    <el-form :model="form" :rules="rules" ref="formRef" label-width="120px" label-position="left" class="convert-form">
      <div class="convert-tip" style="margin-bottom: 32px;">
        ffmpeg -i "m3U8文件地址" -c copy 保存的地址+文件名.mp4
      </div>
      <el-form-item label="m3u8文件地址" prop="m3u8Url">
        <el-input v-model="form.m3u8Url" @input="trimInput('m3u8Url')" placeholder="请输入m3u8文件地址" clearable size="large" />
      </el-form-item>
      <el-form-item label="保存的地址" prop="savePath">
        <el-input v-model="form.savePath" @input="trimInput('savePath')" placeholder="请输入保存地址" clearable size="large" />
        <div class="convert-tip">默认值：D:\软件\Downloads</div>
      </el-form-item>
      <el-form-item label="文件名" prop="fileName">
        <el-input v-model="form.fileName" @input="trimInput('fileName')" placeholder="请输入文件名（不带扩展名）" clearable size="large" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="large" @click="handleUpload">生成命令</el-button>
      </el-form-item>
    </el-form>
    <el-alert v-if="command" :title="command" type="info" show-icon class="convert-alert" />
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import request from '../../utils/request'

const form = reactive({
  m3u8Url: '',
  savePath: 'D:\\软件\\Downloads',
  fileName: ''
})
const command = ref('')
const formRef = ref<FormInstance>()

const rules: FormRules = {
  m3u8Url: [
    { required: true, message: '请输入m3u8文件地址', trigger: 'blur' }
  ],
  savePath: [
    { required: true, message: '请输入保存地址', trigger: 'blur' }
  ],
  fileName: [
    { required: true, message: '请输入文件名', trigger: 'blur' }
  ]
}

function trimInput(field: 'm3u8Url' | 'savePath' | 'fileName') {
  form[field] = form[field].trim()
}

async function handleUpload() {
  // 先去除所有空格
//   form.m3u8Url = form.m3u8Url.replace(/\s+/g, '')
//   form.savePath = form.savePath.replace(/\s+/g, '')
//   form.fileName = form.fileName.replace(/\s+/g, '')

  await formRef.value?.validate(async (valid) => {
    if (!valid) {
      command.value = ''
      return
    }
    const url = form.m3u8Url
    const path = form.savePath
    const name = form.fileName
    command.value = `ffmpeg -i "${url}" -c copy ${path}${path.endsWith('\\') ? '' : '\\'}${name}.mp4`
    // 调用后端接口（使用request/axios）
    try {
      const res = await request.post('/tools/run-cmd', { cmd: command.value })
      const { code, msg } = res.data ? res.data : res
      if (code === 0) {
        ElMessage.success('命令执行成功！')
      } else {
        ElMessage.error(msg || '命令执行失败')
      }
    } catch (e) {
      ElMessage.error('网络异常，命令未执行')
    }
  })
}
</script>

<style scoped>
.convert-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.04);
  padding: 24px 24px 16px 24px;
  margin: 32px 0 0 0;
  /* 参考ImageShow.vue的卡片风格 */
}
.convert-form {
  width: 100%;
  margin-bottom: 24px;
}
.el-form-item {
  margin-bottom: 24px;
}
.convert-tip {
  font-size: 13px;
  color: #888;
  margin-top: 4px;
}
.convert-alert {
  width: 100%;
  margin-top: 24px;
  font-size: 18px;
}
</style>