import request from "../untils/requst";

export default {
    login(data:any){
        return request({
            url:"/login",
            method:"post",
            data
        })
    },
    getHomeData(data:any){
        return request({
            url:"/Index/index",
            method:"get",
            data
        })
    },
    getCreateInfo(data:any){
        return request({
            url:"/h5/companion",
            method:"get",
            data
        })
    },
    createOrder(data:any){
        return request({
            url:"/createOrder",
            method:"post",
            data
        })
    },
    getOrderList(params:any){
        return request({
            url:"/order/list",
            method:"get",
            params
        })
    },
    getOrderData(params:any){
        return request({
            url:"/order/detail",
            method:"get",
            params
        })
    },
}