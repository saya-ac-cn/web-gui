import React, {Component} from 'react';
import {getTransactionList, getFinancialType, deleteTransaction, downTransaction, outTransactionInfoExcel} from '../../../api'
import {
  SearchOutlined,
  ReloadOutlined,
  FileExcelOutlined,
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined} from '@ant-design/icons';
import moment from 'moment';
import {Button, Col, DatePicker, Form, Select, Table, Modal} from "antd";
import {openNotificationWithIcon,showLoading} from "../../../utils/window";
import BillDeclare from './declare'
import BillDetail from './detail'
import BillRenew from './renew'
import axios from "axios";
import './index.less'
import {formatMoney,disabledDate} from '../../../utils/var'
/*
 * 文件名：transaction.jsx
 * 作者：liunengkai
 * 创建日期：2019-08-27 - 21:46
 * 描述：流水申报
 */
const {RangePicker} = DatePicker;
const {Option} = Select;

// 定义组件（ES6）
class Transaction extends Component {

    billDetailRef = React.createRef();
    billDeclareRef = React.createRef();
    billRenewRef = React.createRef();


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
            tradeType: ''//用户选择的交易类别
        },
        queryType: [],// 查询专用类别
    };

    /*
    * 初始化Table所有列的数组
    */
    initColumns = () => {
        this.columns = [
            {
                title: '流水号',
                dataIndex: 'tradeId', // 显示数据对应的属性名
                align:'center',
            },
            {
                title: '收入金额',
                dataIndex: 'deposited', // 显示数据对应的属性名
                align:'right',
                render:(value,row) => (formatMoney(row.deposited))
            },
            {
                title: '支出金额',
                dataIndex: 'expenditure',// 显示数据对应的属性名
                align:'right',
                render:(value,row) => (formatMoney(row.expenditure))
            },
            {
                title: '交易方式',
                dataIndex: 'tradeTypeEntity.transactionType',// 显示数据对应的属性名
                align:'center',
                render: (value, row) => (
                  <span>{!row.tradeTypeEntity?'-':row.tradeTypeEntity.transactionType}</span>
                ),
            },
            {
                title: '摘要',
                dataIndex: 'tradeAmountEntity.tag',// 显示数据对应的属性名
                render: (value, row) => (
                  <span>{!row.tradeAmountEntity ? '-' : row.tradeAmountEntity.tag}</span>
                ),
            },
            {
                title: '交易时间',
                dataIndex: 'tradeDate', // 显示数据对应的属性名
                align:'center',
            },
            {
                title: '收支总额',
                dataIndex: 'currencyNumber',// 显示数据对应的属性名
                align:'right',
                render:(value,row) => (formatMoney(row.currencyNumber))
            },
            {
                title: '修改时间',
                dataIndex: 'updateTime', // 显示数据对应的属性名
                align:'center',
            },
            {
                title: '管理',
                align:'center',
                render: (value, row) => (
                  <div>
                    <Button type="primary" onClick={() => this.openViewModal(row)} shape="circle"
                            icon={<EyeOutlined/>}/>
                    &nbsp;
                    <Button type="primary" onClick={() => this.openEditModal(row)} shape="circle"
                            icon={<EditOutlined/>}/>
                    &nbsp;
                    <Button type="danger" onClick={() => this.handleDelete(row)} shape="circle"
                            icon={<DeleteOutlined/>}/>
                  </div>
                ),
            },
        ]
    };

    /**
     * 获取财政列表数据
     * @returns {Promise<void>}
     */
    getDatas = async () => {
        let para = {
            tradeType: this.state.filters.tradeType,
            nowPage: this.state.nowPage,
            pageSize: this.state.pageSize,
            beginTime: this.state.filters.beginTime,
            endTime: this.state.filters.endTime,
        };
        // 在发请求前, 显示loading
        this.setState({listLoading: showLoading()});
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await getTransactionList(para);
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
        filters.beginTime = null;
        filters.endTime = null;
        filters.tradeType = null;
        _this.setState({
            nowPage: 1,
            filters: filters,
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

    /**
     * 得到交易类别
     */
    initDatas = async () => {
        let _this = this;
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await getFinancialType();
        if (code === 0) {
            let type = [];
            data.forEach(item => {
                type.push((<Option key={item.id} value={item.id}>{item.transactionType}</Option>));
            });
            let copyType = [];
            copyType.push(<Option key='-1' value="">请选择</Option>);
            copyType.push(type);
            _this.setState({
                queryType: copyType
            })
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
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
            filters,
            nowPage: 1,
        }, function () {
            _this.getDatas()
        });
    };

    // 交易方式选框发生改变
    onChangeType = (value) => {
        let _this = this;
        let filters = _this.state.filters;
        filters.tradeType = value;
        _this.setState({
            filters,
            nowPage: 1,
        }, function () {
            _this.getDatas()
        });
    };

    /**
     * 财务流水申报弹框事件
     */
    handleAddModal = () => {
        const _this = this;
        // 触发子组件的调用
        _this.billDeclareRef.handleDisplay()
    };

    /**
     * 预览流水详情
     */
    openViewModal = (value) => {
        const _this = this;
        // 触发子组件的调用
        _this.billDetailRef.handleDisplay(value.tradeId)
    };

    /**
     * 打开编辑弹窗
     * @param value
     */
    openEditModal = (value) => {
        const _this = this;
        // 触发子组件的调用
        _this.billRenewRef.handleDisplay(value.tradeId);
    };

    bindBillDetailRef = (ref) => {
        this.billDetailRef = ref
    };

    bindBillDeclareRef = (ref) => {
        this.billDeclareRef = ref
    };

    bindBillRenewRef = (ref) => {
        this.billRenewRef = ref
    };

    /**
     * 删除流水申报
     */
    handleDelete = (item) => {
        let _this = this;
        Modal.confirm({
            title: '删除确认',
            content: `您确定删除流水号为${item.tradeId}的流水及该流水下的所有明细的记录吗?`,
            onOk: async () => {
                // 在发请求前, 显示loading
                _this.setState({listLoading: true});
                let para = {tradeId: item.tradeId};
                const {msg, code} = await deleteTransaction(para);
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
     * 导出财务流水
     */
    exportListExcel = () => {
        let _this = this;
        // 在发请求前, 显示loading
        _this.setState({listLoading: true});
        let para = {
            tradeType: this.state.filters.tradeType,
            beginTime: this.state.filters.beginTime,
            endTime: this.state.filters.endTime,
        };
        console.log(para);
        axios({
            method: "GET",
            url: downTransaction,   //接口地址
            params: para,           //接口参数
            responseType: 'blob',
            //上面这个参数不加会乱码，据说{responseType: 'arraybuffer'}也可以
            headers: {
                "Content-Type": "application/json"
            },
        })
            .then(function (res) {
                _this.setState({listLoading: false});
                let fileName = '财务流水报表.xlsx';//excel文件名称
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
                openNotificationWithIcon("error", "错误提示", "导出财务流水报表失败");
            });
    };

    /**
     * 导出财务流水明细
     */
    exportInfoExcel = () => {
        let _this = this;
        // 在发请求前, 显示loading
        _this.setState({listLoading: true});
        let para = {
            tradeType: this.state.filters.tradeType,
            beginTime: this.state.filters.beginTime,
            endTime: this.state.filters.endTime,
        };
        axios({
            method: "GET",
            url: outTransactionInfoExcel,   //接口地址
            params: para,           //接口参数
            responseType: 'blob',
            //上面这个参数不加会乱码，据说{responseType: 'arraybuffer'}也可以
            headers: {
                "Content-Type": "application/json"
            },
        })
            .then(function (res) {
                _this.setState({listLoading: false});
                let fileName = '财务流水明细.xlsx';//excel文件名称
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
                openNotificationWithIcon("error", "错误提示", "导出财务流水明细报表失败");
            });
    };

    /**
     * 财政申报页面专属的刷新方法
     */
    refreshListFromDeclare = () =>{
        this.getDatas();
    };

    /**
     * 财政修改页面专属的刷新方法
     */
    refreshListFromRenew = () =>{
        this.getDatas();
    };

    /**
     * 初始化页面配置信息
     */
    componentDidMount() {
      // 绑定刷新（供子页面调用）
      this.refreshListFromDeclare  = this.refreshListFromDeclare.bind(this);
      this.refreshListFromRenew  = this.refreshListFromRenew.bind(this);
      // 初始化表格属性设置
      this.initColumns();
      this.initDatas();
      // 加载页面数据
      this.getDatas();
    };

    render() {
        // 读取状态数据
        const {datas, dataTotal, nowPage, pageSize, listLoading, queryType, filters} = this.state;
        let {beginTime, endTime, tradeType} = filters;
        let rangeDate;
        if (beginTime !== null && endTime !== null) {
            rangeDate = [moment(beginTime), moment(endTime)]
        } else {
            rangeDate = [null, null]
        }
        return (
            <div className='transaction-page'>
                <BillDeclare onRef={this.bindBillDeclareRef.bind(this)} refreshList={this.refreshListFromDeclare}/>
                <BillDetail onRef={this.bindBillDetailRef.bind(this)}/>
                <BillRenew onRef={this.bindBillRenewRef.bind(this)} refreshList={this.refreshListFromRenew}/>
                <header>
                    <div className="page-name">收入支出</div>
                    <div className="tools-bar">
                        <Col span={24}>
                            <Form layout="inline">
                                <Form.Item label="交易类别:">
                                    <Select style={{width: '200px'}} value={tradeType} showSearch
                                        onChange={this.onChangeType} placeholder="请选择交易类别">
                                        {queryType}
                                    </Select>
                                </Form.Item>
                                <Form.Item label="填报时间:">
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
                                    <Button type="primary" htmlType="button" onClick={this.handleAddModal}>
                                        <PlusOutlined/>申报
                                    </Button>
                                </Form.Item>
                                <Form.Item>
                                    <Button type="primary" htmlType="button" onClick={this.exportListExcel}>
                                        <FileExcelOutlined/>流水
                                    </Button>
                                </Form.Item>
                                <Form.Item>
                                    <Button type="primary" htmlType="button" onClick={this.exportInfoExcel}>
                                        <FileExcelOutlined/>明细
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Col>
                    </div>
                </header>
                <section>
                    <Col span={24} className="dataTable">
                        <Table size="small" rowKey="tradeId" bordered loading={listLoading} columns={this.columns}
                               dataSource={datas}
                               pagination={{
                                   current:nowPage,
                                   showTotal: () => `当前第${nowPage}页 共${dataTotal}条`,
                                   pageSize: pageSize,
                                   showQuickJumper: true,
                                   total: dataTotal,
                                   showSizeChanger: true,
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
export default Transaction;
