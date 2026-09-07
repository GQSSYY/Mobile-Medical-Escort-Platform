<template>
  <RouterView />
  <van-tabbar v-model="active">
    <van-tabbar-item v-for="item in tabs" :key="item.path" :icon="String(item.meta?.icon || '')" @click="go(item.path)">
      {{ item.meta?.name }}
    </van-tabbar-item>
  </van-tabbar>
</template>
<script setup lang="ts">
  import { ref, computed, watch } from "vue";
  import { useRoute, useRouter } from "vue-router";
  const route = useRoute();
  const router = useRouter();
  const tabs = computed(() => (router.options.routes[0].children || []));
  const active = ref(0);

  const syncActive = () => {
    active.value = tabs.value.findIndex(item => `/${item.path}` === route.path);
  };
  const go = (path: string) => router.push(`/${path}`);
  watch(() => route.path, syncActive, { immediate: true });
</script>
