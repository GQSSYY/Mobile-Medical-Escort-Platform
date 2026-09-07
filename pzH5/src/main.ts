import { createApp } from 'vue'
// import './style.css'
import App from './App.vue'
import router from './router/index.ts'
import api from './api/index.ts'

const app = createApp(App)
app.use(router)
app.mount('#app')
// 在实例中中挂载api对象到全局属性上
app.config.globalProperties.$api=api

router.beforeEach(to => {
    // 返回 false 以取消导航
    if(to.path !== '/login'){
        if(!localStorage.getItem('h5_token')){
            return '/login'
        }
    }
  })
