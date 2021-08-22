/*
能发送异步ajax请求的函数模块
封装axios库
函数的返回值是promise对象
1. 优化1: 统一处理请求异常?
    在外层包一个自己创建的promise对象
    在请求出错时, 不reject(error), 而是显示错误提示
2. 优化2: 异步得到不是reponse, 而是response.data
   在请求成功resolve时: resolve(response.data)
 */

import axios from 'axios'
import {message} from 'antd'
import memoryUtils from '../utils/memoryUtils'
import storageUtils from '../utils/storageUtils'

/**
 * 状态码设置
 **/
const codeMessage = {
    200: '服务器成功返回请求的数据。',
    201: '新建或修改数据成功。',
    202: '一个请求已经进入后台排队（异步任务）。',
    204: '删除数据成功。',
    400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
    401: '用户没有权限（令牌、用户名、密码错误）。',
    403: '用户得到授权，但是访问是被禁止的。',
    404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
    406: '请求的格式不可得。',
    410: '请求的资源被永久删除，且不会再得到的。',
    422: '当创建一个对象时，发生一个验证错误。',
    500: '服务器发生错误，请检查服务器。',
    502: '网关错误。',
    503: '服务不可用，服务器暂时过载或维护。',
    504: '网关超时。',
};


export default function ajax(url, data = {}, type = 'GET') {
    return new Promise((resolve, reject) => {
        let promise;
        // 1. 执行异步ajax请求
        if (type === 'GET') { // 发GET请求
            promise = axios.get(url, { // 配置对象
                params: data // 指定请求参数
            })
        } else if (type === 'DELETE') { // 发DELETE请求
            promise = axios.delete(url, { // 配置对象
                params: data // 指定请求参数
            })
        } else if (type === 'PUT') { // 发PUT请求
            promise = axios.put(url, data)
        } else { // 发POST请求
            promise = axios.post(url, data)
        }
        // 2. 如果成功(200)了, 调用resolve(value)
        promise.then(response => {
            resolve(response.data);
            // 后台返回会话过期 兼容原有 200 下的状态码
            if (response.data.code === -7) {
                // 删除保存的user数据
                storageUtils.removeUser();
                memoryUtils.user = {};
                window.location.href = "/login";
            }
            // 3. 如果失败了, 不调用reject(reason), 而是提示异常信息
        },error => {
            if (error === undefined || error.code === 'ECONNABORTED') {
                message.error('服务请求超时')
            }
            const { response: { status, statusText, data: { msg = '服务器发生错误' } }} = error;
            //const { response } = error
            const text = codeMessage[status] || statusText || msg;
            if (status === 401) {
                // 未登录
                storageUtils.removeUser();
                memoryUtils.user = {};
                window.location.href = "/login";
            }else{
                message.error(text)
            }
        }).catch(error => {
            // reject(error)
            message.error('请求出错了: ' + error.message)
        })
    })

}