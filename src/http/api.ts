import RequestHttp from './index'

// 登录接口
// 后台api接口
let backendAPI = '/backend';

// 登录接口
export const loginApi = params => RequestHttp.post(`${backendAPI}/login`, params);

// 获取计划
export const planApi = params => RequestHttp.get('/frontend/plan/1',params)