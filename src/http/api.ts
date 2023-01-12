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


// 上传文件
export const uploadFileApi = `${backendAPI}/oss/files/file`;
// 查看分页后的文件
export const filePageApi = params => RequestHttp.get(`${backendAPI}/oss/files/page`, params);
// 删除文件
export const deleteFileApi = params => RequestHttp.delete(`${backendAPI}/oss/files`, params);
// 修改文件
export const editFileApi = params => RequestHttp.put(`${backendAPI}/oss/files/file`, params);
// 下载文件
export const downloadFileApi = `${backendAPI}/oss/files/download/`;


// 查询单条便笺
export const memoInfoApi = params => RequestHttp.get(`${backendAPI}/content/memo/${params}`, {});
// 获取分页便笺
export const memoPageApi = params => RequestHttp.get(`${backendAPI}/content/memo`, params);
// 添加便笺
export const createMemoApi = params => RequestHttp.post(`${backendAPI}/content/memo`, params);
// 修改便笺
export const updateMemoApi = params => RequestHttp.put(`${backendAPI}/content/memo`, params);
// 删除便笺
export const deleteMemoApi = params => RequestHttp.delete(`${backendAPI}/content/memo/${params}`, {});



// 获取计划
export const planApi = params => RequestHttp.get('/frontend/plan/1',params);