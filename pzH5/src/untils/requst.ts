import axios from "axios";

const http = axios.create({
  baseURL: "https://v3pz.itndedu.com/v3pz",
  timeout: 10000,
  headers: { "terminal" : "h5" },
});

// 添加请求拦截器
http.interceptors.request.use(function (config) {
    // 不需要添加token的api
    const whiteUrl = ['/login']
    const token = localStorage.getItem('h5_token')
    if (token && !whiteUrl.includes(config.url || '')) {
      config.headers['h-token'] = token
    }
    return config;
  }, function (error:any) {
    // 对请求错误做些什么
    return Promise.reject(error);
  });

// 添加响应拦截器
http.interceptors.response.use(function (response) {
  const res = response.data
    // 对于接口返回异常的数据，给用户一点提示
    if (res.code === -1) {
    }
    if (res.code === -2) {
      localStorage.removeItem('h5_token')
      localStorage.removeItem('h5_userInfo')
      window.location.href = window.location.origin
    }
    return res;
  }, function (error:any) {
    // 对响应错误做点什么
    return Promise.reject(error);
  });

export default http