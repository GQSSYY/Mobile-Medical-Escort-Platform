<template>
  <div class="control-container">
    <panel-head :info="route" />

    <!-- 顶部数据展示区 -->
    <div class="card-grid">
      <!-- 用户信息卡片 -->
      <div class="user-section">
        <el-card class="user-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-avatar :size="100" :src="userData.user_img" />
              <span class="username">{{ userData.user_name }}</span>
            </div>
          </template>
          <div class="user-details">
            <p>当前权限：<el-tag size="small">{{ userData.permission }}</el-tag></p>
            <p>登录 IP：<span>{{ userData.ip }}</span></p>
          </div>
        </el-card>
      </div>

      <!-- 统计指标卡片 -->
      <el-card class="service-list" shadow="hover">
        <div class="service-item" v-for="(item, index) in summaryData" :key="index">
          <div class="icon-box" :style="{ backgroundColor: item.color }">
            <img :src="getAssetUrl(item.icon)" :alt="item.state" />
          </div>
          <div class="info">
            <div class="num">{{ item.num }}</div>
            <div class="label">{{ item.state }}</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 图表展示区 -->
    <div class="chart-section">
      <el-card shadow="hover">
        <div class="echart-canvas" ref="echartRef"></div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
  import { ref, shallowRef, onMounted, onUnmounted } from "vue";
  import { useRoute } from 'vue-router';
  import * as echarts from "echarts";
  import { getControlData } from "../../api";

  const route = useRoute();
  const echartRef = ref(null);
  const chartInstance = shallowRef(null); // 使用 shallowRef 优化性能
  let resizeObserver = null;

  // 用户数据
  const userData = ref({
    user_img: "",
    user_name: "未登录",
    permission: "无",
    ip: "-"
  });

  // 统计项配置与数据合并
  const summaryData = ref([]);
  const summaryConfig = [
    { state: "待支付", icon: "dzf.png", color: "#F05050" },
    { state: "待服务", icon: "dfw.png", color: "#7266BA" },
    { state: "已完成", icon: "ywc.png", color: "#23B7E5" },
    { state: "已取消", icon: "yqx.png", color: "#27C24C" }
  ];

  // 图表趋势数据
  const trendData = ref([]);

  // 动态获取本地图片资源（适配 Vite）
  const getAssetUrl = (name) => {
    return new URL(`../../assets/images/${name}`, import.meta.url).href;
  };

  const fetchData = async () => {
    try {
      const res = await getControlData();
      const data = res?.data?.data;

      if (data) {
        userData.value = data.user;

        // 模拟/处理统计项数据
        const mockNums = [6, 2, 11, 3]; // 实际开发请替换为 data.types
        summaryData.value = summaryConfig.map((config, index) => ({
          ...config,
          num: mockNums[index]
        }));

        // 趋势图数据
        trendData.value = data.typeList || [
          { date: '07-26', order_sum: 5, order_money: 2.5 },
          { date: '07-27', order_sum: 10, order_money: 5 },
          { date: '07-28', order_sum: 6, order_money: 3 },
          { date: '07-29', order_sum: 4, order_money: 2 },
          { date: '07-30', order_sum: 8, order_money: 4 }
        ];

        initChart();
      }
    } catch (err) {
      console.error("数据获取失败:", err);
    }
  };

  const initChart = () => {
    if (!echartRef.value) return;

    chartInstance.value = echarts.init(echartRef.value);

    const options = {
      grid: { left: '3%', right: '4%', bottom: '3%', top: '5%', containLabel: true },
      tooltip: {
        trigger: "axis",
        formatter: (params) => {
          const item = trendData.value[params[0].dataIndex];
          return `${params[0].name}<br/>
                ${params[0].marker} ${params[0].seriesName}: <b>${params[0].data}</b><br/>
                💰 总金额: <b>￥${item.order_money}</b>`;
        }
      },
      xAxis: {
        type: 'category',
        data: trendData.value.map(i => i.date),
        boundaryGap: false,
        axisLine: { lineStyle: { color: "#67CEBC", width: 2 } },
        axisLabel: { color: "#999" }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { type: 'dashed' } },
        axisLine: { show: true, lineStyle: { color: "#eee" } }
      },
      series: [{
        name: "订单数",
        type: "line",
        data: trendData.value.map(i => i.order_sum),
        smooth: true,
        symbolSize: 8,
        itemStyle: { color: "#67CEBC" },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(103,206,188,0.4)' },
            { offset: 1, color: 'rgba(103,206,188,0)' }
          ])
        }
      }]
    };

    chartInstance.value.setOption(options);

    // 监听容器大小变化
    resizeObserver = new ResizeObserver(() => {
      chartInstance.value?.resize();
    });
    resizeObserver.observe(echartRef.value);
  };

  onMounted(() => {
    fetchData();
  });

  onUnmounted(() => {
    // 销毁监听器
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
    // 销毁图表实例
    if (chartInstance.value) {
      chartInstance.value.dispose();
    }
  });
</script>

<style lang="less" scoped>
  .control-container {
    padding: 20px;
    background-color: #f5f7f9;
    min-height: 100vh;
  }

  .card-grid {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;

    .user-section {
      flex: 4;

      .user-card {
        height: 100%;

        .card-header {
          display: flex;
          align-items: center;
          gap: 20px;

          .username {
            font-size: 24px;
            font-weight: bold;
            color: #303133;
          }
        }

        .user-details {
          color: #606266;

          p {
            margin: 10px 0;
            font-size: 14px;
          }
        }
      }
    }

    .service-list {
      flex: 6;

      ::v-deep(.el-card__body) {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        height: 100%;
        padding: 30px;
      }

      .service-item {
        display: flex;
        align-items: center;
        gap: 15px;

        .icon-box {
          width: 64px;
          height: 64px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;

          img {
            width: 40px;
            height: 40px;
          }
        }

        .num {
          font-size: 24px;
          font-weight: bold;
          color: #303133;
        }

        .label {
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }

  .chart-section {
    .echart-canvas {
      height: 400px;
      width: 100%;
    }
  }
</style>