import React, { useState,forwardRef,useImperativeHandle } from 'react';
import { Modal, Form, Input } from 'antd';
const EditNews = (props,ref) => {

    const [newsForm] = Form.useForm();
    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);

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
        if(val){
            newsForm.setFieldsValue(val);
        }else{
            newsForm.setFieldsValue({'username':null, 'password':null});
        }
        setOpen(true);
    };

    const handleOk = () => {
        // 调用父页面的刷新数据方法
        props.refreshPage();
        setConfirmLoading(true);
        newsForm.validateFields().then((values) => {
            console.log('表单:',values)
            newsForm.resetFields()
        }).catch((info) => {
            console.log('表单校验不通过:', info);
        }).finally(()=>{
            setTimeout(() => {
                setOpen(false);
                setConfirmLoading(false);
            }, 2000);
        });
    };

    const handleCancel = () => {
        console.log('Clicked cancel button');
        setOpen(false);
    };


    return (
        <Modal title="Title" open={open} onOk={handleOk} confirmLoading={confirmLoading} onCancel={handleCancel}>
            <Form name="basic" form={newsForm} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} initialValues={{ remember: true }}>
                <Form.Item label="Username" name="username" rules={[{ required: true, message: 'Please input your username!' }]}>
                    <Input />
                </Form.Item>

                <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
                    <Input.Password />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default forwardRef(EditNews)