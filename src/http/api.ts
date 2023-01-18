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


// 分页获取当前活跃的计划提醒
export const activityPlanPageApi = params => RequestHttp.get(`${backendAPI}/system/plan/page`, params);
// 添加计划提醒
export const createPlanApi = params => RequestHttp.post(`${backendAPI}/system/plan`, params);
// 修改计划提醒
export const updatePlanApi = params => RequestHttp.put(`${backendAPI}/system/plan`, params);
// 删除计划提醒
export const deletePlanApi = params => RequestHttp.delete(`${backendAPI}/system/plan/${params}`, {});
// 提前完成提醒事项
export const advanceFinishPlanApi = params => RequestHttp.put(`${backendAPI}/system/plan/finish/${params}`, {});
// 分页查询已提醒过的计划
export const archivePlanPageApi = params => RequestHttp.get(`${backendAPI}/system/archive/plan/page`, params);
// 修改归档的提醒事项
export const updateArchivePlanApi = params => RequestHttp.put(`${backendAPI}/system/archive/plan`, params);
// 删除归档的提醒事项
export const deleteArchivePlanApi = params => RequestHttp.delete(`${backendAPI}/system/archive/plan/${params}`, {});

// 上传Base64图片
export const uploadBase64PictureApi = `${backendAPI}/oss/picture/base64`;

// 获取动态
export const newsPageApi = params => RequestHttp.get(`${backendAPI}/content/news`, params);
// 发布动态
export const createNewsApi = params => RequestHttp.post(`${backendAPI}/content/news`, params);
// 删除动态
export const deleteNewsApi = params => RequestHttp.delete(`${backendAPI}/content/news/${params}`, {});
// 查询动态
export const newsInfoApi = params => RequestHttp.get(`${backendAPI}/content/news/${params}`, {});
// 修改动态
export const editNewsApi = params => RequestHttp.put(`${backendAPI}/content/news`, params);


// 创建笔记簿
export const createNoteBookApi = params => RequestHttp.post(`${backendAPI}/content/notebook`, params);
// 修改笔记簿
export const updateNoteBookApi = params => RequestHttp.put(`${backendAPI}/content/notebook`, params);
// 删除笔记簿
export const deleteNoteBookApi = params => RequestHttp.delete(`${backendAPI}/content/notebook/${params}`, {});
// 获取笔记簿
export const noteBookListApi = () => RequestHttp.get(`${backendAPI}/content/notebook`, {});

// 创建笔记
export const createNoteApi = params => RequestHttp.post(`${backendAPI}/content/notes`, params);
// 修改笔记
export const updateNoteApi = params => RequestHttp.put(`${backendAPI}/content/notes`, params);
// 删除笔记
export const deleteNoteApi = params => RequestHttp.delete(`${backendAPI}/content/notes/${params}`, {});
// 获取笔记
export const notePageApi = params => RequestHttp.get(`${backendAPI}/content/notes`, params);
// 查询笔记详情
export const noteInfoApi = params => RequestHttp.get(`${backendAPI}/content/notes/${params}`, {});

// 获取计划
export const planApi = params => RequestHttp.get('/frontend/plan/1',params);