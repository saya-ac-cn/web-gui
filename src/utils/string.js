// 字符串工具类

/**
 * 清除输入框的空格
 * @param name
 * @param str
 * @returns {*}
 */
export const clearTrimValueEvent = (value) => {
    return value.target.value.replace(/\s+/g, '');
};
