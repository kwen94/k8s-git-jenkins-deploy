// import { message, notification } from 'antd'
import axios from 'axios'
// import qs from 'qs'


import memoryUtils from '../utils/memoryUtils'
// import removeUser from '../utils/storageUtils'


axios.defaults.headers = {
    'Content-type': 'application/json'
} //配置请求头



// let isTokenExprise = false

// axios.interceptors.response.use(config=>{
//     return config
// }, err=>{

//     if(err.response.status===401){
//         if(!isTokenExprise){
//             isTokenExprise = true
//             message.warning('身份信息已过期，即将重新登录......')
//             setTimeout(()=>{
//                 window.location.replace('/login')
//             }, 1500)
//         }
//     }
//     console.log('拦截器响应错误非401， isTokenExprise=> ', isTokenExprise)

// })


export default function ajax(url, data={}, method='GET', headers={}, call) {

    if(!headers.token){
        const token = memoryUtils.user.token
        headers.token = token
    }

    return new Promise((resolve, reject) => {

        let promise
        // 1. 执行异步ajax请求
        if(method==='GET'){
            promise = axios.get(url, {
                params: data,
                headers: headers,
            })
        } else if(method==='POST') {
            if(!headers['Content-Type']){
                headers['Content-type'] = 'application/json'
                // data = qs.stringify(data)
            }

            promise = axios.post(url,
                data,
                {headers})  
        }
        // 2. 如果成功了,调用resolve(value)
        promise.then(response => {
            // 如果成功了,调用resolve(value)
            resolve(response.data)
        // 3. 如果失败了,不调用reject(reason), 而是提示异常信息
        }).catch(error => {
            // reject(reason)
            console.log('error')
            // if(!isTokenExprise){
            //     message.error('请求出错了: ' + error.message)
            //     if(call){
            //         call()
            //     }
            // }
        })
    })
}

