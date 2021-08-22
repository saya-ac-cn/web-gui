import React, {Component} from 'react';
import {Button, Col, Input, Form, Table, DatePicker, Modal} from "antd";
import {getMemoList, getMemo, deleteMemo} from "../../api";
import {openNotificationWithIcon} from "../../utils/window";
import moment from 'moment';
import MemoFrom from "./edit";
import {DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined} from "@ant-design/icons";
import {disabledDate} from "../../utils/var"

/*
 * 文件名：index.jsx
 * 作者：liunengkai
 * 创建日期：5/4/21 - 8:11 AM
 * 描述：
 */

const {RangePicker} = DatePicker;

// 定义组件（ES6）
class Memo extends Component {

    memoFormRef = React.createRef();

    state = {
        // 返回的单元格数据
        datas: [],
        // 总数据行数
        dataTotal: 0,
        // 当前页
        nowPage: 1,
        // 页面宽度
        pageSize: 10,
        // 是否显示加载
        listLoading: false,
        filters: {
            beginTime: null,// 搜索表单的开始时间
            endTime: null,// 搜索表单的结束时间
            title: null, // 标题
        },
    };

    /*
    * 初始化Table所有列的数组
    */
    initColumns = () => {
        this.columns = [
            {
                title: '标题',
                dataIndex: 'title', // 显示数据对应的属性名
            },
            {
                title: '创建者',
                dataIndex: 'source', // 显示数据对应的属性名
            },
            {
                title: '创建时间',
                dataIndex: 'createtime', // 显示数据对应的属性名
            },
            {
                title: '修改时间',
                dataIndex: 'updatetime', // 显示数据对应的属性名
            },
            {
                title: '操作',
                align:'center',
                render: (text, record) => (
                    <div>
                        <Button type="primary" onClick={() => this.handleModalEdit(record)} shape="circle" icon={<EditOutlined/>}/>
                        &nbsp;
                        <Button type="danger" onClick={() => this.handleDellMemo(record)} shape="circle" icon={<DeleteOutlined/>}/>
                    </div>
                ),
            },
        ]
    };

    /**
     * 获取便利贴列表数据
     * @returns {Promise<void>}
     */
    getDatas = async () => {
        let para = {
            title: this.state.filters.title,
            nowPage: this.state.nowPage,
            pageSize: this.state.pageSize,
            status: this.state.filters.status,
            beginTime: this.state.filters.beginTime,
            endTime: this.state.filters.endTime,
        };
        // 在发请求前, 显示loading
        this.setState({listLoading: true});
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await getMemoList(para);
        // 在请求完成后, 隐藏loading
        this.setState({listLoading: false});
        if (code === 0) {
            this.setState({
                // 总数据量
                dataTotal: data.dateSum,
                // 表格数据
                datas: data.grid
            });
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    /**
     * 刷新
     */
    reloadPage = () => {
        // 重置查询条件
        let _this = this;
        let filters = _this.state.filters;
        filters.name = null;
        filters.status = null;
        _this.setState({
            nowPage: 1,
            filters: filters,
        }, function () {
            _this.getDatas()
        });
    };

    // 回调函数,改变页宽大小
    changePageSize = (pageSize, current) => {
        // react在生命周期和event handler里的setState会被合并（异步）处理,需要在回调里回去获取更新后的 state.
        this.setState({
            nowPage: 1,
            pageSize: pageSize
        }, function () {
            this.getDatas();
        });
    };

    // 回调函数，页面发生跳转
    changePage = (current) => {
        this.setState({
            nowPage: current,
        }, function () {
            this.getDatas();
        });
    };

    // 日期选择发生变化
    onChangeDate = (date, dateString) => {
        let _this = this;
        let {filters} = _this.state;
        // 为空要单独判断
        if (dateString[0] !== '' && dateString[1] !== '') {
            filters.beginTime = dateString[0];
            filters.endTime = dateString[1];
        } else {
            filters.beginTime = null;
            filters.endTime = null;
        }
        _this.setState({
            nowPage: 1,
            filters
        }, function () {
            _this.getDatas()
        });
    };


    /**
     * 双向绑定用户查询主题
     * @param event
     */
    titleInputChange = (event) => {
        let _this = this;
        const value = event.target.value;
        let filters = _this.state.filters;
        filters.title = value;
        _this.setState({
            nowPage: 1,
            filters
        })
    };

    /*
    * 显示添加的弹窗
    */
    handleModalAdd = () => {
        this.memoFormRef.handleDisplay({});
    };

    /*
    * 显示修改的弹窗
    */
    handleModalEdit = async (value) => {
        let _this = this;
        let para = {
            id: value.id
        };
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await getMemo(para);
        if (code === 0) {
            _this.memoFormRef.handleDisplay(data);
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };


    /*
    * 删除指定便利贴
    */
    handleDellMemo = (item) => {
        let _this = this;
        Modal.confirm({
            title: '删除确认',
            content: `确认删除标题为:${item.title}的便利贴吗?`,
            cancelText: '再想想',
            okText: '不要啦',
            onOk: async () => {
                // 在发请求前, 显示loading
                _this.setState({listLoading: true});
                let para = { id: item.id };
                const {msg, code} = await deleteMemo(para);
                // 在请求完成后, 隐藏loading
                _this.setState({listLoading: false});
                if (code === 0) {
                    openNotificationWithIcon("success", "操作结果", "删除成功");
                    _this.getDatas();
                } else {
                    openNotificationWithIcon("error", "错误提示", msg);
                }
            }
        })
    };

    bindMemoFormRef = (ref) => {
        this.memoFormRef = ref
    };

    refreshListFromMemoForm= () =>{
        this.getDatas();
    };

    /*
     * 为第一次render()准备数据
     * 因为要异步加载数据，所以方法改为async执行
     */
    componentDidMount() {
        // 初始化表格属性设置
        this.initColumns();
        this.refreshListFromMemoForm  = this.refreshListFromMemoForm.bind(this);
        // 加载页面数据
        this.getDatas();
    };


    render() {
        const {datas, dataTotal, nowPage, pageSize, listLoading, filters} = this.state;
        let {beginTime, endTime, title} = filters;
        let rangeDate;
        if (beginTime !== null && endTime !== null) {
            rangeDate = [moment(beginTime), moment(endTime)]
        } else {
            rangeDate = [null, null]
        }
        return (
            <div className="mome-page">
                <header>
                    <div className="page-name">便利贴</div>
                    <div className="tools-bar">
                        <Form layout="inline">
                            <Form.Item label="标题:">
                                <Input type='text' value={title} className='form-input' onChange={this.titleInputChange}
                                       placeholder='按标题检索'/>
                            </Form.Item>
                            <Form.Item label="填写时间:">
                                <RangePicker value={rangeDate} disabledDate={disabledDate} onChange={this.onChangeDate}/>
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="button" onClick={this.getDatas}>
                                    <SearchOutlined/>查询
                                </Button>
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="button" onClick={this.reloadPage}>
                                    <ReloadOutlined/>重置
                                </Button>
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="button" onClick={this.handleModalAdd}>
                                    <PlusOutlined/>创建
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                </header>
                <section>
                    <Col span={24} className="dataTable">
                        <Table size="small" rowKey="id" bordered loading={listLoading} columns={this.columns} dataSource={datas}
                               pagination={{
                                   current: nowPage,
                                   showTotal: () => `当前第${nowPage}页 共${dataTotal}条`,
                                   pageSize: pageSize, showQuickJumper: true, total: dataTotal, showSizeChanger: true,
                                   onShowSizeChange: (current, pageSize) => this.changePageSize(pageSize, current),
                                   onChange: this.changePage,
                               }}/>
                    </Col>
                    <MemoFrom onRef={this.bindMemoFormRef.bind(this)} refreshList={this.refreshListFromMemoForm}/>
                </section>
            </div>
        );
    }
}

// 对外暴露
export default Memo;