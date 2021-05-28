import React, {Component} from 'react';
import {totalTransactionForDay, outTransactionForDayExcel} from "../../api";
import {openNotificationWithIcon} from "../../utils/window";
import moment from 'moment';
import axios from 'axios';
import {SearchOutlined, ReloadOutlined, FileExcelOutlined} from '@ant-design/icons';
import {Button, Row, DatePicker, Table, Form, Col} from "antd";
import {disabledDate, formatMoney} from "../../utils/var";

/*
 * 文件名：index.jsx
 * 作者：liunengkai
 * 创建日期：5/4/21 - 2:57 PM
 * 描述： 收支汇总 按天
 */

const {RangePicker} = DatePicker;

// 定义组件（ES6）
class Statistics extends Component {

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
        },
    };

    /*
    * 初始化Table所有列的数组
    */
    initColumns = () => {
        this.columns = [
            {
                title: '统计日期',
                dataIndex: 'tradeDate', // 显示数据对应的属性名
                align:'center',
            },
            {
                title: '收入(元)',
                dataIndex: 'deposited', // 显示数据对应的属性名
                align:'right',
                render:(value,row) => (formatMoney(row.deposited))
            },
            {
                title: '支出(元)',
                dataIndex: 'expenditure', // 显示数据对应的属性名
                align:'right',
                render:(value,row) => (formatMoney(row.expenditure))
            },
            {
                title: '收支总额(元)',
                dataIndex: 'currencyNumber', // 显示数据对应的属性名
                align:'right',
                render:(value,row) => (formatMoney(row.currencyNumber))
            }
        ]
    };

    /**
     * 获取页面数据
     * @returns {Promise<void>}
     */
    getDatas = async () => {
        let _this = this;
        let para = {
            beginTime: _this.state.filters.beginTime,
            endTime: _this.state.filters.endTime,
            nowPage: this.state.nowPage,
            pageSize: this.state.pageSize,
        };
        // 在发请求前, 显示loading
        _this.setState({listLoading: true});
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await totalTransactionForDay(para);
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
            nowPage: 1,
            pageSize: pageSize
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
     * 导出财务流水
     */
    exportExcel = () =>{
        let _this = this;
        // 在发请求前, 显示loading
        _this.setState({listLoading: true});
        let para = {
            beginTime: this.state.filters.beginTime,
            endTime: this.state.filters.endTime,
        };
        axios({
            method: "GET",
            url: outTransactionForDayExcel,   //接口地址
            params: para,           //接口参数
            responseType: 'blob',
            //上面这个参数不加会乱码，据说{responseType: 'arraybuffer'}也可以
            headers: {
                "Content-Type": "application/json"
            },
        })
            .then(function (res) {
                _this.setState({listLoading: false});
                let fileName = '财务流水日度报表.xlsx';//excel文件名称
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
                console.log(res);
                _this.setState({listLoading: false});
                openNotificationWithIcon("error", "错误提示", "导出财务流水日度报表失败");
            });
    };

    /*
    *为第一次render()准备数据
    * 因为要异步加载数据，所以方法改为async执行
    */
    componentDidMount() {
        // 初始化表格属性设置
        this.initColumns();
        // 加载页面数据
        this.getDatas();
    };


    render() {
        // 读取状态数据
        const {datas, dataTotal, nowPage, pageSize, listLoading, filters} = this.state;
        let {beginTime, endTime} = filters;
        let rangeDate;
        if (beginTime !== null && endTime !== null) {
            rangeDate = [moment(beginTime), moment(endTime)]
        } else {
            rangeDate = [null, null]
        }
        return (
            <div className="statistics-page">
                <header>
                    <div className="page-name">收支汇总</div>
                    <div className="tools-bar">
                        <Col span={24}>
                            <Form layout="inline">
                                <Form.Item>
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
                                    <Button type="primary" htmlType="button" onClick={this.exportExcel}>
                                        <FileExcelOutlined/>导出
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Col>
                    </div>
                </header>
                <section>
                    <Col span={24} className="dataTable">
                        <Table size="middle" bordered rowKey='tradeDate' loading={listLoading} columns={this.columns} dataSource={datas}
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
export default Statistics;