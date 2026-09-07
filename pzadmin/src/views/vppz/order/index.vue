<template>
  <div class="order-container">
    <panel-head :info="route" />

    <!-- 搜索栏 -->
    <div class="form">
      <el-form :model="searchForm" :inline="true">
        <el-form-item prop="out_trade_no">
          <el-input v-model="searchForm.out_trade_no" placeholder="订单号" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据表格 -->
    <el-table :data="tableData.list" stripe style="width: 100%">
      <el-table-column fixed label="订单号" prop="out_trade_no" width="150" />
      <el-table-column label="就诊医院" prop="hospital_name" />
      <el-table-column label="陪诊服务" prop="service_name" />
      <el-table-column label="陪护师" align="center">
        <template #default="{ row }">
          <el-avatar :src="row.companion?.avatar" />
        </template>
      </el-table-column>
      <el-table-column label="陪护师手机号" width="120">
        <template #default="{ row }">
          {{ row.companion?.mobile || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="总价" prop="price" />
      <el-table-column label="已付" prop="paidPrice" />
      <el-table-column label="下单时间" width="120">
        <template #default="{ row }">
          {{ dayjs(row.order_start_time).format('YYYY-MM-DD') }}
        </template>
      </el-table-column>
      <el-table-column label="订单状态" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.trade_state)">{{ row.trade_state }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="接单状态" prop="service_state" />
      <el-table-column label="联系人手机号" prop="tel" width="120" />

      <!-- 操作栏 -->
      <el-table-column fixed="right" label="操作" width="100">
        <template #default="{ row }">
          <el-popconfirm v-if="row.trade_state === '待服务'" title="是否确认完成？" confirm-button-text="是" cancel-button-text="否"
            :icon="InfoFilled" icon-color="#626AEF" @confirm="handleServerEnd(row.out_trade_no)">
            <template #reference>
              <el-button type="primary" link>服务完成</el-button>
            </template>
          </el-popconfirm>
          <el-button v-else type="primary" link disabled>暂无服务</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-info">
      <el-pagination v-model:current-page="paginationData.pageNum" size="small" layout="total, prev, pager, next"
        :total="tableData.total" @current-change="handleCurrentChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive, onMounted } from "vue";
  import { InfoFilled } from "@element-plus/icons-vue";
  import { adminOrder, updateOrder } from "../../../api";
  import dayjs from 'dayjs';
  import { useRoute } from 'vue-router';
  import { ElMessage } from 'element-plus';

  const route = useRoute();

  // 1. 状态常量配置（提取到函数外，避免重复创建）
  const STATUS_MAP: Record<string, string> = {
    '已取消': 'info',
    '待支付': 'warning',
    '已完成': 'success',
    '待服务': 'primary'
  };

  // 2. 响应式数据
  const searchForm = reactive({
    out_trade_no: ''
  });

  const paginationData = reactive({
    pageNum: 1,
    pageSize: 10
  });

  const tableData = reactive({
    list: [],
    total: 0
  });

  /**
   * 获取列表数据
   * 优化点：整合分页与搜索参数，确保分页时搜索条件不丢失
   */
  const getList = async () => {
    try {
      const params = {
        ...paginationData,
        out_trade_no: searchForm.out_trade_no
      };
      const { data } = await adminOrder(params);
      const { list, total } = data.data;
      tableData.list = list;
      tableData.total = total;
    } catch (error) {
      console.error("加载列表失败", error);
    }
  };

  // 搜索处理
  const handleSearch = () => {
    paginationData.pageNum = 1; // 搜索时重置回第一页
    getList();
  };

  // 分页处理
  const handleCurrentChange = (val: any) => {
    paginationData.pageNum = val
    getList()
  }

  //状态样式转换
  const getStatusType = (state: string) => STATUS_MAP[state] || '';

  //确认完成服务
  const handleServerEnd = async (id: string) => {
    try {
      await updateOrder({ id });
      ElMessage.success("操作成功");
      getList();
    } catch (error) {
      ElMessage.error("操作失败");
    }
  };

  onMounted(() => {
    getList();
  });
</script>

<style lang="less" scoped>
  .order-container {
    .form {
      display: flex;
      justify-content: flex-end;
      padding: 10px;
      background-color: #fff;
      margin-bottom: 10px;
    }

    .pagination-info {
      display: flex;
      justify-content: flex-end;
      padding: 20px 0;
    }
  }
</style>