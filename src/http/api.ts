import RequestHttp from './index'

// 登录接口
export const loginApi = params => RequestHttp.get('/frontend/plan/1',params)