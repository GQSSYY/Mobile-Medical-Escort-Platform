<template>
  <div class="container">
    <div class="header">
      <van-icon @click="goBack" class="header-left" name="arrow-left" size="30" />
      订单详情
    </div>

    <!-- 进度条组件：isState 转换状态为数字 -->
    <schedule :item="isState(orderData.trade_state)" />

    <!-- 状态文案区域 -->
    <div class="tips">
      <div class="dzf" v-if="orderData.trade_state === '待支付'">
        <div class="text1">订单待支付</div>
        <div class="text2">
          请在
          <counter :second="remainingTime" />
          内完成支付,超时订单自动取消
        </div>
        <div class="text3">
          <van-button @click="showcode = true" type="success" size="large">立即支付(0.5元)</van-button>
        </div>
      </div>
      <div class="dzf" v-if="orderData.trade_state === '待服务'">
        <div class="text1">正在为您安排服务专员...</div>
        <div class="text2">请保持手机畅通，稍后将有服务专员与您联系</div>
      </div>
      <div class="dzf" v-if="orderData.trade_state === '已完成'">
        <div class="text1">服务已完成</div>
        <div class="text2">感谢您的使用，如有售后问题请联系客服</div>
      </div>
      <div class="dzf" v-if="orderData.trade_state === '已取消'">
        <div class="text1">订单已取消</div>
        <div class="text2">期待下次为您服务，如需帮助可咨询客服</div>
      </div>
    </div>

    <!-- 预约信息卡片 -->
    <van-cell-group class="card">
      <div class="header-text">预约信息</div>
      <!-- 循环 makeIfo，通过 formatData 获取嵌套或格式化后的值 -->
      <van-cell v-for="(label, key) in makeIfo" :title="label" :key="key" :value="formatData(key as string)" />
    </van-cell-group>

    <!-- 订单信息卡片 -->
    <van-cell-group class="card">
      <div class="header-text">订单信息</div>
      <van-cell v-for="(label, key) in orderInfo" :title="label" :key="key" :value="formatData(key as string)" />
      <van-cell title="联系客服" value="疑问或投诉>" />
    </van-cell-group>

    <!-- 支付二维码弹窗 -->
    <van-dialog :show-confirm-button="false" v-model:show="showcode">
      <van-icon name="cross" @click="closeCode" class="close" />
      <div style="margin-top: 20px">微信支付</div>
      <van-image height="150" width="150" :src="code" style="margin: 20px 0" />
      <div style="color: #999; font-size: 12px">请使用本人微信扫描二维码</div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, getCurrentInstance, onMounted } from "vue";
  import { useRouter, useRoute } from "vue-router";
  import counter from "../../components/counter.vue";
  import schedule from "../../components/schedule.vue";
  import QRCode from "qrcode";

  // 定义订单数据的 TS 结构
  interface OrderData {
    trade_state?: string;
    order_start_time?: number;
    service_name?: string;
    hospital_name?: string;
    starttime?: string;
    receiveAddress?: string;
    demand?: string;
    price?: string;
    out_trade_no?: string;
    code_url?: string;
    client?: {
      name: string;
      mobile: string;
    };
  }

  const route = useRoute();
  const router = useRouter();
  const { proxy } = getCurrentInstance() as any;

  const orderData = ref<OrderData>({});
  const showcode = ref(false);
  const code = ref<string>("");

  const formatData = (key: string) => {
    // 处理特殊字段：下单时间需要格式化
    if (key === "order_start_time") {
      return orderData.value.order_start_time ? formatTimestamp(orderData.value.order_start_time) : "-";
    }

    // 处理普通嵌套字段，如 "client.mobile"
    if (key.indexOf(".") === -1) {
      return (orderData.value as any)[key] || "-";
    }

    // 处理 client.name 这种深层嵌套逻辑
    return key.split(".").reduce((o, p) => {
      return (o || {})[p];
    }, orderData.value as any);
  };

  //计算倒计时剩余毫秒数
  const remainingTime = computed(() => {
    if (!orderData.value.order_start_time) return 0;
    // 下单时间 + 2小时 (7200000ms) - 当前时间
    return orderData.value.order_start_time + 7200000 - Date.now();
  });

  const goBack = () => {
    router.go(-1);
  };

  //将文字状态转换为进度条索引
  const isState = (state: string | undefined) => {
    const stateMap: Record<string, number> = {
      待支付: 10,
      待服务: 20,
      已完成: 30,
      已取消: 40,
    };
    return state ? stateMap[state] : 0;
  };

  //时间戳转 YYYY-MM-DD
  function formatTimestamp(timestamp: number) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  // 渲染配置：对应接口字段与页面显示的 Label
  const makeIfo = {
    service_name: "预约服务",
    hospital_name: "就诊医院",
    starttime: "期望就诊时间",
    "client.name": "就诊人",
    "client.mobile": "就诊人电话",
    receiveAddress: "接送地址",
    demand: "其他需求",
  };

  const orderInfo = {
    "client.mobile": "联系电话",
    order_start_time: "下单时间",
    price: "应付金额",
    out_trade_no: "订单编号",
  };

  const closeCode = () => {
    showcode.value = false;
    getOrderData(); // 关闭弹窗刷新数据状态
  };

  ///获取订单详情
  const getOrderData = async () => {
    const oid = route.query.oid;
    if (!oid) return;
    const res = await proxy.$api.getOrderData({ oid });

    // 逻辑修复：判断 code 为 10000 并访问 res.data
    if (res && res.code === 10000 && res.data) {
      orderData.value = res.data;

      // 安全生成二维码：确认字段名为 code_url 且不为空
      if (res.data.code_url) {
        QRCode.toDataURL(res.data.code_url).then((url) => {
          code.value = url;
        }).catch(err => {
          console.error("二维码生成失败", err);
        });
      }
    }
  };

  onMounted(() => {
    getOrderData();
  });
</script>

<style lang="less" scoped>
  .container {
    background-color: #f0f0f0;
    min-height: 100vh;
  }

  .header {
    background-color: #fff;
    line-height: 40px;
    text-align: center;
    position: relative;

    .header-left {
      position: absolute;
      left: 10px;
      top: 5px;
    }
  }

  .card {
    margin: 15px 0;
    padding: 10px;

    .header-text {
      padding-left: 10px;
      line-height: 30px;
      font-size: 16px;
      font-weight: bold;
      border-left: 4px solid #ee0a24;
      margin-bottom: 5px;
    }
  }

  .dzf {
    padding: 20px;

    .text1 {
      font-size: 20px;
      font-weight: bold;
      line-height: 30px;
      color: #323233;
    }

    .text2 {
      font-size: 14px;
      color: #969799;
      margin-top: 5px;
    }

    .text3 {
      text-align: center;
      margin-top: 15px;

      .van-button {
        width: 100%;
        font-weight: bold;
      }
    }
  }

  ::v-deep(.van-dialog__content) {
    text-align: center;
    padding: 20px;

    .close {
      position: absolute;
      left: 15px;
      top: 15px;
      font-size: 20px;
      color: #ccc;
    }
  }
</style>