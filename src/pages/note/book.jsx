import React, {Component} from 'react';
import {Form, Input, Modal, Radio, Tooltip} from "antd";
import {clearTrimValueEvent} from "@/utils/string";
import {QuestionCircleOutlined} from "@ant-design/icons";
import {openNotificationWithIcon} from "@/utils/window";
import {createNoteBookApi, updateNoteBookApi} from "../../../api";
/*
 * 文件名：book.jsx
 * 作者：liunengkai
 * 创建日期：2022-10-05 - 21:50
 * 描述：笔记簿表单
 */

// 定义组件（ES6）
class EditNoteBook extends Component {

    formRef = React.createRef();

    state = {
        book: {}, // 创建一个没有内容的编辑对象
        visibleModal: false
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
            book: val,
            visibleModal: true
        }, function () {
            //注意 initialValues 不能被 setState 动态更新，你需要用 setFieldsValue 来更新。
            if (!val || !val.id) {
                _this.formRef.current.setFieldsValue({'name': null, 'descript': null, 'status': 1});
            } else {
                _this.formRef.current.setFieldsValue(val);
            }
        });
    };

    /**
     * 响应用户提交事件
     */
    handleSubmit = () => {
        const _this = this;
        const book = _this.state.book;
        _this.formRef.current.validateFields(['name', 'descript', 'status']).then(value => {
            if (!book.id) {
                // 执行添加
                _this.handleAddBook(value);
            } else {
                // 执行修改
                value.id = book.id;
                _this.handleRenewBook(value);
            }
            console.log('val', value)
        }).catch(e => console.log("修改或添加笔记簿错误", e));
    }

    /**
     * 添加笔记簿
     * @param value
     * @returns {boolean}
     */
    handleAddBook = (value) => {
        const _this = this;
        Modal.confirm({
            title: '您确定创建该笔记簿?',
            onOk: async () => {
                const {msg, code} = await createNoteBookApi(value);
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
    }

    /**
     * 修改笔记簿
     * @param value
     * @returns {boolean}
     */
    handleRenewBook = (value) => {
        const _this = this;
        Modal.confirm({
            title: '您确定要保存此次修改结果?',
            onOk: async () => {
                const {msg, code} = await updateNoteBookApi(value);
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
    }

    /**
     * 为第一次render()准备数据
     * 因为要异步加载数据，所以方法改为async执行
     */
    componentDidMount() {
        this.formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 14},
        };
        // 加载页面数据
        const _this = this;
        _this.props.onRef(_this);
    };

    render() {
        const {book, visibleModal} = this.state;
        return (
            <Modal title={!book || !book.id ? '添加笔记簿' : '修改笔记簿'} open={visibleModal} maskClosable={false} okText='保存'
                   onOk={this.handleSubmit} onCancel={this.handleCancel}>
                <Form {...this.formItemLayout} ref={this.formRef}>
                    <Form.Item label="笔记簿名：" {...this.formItemLayout} initialValue={book.name}
                               getValueFromEvent={(e) => clearTrimValueEvent(e)} name='name'
                               rules={[{required: true, message: '请输入笔记簿名'}, {
                                   min: 2,
                                   message: '长度在 2 到 15 个字符'
                               }, {max: 15, message: '长度在 2 到 15 个字符'}]}>
                        <Input placeholder='请输入笔记簿名'/>
                    </Form.Item>
                    <Form.Item label="分类描述：" {...this.formItemLayout} initialValue={book.descript}
                               getValueFromEvent={(e) => clearTrimValueEvent(e)} name='descript'
                               rules={[{required: true, message: '请输入笔记簿描述'}, {
                                   min: 1,
                                   message: '长度在 1 到 50 个字符'
                               }, {max: 50, message: '长度在 1 到 50 个字符'}]}>
                        <Input.TextArea autosize={{minRows: 2, maxRows: 4}} showCount maxLength={50}
                                        placeholder='请输入笔记簿描述'/>
                    </Form.Item>
                    <Form.Item label={<span>是否开启&nbsp;<Tooltip
                        title="是否公开显示该笔记簿下的所有笔记"><QuestionCircleOutlined/></Tooltip></span>} {...this.formItemLayout}
                               initialValue={book.status || 1} name='status'
                               rules={[{required: true, message: '请选择接口开启状态'}]}>
                        <Radio.Group>
                            <Radio value={1}>开启</Radio>
                            <Radio value={2}>关闭</Radio>
                        </Radio.Group>
                    </Form.Item>
                </Form>
            </Modal>
        );
    }
}

// 对外暴露
export default EditNoteBook;
