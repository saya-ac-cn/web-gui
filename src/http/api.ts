import RequestHttp from './index'

// 登录接口
// 后台api接口
let backendAPI = '/backend';

// 登录接口
export const loginApi = params => RequestHttp.post(`${backendAPI}/login`, params);
// 令牌刷新
export const refreshTokenApi = `${backendAPI}/system/token/refresh`;



// 获取自己所在组织下的用户
export const ownOrganizeUserApi = () => RequestHttp.get(`${backendAPI}/system/user/own/organize`, {});


// 查看数据库备份执行列表
export const dbDumpPageApi = params => RequestHttp.get(`${backendAPI}/system/db/log/page`, params);

// 注销接口
export const requestLogout = params => RequestHttp.post(`${backendAPI}/logout`, params);


// 获取日志接口
export const logPageApi = params => RequestHttp.get(`${backendAPI}/system/log/page`, params);
// 获取日志类别接口
export const logTypeListApi = () => RequestHttp.get(`${backendAPI}/system/log/type`, {});
// 导出日志
export const downloadLogExcelApi = `${backendAPI}/system/log/excel`;


// 获取计划
export const planApi = params => RequestHttp.get('/frontend/plan/1',params)