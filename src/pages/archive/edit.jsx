import React, {Component} from 'react';
import {Form, Modal,Radio,Tooltip} from "antd";
import {updateArchivePlanApi} from "@/api";
import {openNotificationWithIcon} from "@/utils/window";
import {QuestionCircleOutlined} from "@ant-design/icons";

/*
 * 文件名：edit.jsx
 * 作者：shmily
 * 创建日期：2022-10-30 - 00:50
 * 描述：过往的计划提醒表单
 */

// 定义组件（ES6）
class EditArchivePlan extends Component {

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
                _this.formRef.current.setFieldsValue({display:null,status:null});
            }else{
                _this.formRef.current.setFieldsValue({display:val.display, status:val.status});
            }
        });
    };

    /**
     * 响应用户提交事件
     */
    handleSubmit = () => {
        const _this = this;
        const plan = _this.state.plan;
        _this.formRef.current.validateFields(['display','status']).then(value => {
            // 执行修改
            value.id = plan.id;
            _this.handleRenewPlan(value);
        }).catch(e => console.log("修改或预览计划提醒错误",e));
    };

    /**
     * 修改计划提醒
     * @param value
     * @returns {boolean}
     */
    handleRenewPlan = (value) => {
        const param = {display:value.display,status:value.status,id:value.id}
        const _this = this;
        Modal.confirm({
            title: '您确定要保存此次修改结果?',
            cancelText: '再想想',
            okText: '想好啦',
            onOk: async () => {
                const {msg, code} = await updateArchivePlanApi(param);
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
            <Modal title='计划提醒详情' open={visibleModal} maskClosable={false} width="45%" okText='保存' onOk={this.handleSubmit} onCancel={this.handleCancel}>
                <Form {...this.formItemLayout} ref={this.formRef}>
                    <Form.Item label="标题：" {...this.formItemLayout}>
                        {plan.title}
                    </Form.Item>

                    <Form.Item label="执行时间：" {...this.formItemLayout}>
                        {plan.archive_time}
                    </Form.Item>

                    <Form.Item label={<span>是否公开&nbsp;<Tooltip title="该操作为单向不可逆操作，一旦选择未完成或者已完成保存后，不可修改，请谨慎操作!"><QuestionCircleOutlined /></Tooltip></span>} {...this.formItemLayout} initialValue={plan.status}  name='status' rules={[{required: true, message: '请选择是否展示'}]}>
                        <Radio.Group disabled={plan.status!==1}>
                            <Radio disabled={true} value={1}>进行中</Radio>
                            <Radio value={2}>未完成</Radio>
                            <Radio value={3}>已完成</Radio>
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item label={<span>是否公开&nbsp;<Tooltip title="是否公开。如果选择是，该计划提醒将会展示在公众页面，对于敏感内容，请谨慎操作!"><QuestionCircleOutlined /></Tooltip></span>} {...this.formItemLayout} initialValue={plan.display} name='display' rules={[{required: true, message: '请选择是否公开'}]}>
                        <Radio.Group>
                            <Radio value={1}>否</Radio>
                            <Radio value={2}>是</Radio>
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item label="内容：" {...this.formItemLayout}>
                        {plan.content}
                    </Form.Item>
                </Form>
            </Modal>
        );
    }
}

// 对外暴露
export default EditArchivePlan;
