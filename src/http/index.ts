import axios, {AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse, CreateAxiosDefaults} from "axios";
import { AxiosCanceler } from "./axios-cancel";
import { checkStatus } from "./check-status";
import { message } from 'antd'

enum ResultEnum {
    SUCCESS = 200,
    ERROR = 500,
    OVERDUE = 10001,
    TIMEOUT = 6000,
    TYPE = "success"
}


interface Result {
    code: number;
    message: string;
}

// * 请求响应参数(包含data)
interface ResultData<T = any> extends Result {
    data?: T;
}


const axiosCanceler = new AxiosCanceler();

const config = {
    // 默认地址请求地址，可在 .env 开头文件中修改
    baseURL: import.meta.env.VITE_APP_BASE_API as string,
    // 设置超时时间（10s）
    timeout: ResultEnum.TIMEOUT as number,
    // 跨域时候允许携带凭证
    withCredentials: true
};

class RequestHttp {
    service: AxiosInstance;
    constructor(config) {
        // 实例化axios
        this.service = axios.create(config);

        /**
         * @description 请求拦截器
         */
        this.service.interceptors.request.use(
            (config: AxiosRequestConfig) => {
                axiosCanceler.addPending(config);
                // * 需要添加的token 自行设置
                const token: string|null = '';
                config.headers.token = token;
                return config;
            },
            (error: AxiosError) => {
                return Promise.reject(error);
            }
        );

        /**
         * @description 响应拦截器
         */
        this.service.interceptors.response.use(
            (response: AxiosResponse) => {
                const { data, config } = response;
                // * 在请求结束后，移除本次请求
                axiosCanceler.removePending(config);
                // * 登陆失效操作
                if (data.code == ResultEnum.OVERDUE) {
                    message.error(data.message);
                    return Promise.reject(data);
                }
                // * 全局错误信息拦截（防止下载文件得时候返回数据流，没有code，直接报错）
                if (data.code && data.code !== ResultEnum.SUCCESS) {
                    return Promise.reject(data);
                }
                // * 成功请求
                return data;
            },
            async (error: AxiosError) => {
                const { response } = error;
                // 根据响应的错误状态码，做不同的处理
                if (response) return checkStatus(response.status);
                // 服务器结果都没有返回(可能服务器错误可能客户端断网)，断网处理:可以跳转到断网页面
                if (!window.navigator.onLine) return
                return Promise.reject(error);
            }
        );
    }

    // * 常用请求方法封装
    get<T>(url: string, params?: any, _object = {}): Promise<ResultData<T>> {
        return this.service.get(url, { params, ..._object });
    }
    post<T>(url: string, params?: object, _object = {}): Promise<ResultData<T>> {
        return this.service.post(url, params, _object);
    }
    put<T>(url: string, params?: object, _object = {}): Promise<ResultData<T>> {
        return this.service.put(url, params, _object);
    }
    delete<T>(url: string, params?: any, _object = {}): Promise<ResultData<T>> {
        return this.service.delete(url, { params, ..._object });
    }
}

export default new RequestHttp(config);