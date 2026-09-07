<template>
  <div class="container">
    <!-- 顶部标题 -->
    <div class="header">我的订单</div>

    <!-- 订单状态切换标签 -->
    <van-tabs @click-tab="clickTab" v-model:active="active">
      <van-tab title="全部" name="" />
      <van-tab title="待支付" name="1" />
      <van-tab title="待服务" name="2" />
      <van-tab title="已完成" name="3" />
      <van-tab title="已取消" name="4" />

      <!-- 订单列表项 -->
      <van-row @click="goDetail(item)" v-for="item in orderList" :key="item.out_trade_no">
        <!-- 订单图片 -->
        <van-col span="5">
          <van-image width="50" radius="5" height="50" :src="item.serviceImg" />
        </van-col>

        <!-- 订单主要信息 -->
        <van-col span="14">
          <div class="text1">{{ item.service_name }}</div>
          <div class="text2">
            <div>{{ item.hospital_name }}</div>
            <div>预约时间:{{ item.starttime }}</div>
          </div>
        </van-col>

        <!-- 订单状态与倒计时 -->
        <van-col class="text2" span="5" :style="{ color: stateColorMap[item.trade_state] }">
          {{ item.trade_state }}
          <!-- 仅在待支付状态下显示倒计时组件 -->
          <counter :second="item.timer" v-if="item.trade_state === '待支付'" />
        </van-col>
      </van-row>
    </van-tabs>

    <!-- 底部兜底文字 -->
    <div class="bottom-text">没有更多了</div>
  </div>
</template>

<script setup lang="ts">
  import { ref, getCurrentInstance, onMounted } from "vue";
  import { useRouter, useRoute } from "vue-router";
  import counter from "../../components/counter.vue";

  //  基础配置与路由初始化
  const router = useRouter();
  const route = useRoute();
  const { proxy } = getCurrentInstance() as any;

  // 订单列表数据
  const orderList = ref<any[]>([]);
  // 当前激活的标签页名称 (对应接口的 state)
  const active = ref<string | any>("");

  // 状态颜色映射表 (移出组件逻辑，避免重复定义)
  const stateColorMap: Record<string, string> = {
    "待支付": "#ffa200",
    "待服务": "#1da6fd",
    "已完成": "#21c521",
  };

  // 获取订单列表数据
  const getOrderList = async (state?: string) => {
    try {
      const res = await proxy.$api.getOrderList(state ? { state } : {});
      if (!res || res.code !== 10000 || !Array.isArray(res.data)) {
        orderList.value = [];
        return;
      }
    // 映射数据并计算支付剩余倒计时 (逻辑维持：下单时间 + 2小时 - 当前时间)
      orderList.value = res.data.map((item: any) => {
      item.timer = item.order_start_time + 7200000 - Date.now();
      return item;
      });
    } catch (error) {
      orderList.value = [];
      console.error('获取订单失败', error);
    }

  };

  //标签页点击回调
  const clickTab = (tab: any) => {
    getOrderList(tab.name);
  };

  // 跳转至订单详情
  const goDetail = (item: any) => {
    router.push(`/detail?oid=${item.out_trade_no}`);
  };
  onMounted(() => {
    // 1. 如果路由参数中带有 active，则同步到当前 active 变量
    if (route.query.active) {
      active.value = route.query.active;
    }
    // 2. 初始化加载列表，传入当前的 active 值作为初始过滤条件
    getOrderList(active.value);
  });
</script>

<style lang="less" scoped>
  .container {
    background-color: #f0f0f0;
    height: 100vh;
  }

  .header {
    background-color: #fff;
    line-height: 40px;
    text-align: center;
  }

  .van-row {
    background-color: #fff;
    padding: 10px;
    margin: 5px;
    border-radius: 5px;

    .text1 {
      font-size: 16px;
      line-height: 25px;
      font-weight: bold;
    }

    .text2 {
      font-size: 14px;
      line-height: 20px;
      color: #999999;
    }
  }

  .bottom-text {
    line-height: 50px;
    text-align: center;
    color: #999999;
  }
</style>
