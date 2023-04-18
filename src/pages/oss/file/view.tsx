import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {Button, Form, Drawer, Input, Tag, Select, Space,Spin} from "antd";
import axios from "axios";
import Storage from "@/utils/storage";
import './view.less'
import {openNotificationWithIcon} from "@/utils/window";
import {Loading3QuartersOutlined } from '@ant-design/icons';

const EditNote = (props,ref) => {


    const [open, setOpen] = useState<boolean>(false);
    const [loading,setLoading] = useState(false)
    const [file,setFile] = useState({file_name:null,file_url:null})


    // 暴露方法给父组件
    useImperativeHandle(ref,()=>({
        handleDisplay
    }))


    /**
     * 初始化数据
     * @param file
     */
    const handleDisplay = async (file: object) => {
        setOpen(true);
        setFile({...file,file_name:file.file_name})
        downloadFile(file);
    };

    /**
     * 显示笔记编辑的弹窗
     */
    const downloadFile = (file) => {
        // 在发请求前, 显示loading
        setLoading(true);
        let access_token = Storage.get(Storage.ACCESS_KEY)
        axios({
            method: "GET",
            url: '/warehouse'+file.file_url,   //接口地址
            responseType: 'blob',
            headers: {"access_token":access_token},
        }).then(function (res) {
            setLoading(false);
            const contentType = res.headers['content-type']
            let blob = new Blob([res.data],{'type': contentType})
            setFile({...file,file_url:window.URL.createObjectURL(blob)})
        }).catch(res => {
            setLoading(false);
            openNotificationWithIcon("error", "错误提示", "打开文件失败"+res);
        });
    };

    const handleCancel = () => {
        setOpen(false);
    };

    return (
        <Drawer title={file.file_name} className='file-view' width='85%' forceRender onClose={handleCancel} open={open} bodyStyle={{ paddingBottom: 80 }} maskClosable={false}>
            {loading?<Spin delay={300} indicator={<Loading3QuartersOutlined style={{ fontSize: 30,width:'100%',height:'100%' }} spin />} tip="loading..." size="large"/>:<iframe src={file.file_url}></iframe>}
        </Drawer>
    )
}

// 对外暴露
export default forwardRef(EditNote);
