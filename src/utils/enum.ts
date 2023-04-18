// 枚举工具类
/**
 * 转义计划提醒执行频率
 * @param key
 * @returns {*}
 */
export const getPlanHowOftenExecute = (key:number) => {
    const array = ['一次性','天','周','月','年'];
    if (key < 1 || key > array.length){
        return ''
    }
    return array[key-1];
};


/**
 * @description: 请求配置
 */
export enum ResultEnum {
    SUCCESS = 200,
    UNAUTHORIZED = 401,
    ERROR = 500,
    OVERDUE = 599,
    TIMEOUT = 120000,
    TYPE = "success"
}