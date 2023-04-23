import RequestHttp from './index'

// 登录接口
// 后台api接口
let backendAPI = '/backend';

// 登录接口
export const loginApi = params => RequestHttp.post(`${backendAPI}/login`, params).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 登录接口
export const logoutApi = () => RequestHttp.post(`${backendAPI}/logout`, {}).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});


// 获取请求token
export const getRequestToken = () => RequestHttp.get(`${backendAPI}/system/token`, {}).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});

// 上传头像
export const uploadLogoApi = params => RequestHttp.post(`${backendAPI}/system/user/logo`, params).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 获取个人信息
export const getPersonal = params => RequestHttp.get(`${backendAPI}/system/user`, params).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 修改密码
export const editPwdApi = params => RequestHttp.put(`${backendAPI}/system/user/password`, params).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 修改用户信息
export const editUserInfoApi = params => RequestHttp.put(`${backendAPI}/system/user`, params).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});

// 获取自己所在组织下的用户
export const ownOrganizeUserApi = () => RequestHttp.get(`${backendAPI}/system/user/own/organize`, {}).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});


// 查看数据库备份执行列表
export const dbDumpPageApi = params => RequestHttp.get(`${backendAPI}/system/db/log/page`, params).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});

// 获取日志接口
export const logPageApi = params => RequestHttp.get(`${backendAPI}/system/log/page`, params).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 获取日志类别接口
export const logTypeListApi = () => RequestHttp.get(`${backendAPI}/system/log/type`, {}).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 导出日志
export const downloadLogExcelApi = `${backendAPI}/system/log/excel`;

// 查看分页后的图片
export const picturePageApi = params => RequestHttp.get(`${backendAPI}/oss/picture/page`, params).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 上传壁纸
export const uploadWallpaperApi = `${backendAPI}/oss/picture/file`;
// 删除壁纸/插图
export const deletePictureApi = params => RequestHttp.delete(`${backendAPI}/oss/picture/${params}`, {}).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});



// 上传文件
export const uploadFileApi = `${backendAPI}/oss/files/file`;
// 查看分页后的日志
export const filePageApi = params => RequestHttp.get(`${backendAPI}/oss/files/page`, params).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 删除文件
export const deleteFileApi = params => RequestHttp.delete(`${backendAPI}/oss/files`, params).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 修改文件
export const editFileApi = params => RequestHttp.put(`${backendAPI}/oss/files/file`, params).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 下载文件
export const downloadFileApi = `${backendAPI}/oss/files/download/`;


// 查询单条便笺
export const memoInfoApi = params => RequestHttp.get(`${backendAPI}/content/memo/${params}`, {}).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 获取分页便笺
export const memoPageApi = params => RequestHttp.get(`${backendAPI}/content/memo`, params).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 添加便笺
export const createMemoApi = params => RequestHttp.post(`${backendAPI}/content/memo`, params).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 修改便笺
export const updateMemoApi = params => RequestHttp.put(`${backendAPI}/content/memo`, params).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 删除便笺
export const deleteMemoApi = params => RequestHttp.delete(`${backendAPI}/content/memo/${params}`, {}).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});


// 分页获取当前活跃的计划提醒
export const activityPlanPageApi = params => RequestHttp.get(`${backendAPI}/system/plan/page`, params).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 添加计划提醒
export const createPlanApi = params => RequestHttp.post(`${backendAPI}/system/plan`, params).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 修改计划提醒
export const updatePlanApi = params => RequestHttp.put(`${backendAPI}/system/plan`, params).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 删除计划提醒
export const deletePlanApi = params => RequestHttp.delete(`${backendAPI}/system/plan/${params}`, {}).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 提前完成提醒事项
export const advanceFinishPlanApi = params => RequestHttp.put(`${backendAPI}/system/plan/finish`, params).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 分页查询已提醒过的计划
export const archivePlanPageApi = params => RequestHttp.get(`${backendAPI}/system/archive/plan/page`, params).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 修改归档的提醒事项
export const updateArchivePlanApi = params => RequestHttp.put(`${backendAPI}/system/archive/plan`, params).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 删除归档的提醒事项
export const deleteArchivePlanApi = params => RequestHttp.delete(`${backendAPI}/system/archive/plan/${params}`, {}).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});

// 上传Base64图片
export const uploadBase64PictureApi = `${backendAPI}/oss/picture/base64`;

// 获取动态
export const newsPageApi = params => RequestHttp.get(`${backendAPI}/content/news`, params).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 发布动态
export const createNewsApi = params => RequestHttp.post(`${backendAPI}/content/news`, params).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 删除动态
export const deleteNewsApi = params => RequestHttp.delete(`${backendAPI}/content/news/${params}`, {}).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 查询动态
export const newsInfoApi = params => RequestHttp.get(`${backendAPI}/content/news/${params}`, {}).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 修改动态
export const editNewsApi = params => RequestHttp.put(`${backendAPI}/content/news`, params).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});

// 创建笔记簿
export const createNoteBookApi = params => RequestHttp.post(`${backendAPI}/content/notebook`, params).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 修改笔记簿
export const updateNoteBookApi = params => RequestHttp.put(`${backendAPI}/content/notebook`, params).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 删除笔记簿
export const deleteNoteBookApi = params => RequestHttp.delete(`${backendAPI}/content/notebook/${params}`, {}).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 获取笔记簿
export const noteBookListApi = () => RequestHttp.get(`${backendAPI}/content/notebook`, {}).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});

// 创建笔记
export const createNoteApi = params => RequestHttp.post(`${backendAPI}/content/notes`, params).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 修改笔记
export const updateNoteApi = params => RequestHttp.put(`${backendAPI}/content/notes`, params).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 删除笔记
export const deleteNoteApi = params => RequestHttp.delete(`${backendAPI}/content/notes/${params}`, {}).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 获取笔记
export const notePageApi = params => RequestHttp.get(`${backendAPI}/content/notes`, params).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 查询笔记详情
export const noteInfoApi = params => RequestHttp.get(`${backendAPI}/content/notes/${params}`, {}).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});

// 查询货币列表
export const monetaryListApi = () => RequestHttp.get(`${backendAPI}/financial/dictionary/monetary`, {}).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 获取所有的支付类别
export const paymentMeansListApi = () => RequestHttp.get(`${backendAPI}/financial/dictionary/payment/means`, {}).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 获取所有的交易摘要
export const abstractsApi = () => RequestHttp.get(`${backendAPI}/financial/dictionary/abstracts`, {}).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 获取财政流水
export const getTransactionList = params => RequestHttp.get(`${backendAPI}/financial/journal`, params).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 流水列表
export const generalJournalListApi = params => RequestHttp.get(`${backendAPI}/financial/general/journal`, params).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 财政申报
export const addJournalApi = params => RequestHttp.post(`${backendAPI}/financial/journal`, params).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 修改流水
export const updateJournalApi = params => RequestHttp.put(`${backendAPI}/financial/journal`, params).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 删除流水
export const deleteJournalApi = params => RequestHttp.delete(`${backendAPI}/financial/journal/${params}`, {}).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 导出流水
export const JournalExcelApi = `${backendAPI}/financial/journal/excel`;
// 导出流水明细
export const generalJournalExcelApi = `${backendAPI}/financial/general/journal/excel`;
// 添加流水明细
export const addGeneralJournalApi = params => RequestHttp.post(`${backendAPI}/financial/general/journal`, params).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 修改流水明细
export const updateGeneralJournalApi = params => RequestHttp.put(`${backendAPI}/financial/general/journal`, params).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 删除流水明细
export const deleteGeneralJournalApi = params => RequestHttp.delete(`${backendAPI}/financial/general/journal/${params}`, {}).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 按天统计流水
export const totalJournalForDayApi = params => RequestHttp.get(`${backendAPI}/financial/journal/day`, params).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 导出按天统计的报表
export const journalForDayExcelApi = `${backendAPI}/financial/journal/collect/excel`;

// 获取数据总量及词云数据
export const getCountAndWordCloud = () => RequestHttp.get(`${backendAPI}/system/total/object/rows`, {}).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 近6个月的活跃情况
export const getActivityRate= params => RequestHttp.get(`${backendAPI}/system/log/total/pre6`, params).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 近6个月的动态发布情况
export const getNewsRate = params => RequestHttp.get(`${backendAPI}/content/news/total/pre6`, params).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 统计收支增长率
export const getAccountGrowthRate = params => RequestHttp.get(`${backendAPI}/financial/journal/total/balance`, params).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 计算收入比重
export const getIncomePercentage = params => RequestHttp.get(`${backendAPI}/financial/journal/total/income`, params).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 统计摘要排名
export const getOrderByAmount = params => RequestHttp.get(`${backendAPI}/financial/journal/total/order`, params).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});
// 近6个月的财务流水
export const getPreSixMonthBill = params => RequestHttp.get(`${backendAPI}/financial/journal/total/pre6`, params).then(data =>{return {err:null, result:data}}).catch(err => {return {err:err, result:null}});

export const getToken: () => (string | unknown) = async () => {
    // 发异步ajax请求, 获取数据
    const {err, result} = await getRequestToken()
    if (err) {
        console.error("获取token异常:", err)
        return null;
    } else {
        return result.data;
    }
}
