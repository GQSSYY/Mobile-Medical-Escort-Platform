<template>
  <panel-head :info="route" />
  <div class="btns">
    <el-button @click="open(null)" type="primary" size="small" :icon="Plus">新增</el-button>
    <el-popconfirm confirm-button-text="是" cancel-button-text="否" :icon="InfoFilled" icon-color="#626AEF"
      title="是否确认删除？" @confirm="confirmEvent">
      <template #reference>
        <el-button type="danger" size="small" :icon="Delete">删除</el-button>
      </template>
    </el-popconfirm>
  </div>
  <el-table :data="tableData.list" stripe style="width: 100%" @selection-change="handleSelectionChange">
    <el-table-column type="selection" width="55" />
    <el-table-column label="id" prop="id" />
    <el-table-column label="昵称" prop="name" />
    <el-table-column label="头像">
      <template #default="scope">
        <el-image style="width: 50px; height: 50px" :src="scope.row.avatar" />
      </template>
    </el-table-column>
    <el-table-column label="性别">
      <template #default="scope">
        {{ scope.row.sex === "1" ? "男" : "女" }}
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
      layout="total, prev, pager, next" :total="tableData.total" @current-change="handleCurrentChange" />
  </div>
  <el-dialog v-model="dialogFormVisible" :before-close="beforeClose" title="陪护师" width="500">
    <el-form label-width="100px" label-position="left" :model="form" :rules="rules" ref="formRef">
      <el-form-item v-show="false" prop="id">
        <el-input v-model="form.id" placeholder="请输入昵称" />
      </el-form-item>
      <el-form-item label="昵称" prop="name">
        <el-input v-model="form.name" placeholder="请输入昵称" />
      </el-form-item>
      <el-form-item label="头像" prop="avatar">
        <el-button v-if="!form.avatar" @click="dialogImgVisible = true" type="primary">点击上传</el-button>
        <el-image v-else style="width: 100px; height: 100px" :src="form.avatar" @click="dialogImgVisible = true" />
      </el-form-item>
      <el-form-item label="性别" prop="sex">
        <el-select v-model="form.sex" placeholder="请选择性别">
          <el-option label="男" value="1" />
          <el-option label="女" value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="年龄" prop="age">
        <el-input-number v-model="form.age" :min="18" :max="50" />
      </el-form-item>
      <el-form-item label="手机号" prop="mobile">
        <el-input v-model="form.mobile" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="是否生效" prop="active">
        <el-radio-group v-model="form.active">
          <el-radio :value="0">失效</el-radio>
          <el-radio :value="1">生效</el-radio>
        </el-radio-group>
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
  <el-dialog v-model="dialogImgVisible" title="选择图片" width="680">
    <div class="image-list">
      <div v-for="(item, index) in fileList" :key="item.name" class="img-box" @click="selectIndex = index">
        <div v-if="selectIndex === index" class="select">
          <el-icon color="#fff">
            <Check />
          </el-icon>
        </div>
        <el-image style="width: 148px; height: 148px" :src="item.url" />
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogImgVisible = false">取消</el-button>
        <el-button type="primary" @click="confrimImage(formRef)">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
  import { reactive, ref, onMounted, nextTick } from "vue";
  import { Plus, Delete, InfoFilled } from "@element-plus/icons-vue";
  import { photoList, companion, companionList, deleteCompanion, } from "../../../api";
  import dayjs from "dayjs";
  import { useRoute } from "vue-router";
  import { ElMessage } from 'element-plus'

  const route = useRoute();
  onMounted(() => {
    photoList().then(({ data }) => {
      fileList.value = data.data;
    });
    getList();
  });

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

  const getList = () => {
    companionList(paginationData).then(({ data }) => {
      const { list, total } = data.data;
      list.forEach((item: any) => {
        item.create_time = dayjs(item.create_time).format("YYYY-MM-DD");
      });
      tableData.list = list;
      tableData.total = total;
    });
  };

  const dialogFormVisible = ref(false);
  const formRef = ref();
  const form = reactive({
    age: 28,
    sex: "",
    avatar: "",
    active: 1,
    mobile: '',
    id: '',
    name: ''
  });
  // 账号校验规则
  const validateUser = (value: any, callback: any) => {
    // 不能为空
    if (value === "") {
      callback(new Error("请输入密码"));
    } else {
      const reg =
        /^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/;
      reg.test(value)
        ? callback()
        : callback(new Error("手机号格式不对,请输入正确手机号"));
    }
  };
  // 校验
  const rules = ref({
    name: [{ required: true, trigger: "blur", message: "请填写昵称" }],
    avatar: [{ required: true, message: "请选择头像" }],
    sex: [{ required: true, trigger: "change", message: "请选择性别" }],
    mobile: [{ required: true, validator: validateUser, trigger: "blur" }],
  });
  // 陪护师新增/编辑
  const open = (rowData: any) => {
    dialogFormVisible.value = true;
    nextTick(() => {
      // 如果是编辑
      if (rowData) {
        Object.assign(form, rowData);
      }
    });
  };
  const beforeClose = () => {
    dialogFormVisible.value = false;
    formRef.value.resetFields();
  };

  // 选择图片的弹窗
  const dialogImgVisible = ref(false);
  // 照片墙
  interface PhotoItem {
    url: string;
    id?: number | string;
    name: string;
  }
  let fileList = ref<PhotoItem[]>([]);
  const selectIndex = ref(0);
  const confrimImage = (formEl: any) => {
    form.avatar = fileList.value[selectIndex.value].url;
    dialogImgVisible.value = false;
    formEl.validateField("avatar");
  };
  const confirm = async (formEl: any) => {
    if (!formEl) return;
    await formEl.validate((valid: any, fields: any) => {
      if (valid) {
        companion(form).then(({ data }) => {
          if (data.code === 10000) {
            ElMessage.success("成功");
            beforeClose();
            getList();
          }
        });
      } else {
        console.log("error submit!", fields);
      }
    });
  };

  const handleCurrentChange = (val: any) => {
    paginationData.pageNum = val;
    getList();
  };
  // 选中table项
  const multipleSelection = ref([]);
  const handleSelectionChange = (val: any) => {
    multipleSelection.value = val;
    console.log(multipleSelection);
  };
  // 删除
  const confirmEvent = () => {
    if (!multipleSelection.value.length) {
      return ElMessage({
        showClose: true,
        message: "请选择至少一个删除项",
        type: "warning",
      });
    }

    deleteCompanion({ id: multipleSelection.value }).then(({ data }) => {
      if (data.code === 10000) {
        getList();
      }
    });
  };
</script>
<style lang="less" scoped>
  .btns {
    padding: 10px 0 10px 10px;
    background-color: #fff;
  }

  .image-list {
    display: flex;
    align-items: center;
    flex-wrap: wrap;

    .img-box {
      position: relative;

      .select {
        position: absolute;
        left: 0px;
        top: 0px;
        width: 24px;
        height: 24px;
        background-color: #67c23a;
        z-index: 999;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }

    .el-image {
      margin-right: 10px;
      margin-bottom: 10px;
    }
  }
</style>
