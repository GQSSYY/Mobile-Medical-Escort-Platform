<template>
  <div class="admin-container">
    <panel-head :info="route" />
    <el-table :data="tableData.list" stripe style="width: 100%">
      <el-table-column label="id" prop="id" />
      <el-table-column label="昵称" prop="name" />
      <el-table-column label="所属组别" prop="id">
        <template #default="scope">
          {{ permissionsName(scope.row.permissions_id) }}
        </template>
      </el-table-column>
      <el-table-column label="手机号" prop="mobile" />
      <el-table-column label="状态" prop="active">
        <template #default="scope">
          <div style="display: flex; align-items: center">
            <el-tag :type="scope.row.active ? 'success' : 'danger'">{{
              scope.row.active ? "正常" : "失效"
            }}</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="创建时间">
        <template #default="scope">
          <div style="display: flex; align-items: center">
            <el-icon>
              <Clock />
            </el-icon>
            <span style="margin-left: 10px">{{ scope.row.create_time }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button type="primary" @click="open(scope.row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-info">
      <el-pagination v-model:current-page="paginationData.pageNum" size="small" :background="false"
        layout="total, prev, pager, next" :total="tableData.total" @current-change="handleCurrentChange"
        @size-change="handleSizeChange" />
    </div>
    <el-dialog v-model="dialogFormVisible" title="编辑用户" width="500">
      <el-form label-width="100px" label-position="left" :model="form" :rules="rules" ref="formRef">
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="form.mobile" disabled />
        </el-form-item>
        <el-form-item label="昵称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="菜单权限" prop="permissions_id">
          <el-select v-model="form.permissions_id" placeholder="请选择菜单权限" style="width: 240px">
            <el-option v-for="item in options" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="confirm(formRef)">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
  import { onMounted, reactive, ref } from "vue";
  import { authAdmin, menuSelectList, updateUser } from "../../../api";
  import dayjs from "dayjs";
  import { useRoute } from "vue-router";

  const route = useRoute();
  // 请求参数
  const paginationData = reactive({
    pageNum: 1,
    pageSize: 10,
  });

  // 列表数据
  const tableData = reactive({
    list: [],
    total: 0,
  });

  interface PermissionOption {
    id: string | number;
    name: string;
  }
  let options = ref<PermissionOption[]>([]);
  onMounted(() => {
    getListData();
    menuSelectList().then(({ data }) => {
      options.value = data.data;
    });
  });

  // 请求列表数据,更新列表数据
  const getListData = () => {
    authAdmin(paginationData).then(({ data }) => {
      const { list, total } = data.data;
      list.forEach((item: { create_time: dayjs.Dayjs | string }) => {
        item.create_time = dayjs(item.create_time).format("YYYY-MM-DD");
      });
      tableData.list = list;
      tableData.total = total;
    });
  };

  const handleCurrentChange = (val: any) => {
    paginationData.pageNum = val;
    getListData();
  };
  const handleSizeChange = (val: any) => {
    paginationData.pageNum = val;
    getListData();
  };

  // 编辑弹窗
  const dialogFormVisible = ref(false);
  const rules = ref({
    name: [{ required: true, trigger: "blur", message: "请填写昵称" }],
    permissions_id: [
      { required: true, trigger: "blur", message: "请选择菜单权限" },
    ],
  });

  interface UserForm {
    id?: string | number;
    mobile?: string;
    name?: string;
    permissions_id?: string | number;
  }
  const form = ref<UserForm>({
    name: "",
    permissions_id: "",
  });
  // 点击编辑
  const open = (rowData: any) => {
    dialogFormVisible.value = true;
    form.value = JSON.parse(JSON.stringify(rowData));
  };
  const formRef = ref();
  const confirm = async (formEl: any) => {
    if (!formEl) return;
    await formEl.validate((valid: any, fields: any) => {
      if (valid) {
        const { name, permissions_id } = form.value;
        updateUser({
          name,
          permissions_id,
        }).then(() => {
          dialogFormVisible.value = false;
          getListData();
        });
      } else {
        console.log("error submit!", fields);
      }
    });
  };
  // 根据权限id匹配权限名称
  const permissionsName = (id: string | number) => {
    const data = options.value.find((el) => el.id === id);
    return data ? data.name : "超级管理员";
  };
</script>
<style lang="less" scoped></style>
