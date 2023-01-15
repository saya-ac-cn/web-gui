import React, {Component} from 'react';
import {Button, Col, Input, Form, Table, DatePicker, Modal} from "antd";
import {activityPlanPageApi, advanceFinishPlanApi, deletePlanApi} from "../../../api";
import {openNotificationWithIcon} from "@/utils/window";
import {getPlanHowOftenExecute} from "@/utils/enum";
import moment from 'moment';
 import EditActivityPlan from "./edit";
import {DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined,CheckOutlined} from "@ant-design/icons";
import storageUtils from "@/utils/storageUtils";
import {extractUserName} from "@/utils/var";
/*
 * 文件名：index.jsx
 * 作者：liunengkai
 * 创建日期：2022-10-29 - 23:35
 * 描述：进行中的计划提醒
 */
const {RangePicker} = DatePicker;

// 定义组件（ES6）
class ActivityPlan extends Component {

    activityFormRef = React.createRef();

    state = {
        // 返回的单元格数据
        datas: [],
        // 总数据行数
        dataTotal: 0,
        // 当前页
        page_no: 1,
        // 页面宽度
        page_size: 10,
        // 是否显示加载
        listLoading: false,
        organize:storageUtils.get(storageUtils.ORGANIZE_KEY),
        filters: {
            begin_time: null,// 搜索表单的开始时间
            end_time: null,// 搜索表单的结束时间
            title: null, // 标题
            content: null, // 正文
        },
    };

    /**
     * 初始化Table所有列的数组
     */
    initColumns = () => {
        this.columns = [
            {
                title: '编号',
                dataIndex: 'id', // 显示数据对应的属性名
            },
            {
                title: '执行时间',
                dataIndex: 'standard_time', // 显示数据对应的属性名
            },
            {
                title: '频率',
                dataIndex: 'unit', // 显示数据对应的属性名
                render: (text, record) => {
                    return this.formatHowOftenExecute(record)
                }
            },
            {
                title: '下次执行时间',
                dataIndex: 'next_exec_time', // 显示数据对应的属性名
                render: (text, record) => {
                    if (1 === record.cycle) {
                        return '/'
                    } else {
                        return record.next_exec_time
                    }
                }
            },
            {
                title: '标题',
                dataIndex: 'title', // 显示数据对应的属性名
            },
            {
                title: '公开状态',
                dataIndex: 'display', // 显示数据对应的属性名
                render: (text, record) => {
                    if (1 === record.display) {
                        return '已隐藏'
                    } else if (2 === record.display) {
                        return '已公开'
                    } else {
                        return '未知'
                    }
                }
            },
            {
                title: '创建者',
                dataIndex: 'user', // 显示数据对应的属性名
                render:(value,row) => (extractUserName(this.state.organize, row.user))
            },
            {
                title: '创建时间',
                dataIndex: 'create_time', // 显示数据对应的属性名
            },
            {
                title: '操作',
                align:'center',
                render: (text, record) => (
                    <div>
                        <Button type="primary" onClick={() => this.handleModalEdit(record)} shape="circle" icon={<EditOutlined/>}/>
                        &nbsp;
                        <Button type="primary" onClick={() => this.handleFinishPlan(record)} shape="circle" icon={<CheckOutlined/>}/>
                        &nbsp;
                        <Button type="danger" onClick={() => this.handleDell(record)} shape="circle" icon={<DeleteOutlined/>}/>
                    </div>
                ),
            },
        ]
    };

    /**
     * 格式化多久执行一次
     * @param row 所在行数据
     */
    formatHowOftenExecute = (row) => {
        if (1 === row.cycle) {
            return '/'
        } else {
            return `${row.unit}${getPlanHowOftenExecute(row.cycle)}/1次`
        }
    }

    /**
     * 获取当前活跃的计划提醒列表数据
     * @returns {Promise<void>}
     */
    getDatas = async () => {
        let para = {
            title: this.state.filters.title,
            content: this.state.filters.content,
            page_no: this.state.page_no,
            page_size: this.state.page_size,
            begin_time: this.state.filters.begin_time,
            end_time: this.state.filters.end_time,
        };
        // 在发请求前, 显示loading
        this.setState({listLoading: true});
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await activityPlanPageApi(para);
        // 在请求完成后, 隐藏loading
        this.setState({listLoading: false});
        if (code === 0) {
            this.setState({
                // 总数据量
                dataTotal: data.total_row,
                // 表格数据
                datas: data.records
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
        filters.begin_time = null;
        filters.end_time = null;
        filters.content = null;
        filters.title = null;
        _this.setState({
            page_no: 1,
            filters: filters,
        }, function () {
            _this.getDatas()
        });
    };


    /**
     * 回调函数,改变页宽大小
     * @param page_size
     * @param current
     */
    changePageSize = (page_size, current) => {
        // react在生命周期和event handler里的setState会被合并（异步）处理,需要在回调里回去获取更新后的 state.
        this.setState({
            page_no: 1,
            page_size: page_size
        }, function () {
            this.getDatas();
        });
    };

    /**
     * 回调函数，页面发生跳转
     * @param current
     */
    changePage = (current) => {
        this.setState({
            page_no: current,
        }, function () {
            this.getDatas();
        });
    };

    /**
     * 日期选择发生变化
     * @param date
     * @param dateString
     */
    onChangeDate = (date, dateString) => {
        let _this = this;
        let {filters} = _this.state;
        // 为空要单独判断
        if (dateString[0] !== '' && dateString[1] !== '') {
            filters.begin_time = dateString[0];
            filters.end_time = dateString[1];
        } else {
            filters.begin_time = null;
            filters.end_time = null;
        }
        _this.setState({
            page_no: 1,
            filters
        }, function () {
            _this.getDatas()
        });
    };


    /**
     * 双向绑定用户文本输入框
     * @param event
     * @param field
     */
    textInputChange = (event,field) => {
        let _this = this;
        const value = event.target.value;
        let filters = _this.state.filters;
        filters[field]  = value;
        _this.setState({
            page_no: 1,
            filters
        })
    };

    /**
     * 显示添加的弹窗
     */
    handleModalAdd = () => {
        this.activityFormRef.handleDisplay({});
    };

    /**
     * 显示修改的弹窗
     * @param value
     * @returns {Promise<void>}
     */
    handleModalEdit = (value) => {
        this.activityFormRef.handleDisplay(value);
    };


    /**
     * 删除指定计划提醒
     * @param item
     */
    handleDell = (item) => {
        let _this = this;
        Modal.confirm({
            title: '删除确认',
            content: `确认删除标题为:'${item.title}'的计划提醒吗?`,
            cancelText: '再想想',
            okText: '不要啦',
            onOk: async () => {
                // 在发请求前, 显示loading
                _this.setState({listLoading: true});
                const {msg, code} = await deletePlanApi(item.id);
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

    /**
     * 提前完成计划
     * @param item
     */
    handleFinishPlan = (item) => {
        let _this = this;
        Modal.confirm({
            title: '已完成确认',
            content: `确认标题为:'${item.title}'的计划提醒已完成了吗?`,
            cancelText: '再看看',
            okText: '已完成',
            onOk: async () => {
                // 在发请求前, 显示loading
                _this.setState({listLoading: true});
                const {msg, code} = await advanceFinishPlanApi(item.id);
                // 在请求完成后, 隐藏loading
                _this.setState({listLoading: false});
                if (code === 0) {
                    openNotificationWithIcon("success", "操作结果", "操作成功");
                    _this.getDatas();
                } else {
                    openNotificationWithIcon("error", "错误提示", msg);
                }
            }
        })
    };

    bindActivityFormRef = (ref) => {
        this.activityFormRef = ref
    };

    refreshListFromPlanForm= () =>{
        this.getDatas();
    };

    /**
     * 为第一次render()准备数据  因为要异步加载数据，所以方法改为async执行
     */
    componentDidMount() {
      // 初始化表格属性设置
      this.initColumns();
      this.refreshListFromPlanForm  = this.refreshListFromPlanForm.bind(this);
      // 加载页面数据
      this.getDatas();
    };


    render() {
        // 读取状态数据
        const {datas, dataTotal, page_no, page_size, listLoading, filters} = this.state;
        let {begin_time, end_time, content,title} = filters;
        let rangeDate;
        if (begin_time !== null && end_time !== null) {
            rangeDate = [moment(begin_time), moment(end_time)]
        } else {
            rangeDate = [null, null]
        }
        return (
            <DocumentTitle title='计划提醒'>
                <div className='child-container'>
                    <div className='header-tools'>
                        进行中的计划提醒
                    </div>
                    <div className='child-content'>
                        <Col span={24} className="toolbar">
                            <Form layout="inline">
                                <Form.Item label="标题:">
                                    <Input type='text' value={title} allowClear={true} onChange={(e)=>this.textInputChange(e,'title')}
                                           placeholder='按内容标题'/>
                                </Form.Item>
                                <Form.Item label="内容:">
                                    <Input type='text' value={content} allowClear={true} onChange={(e)=>this.textInputChange(e,'content')}
                                           placeholder='按内容检索'/>
                                </Form.Item>
                                <Form.Item label="执行时间:">
                                    <RangePicker value={rangeDate} onChange={this.onChangeDate}/>
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
                        </Col>
                        <Col span={24} className="dataTable">
                            <Table size="middle" rowKey="id" bordered loading={listLoading} columns={this.columns} dataSource={datas}
                                   pagination={{
                                       current: page_no,
                                       showTotal: () => `当前第${page_no}页 共${dataTotal}条`,
                                       pageSize: page_size, showQuickJumper: true, total: dataTotal, showSizeChanger: true,
                                       onShowSizeChange: (current, page_size) => this.changePageSize(page_size, current),
                                       onChange: this.changePage,
                                   }}/>
                        </Col>
                        <EditActivityPlan onRef={this.bindActivityFormRef.bind(this)} refreshList={this.refreshListFromPlanForm}/>
                    </div>
                </div>
            </DocumentTitle>
        );
    }
}

// 对外暴露
export default ActivityPlan;
