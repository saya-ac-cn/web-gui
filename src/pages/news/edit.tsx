import React, { useState,forwardRef,useImperativeHandle } from 'react';
import { Modal } from 'antd';

const EditNews = (props,ref) => {

    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [modalText, setModalText] = useState('Content of the modal');

    // 暴露方法给父组件
    useImperativeHandle(ref,()=>({
        handleDisplay,
    }))

    /**
     * 显示弹框
     * @param val
     */
    const handleDisplay = (val) => {
        console.log('父组件的传值:',val)
        setOpen(true);
    };

    const handleOk = () => {
        // 调用父页面的刷新数据方法
        props.refreshPage();
        setModalText('The modal will be closed after two seconds');
        setConfirmLoading(true);
        setTimeout(() => {
            setOpen(false);
            setConfirmLoading(false);
        }, 2000);
    };

    const handleCancel = () => {
        console.log('Clicked cancel button');
        setOpen(false);
    };

    return (
        <Modal
            title="Title"
            open={open}
            onOk={handleOk}
            confirmLoading={confirmLoading}
            onCancel={handleCancel}
        >
            <p>{modalText}</p>
        </Modal>
    )
}

export default forwardRef(EditNews)