<template>
  <el-row class="login-container" justify="center" align="middle">
    <el-card style="max-width: 480px">
      <!-- 上方插槽卡片 -->
      <template #header>
        <div class="card-header">
          <img :src="imgUrl" alt="" />
        </div>
      </template>
      <!-- 注册和登录切换 -->
      <div class="jump-link">
        <el-link @click.prevent="handleChange" type="primary" underline>{{ formType ? "返回登录" : "注册账号" }}</el-link>
      </div>
      <!-- 表单 -->
      <el-form ref="loginFormRef" style="max-width: 600px" :model="loginForm" class="demo-ruleForm" :rules="rules">
        <el-form-item prop="userName">
          <el-input v-model="loginForm.userName" :prefix-icon="UserFilled" placeholder="手机号" autocomplete="off" />
        </el-form-item>
        <el-form-item prop="passWord">
          <el-input v-model="loginForm.passWord" :prefix-icon="Lock" type="passWord" placeholder="密码"
            autocomplete="off" />
        </el-form-item>
        <el-form-item v-if="formType" prop="validCode">
          <el-input v-model="loginForm.validCode" :prefix-icon="Lock" placeholder="验证码" autocomplete="off">
            <template #append>
              <span @click="countdownChange">{{ countdown.validText }}</span>
            </template>
          </el-input>
        </el-form-item>
        <!-- 提交 -->
        <el-form-item>
          <el-button :style="{ width: '100%' }" type="primary" @click="submitForm(loginFormRef)">
            {{ formType ? '注册账号' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </el-row>
</template>
<script setup lang="ts">
  import { reactive, ref, computed, toRaw } from 'vue';
  import { UserFilled, Lock } from '@element-plus/icons-vue'
  import { getCode, authentication, login, menuPermissions } from '../../api'
  import { ElMessage } from 'element-plus'
  import { useRouter } from 'vue-router'
  import { useMenuStore } from "../../store/menu";
  const imgUrl = new URL('../../../public/login-head.png', import.meta.url).href

  // 初始表单数据
  const loginForm = reactive({
    userName: '',
    passWord: '',
    validCode: ''
  })
  // 账号校验规则
  const validateUser = (_rule: any, value: any, callback: any) => {
    // 不能为空
    if (value === '') {
      callback(new Error('请输入账号'))
    } else {
      const phoneReg = /^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/
      phoneReg.test(value) ? callback() : callback(new Error('手机号格式不对,请输入正确手机号'))
    }
  }

  // 密码校验规则
  const validatePass = (_rule: any, value: any, callback: any) => {
    // 不能为空
    if (value === '') {
      callback(new Error('请输入密码'))
    } else {
      const phoneReg = /^[a-zA-Z0-9_-]{4,16}$/
      phoneReg.test(value) ? callback() : callback(new Error('密码格式不对,需要4到16位字母/数字/下划线/减号'))
    }
    //表单校验
  }
  // 表单校验规则
  const rules = reactive({
    userName: [{ validator: validateUser, trigger: 'blur' }],
    passWord: [{ validator: validatePass, trigger: 'blur' }],
  })


  // 切换表单(0为登录，1为注册)
  const formType = ref(0)
  const handleChange = () => {
    formType.value = formType.value ? 0 : 1
  }
  // 发送短信
  let flag = false
  const countdown = reactive({
    validText: '获取验证码',
    time: 60
  })
  const countdownChange = () => {
    // 已经发送的不处理
    if (flag) return
    // 手机号正则
    const phoneReg = /^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/
    // 判断手机号是否正确
    if (!loginForm.userName || !phoneReg.test(loginForm.userName)) {
      return ElMessage.warning('请检查手机号是否正确')
    }
    // 倒计时
    const time = setInterval(() => {
      if (countdown.time <= 0) {
        countdown.validText = '获取验证码'
        countdown.time = 60
        flag = false
        clearInterval(time)
      } else {
        countdown.time -= 1
        countdown.validText = `剩余${countdown.time}s`
      }
    }, 1000)
    flag = true
    console.log('发送短信')
    getCode({ tel: loginForm.userName }).then(({ data }) => {
      if (data.code === 100000) {
        ElMessage.success('发送成功')
      }

    })
  }
  // 表单提交
  const loginFormRef = ref()
  const router = useRouter()
  const menuStore = useMenuStore();
  const routerList = computed(() => menuStore.routerList)

  // 表单校验
  const submitForm = async (formEl: any) => {
    await formEl.validate((valid: any, fields: any) => {
      if (valid) {
        // 当前是登录页面
        if (!formType.value) {
          login(loginForm).then(({ data }) => {
            if (data.code === 10000) {
              ElMessage.success('登录成功')
              formType.value = 0
              // 将token和用户信息放入缓存到浏览器里
              localStorage.setItem('token', data.data.token)
              localStorage.setItem('userInfo', JSON.stringify(data.data.userInfo))
              menuPermissions({}).then(({ data: permission }) => {
                menuStore.setDynamicMenu(permission.data)
                toRaw(routerList.value).forEach(item => {
                  router.addRoute("main", item as any)
                })
              }).then(() => {
                router.push('/')
              })
            }
          })
        } else { // 如果是注册页面
          authentication(loginForm).then(({ data }) => {
            if (data.code === 100000) {
              ElMessage.success('注册成功！请登录')
              formType.value = 0
            }
          })
        }
      } else {
        console.log('error submit!', fields)
      }
    })
  }
</script>
<style lang="less" scoped>
  :deep(.el-card__header) {
    padding: 0
  }

  .login-container {
    height: 100%;

    .card-header {
      background-color: #899fe1;

      img {
        width: 430px;
      }
    }

    .jump-link {
      text-align: right;
      margin-bottom: 10px;
    }

    .submit-button {
      width: 100%;
    }

    .code-action {
      color: var(--el-color-primary);
      cursor: pointer;
      user-select: none;

      &.disabled {
        color: var(--el-text-color-disabled);
        cursor: not-allowed;
      }
    }
  }
</style>
