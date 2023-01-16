import React, {forwardRef, useImperativeHandle, useState} from 'react';
import {Form, Modal,Radio,Tooltip} from "antd";
import {updateArchivePlanApi} from "@/http/api";
import {openNotificationWithIcon} from "@/utils/window";
import {QuestionCircleOutlined} from "@ant-design/icons";

const formItemLayout = {
    labelCol: {span: 4},
    wrapperCol: {span: 14},
};

const EditArchivePlan = (props,ref) => {

    const [planForm] = Form.useForm();
    const [plan, setPlan] = useState({id:null,title:null,archive_time:null,display:null, status:1,content:null});
    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);

    // 暴露方法给父组件
    useImperativeHandle(ref,()=>({
        handleDisplay,
    }))

    /**
     * 关闭弹框
     */
    const handleCancel = () => {
        setOpen(false);
    };

    /**
     * 显示弹框
     * @param val
     */
    const handleDisplay = (val) => {
        if(val){
            setPlan(val)
            planForm.setFieldsValue({display:val.display, status:val.status});
        }else{
            planForm.setFieldsValue({display:null, status:null});
        }
        setOpen(true);

    };

    /**
     * 响应用户提交事件
     */
    const handleSubmit = () => {
        planForm.validateFields(['display','status']).then(values => {
            // 执行修改
            values.id = plan.id;
            handleRenewPlan(values);
        }).catch(e => console.log("修改或预览计划提醒错误",e));
    };

    /**
     * 修改计划提醒
     * @param value
     * @returns {boolean}
     */
    const handleRenewPlan = (value) => {
        const param = {display:value.display,status:value.status,id:value.id}
        Modal.confirm({
            title: '您确定要保存此次修改结果?',
            cancelText: '再想想',
            okText: '想好啦',
            onOk: async () => {
                setConfirmLoading(true);
                const {msg, code} = await updateArchivePlanApi(param).catch(()=>setConfirmLoading(false));
                setConfirmLoading(false);
                if (code === 0) {
                    openNotificationWithIcon("success", "操作结果", "修改成功");
                    // 调用父页面的刷新数据方法
                    props.refreshPage();
                    handleCancel();
                } else {
                    openNotificationWithIcon("error", "错误提示", msg);
                }
            },
            onCancel() {
                return false;
            },
        });
    };


    return (
        <Modal title='计划提醒详情' open={open} confirmLoading={confirmLoading} maskClosable={false} width="45%" okText='保存' onOk={handleSubmit} onCancel={handleCancel}>
            <Form {...formItemLayout} form={planForm}>
                <Form.Item label="标题：" {...formItemLayout}>
                    {plan.title}
                </Form.Item>

                <Form.Item label="执行时间：" {...formItemLayout}>
                    {plan.archive_time}
                </Form.Item>

                <Form.Item label={<span>是否公开&nbsp;<Tooltip title="该操作为单向不可逆操作，一旦选择未完成或者已完成保存后，不可修改，请谨慎操作!"><QuestionCircleOutlined /></Tooltip></span>} {...formItemLayout} initialValue={plan.status}  name='status' rules={[{required: true, message: '请选择是否展示'}]}>
                    <Radio.Group disabled={plan.status!==1}>
                        <Radio disabled={true} value={1}>进行中</Radio>
                        <Radio value={2}>未完成</Radio>
                        <Radio value={3}>已完成</Radio>
                    </Radio.Group>
                </Form.Item>

                <Form.Item label={<span>是否公开&nbsp;<Tooltip title="是否公开。如果选择是，该计划提醒将会展示在公众页面，对于敏感内容，请谨慎操作!"><QuestionCircleOutlined /></Tooltip></span>} {...formItemLayout} initialValue={plan.display} name='display' rules={[{required: true, message: '请选择是否公开'}]}>
                    <Radio.Group>
                        <Radio value={1}>否</Radio>
                        <Radio value={2}>是</Radio>
                    </Radio.Group>
                </Form.Item>

                <Form.Item label="内容：" {...formItemLayout}>
                    {plan.content}
                </Form.Item>
            </Form>
        </Modal>
    );
}

// 对外暴露
export default forwardRef(EditArchivePlan);
