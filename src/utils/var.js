/**
 * 变量操作js工具类
 */
import moment from "moment";

/**
 * 判断对象是否为空
 * 入参 data
 * 返回 为空返回true
 */
export const isEmptyObject = (data) => {
    // 手写实现的判断一个对象{}是否为空对象，没有任何属性 非空返回false
    for (let item in data)
        return false;
    return true;
};

/**
 * 货币格式化
 * @param s 要格式化的数字
 * @param n 保留几位小数
 * @returns {string}
 */
export const formatMoney = (s, n) => {
    n = typeof(n)==="undefined"?2:n;
    n = n > 0 && n <= 20 ? n : 2;
    s = parseFloat((s + "").replace(/[^\d.-]/g, "")).toFixed(n) + "";
    let l = s.split(".")[0].split("").reverse(),
        r = s.split(".")[1];
    let t= "";
    for (let i = 0; i < l.length; i++) {
        t += l[i] + ((i + 1) % 3 === 0 && (i + 1) !== l.length ? "," : "");
    }
    return t.split("").reverse().join("") + "." + r;
};

/**
 * 深拷贝函数  接收目标target参数
 * @param target
 * @returns {Object|Array|{}}
 */
export const deepClone = (target) => {
    // 定义一个变量
    let result;
    // 如果当前需要深拷贝的是一个对象的话
    if (typeof target === 'object') {
        // 如果是一个数组的话
        if (Array.isArray(target)) {
            result = []; // 将result赋值为一个数组，并且执行遍历
            for (let i in target) {
                // 递归克隆数组中的每一项
                result.push(deepClone(target[i]))
            }
            // 判断如果当前的值是null的话；直接赋值为null
        } else if(target===null) {
            result = null;
            // 判断如果当前的值是一个RegExp对象的话，直接赋值
        } else if(target.constructor===RegExp){
            result = target;
        }else {
            // 否则是普通对象，直接for in循环，递归赋值对象的所有值
            result = {};
            for (let i in target) {
                result[i] = deepClone(target[i]);
            }
        }
        // 如果不是对象的话，就是基本数据类型，那么直接赋值
    } else {
        result = target;
    }
    // 返回最终结果
    return result;
};

// 只能选择今天以前的日期
export const disabledDate = (current) => {
  // Can not select days before today and today
  return current && current > moment().endOf('day');
};

// 只能选择本月及其以前的月份
export const disabledMonth = (current) => {
    return current && current > moment().endOf('month');
};