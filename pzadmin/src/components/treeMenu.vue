<template>
  <template v-for="item in props.menuData">
    <el-menu-item @click="handleClick(item, `${props.index}-${item.meta.id}`)"
      v-if="!item.children || item.children.length === 0" :index="`${props.index}-${item.meta.id}`"
      :key="`${props.index}-${item.meta.id}`">
      <el-icon size="20">
        <component :is="item.meta.icon"></component>
      </el-icon>
      <span>{{ item.meta.name }}</span>
    </el-menu-item>
    <el-sub-menu v-else :index="`${props.index}-${item.meta.id}`">
      <template #title><el-icon size="20">
          <component :is="item.meta.icon"></component>
        </el-icon><span>{{ item.meta.name }}</span></template>
      <tree-menu :index="`${props.index}-${item.meta.id}`" :menuData="item.children" />
    </el-sub-menu>
  </template>
</template>
<script setup lang="ts">
  import { useRouter } from "vue-router";
  import { useMenuStore } from "../store/menu";
  const menuStore = useMenuStore();
  const router = useRouter();
  const props = defineProps(["menuData", "index"]);
  // 点击菜单功能
  const handleClick = (item: any, active: string) => {
    // 将页面加入顶部标签，并记录侧栏当前激活项。
    menuStore.addMenu(item.meta);
    menuStore.updateMenuActive(active);
    // 跳转到菜单元数据中配置的业务页面。
    router.push(item.meta.path);
  };
</script>
<style lang="less" scoped></style>
