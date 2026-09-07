<template>
  <div class="header-container">
    <div class="header-left flex-box">
      <el-icon class="icon" size="20" @click="menuStore.collapseMenu">
        <Fold />
      </el-icon>
      <ul class="flex-box">
        <li v-for="(item, index) in selectMenu" :key="item.path" :class="{ selected: route.path === item.path }"
          class="tab flex-box">
          <el-icon size="12">
            <component :is="item.icon" />
          </el-icon>
          <router-link class="text flex-box" :to="{ path: item.path }">{{ item.name }}</router-link>
          <el-icon size="12" class="close" @click.stop="closeTab(item, index)">
            <Close />
          </el-icon>
        </li>
      </ul>
    </div>
    <div class="header-right">
      <el-dropdown @command="handleClick">
        <div class="el-dropdown-link flex-box">
          <el-avatar :src="userInfo.avatar" />
          <p class="user-name">{{ userInfo.name }}</p>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="cancel">退出</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { computed } from "vue";
  import { useMenuStore, type MenuMeta } from "../store/menu";
  import { useRoute, useRouter } from "vue-router";
  const route = useRoute();
  const router = useRouter();
  const menuStore = useMenuStore();
  const selectMenu = computed(() => menuStore.selectMenu);

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')

  // 点击关闭页签。
  const closeTab = async (item: MenuMeta, index: number) => {
    // 关闭非当前标签时只删除标签，不改变正在显示的页面。
    const isCurrentTab = route.path === item.path;
    const tabs = selectMenu.value;
    // 删除前先确定跳转目标：优先右侧标签，其次左侧标签，最后回到默认。
    const targetPath = tabs[index + 1]?.path ?? tabs[index - 1]?.path ?? "/";

    // 从 Pinia 中删除标签，持久化逻辑会同步更新本地缓存。
    menuStore.closeMenu(item);

    // 只有关闭当前标签时才需要切换路由。
    if (isCurrentTab) {
      await router.push(targetPath);
    }
  };
  const handleClick = (command: any) => {
    if (command === 'cancel') {
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      localStorage.removeItem('v3pz')
      // 清除cookie中的menu
      // 跳转到登录页
      // router.push('/login')
      window.location.href = window.location.origin
    }
  }
</script>
<style lang="less" scoped>
  .flex-box {
    display: flex;
    align-items: center;
    height: 100%;
  }

  .header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    background-color: #fff;
    padding-right: 25px;

    .header-left {
      height: 100%;

      .icon {
        width: 45px;
        height: 100%;
      }

      .icon:hover {
        background-color: #f5f5f5;
        cursor: pointer;
      }

      .tab {
        padding: 0 10px;
        height: 100%;

        .text {
          margin: 0 5px;
        }

        .close {
          visibility: hidden;
        }

        &.selected {
          background-color: #f5f5f5;

          i {
            color: #409eff;
          }

          a {
            color: #409eff;
          }
        }
      }

      .tab:hover {
        background-color: #f5f5f5;

        .close {
          visibility: inherit;
          cursor: pointer;
          color: #000;
        }

        .tab:hover {
          background-color: #f5f5f5;

          .close {
            visibility: inherit;
            cursor: pointer;
            color: #000;
          }
        }
      }
    }

    .header-right {
      .user-name {
        margin-left: 10px;
      }
    }

    a {
      height: 100%;
      color: #333;
      font-size: 15px;
    }
  }
</style>
