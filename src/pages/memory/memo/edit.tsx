import React, { useState,forwardRef,useImperativeHandle } from 'react';
import { Modal, Form, Input } from 'antd';
import {clearTrimValueEvent} from "@/utils/string";
import {createMemoApi, updateMemoApi,getToken} from "@/http/api"
import {openNotificationWithIcon} from "@/utils/window";

const formItemLayout = {
    labelCol: {span: 4},
    wrapperCol: {span: 14},
};

const EditMemo = (props,ref) => {

    const [memoForm] = Form.useForm();
    const [memoId, setMemoId] = useState(null);
    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [token,setToken] = useState('');

    // 暴露方法给父组件
    useImperativeHandle(ref,()=>({
        handleDisplay,
    }))

    /**
     * 初始化token
     */
    const initToken = async () => {
        setToken(await getToken())
    }

    /**
     * 显示弹框
     * @param val
     */
    const handleDisplay = (val) => {
        if(val){
            setMemoId(val.id)
            memoForm.setFieldsValue({title:val.title, content:val.content});
        }else{
            setMemoId(null)
            memoForm.setFieldsValue({title:null, content:null});
        }
        initToken();
        setOpen(true);
    };

    const handleCancel = () => {
        setOpen(false);
    };

    /**
     * 响应用户提交事件
     */
    const handleSubmit = () => {
        memoForm.validateFields().then((values) => {
            values.token = token
            if(memoId){
                // 执行修改
                values.id = memoId;
                handleRenewMemo(values);
            }else{
                // 执行添加
                handleAddMemo(values);
            }
        }).catch(e => {
            console.log("修改或添加便利贴错误",e)
        });
    };

    /**
     * 添加便利贴
     * @param value
     * @returns {boolean}
     */
    const handleAddMemo = (value) => {
        Modal.confirm({
            title: '您确定创建该便利贴?',
            onOk: async () => {
                setConfirmLoading(true);
                const {err, result} = await createMemoApi(value);
                if (err){
                    console.error('保存便利贴异常:',err)
                    setConfirmLoading(false)
                    return
                }
                const {msg, code} = result
                setConfirmLoading(false);
                if (code === 0) {
                    openNotificationWithIcon("success", "操作结果", "添加成功");
                    // 调用父页面的刷新数据方法
                    props.refreshPage();
                    handleCancel();
                } else {
                    // 为下一次的提交申请一个token
                    setToken(await getToken());
                    openNotificationWithIcon("error", "错误提示", msg);
                }
            },
            onCancel() {
                return false;
            },
        });
    };

    /**
     * 修改便笺
     * @param value
     * @returns {boolean}
     */
    const handleRenewMemo = (value) => {
        Modal.confirm({
            title: '您确定要保存此次修改结果?',
            onOk: async () => {
                setConfirmLoading(true);
                const {err, result} = await updateMemoApi(value);
                if (err){
                    console.error('修改便利贴异常:',err)
                    setConfirmLoading(false)
                    return
                }
                const {msg, code} = result
                setConfirmLoading(false);
                if (code === 0) {
                    openNotificationWithIcon("success", "操作结果", "修改成功");
                    // 调用父页面的刷新数据方法
                    props.refreshPage();
                    handleCancel();
                } else {
                    // 为下一次的提交申请一个token
                    setToken(await getToken());
                    openNotificationWithIcon("error", "错误提示", msg);
                }
            },
            onCancel() {
                return false;
            },
        });
    };


    return (
        <Modal title={memoId ? '编辑便利贴':'添加便利贴'} open={open} confirmLoading={confirmLoading} maskClosable={false} okText='保存' onOk={handleSubmit} onCancel={handleCancel}>
            <Form {...formItemLayout} name='便利贴表单' form={memoForm}>
                <Form.Item label="标题名：" {...formItemLayout} getValueFromEvent={(e) => clearTrimValueEvent(e.target.value)} name='title' rules={[{required: true, message: '请输入便利贴标题'}, {min: 2, message: '长度在 2 到 15 个字符'}, {max: 15, message: '长度在 2 到 15 个字符'}]}>
                    <Input placeholder='请输入标题'/>
                </Form.Item>
                <Form.Item label="正文：" {...formItemLayout} getValueFromEvent={(e) => clearTrimValueEvent(e.target.value)} name='content' rules={[{required: true, message: '请输入便利贴正文'}, {max: 128, message: '长度在 1 到 128 个字符'}]}>
                    <Input.TextArea showCount placeholder='请输入便利贴正文' maxLength={128} autosize={{minRows: 4, maxRows: 6}}/>
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default forwardRef(EditMemo)