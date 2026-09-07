<template>
  <el-menu :style="{ width: !isCollapse ? '230px' : '64px' }" active-text-color="#ffd04b" background-color="#545c64"
    class="aside-container" text-color="#fff" @open="handleOpen" @close="handleClose" :collapse="isCollapse"
    :default-active="active">
    <p class="logo-lg">{{ isCollapse ? "知护" : "知护陪诊" }}</p>
    <TreeMenu :index="1" :menuData="menuData" />
  </el-menu>
</template>
<script setup lang="ts">
  import { computed } from "vue";
  import TreeMenu from "./treeMenu.vue";
  // import { useRouter } from "vue-router";
  import { useMenuStore } from "../store/menu";
  const menuStore = useMenuStore();
  // const router = useRouter();
  // const menuData = reactive(router.options.routes[0].children || []);
  const menuData = computed(() => menuStore.routerList)
  const isCollapse = computed(() => menuStore.isCollapse)
  const active = computed(() => menuStore.menuActive)

  const handleOpen = () => { };
  const handleClose = () => { };
</script>

<style lang="less" scoped>
  .aside-container {
    height: 100%;

    .logo-lg {
      font-size: 20px;
      text-align: center;
      height: 50px;
      line-height: 50px;
      color: #fff;
    }
  }
</style>
