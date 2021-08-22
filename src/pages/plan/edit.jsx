import React, {Component} from 'react';
import {Button, Col, DatePicker, Form, Row, Modal, Input, Spin, Popconfirm} from "antd";
import {createPlan, deletePlan, updatePlan} from "../../api";
import {openNotificationWithIcon} from "../../utils/window";

/*
 * 文件名：edit.jsx
 * 作者：liunengkai
 * 创建日期：5/4/21 - 11:01 AM
 * 描述：
 */

// 定义组件（ES6）
class Edit extends Component {

    formRef = React.createRef();

    state = {
        plan: {}, // 创建一个没有内容的编辑对象
        visibleModal:false
    };

    /**
     * 显示弹框
     * @param val
     */
    handleDisplay = (val) => {
        let _this = this;
        console.log('val',val);
        _this.setState({
            plan: val,
            visibleModal: true
        },function () {
            //注意 initialValues 不能被 setState 动态更新，你需要用 setFieldsValue 来更新。
            if(!val || !val.id){
                _this.formRef.current.setFieldsValue({'planDate':val.planDate, 'planContent':null});
            }else{
                _this.formRef.current.setFieldsValue(val);
            }
        });
    };

    /**
     * 关闭弹框
     */
    handleCancel = () => {
        this.setState({visibleModal: false});
    };

    /**
     * 提交修改
     */
    handleSubmitForm = () => {
        let _this = this;
        let form = _this.state.plan;
        _this.formRef.current.validateFields(['planContent']).then( value => {
            // 通过验证
            form.planContent = value.planContent;
            if (form.id === null){
                // 提交到创建接口
                _this.sendInsertRequest(form)
            } else {
                // 提交到修改接口
                _this.sendUpdateRequest(form)
            }
        })
    };

    /**
     * 发送添加请求
     * @param form
     * @returns {Promise<void>}
     */
    sendInsertRequest = async (form) => {
        let _this = this;
        let para = {
            describe: form.planContent,
            plandate: form.planDate
        };
        // 在发请求前, 显示loading
        _this.setState({listLoading: true});
        const {msg, code} = await createPlan(para);
        // 在请求完成后, 隐藏loading
        _this.setState({listLoading: false});
        if (code === 0) {
            openNotificationWithIcon("success", "操作结果", "创建成功");
            _this.handleCancel();
            _this.formRef.current.resetFields();
            _this.props.refreshPage();
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    sendUpdateRequest = async (form) => {
        let _this = this;
        let para = {
            id: form.id,
            describe:form.planContent,
            plandate: form.planDate
        };
        // 在发请求前, 显示loading
        _this.setState({listLoading: true});
        const {msg, code} = await updatePlan(para)
        // 在请求完成后, 隐藏loading
        _this.setState({listLoading: false});
        if (code === 0) {
            openNotificationWithIcon("success", "操作结果", "修改成功");
            _this.handleCancel();
            _this.formRef.current.resetFields();
            _this.props.refreshPage();
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    /**
     * 删除计划
     * @param e
     */
    handleDeletePlan = async (e) =>{
        let _this = this;
        let editForm = _this.state.plan;
        let para = {
            id: editForm.id
        };
        // 在发请求前, 显示loading
        _this.setState({listLoading: true});
        const {msg, code} = await deletePlan(para);
        // 在请求完成后, 隐藏loading
        _this.setState({listLoading: false});
        if (code === 0) {
            openNotificationWithIcon("success", "操作结果", "删除成功");
            _this.handleCancel();
            _this.formRef.current.resetFields();
            _this.props.refreshPage();
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    /*
     * 为第一次render()准备数据
     * 因为要异步加载数据，所以方法改为async执行
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
        const {visibleModal, plan} = this.state;
        return (
            <Modal
                title="计划安排"
                width="50%"
                visible={visibleModal === true}
                okText='提交'
                onOk={this.handleSubmitForm}
                onCancel={this.handleCancel}>
                <Form {...this.formItemLayout} ref={this.formRef}>
                    <Form.Item label="计划时间" name='planDate' {...this.formItemLayout} initialValue={plan.planDate} >
                        <Input disabled={true}/>
                    </Form.Item>
                    <Form.Item label="计划内容：" name='planContent' {...this.formItemLayout} initialValue={plan.planContent} rules={[{required: true, message: '请输入计划内容'},{min: 1, message: '长度在 1 到 50 个字符'}, {max: 50, message: '长度在 1 到 50 个字符'}]}>
                        <Input.TextArea maxLength={50} showCount autosize={{minRows: 2, maxRows: 4}} placeholder='请输入计划内容'/>
                    </Form.Item>
                    {
                        plan.id &&
                        <Form.Item {...this.buttonItemLayout}>
                            <Popconfirm
                                title="您确定要删除该计划?"
                                onConfirm={this.handleDeletePlan}
                                okText="确定"
                                cancelText="取消"
                            >
                                <Button type="link">删除计划</Button>
                            </Popconfirm>
                        </Form.Item>
                    }
                </Form>
            </Modal>
        );
    }
}

// 对外暴露
export default Edit;