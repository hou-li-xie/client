import { createRouter, createWebHistory } from "vue-router";
import { getCookie } from "../utils/cookie";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      redirect: "/login",
    },
    {
      path: "/login",
      name: "login",
      component: () => import("@/views/login/index.vue"),
    },
    {
      path: "/layout",
      name: "layout",
      redirect:'/dashboard',
      component: () => import("@/layout/index.vue"),
      meta: {
        title: "首页",
      },
      children: [
        {
          path: "/dashboard",
          name: "Home",
          component: () => import("@/views/dashboard/index.vue"),
          meta: {
            title: "dashboard",
          },
        },
        {
          path: "/sys",
          name: "系统管理",
          // component: () => import("@/views/sys/user.vue"),
          meta: {
            title: "系统管理",
          },
          children: [
            {
              path: "user",
              name: "用户管理",
              component: () => import("@/views/sys/user.vue"),
              meta: {
                title: "用户管理",
              },
            },
          ],
        },
        {
          path: "/material",
          name: "素材管理",
          // component: () => import("@/views/material/show.vue"),
          meta: {
            title: "素材管理",
          },
          children: [
            {
              path: "show",
              name: "素材展示",
              component: () => import("@/views/material/show.vue"),
              meta: {
                title: "素材展示",
              },
            },
            {
              path: "upload",
              name: "素材上传",
              component: () => import("@/views/material/upload.vue"),
              meta: {
                title: "素材上传",
              },
            }
          ],
        },
        {
          path: "/tools",
          name: "tools",
          // component: () => import("@/views/material/show.vue"),
          meta: {
            title: "便捷工具",
          },
          children: [
            {
              path: "convert",
              name: "m3u8转mp4",
              component: () => import("@/views/tools/convert.vue"),
              meta: {
                title: "m3u8转mp4",
              },
            }
          ],
        },
      ],
    },
  ],
});

router.beforeEach((to, from, next) => {
  const token = getCookie("token");
  console.log("路由守卫触发，当前token：", token);

  // 需要登录的页面（layout及其子路由）
  const needAuth = to.matched.some(record => record.path.startsWith("/layout"));

  if (needAuth) {
    if (!token) {
      // 未登录，跳转到登录页
      next({ path: "/login", replace: true });
    } else {
      // 已登录，放行
      next();
    }
  } else if (to.path === "/login") {
    if (token) {
      // 已登录，访问登录页时重定向到首页
      next({ path: "/layout", replace: true });
    } else {
      // 未登录，放行
      next();
    }
  } else {
    // 其他页面直接放行
    next();
  }
});

export default router;



  