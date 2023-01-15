import React, {Component} from 'react';
import {DatePicker, Form, Input,Select,InputNumber, Modal,Radio} from "antd";
import {clearTrimValueEvent} from "@/utils/string";
import {createPlanApi, updatePlanApi} from "../../../api";
import {openNotificationWithIcon} from "@/utils/window";
import moment from "moment";
/*
 * 文件名：edit.jsx
 * 作者：shmily
 * 创建日期：2022-10-30 - 00:50
 * 描述：活跃的计划提醒表单
 */

// 定义组件（ES6）
class EditActivityPlan extends Component {

    formRef = React.createRef();

    state = {
        plan: {}, // 创建一个没有内容的编辑对象
        visibleModal:false
    };

    /**
     * 关闭弹框
     */
    handleCancel = () => {
        this.setState({visibleModal: false});
    };

    /**
     * 显示弹框
     * @param val
     */
    handleDisplay = (val) => {
        let _this = this;
        _this.setState({
            plan: val,
            visibleModal: true
        },function () {
            //注意 initialValues 不能被 setState 动态更新，你需要用 setFieldsValue 来更新。
            if(!val || !val.id){
                _this.formRef.current.setFieldsValue({display:null,title:null,standard_time:null,cycle:null,unit:null,content:null});
            }else{
                const standard_time = !val.standard_time ? null : moment(val.standard_time, 'YYYY-MM-DD HH:mm:ss')
                _this.formRef.current.setFieldsValue({display:val.display, title:val.title,standard_time:standard_time, cycle:val.cycle,unit:!val.unit?0:val.unit,content:val.content});
            }
        });
    };

    /**
     * 响应用户提交事件
     */
    handleSubmit = () => {
        const _this = this;
        const plan = _this.state.plan;
        _this.formRef.current.validateFields(['display','title','standard_time', 'cycle','unit','content']).then(value => {
            if(!plan.id){
                // 执行添加
                _this.handleAddPlan(value);
            }else{
                // 执行修改
                value.id = plan.id;
                _this.handleRenewPlan(value);
            }
        }).catch(e => console.log("修改或添加计划提醒错误",e));
    };

    /**
     * 添加计划提醒
     * @param value
     * @returns {boolean}
     */
    handleAddPlan = (value) => {
        const standard_time = moment(value.standard_time).format('YYYY-MM-DD HH:mm:ss');
        const param = {display:value.display,title:value.title,standard_time:standard_time,cycle:value.cycle, unit:value.unit, content:value.content}
        const _this = this;
        Modal.confirm({
            title: '您确定创建该计划提醒?',
            onOk: async () => {
                const {msg, code} = await createPlanApi(param);
                if (code === 0) {
                    openNotificationWithIcon("success", "操作结果", "添加成功");
                    _this.props.refreshList();
                    _this.handleCancel();
                } else {
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
     * @param value
     * @returns {boolean}
     */
    handleRenewPlan = (value) => {
        const standard_time = moment(value.standard_time).format('YYYY-MM-DD HH:mm:ss');
        const param = {display:value.display,title:value.title,id:value.id,standard_time:standard_time,cycle:value.cycle, unit:value.unit, content:value.content}
        const _this = this;
        Modal.confirm({
            title: '您确定要保存此次修改结果?',
            onOk: async () => {
                const {msg, code} = await updatePlanApi(param);
                if (code === 0) {
                    openNotificationWithIcon("success", "操作结果", "修改成功");
                    _this.props.refreshList();
                    _this.handleCancel();
                } else {
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
    handleHowOftenChange = (value) => {
        const _this = this;
        if (1===value){
            // 一次性的计划提醒特殊处理，回填0
            _this.formRef.current.setFieldsValue({'unit':0});
        }
        let plan = _this.state.plan
        // 方便禁用
        plan.cycle = value
        _this.setState({plan})
    };


    /**
     * 为第一次render()准备数据  因为要异步加载数据，所以方法改为async执行
     */
    componentDidMount() {
        this.formItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 14},
        };
        // 加载页面数据
        const _this = this;
        _this.props.onRef(_this);
    };


    render() {
        const {plan,visibleModal} = this.state;
        return (
            <Modal title={!plan || !plan.id ? '添加计划提醒':'编辑计划提醒'} open={visibleModal} maskClosable={false} width="45%" okText='保存' onOk={this.handleSubmit} onCancel={this.handleCancel}>
                <Form {...this.formItemLayout} ref={this.formRef}>
                    <Form.Item label="标题：" {...this.formItemLayout} initialValue={plan.title} getValueFromEvent={ (e) => clearTrimValueEvent(e)} name='title' rules={[{required: true, message: '请输入标题'}, {max: 32, message: '长度在 1 到 32 个字符'}]}>
                        <Input showCount placeholder='请输入标题' maxLength={32}/>
                    </Form.Item>

                    <Form.Item label="执行时间：" {...this.formItemLayout} initialValue={!plan || !plan.standard_time ? null : moment(plan.standard_time, 'YYYY-MM-DD HH:mm:ss')} name='standard_time' rules={[{required: true, message: '请选择执行时间'}]}>
                        <DatePicker format="YYYY-MM-DD HH:mm:ss" showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss')}} aceholder="执行时间"/>
                    </Form.Item>

                    <Form.Item label="重复周期：" {...this.formItemLayout} initialValue={plan.cycle} name='cycle' rules={[{required: true, message: '请选择重复周期'}]}>
                        <Select onChange={this.handleHowOftenChange}>
                            <Select.Option value={1}>不重复</Select.Option>
                            <Select.Option value={2}>天</Select.Option>
                            <Select.Option value={3}>周</Select.Option>
                            <Select.Option value={4}>月</Select.Option>
                            <Select.Option value={5}>年</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="周期单位：" {...this.formItemLayout} initialValue={plan.unit} name='unit' rules={[{required: true, message: '请输入周期单位'}]}>
                        <InputNumber min={0} max={365} disabled={plan.cycle===1}/>
                    </Form.Item>

                    <Form.Item label="是否展示：" {...this.formItemLayout} initialValue={plan.display} name='display' rules={[{required: true, message: '请选择是否展示'}]}>
                        <Radio.Group>
                            <Radio value={1}>否</Radio>
                            <Radio value={2}>是</Radio>
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item label="内容：" {...this.formItemLayout} initialValue={plan.content} getValueFromEvent={ (e) => clearTrimValueEvent(e)} name='content' rules={[{required: true, message: '请输入计划提醒内容'}, {max: 128, message: '长度在 1 到 128 个字符'}]}>
                        <Input.TextArea showCount placeholder='请输入计划提醒内容' maxLength={128} autosize={{minRows: 4, maxRows: 6}}/>
                    </Form.Item>
                </Form>
            </Modal>
        );
    }
}

// 对外暴露
export default EditActivityPlan;
