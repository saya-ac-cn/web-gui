import React, {Component} from 'react';
import {Form, Input,Modal} from "antd";
import {clearTrimValueEvent} from "../../utils/string";
import {createMemo, updateMemo} from "../../api";
import {openNotificationWithIcon} from "../../utils/window";
/*
 * 文件名：edit.jsx
 * 作者：shmily
 * 创建日期：2019-08-25 - 21:50
 * 描述：便利贴表单
 */

// 定义组件（ES6）
class EditMemo extends Component {

    formRef = React.createRef();

    state = {
        memo: {}, // 创建一个没有内容的编辑对象
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
        console.log('val',val);
        _this.setState({
            memo: val,
            visibleModal: true
        },function () {
            //注意 initialValues 不能被 setState 动态更新，你需要用 setFieldsValue 来更新。
            if(!val || !val.id){
                _this.formRef.current.setFieldsValue({'title':null, 'content':null});
            }else{
                _this.formRef.current.setFieldsValue(val);
            }
        });
    };

    /**
     * 响应用户提交事件
     */
    handleSubmit = () => {
        const _this = this;
        const memo = _this.state.memo;
        _this.formRef.current.validateFields(['title', 'content']).then(value => {
            if(!memo.id){
                // 执行添加
                _this.handleAddMemo(value);
            }else{
                // 执行修改
                value.id = memo.id;
                _this.handleRenewMemo(value);
            }
        }).catch(e => console.log("修改或添加便利贴错误",e));
    };

    /**
     * 添加便利贴
     * @param value
     * @returns {boolean}
     */
    handleAddMemo = (value) => {
        const _this = this;
        Modal.confirm({
            title: '您确定创建该便利贴?',
            onOk: async () => {
                const {msg, code} = await createMemo(value);
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

    handleRenewMemo = (value) => {
        const _this = this;
        Modal.confirm({
            title: '您确定要保存此次修改结果?',
            onOk: async () => {
                const {msg, code} = await updateMemo(value);
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
        const {memo,visibleModal} = this.state;
        return (
            <Modal title={!memo || !memo.id ? '添加便利贴':'编辑便利贴'} visible={visibleModal} maskClosable={false} okText='保存' onOk={this.handleSubmit} onCancel={this.handleCancel}>
                <Form {...this.formItemLayout} ref={this.formRef}>
                    <Form.Item label="标题名：" {...this.formItemLayout} initialValue={memo.title} getValueFromEvent={ (e) => clearTrimValueEvent(e)} name='title' rules={[{required: true, message: '请输入便利贴标题'}, {min: 2, message: '长度在 2 到 15 个字符'}, {max: 15, message: '长度在 2 到 15 个字符'}]}>
                        <Input placeholder='请输入标题'/>
                    </Form.Item>
                    <Form.Item label="正文：" {...this.formItemLayout} initialValue={memo.content} getValueFromEvent={ (e) => clearTrimValueEvent(e)} name='content' rules={[{required: true, message: '请输入便利贴正文'}, {max: 128, message: '长度在 1 到 128 个字符'}]}>
                        <Input.TextArea showCount placeholder='请输入便利贴正文' maxLength={128} autosize={{minRows: 4, maxRows: 6}}/>
                    </Form.Item>
                </Form>
            </Modal>
        );
    }
}

// 对外暴露
export default EditMemo;
