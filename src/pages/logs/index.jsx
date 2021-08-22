import React, {Component} from 'react';
import {Col, Form, Button, Table, DatePicker, Select} from 'antd';
import {getLogList, getLogType, downloadLogExcel} from '../../api'
import {openNotificationWithIcon} from '../../utils/window'
import {SearchOutlined,ReloadOutlined,FileExcelOutlined} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios'
import {disabledDate} from "../../utils/var"
import './index.less'
/*
 * 文件名：index.jsx
 * 作者：liunengkai
 * 创建日期：4/12/21 - 11:02 PM
 * 描述：
 */

const {RangePicker} = DatePicker;
const {Option} = Select;

// 定义组件（ES6）
class Logs extends Component {

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
            // 查询的日期
            date: null,
            beginTime: null,// 搜索表单的开始时间
            endTime: null,// 搜索表单的结束时间
            selectType: ''//用户选择的日志类别
        },
        type: [],// 系统返回的日志类别
    };

    /*
    * 初始化Table所有列的数组
    */
    initColumns = () => {
        this.columns = [
            {
                title: '用户',
                dataIndex: 'user', // 显示数据对应的属性名
                align:'center',
            },
            {
                title: '操作详情',
                dataIndex: 'logType.describe', // 显示数据对应的属性名
                render: (text, record) => <span>{!record.logType?'-':record.logType.describe}</span>,
            },
            {
                title: 'IP',
                dataIndex: 'ip', // 显示数据对应的属性名
                align:'center',
            },
            {
                title: '城市',
                dataIndex: 'city', // 显示数据对应的属性名
            },
            {
                title: '日期',
                dataIndex: 'date', // 显示数据对应的属性名
                align:'center',
            }
        ]
    };

    /**
     * 获取日志类别
     * @returns {Promise<void>}
     */
    getTypeData = async () => {
        let _this = this;
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await getLogType();
        if (code === 0) {
            // 利用更新状态的回调函数，渲染下拉选框
            let type = [];
            type.push((<Option key={-1} value="">请选择</Option>));
            data.forEach(item => {
                type.push((<Option key={item.type} value={item.type}>{item.describe}</Option>));
            });
            _this.setState({
                type
            });
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    /**
     * 获取日志数据
     * @returns {Promise<void>}
     */
    getDatas = async () => {
        let _this = this;
        let para = {
            nowPage: _this.state.nowPage,
            pageSize: _this.state.pageSize,
            type: _this.state.filters.selectType,
            beginTime: _this.state.filters.beginTime,
            endTime: _this.state.filters.endTime,
        };
        // 在发请求前, 显示loading
        _this.setState({listLoading: true});
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await getLogList(para);
        // 在请求完成后, 隐藏loading
        _this.setState({listLoading: false});
        if (code === 0) {
            _this.setState({
                // 总数据量
                dataTotal: data.dateSum,
                // 表格数据
                datas: data.grid
            });
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    reloadPage = () => {
        // 重置查询条件
        let _this = this;
        let filters = _this.state.filters;
        filters.beginTime = null;
        filters.endTime = null;
        filters.selectType = '';
        _this.setState({
            nowPage: 1,
            filters: filters
        }, function () {
            _this.getDatas()
        });
    };

    // 回调函数,改变页宽大小
    changePageSize = (pageSize, current) => {
        let _this = this;
        // react在生命周期和event handler里的setState会被合并（异步）处理,需要在回调里回去获取更新后的 state.
        _this.setState({
            pageSize: pageSize,
            nowPage: 1,
        }, function () {
            _this.getDatas();
        });
    };

    // 回调函数，页面发生跳转
    changePage = (current) => {
        let _this = this;
        _this.setState({
            nowPage: current,
        }, function () {
            _this.getDatas();
        });
    };

    // 日期选择发生变化
    onChangeDate = (date, dateString) => {
        let _this = this;
        let {filters} = _this.state;
        // 为空要单独判断
        if (dateString[0] !== '' && dateString[1] !== ''){
            filters.beginTime = dateString[0];
            filters.endTime = dateString[1];
        }else{
            filters.beginTime = null;
            filters.endTime = null;
        }
        _this.setState({
            filters,
            nowPage: 1,
        }, function () {
            _this.getDatas()
        });
    };

    // 日志选框发生改变
    onChangeType = (value) => {
        let _this = this;
        let {filters} = _this.state;
        filters.selectType = value;
        _this.setState({
            filters,
            nowPage: 1,
        }, function () {
            _this.getDatas()
        });
    };

    exportExcel = () => {
        let _this = this;
        // 在发请求前, 显示loading
        _this.setState({listLoading: true});
        let para = {
            type: this.state.filters.selectType,
            beginTime: this.state.filters.beginTime,
            endTime: this.state.filters.endTime,
        };
        axios({
            method: "GET",
            url: downloadLogExcel,   //接口地址
            params: para,           //接口参数
            responseType: 'blob',
            //上面这个参数不加会乱码，据说{responseType: 'arraybuffer'}也可以
            headers: {
                "Content-Type": "application/json"
            },
        })
            .then(function (res) {
                _this.setState({listLoading: false});
                let fileName = '操作日志报表.xlsx';//excel文件名称
                let blob = new Blob([res.data], {type: 'application/x-xlsx'});   //word文档为msword,pdf文档为pdf，excel文档为x-xls
                if (window.navigator.msSaveOrOpenBlob) {
                    navigator.msSaveBlob(blob, fileName);
                } else {
                    let link = document.createElement('a');
                    link.href = window.URL.createObjectURL(blob);
                    link.download = fileName;
                    link.click();
                    window.URL.revokeObjectURL(link.href);
                }
            })
            .catch(function (res) {
                _this.setState({listLoading: false});
                openNotificationWithIcon("error", "错误提示", "导出日志报表失败");
            });
    };


    /*
    *为第一次render()准备数据
    * 因为要异步加载数据，所以方法改为async执行
    */
    componentDidMount() {
        // 初始化日志类别数据
        this.getTypeData();
        // 初始化表格属性设置
        this.initColumns();
        // 加载页面数据
        this.getDatas();
    };


    render() {
        // 读取状态数据
        const {datas, dataTotal, nowPage, pageSize, listLoading,filters, type} = this.state;
        let {beginTime,endTime} = filters;
        let rangeDate;
        if (beginTime !== null && endTime !== null){
            rangeDate = [moment(beginTime),moment(endTime)]
        } else {
            rangeDate = [null,null]
        }
        return (
            <div className="logs-page">
                <header>
                    <div className="page-name">日志</div>
                    <div className="tools-bar">
                        <Col span={24}>
                            <Form layout="inline">
                                <Form.Item label="操作类别:">
                                    <Select value={filters.selectType} className="form-select" showSearch onChange={this.onChangeType}
                                            placeholder="请选择操作类别">
                                        {type}
                                    </Select>
                                </Form.Item>
                                <Form.Item label="操作时间:">
                                    <RangePicker value={rangeDate} className='form-range' disabledDate={disabledDate} onChange={this.onChangeDate}/>
                                </Form.Item>
                                <Form.Item>
                                    <Button type="primary" className='form-button' htmlType="button" onClick={this.getDatas}>
                                        <SearchOutlined/>查询
                                    </Button>
                                </Form.Item>
                                <Form.Item>
                                    <Button type="primary" className='form-button' htmlType="button" onClick={this.reloadPage}>
                                        <ReloadOutlined/>重置
                                    </Button>
                                </Form.Item>
                                <Form.Item>
                                    <Button type="primary" className='form-button' htmlType="button" onClick={this.exportExcel}>
                                        <FileExcelOutlined/>导出
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Col>
                    </div>
                </header>
                <section>
                    <Col span={24} className="dataTable">
                        <Table size="small" rowKey="id" bordered loading={listLoading} columns={this.columns} dataSource={datas}
                               pagination={{
                                   current:nowPage,
                                   showTotal: () => `当前第${nowPage}页 共${dataTotal}条`,
                                   pageSize: pageSize, showQuickJumper: true, total: dataTotal, showSizeChanger: true,
                                   onShowSizeChange: (current, pageSize) => this.changePageSize(pageSize, current),
                                   onChange: this.changePage,
                               }}/>
                    </Col>
                </section>
            </div>
        );
    }
}

// 对外暴露
export default Logs;