import React, {Component} from 'react';
import {totalJournalForDayApi, journalForDayExcelApi} from "@/api";
import {openNotificationWithIcon} from "@/utils/window";
import moment from 'moment';
import axios from 'axios';
import {SearchOutlined, ReloadOutlined, FileExcelOutlined} from '@ant-design/icons';
import DocumentTitle from 'react-document-title'
import {Button, Col, DatePicker, Table, Form} from "antd";
import {disabledDate, formatMoney} from "@/utils/var";
import storageUtils from "@/utils/storageUtils";
/*
 * 文件名：index.jsx
 * 作者：liunengkai
 * 创建日期：2022-10-06 - 15:09
 * 描述：财务日度报表
 */
const {RangePicker} = DatePicker;
// 定义组件（ES6）
class FinancialForDay extends Component {

    state = {
        // 返回的单元格数据
        datas: [],
        // 总数据行数
        dataTotal: 0,
        // 当前页
        now_page: 1,
        // 页面宽度
        page_size: 10,
        // 是否显示加载
        listLoading: false,
        filters: {
            begin_time: null,// 搜索表单的开始时间
            end_time: null,// 搜索表单的结束时间
        },
    };


    /**
     * 初始化Table所有列的数组
     */
    initColumns = () => {
        this.columns = [
            {
                title: '统计日期',
                dataIndex: 'archive_date', // 显示数据对应的属性名
                align:'center',
            },
            {
                title: '收入',
                dataIndex: 'deposited', // 显示数据对应的属性名
                align:'right',
                render:(value,row) => (formatMoney(row.income))
            },
            {
                title: '支出',
                dataIndex: 'expenditure', // 显示数据对应的属性名
                align:'right',
                render:(value,row) => (formatMoney(row.outlay))
            },
            {
                title: '收支总额',
                dataIndex: 'currencyNumber', // 显示数据对应的属性名
                align:'right',
                render:(value,row) => (formatMoney(row.total))
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
            begin_time: this.state.filters.begin_time,
            end_time: this.state.filters.end_time,
            now_page: this.state.now_page,
            page_size: this.state.page_size,
        };
        // 在发请求前, 显示loading
        _this.setState({listLoading: true});
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await totalJournalForDayApi(para);
        // 在请求完成后, 隐藏loading
        _this.setState({listLoading: false});
        if (code === 0) {
            _this.setState({
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
        _this.setState({
            now_page: 1,
            filters: filters
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
        let _this = this;
        // react在生命周期和event handler里的setState会被合并（异步）处理,需要在回调里回去获取更新后的 state.
        _this.setState({
            now_page: 1,
            page_size: page_size
        }, function () {
            _this.getDatas();
        });
    };

    /**
     * 回调函数，页面发生跳转
     * @param current
     */
    changePage = (current) => {
        let _this = this;
        _this.setState({
            now_page: current,
        }, function () {
            _this.getDatas();
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
            now_page: 1,
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
        let access_token = storageUtils.get(storageUtils.ACCESS_KEY)

        let para = {
            begin_time: this.state.filters.begin_time,
            end_time: this.state.filters.end_time,
        };
        axios({
            method: "GET",
            url: journalForDayExcelApi,   //接口地址
            params: para,           //接口参数
            responseType: 'blob',
            //上面这个参数不加会乱码，据说{responseType: 'arraybuffer'}也可以
            headers: {
                "Content-Type": "application/json",
                "access_token":access_token
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

    /**
     * 为第一次render()准备数据  因为要异步加载数据，所以方法改为async执行
     */
    componentDidMount() {
        // 初始化表格属性设置
        this.initColumns();
        // 加载页面数据
        this.getDatas();
    };


    render() {
        // 读取状态数据
        const {datas, dataTotal, now_page, page_size, listLoading, filters} = this.state;
        let {begin_time, end_time} = filters;
        let rangeDate;
        if (begin_time !== null && end_time !== null) {
            rangeDate = [moment(begin_time), moment(end_time)]
        } else {
            rangeDate = [null, null]
        }
        return (
            <DocumentTitle title="日度报表">
                <div className='child-container'>
                    <div className='header-tools'>
                        日度报表
                    </div>
                    <div className='child-content'>
                        <Col span={24} className="toolbar">
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
                        <Col span={24} className="dataTable">
                            <Table size="middle" bordered rowKey='archive_date' loading={listLoading} columns={this.columns} dataSource={datas}
                                   pagination={{
                                       current:now_page,
                                       showTotal: () => `当前第${now_page}页 共${dataTotal}条`,
                                       pageSize: page_size, showQuickJumper: true, total: dataTotal, showSizeChanger: true,
                                       onShowSizeChange: (current, page_size) => this.changePageSize(page_size, current),
                                       onChange: this.changePage,
                                   }}/>
                        </Col>
                    </div>
                </div>
            </DocumentTitle>
        );
    }
}

// 对外暴露
export default FinancialForDay;