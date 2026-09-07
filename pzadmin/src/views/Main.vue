<template>
  <div class="common-layout">
    <el-container>
      <!-- 引入侧边栏 -->
      <Aside />
      <el-container>
        <el-header>
          <!-- 引入头部组件 -->
          <Header />
        </el-header>
        <el-main>
          <!-- 引入内容组件 -->
          <RouterView />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
  import Aside from "../components/aside.vue";
  import Header from "../components/navHeader.vue";
</script>
<style lang="less" scoped>
  .common-layout {
    height: 100%;

    .el-container {
      height: 100%;
    }
  }
</style>
