<script setup lang="ts">
import { reactive, ref } from "vue";
import { User, Lock, ChatDotRound } from "@element-plus/icons-vue";
import { login } from "../../api/api";
import { setCookie } from "../../utils/cookie";
import { ElMessage } from "element-plus";
import { useRouter,useRoute } from "vue-router";
//登录注册切换
const className = ref<string>("");
function handleRegister() {
  className.value = "right-panel-active";
}
function handleSignIn() {
  className.value = "";
}
const formData = reactive({
  username: "小红",
  password: "123456",
});
const router = useRouter();
const route = useRoute();
// 登录操作
async function handleLogin(e: Event) {
  e.preventDefault();
  const res: any = await login({
    username: formData.username,
    password: formData.password,
  });
  // 假设后端返回 { token: 'xxx', ... }
  if (res && res.code === 0 && res.token) {
    setCookie("token", res.token);
    ElMessage.success("登录成功！");
    localStorage.setItem('user',JSON.stringify(res.user))
    router.push("/layout");
  } else {
    ElMessage.error(res?.msg || "登录失败");
  }
}
</script>

<template>
  <div class="login-page">
    <div class="container" id="container" :class="className">
      <div class="form-container sign-up-container">
        <form action="#">
          <h1>Create Account</h1>
          <div class="social-container">
            <a href="#" class="social"><i class="bi bi-facebook"></i></a>
            <a href="#" class="social"><i class="bi bi-twitter-x"></i></a>
            <a href="#" class="social"><i class="bi bi-instagram"></i></a>
          </div>
          <span style="margin-bottom: 10px"
            >or use your email for registration</span
          >
          <el-input
            v-model="formData.username"
            style="width: 240px; margin-bottom: 10px"
            :prefix-icon="User"
            placeholder="Please enter your username"
          />
          <el-input
            v-model="formData.password"
            style="width: 240px; margin-bottom: 10px"
            :prefix-icon="Lock"
            placeholder="Please input a password"
          />
          <div class="code_input">
            <el-input
              v-model="formData.password"
              style="width: 240px; margin-bottom: 10px"
              :prefix-icon="ChatDotRound"
              placeholder="Please input a code"
            />
            <a href="#" class="get_code">get a code</a>
          </div>

          <button>Sign Up</button>
        </form>
      </div>
      <div class="form-container sign-in-container">
        <form action="#" @submit="handleLogin">
          <h1>Sign in</h1>
          <div class="social-container">
            <a href="#" class="social"><i class="bi bi-facebook"></i></a>
            <a href="#" class="social"><i class="bi bi-twitter-x"></i></a>
            <a href="#" class="social"><i class="bi bi-instagram"></i></a>
          </div>
          <span style="margin-bottom: 10px">or use your account</span>
          <el-input
            v-model="formData.username"
            style="width: 240px; margin-bottom: 20px"
            :prefix-icon="User"
            placeholder="Please enter your username"
          />
          <el-input
            v-model="formData.password"
            style="width: 240px"
            :prefix-icon="Lock"
            placeholder="Please input a password"
            show-password
          />
          <a href="#">Forgot your password?</a>
          <button type="submit">Sign In</button>
        </form>
      </div>
      <div class="overlay-container">
        <div class="overlay">
          <div class="overlay-panel overlay-left">
            <h1>Welcome Back!</h1>
            <p>
              To keep connected with us please login with your personal info
            </p>
            <button class="ghost" id="signIn" @click="handleSignIn">
              Sign In
            </button>
          </div>
          <div class="overlay-panel overlay-right">
            <h1>Hello, Friend!</h1>
            <p>Enter your personal details and start journey with us</p>
            <button class="ghost" id="signUp" @click="handleRegister">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-page {
  width: 100vw;
  height: 100vh;
  background-color: #f6f5f7;
  display: flex;
  align-items: center;
  justify-content: center;
}
@import url("https://fonts.googleapis.com/css?family=Montserrat:400,800");

* {
  box-sizing: border-box;
}

body {
  background: #f6f5f7;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-family: "Montserrat", sans-serif;
  height: 100vh;
  margin: -20px 0 50px;
}

h1 {
  font-weight: bold;
  margin: 0;
}

h2 {
  text-align: center;
}

p {
  font-size: 14px;
  font-weight: 100;
  line-height: 20px;
  letter-spacing: 0.5px;
  margin: 20px 0 30px;
}

span {
  font-size: 12px;
}

a {
  color: #333;
  font-size: 14px;
  text-decoration: none;
  margin: 15px 0;
}

button {
  border-radius: 20px;
  border: 1px solid #ff4b2b;
  background-color: #ff4b2b;
  color: #ffffff;
  font-size: 12px;
  font-weight: bold;
  padding: 12px 45px;
  letter-spacing: 1px;
  text-transform: uppercase;
  transition: transform 80ms ease-in;
}

button:active {
  transform: scale(0.95);
}

button:focus {
  outline: none;
}

button.ghost {
  background-color: transparent;
  border-color: #ffffff;
}

form {
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 50px;
  height: 100%;
  text-align: center;
}

input {
  background-color: #eee;
  border: none;
  padding: 12px 15px;
  margin: 8px 0;
  width: 100%;
}

.container {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
  position: relative;
  overflow: hidden;
  width: 768px;
  max-width: 100%;
  min-height: 480px;
}

.form-container {
  position: absolute;
  top: 0;
  height: 100%;
  transition: all 0.6s ease-in-out;
}

.sign-in-container {
  left: 0;
  width: 50%;
  z-index: 2;
}

.container.right-panel-active .sign-in-container {
  transform: translateX(100%);
}

.sign-up-container {
  left: 0;
  width: 50%;
  opacity: 0;
  z-index: 1;
}

.container.right-panel-active .sign-up-container {
  transform: translateX(100%);
  opacity: 1;
  z-index: 5;
  animation: show 0.6s;
}

@keyframes show {
  0%,
  49.99% {
    opacity: 0;
    z-index: 1;
  }

  50%,
  100% {
    opacity: 1;
    z-index: 5;
  }
}

.overlay-container {
  position: absolute;
  top: 0;
  left: 50%;
  width: 50%;
  height: 100%;
  overflow: hidden;
  transition: transform 0.6s ease-in-out;
  z-index: 100;
}

.container.right-panel-active .overlay-container {
  transform: translateX(-100%);
}

.overlay {
  background: #ff416c;
  background: -webkit-linear-gradient(to right, #ff4b2b, #ff416c);
  background: linear-gradient(to right, #ff4b2b, #ff416c);
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 0 0;
  color: #ffffff;
  position: relative;
  left: -100%;
  height: 100%;
  width: 200%;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;
}

.container.right-panel-active .overlay {
  transform: translateX(50%);
}

.overlay-panel {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 40px;
  text-align: center;
  top: 0;
  height: 100%;
  width: 50%;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;
}

.overlay-left {
  transform: translateX(-20%);
}

.container.right-panel-active .overlay-left {
  transform: translateX(0);
}

.overlay-right {
  right: 0;
  transform: translateX(0);
}

.container.right-panel-active .overlay-right {
  transform: translateX(20%);
}

.social-container {
  margin: 20px 0;
}

.social-container a {
  border: 1px solid #dddddd;
  border-radius: 50%;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  margin: 0 5px;
  height: 40px;
  width: 40px;
  i {
    font-size: 20px;
  }
}

footer {
  background-color: #222;
  color: #fff;
  font-size: 14px;
  bottom: 0;
  position: fixed;
  left: 0;
  right: 0;
  text-align: center;
  z-index: 999;
}

footer p {
  margin: 10px 0;
}

footer i {
  color: red;
}

footer a {
  color: #3c97bf;
  text-decoration: none;
}
.el-input {
  height: 40px;
}
.code_input {
  position: relative;
}
.get_code {
  position: absolute;
  bottom: 6px;
  right: 4px;
  font-size: 12px;
  color: #0ebeff;
}
</style>
