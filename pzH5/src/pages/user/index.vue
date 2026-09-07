<template>
  <div class="container">
    <!-- 用户信息区域 -->
    <div class="user">
      <van-image class="img" width="100" height="100" round :src="userInfo.avatar" />
      <div class="text">{{ userInfo.name || '未登录' }}</div>
    </div>

    <!-- 订单管理区域 -->
    <div class="order">
      <div class="top" @click="goOrder('')">
        <div class="text1">我的订单</div>
        <div class="text2">全部 <van-icon name="arrow" /></div>
      </div>
      <div class="buttom">
        <!-- 使用 v-for 循环减少重复代码 -->
        <div v-for="item in orderStatusList" :key="item.active" class="item" @click="goOrder(item.active)">
          <van-image width="40" height="40" :src="item.icon" />
          <div>{{ item.label }}</div>
        </div>
      </div>
    </div>

    <!-- 底部功能列表 -->
    <div class="foot">
      <div class="foot1">
        <div class="text1">
          <van-image width="20" height="20" src="/images/ic_clients.png" />
          服务对象管理
        </div>
        <div class="text2"><van-icon name="arrow" /></div>
      </div>
      <div @click="showShare = true" class="foot2">
        <div class="text1">
          <van-image width="20" height="20" src="/images/ic_share.png" />
          分享转发
        </div>
        <div class="text2"><van-icon name="arrow" /></div>
      </div>
    </div>

    <!-- 分享面板 -->
    <van-share-sheet v-model:show="showShare" title="转发分享" :options="shareOptions" />

    <!-- 退出登录 -->
    <van-button type="danger" @click="showQuitDialog = true" class="quit" size="large">退出登录</van-button>

    <!-- 退出确认对话框 -->
    <van-dialog v-model:show="showQuitDialog" title="提示" show-cancel-button @confirm="handleQuit"
      @cancel="showQuitDialog = false">
      <div class="quit_text">是否确认退出登录</div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from "vue";
  import { useRouter } from "vue-router";

  const router = useRouter();

  // 状态控制
  const showShare = ref(false);
  const showQuitDialog = ref(false);

  //静态配置数据
  const orderStatusList = [
    { label: '待支付', icon: '/images/od_10.png', active: 1 },
    { label: '待服务', icon: '/images/od_20.png', active: 2 },
    { label: '已完成', icon: '/images/od_30.png', active: 3 },
    { label: '已取消', icon: '/images/od_40.png', active: 4 },
  ];

  const shareOptions = [
    { name: '微信', icon: 'wechat' },
    { name: '微博', icon: 'weibo' },
  ];

  //用户信息逻辑
  const userInfo = computed(() => {
    try {
      const data = localStorage.getItem("h5_userInfo");
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error("用户信息解析失败", e);
      return {};
    }
  });

  //跳转订单列表
  const goOrder = (active: number | string) => {
    router.push(`/order?active=${active}`);
  };

  //退出登录逻辑
  const handleQuit = () => {
    localStorage.removeItem("h5_userInfo");
    localStorage.removeItem("h5_token");
    router.push("/login");
  };
</script>

<style lang="less" scoped>
  .container {
    background-color: #f0f0f0;
    height: 100vh;
    overflow-y: auto; // 优化：允许纵向滚动，防止小屏幕显示不全

    .user {
      width: 95%;
      height: 200px;
      background-color: #fff;
      text-align: center;
      border-radius: 10px;
      margin: 10px auto; // 优化：居中

      .img {
        margin-top: 30px;
      }

      .text {
        line-height: 30px;
        font-weight: bold;
        color: #333;
      }
    }

    .order {
      width: 90%;
      margin: 10px auto; // 优化：居中
      border-radius: 5px;
      background-color: #fff;
      padding: 10px;

      .top {
        margin: 10px;
        line-height: 50px;
        display: flex;
        justify-content: space-between;
        border-bottom: 0.5px solid #f5f5f5;

        .text1 {
          color: #333;
          font-weight: 500;
        }

        .text2 {
          color: #999;
          font-size: 14px;
        }
      }

      .buttom {
        padding: 10px 0;
        display: flex;
        justify-content: space-around;

        .item {
          text-align: center; // 优化：图标文字对齐
          font-size: 13px;
          color: #666;

          div {
            margin-top: 4px;
          }
        }
      }
    }

    .foot {
      margin: 10px;
      padding: 0 10px;
      background-color: #fff;
      border-radius: 5px;

      .foot1,
      .foot2 {
        display: flex;
        justify-content: space-between;
        align-items: center; // 优化：垂直居中
        height: 55px;
        color: #333;

        .text1 {
          display: flex;
          align-items: center;
          gap: 8px; // 优化：图标文字间距
        }

        .text2 {
          color: #ccc;
        }
      }

      .foot1 {
        border-bottom: 0.5px solid #f5f5f5;
      }
    }

    .quit {
      width: 90%;
      display: block;
      margin: 30px auto;
      border-radius: 8px;
    }

    .quit_text {
      padding: 30px 20px;
      text-align: center;
      color: #666;
    }
  }
</style>