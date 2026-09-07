<template>
  <h1>用户登录</h1>
  <van-form @submit="onSubmit">
    <van-cell-group inset>
      <van-field v-model="from.userName" name="用户名" label="用户名" placeholder="用户名"
        :rules="[{ required: true, message: '请填写用户名' }]" />
      <van-field v-model="from.passWord" type="password" name="密码" label="密码" placeholder="密码"
        :rules="[{ required: true, message: '请填写密码' }]" />
    </van-cell-group>
    <div style="margin: 16px">
      <van-button round block type="primary" native-type="submit">
        提交
      </van-button>
    </div>
  </van-form>
</template>

<script setup lang="ts">
  import { reactive, getCurrentInstance, ref } from "vue";
  import { useRouter } from "vue-router";
  const { proxy } = getCurrentInstance() as any;
  const router = useRouter();
  const from = reactive({
    userName: '',
    passWord: '',
  });
  const loading = ref(false);
  const onSubmit = async () => {
    if (loading.value) return;
    loading.value = true;
    try {
      const res = await proxy.$api.login(from);
      if (res?.code === 10000 && res.data?.token) {
        localStorage.setItem("h5_token", res.data.token);
        localStorage.setItem("h5_userInfo", JSON.stringify(res.data.userInfo || {}));
        router.push("/home");
      } else showNotify({ type: 'danger', message: res?.message || '登录失败' });
    } catch (error) {
      showNotify({ type: 'danger', message: '网络异常，请稍后重试' });
    } finally { loading.value = false; }
  };
</script>

<style lang="less" scoped>
  h1 {
    text-align: center;
  }
</style>
