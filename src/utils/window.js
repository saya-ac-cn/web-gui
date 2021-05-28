import {notification} from 'antd';
import {LoadingOutlined} from "@ant-design/icons";
import React from "react";

// Notification通知提醒框
export const openNotificationWithIcon = (type, message, description) => notification[type]({
    placement: 'topRight',
    message: message,
    description: description,
});

export const openNotificationWithIcon_ = (type, message, description) => notification[type]({
    placement: 'bottomRight',
    message: message,
    description: description,
});

// 重写loading样式
export const showLoading = () => ({ indicator:<LoadingOutlined/>,size:'large',spinning:true});
