import { createApp } from "vue";
import "./style.css";
import "element-plus/dist/index.css";
import App from "./App.vue";
import router from "./router/index";
import pinia from "./store";
import { useMenuStore } from "./store/menu";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

const menuStore = useMenuStore(pinia);

// 刷新后先恢复菜单组件，再注册动态路由，避免 RouterView 找不到组件。
const savedRoutes = menuStore.routerList;
if (savedRoutes.length) {
  menuStore.setDynamicMenu(savedRoutes);
  savedRoutes.forEach((route) => {
    const routePath = route.meta?.path || route.path;
    const exists = router.getRoutes().some((registered) => registered.path === routePath || registered.meta?.path === routePath);
    if (route.path && !exists) {
      router.addRoute("main", route as never);
    }
  });
}

router.beforeEach((to) => {
  const token = localStorage.getItem("token");
  if (to.path !== "/login" && !token) return "/login";
  if (to.path === "/login" && token) return "/dashboard";
  return true;
});

const app = createApp(App);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
app.use(pinia);
app.use(router);
app.mount("#app");
