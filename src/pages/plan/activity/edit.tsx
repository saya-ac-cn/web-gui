import React, {forwardRef, useImperativeHandle, useState} from 'react';
import {DatePicker, Form, Input,Select,InputNumber, Modal,Radio} from "antd";
import {clearTrimValueEvent} from "@/utils/string";
import {createPlanApi, updatePlanApi, getToken} from "@/http/api";
import {openNotificationWithIcon} from "@/utils/window";
import dayjs from 'dayjs';
const formItemLayout = {
    labelCol: {span: 4},
    wrapperCol: {span: 14},
};
const EditActivityPlan = (props,ref) => {

    const [planForm] = Form.useForm();
    const [plan, setPlan] = useState({id:null,display:null,title:null,standard_time:null,cycle:null,unit:null,content:null});
    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [token,setToken] = useState('');

    /**
     * 初始化token
     */
    const initToken = async () => {
        setToken(await getToken())
    }

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
            const standard_time = !val.standard_time ? null : dayjs(val.standard_time, 'YYYY-MM-DD HH:mm:ss')
            planForm.setFieldsValue({display:val.display, title:val.title,standard_time:standard_time, cycle:val.cycle,unit:!val.unit?0:val.unit,content:val.content});
        }else{
            setPlan({id:null,display:null,title:null,standard_time:null,cycle:null,unit:null,content:null})
            planForm.setFieldsValue({display:null,title:null,standard_time:null,cycle:null,unit:null,content:null});
        }
        initToken()
        setOpen(true);
    };

    /**
     * 响应用户提交事件
     */
    const handleSubmit = () => {
        planForm.validateFields(['display','title','standard_time', 'cycle','unit','content']).then(values => {
            if(!plan.id){
                // 执行添加
                handleAddPlan(values);
            }else{
                // 执行修改
                values.id = plan.id;
                handleRenewPlan(values);
            }
        }).catch(e => console.log("修改或添加计划提醒错误",e));
    };

    /**
     * 添加计划提醒
     * @param values
     * @returns {boolean}
     */
    const handleAddPlan = (values) => {
        const standard_time = dayjs(values.standard_time).format('YYYY-MM-DD HH:mm:ss');
        const param = {display:values.display,title:values.title,standard_time:standard_time,cycle:values.cycle, unit:values.unit, content:values.content,token:token}
        Modal.confirm({
            title: '您确定创建该计划提醒?',
            onOk: async () => {
                setConfirmLoading(true);
                const {err, result} = await createPlanApi(param);
                if (err){
                    console.error('创建该计划提醒异常:',err)
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
     * 修改计划提醒
     * @param values
     * @returns {boolean}
     */
    const handleRenewPlan = (values) => {
        const standard_time = dayjs(values.standard_time).format('YYYY-MM-DD HH:mm:ss');
        const param = {display:values.display,title:values.title,id:values.id,standard_time:standard_time,cycle:values.cycle, unit:values.unit, content:values.content,token:token}
        Modal.confirm({
            title: '您确定要保存此次修改结果?',
            onOk: async () => {
                setConfirmLoading(true);
                const {err, result} = await updatePlanApi(param);
                if (err){
                    console.error('修改计划提醒异常:',err)
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

    /**
     * 重复周期发送变化
     * @param value
     */
    const handleHowOftenChange = (value) => {
        if (1===value){
            // 一次性的计划提醒特殊处理，回填0
            planForm.setFieldsValue({unit:0});
        }
        setPlan({...plan,cycle:value})
    };

    return (
        <Modal title={plan ? '编辑计划提醒' : '添加计划提醒'} open={open} confirmLoading={confirmLoading} maskClosable={false} width="45%" okText='保存' onOk={handleSubmit} onCancel={handleCancel}>
            <Form {...formItemLayout} form={planForm}>
                <Form.Item label="标题：" {...formItemLayout} initialValue={plan.title} getValueFromEvent={ (e) => clearTrimValueEvent(e.target.value)} name='title' rules={[{required: true, message: '请输入标题'}, {max: 32, message: '长度在 1 到 32 个字符'}]}>
                    <Input showCount placeholder='请输入标题' maxLength={32}/>
                </Form.Item>

                <Form.Item label="执行时间：" {...formItemLayout} initialValue={!plan || !plan.standard_time ? null : dayjs(plan.standard_time, 'YYYY-MM-DD HH:mm:ss')} name='standard_time' rules={[{required: true, message: '请选择执行时间'}]}>
                    <DatePicker format="YYYY-MM-DD HH:mm:ss" showTime={{ defaultValue: dayjs('00:00:00', 'HH:mm:ss')}} aceholder="执行时间"/>
                </Form.Item>

                <Form.Item label="重复周期：" {...formItemLayout} initialValue={plan.cycle} name='cycle' rules={[{required: true, message: '请选择重复周期'}]}>
                    <Select onChange={handleHowOftenChange}>
                        <Select.Option value={1}>不重复</Select.Option>
                        <Select.Option value={2}>天</Select.Option>
                        <Select.Option value={3}>周</Select.Option>
                        <Select.Option value={4}>月</Select.Option>
                        <Select.Option value={5}>年</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item label="周期单位：" {...formItemLayout} initialValue={plan.unit} name='unit' rules={[{required: true, message: '请输入周期单位'}]}>
                    <InputNumber min={0} max={365} disabled={plan.cycle===1}/>
                </Form.Item>

                <Form.Item label="是否展示：" {...formItemLayout} initialValue={plan.display} name='display' rules={[{required: true, message: '请选择是否展示'}]}>
                    <Radio.Group>
                        <Radio value={1}>否</Radio>
                        <Radio value={2}>是</Radio>
                    </Radio.Group>
                </Form.Item>

                <Form.Item label="内容：" {...formItemLayout} initialValue={plan.content} getValueFromEvent={ (e) => clearTrimValueEvent(e.target.value)} name='content' rules={[{required: true, message: '请输入计划提醒内容'}, {max: 128, message: '长度在 1 到 128 个字符'}]}>
                    <Input.TextArea showCount placeholder='请输入计划提醒内容' maxLength={128} autosize={{minRows: 4, maxRows: 6}}/>
                </Form.Item>
            </Form>
        </Modal>
    );
}

// 对外暴露
export default forwardRef(EditActivityPlan);
