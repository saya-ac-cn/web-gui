import React, {Component} from 'react';
import {formatMoney,deepClone} from "../../../utils/var";
import {openNotificationWithIcon, showLoading} from "../../../utils/window";
import {Redirect} from "react-router-dom";
import {
    getFinancialType,
    getFinancialAmount,
    getTransactionDetail,
    deleteTransactioninfo, insertTransactioninfo, updateTransactioninfo, updateTransaction
} from "../../../api";
import {Col, DatePicker, Input, InputNumber, Modal, Popconfirm, Row, Select, Table, Tooltip} from "antd";
import moment from 'moment';
import {CloseOutlined, ExclamationCircleOutlined, PlusOutlined,CheckOutlined} from "@ant-design/icons";
import memoryUtils from "../../../utils/memoryUtils";

/*
 * 文件名：renew.jsx
 * 作者：liunengkai
 * 创建日期：1/10/21 - 11:15 AM
 * 描述：修改申报
 */
const {Option} = Select;
// 定义组件（ES6）
class Renew extends Component {

    state = {
        // 返回的账单数据，以便对比
        bill: null,
        // 用户修改中的账单数据
        newBill: null,
        // 是否显示加载
        listLoading: false,
        tradeId: -1,
        visibleModal: false,
        financialType:[],
        financialAmount:[],
        currentUser:''
    };

    /**
     * 初始化Table所有列的数组
     */
    initColumns = () => {
        this.columns = [
            {
                title: '序号',
                render: (text, record,index) => (index+1),
                align:'center',
            },
            {
                title: '用户',
                dataIndex: 'source',
                align:'center',
                render:(value) => (!value ? (!this.state.newBill || !this.state.newBill.source?'': this.state.newBill.source):value),
            },
            {
                title: '交易类型',
                dataIndex: 'flog', // 显示数据对应的属性名
                align:'center',
                render: (text, record, index) => {
                    return <Select value={text} bordered={false} onChange={(e) => this.onChangeFlag(e,index)}>
                        <Option value={1}>收入</Option>
                        <Option value={2}>支出</Option>
                    </Select>
                }
            },
            {
                title: '交易说明',
                dataIndex: 'currencyDetails', // 显示数据对应的属性名
                editable: true,
                render: (text, record, index) => {
                    return <Input type="text" value={text} maxLength={15} bordered={false} onChange={(e) => this.inputChange(e, record, index, 'currencyDetails')}/>
                }
            },
            {
                title: '交易金额（元）',
                dataIndex: 'currencyNumber', // 显示数据对应的属性名
                align:'right',
                render: (text, record, index) => {
                    return <InputNumber value={text} className='input-currencyNumber' ordered={false} min={0} parser={value => value.replace(/\s?|(,*)/g, '')} onChange={(e) => this.inputChange(e, record, index, 'currencyNumber')}/>
                }
            },
            {
                title: '操作',
                align:'center',
                render: (text, record,index) =>{
                    let newBill = this.state.newBill;
                    let infoList = !newBill || !newBill.infoList ? [] : newBill.infoList;
                    const deleteControl = infoList.length > 1 ? (
                        <Popconfirm title="确定删除?" onConfirm={() => this.deleteLine(index)}>
                            <CloseOutlined/>
                        </Popconfirm>
                    ) : <Tooltip placement="left" title="填报的明细必须要有1条以上">
                        <ExclamationCircleOutlined/>
                    </Tooltip>;
                    const saveControl = <Popconfirm title="确定提交保存?" onConfirm={() => this.renewLine(index)}>
                        <CheckOutlined />
                    </Popconfirm>;
                    return <div> {saveControl} &nbsp; {deleteControl} </div>;
                }
            }
        ]
    };

    /**
     * 获取财政列表数据
     * @returns {Promise<void>}
     */
    getDatas = async () => {
        let para = {
            tradeId: this.state.tradeId
        };
        // 在发请求前, 显示loading
        this.setState({listLoading: showLoading()});
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await getTransactionDetail(para);
        // 在请求完成后, 隐藏loading
        this.setState({listLoading: false});
        if (code === 0) {
            this.setState({
                bill: data,
                newBill: deepClone(data)
            });
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    handleCancel = () => {
        this.setState({visibleModal: false});
    };

    handleDisplay = (val) => {
        let _this = this;
        _this.setState({
            tradeId: val,
            visibleModal: true
        },function () {
            // 执行初始化加载页面数据
            _this.getDatas()
        });
    };

    /**
     * 继续添加财政明细
     */
    continueAdd = () => {
        const _this = this;
        let newBill = _this.state.newBill;
        const currentUser = _this.state.currentUser;
        let infoList = !newBill || !newBill.infoList ? [] : newBill.infoList;
        let item = {
            id:(infoList[infoList.length-1].id+1),
            flog: 1,
            source:currentUser,
            currencyNumber: 0,
            currencyDetails: ''
        };
        infoList = infoList.concat(item);
        newBill.infoList = infoList;
        this.setState({newBill})
    };

    /**
     * 删除明细添加行
     * @param index
     */
    deleteLine = (index) => {
        const _this = this;
        let {newBill} = _this.state;
        let infoList = !newBill || !newBill.infoList ? [] : newBill.infoList;
        if(infoList.length === 1){
            openNotificationWithIcon("error", "错误提示", '每一笔流水申请下边必须要有一条详情记录');
        }else{
            const dependDelete = deepClone(infoList[index]);
            let findFlag = !dependDelete || !dependDelete.tradeId?false:dependDelete.tradeId;
            if (findFlag) {
                _this.deleteTransactionItem(dependDelete);
            }else{
                infoList = infoList.filter((item, key) => key !== index);
                newBill.infoList = infoList;
                _this.setState({ newBill },function () {
                    _this.renewList();
                });
            }
        }
    };

    /**
     * 修改该行数据
     * @param index
     */
    renewLine = (index) => {
        const _this = this;
        let {newBill} = _this.state;
        let infoList = !newBill || !newBill.infoList ? [] : newBill.infoList;
        const dependSave = deepClone(infoList[index]);
        let findFlag = !dependSave || !dependSave.tradeId?false:dependSave.tradeId;
        if (findFlag) {
            // 执行修改操作
            _this.renewTransactionItem(dependSave);
        }else{
            // 执行保存操作
            _this.addTransactionItem(dependSave);
        }
    };


    /**
     * 只能选择今天及其以前的日期
     * @param current
     * @returns {*|boolean}
     */
    disabledDate = (current) => {
        return current && current > moment();
    };

    /**
     * 申报时间改变事件
     * @param date
     * @param dateString
     */
    tradeDateChange = (date, dateString) => {
        const _this = this;
        let { newBill } = _this.state;
        newBill.tradeDate = date;//!dateString?null:moment(dateString);
        _this.setState({newBill});
    };

    /**
     * 交易类型改变事件
     * @param value
     * @param index
     */
    onChangeFlag = (value,index) => {
        const _this = this;
        let newBill = _this.state.newBill;
        let infoList = !newBill || !newBill.infoList ? [] : newBill.infoList;
        if (infoList[index].flog !== value){
            infoList[index].flog = value;
            newBill.infoList = infoList;
            _this.setState({newBill},function () {
                _this.renewList()
            });
        }
    };

    /**
     * input改变事件
     * @param e
     * @param record
     * @param index
     * @param field
     */
    inputChange = (e, record, index, field) => {
        const _this = this;
        let newBill = _this.state.newBill;
        let infoList = !newBill || !newBill.infoList ? [] : newBill.infoList;
        if ('currencyNumber' === field){
            // 修改了交易金额
            // 对于 InputNumber 类型的输入框需要另类处理
            let currencyNumber = e;
            if (typeof(currencyNumber) === "string"){
                currencyNumber = currencyNumber.replace(/[^0-9.]/ig,"");
            }
            // 替换后再次检查
            if ('' === currencyNumber) {
                currencyNumber = 0;
            }
            // 核对本次修改了值和上次是否一致，如果不一致需要触发重新计算
            if(infoList[index].currencyNumber !== currencyNumber){
                infoList[index].currencyNumber = currencyNumber
            }
            infoList[index].currencyNumber = currencyNumber;
            newBill.infoList = infoList;
            _this.setState({ newBill },function () {
                _this.renewList()
            });
        }else{
            // 修改了摘要
            infoList[index][field] = (e.target.value).replace(/(^\s*)|(\s*$)/g, '');
            newBill.infoList = infoList;
            _this.setState({ newBill })
        }
    };


    /**
     * 获取所有的支付类别
     */
    initFinancialType = async () => {
        const _this = this;
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await getFinancialType();
        if (code === 0) {
            let type = [];
            data.forEach(item => {
                type.push((<Option key={item.id} value={item.id}>{item.transactionType}</Option>));
            });
            _this.setState({
                financialType: type
            })
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    /**
     * 获取所有的交易摘要
     */
    initFinancialAmount = async () => {
        const _this = this;
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await getFinancialAmount();
        if (code === 0) {
            let type = [];
            data.forEach(item => {
                type.push((<Option key={item.id} value={item.id}>{item.tag}</Option>));
            });
            _this.setState({
                financialAmount: type
            })
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    /**
     * 支付类型 或者 摘要 选择框改变事件
     * @param value
     * @param field
     */
    onChangeTypeAmount = (value,field) => {
        let _this = this;
        let { newBill } = this.state;
        newBill[field] = value;
        _this.setState({newBill});
    };

    /**
     * 删除一条明细数据
     * @param value
     * @returns {Promise<void>}
     */
    deleteTransactionItem = async (value) => {
        let para = {
            id: value.id,
            tradeId: value.tradeId
        };
        const {msg, code} = await deleteTransactioninfo(para);
        if (code === 0) {
            openNotificationWithIcon("success", "操作结果", "删除成功");
            this.getDatas();
            this.props.refreshList();
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    /**
     * 追加一条明细
     * @param value
     * @returns {Promise<void>}
     */
    addTransactionItem = async (value) => {
        if(!value.currencyDetails){
            openNotificationWithIcon("warning", "提示", `请填写摘要`);
            return
        }
        if(value.currencyNumber <= 0){
            openNotificationWithIcon("warning", "提示", `发现无效的交易金额(交易金额必须大于0)`);
            return
        }
        const _this = this;
        const tradeId = _this.state.tradeId;
        let para = {
            tradeId: tradeId,
            flog: value.flog,
            currencyNumber: value.currencyNumber,
            currencyDetails: value.currencyDetails
        };
        const {msg, code} = await insertTransactioninfo(para);
        _this.setState({listLoading: false});
        if (code === 0) {
            openNotificationWithIcon("success", "操作结果", "添加流水明细成功");
            _this.getDatas();
            _this.props.refreshList();
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    /**
     * 更新一条明细
     * @param value
     * @returns {Promise<void>}
     */
    renewTransactionItem = async (value) => {
        if(!value.currencyDetails){
            openNotificationWithIcon("warning", "提示", `请填写摘要`);
            return
        }
        if(value.currencyNumber <= 0){
            openNotificationWithIcon("warning", "提示", `发现无效的交易金额(交易金额必须大于0)`);
            return
        }
        const _this = this;
        let para = {
            id: value.id,
            tradeId: value.tradeId,
            flog: value.flog,
            currencyNumber: value.currencyNumber,
            currencyDetails: value.currencyDetails
        };
        const {msg, code} = await updateTransactioninfo(para);
        _this.setState({listLoading: false});
        if (code === 0) {
            openNotificationWithIcon("success", "操作结果", "流水明细修改成功");
            _this.getDatas();
            _this.props.refreshList();
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };


    /**
     * 更新列表数据
     */
    renewList = () => {
        const _this = this;
        let newBill = _this.state.newBill;
        let infoList = !newBill || !newBill.infoList ? [] : newBill.infoList;
        let currencyNumber = 0.0;
        let deposited = 0.0;
        let expenditure = 0.0;
        infoList.forEach(item => {
            if(1 === item.flog){
                deposited += item.currencyNumber;
            }else{
                expenditure += item.currencyNumber;
            }
            currencyNumber += item.currencyNumber;
        });
        newBill.currencyNumber = currencyNumber;
        newBill.deposited = deposited;
        newBill.expenditure = expenditure;
        _this.setState({newBill})
    };


    /**
     * 提交到后台修改
     */
    handleEdit = async () => {
        const _this = this;
        let{bill,newBill} = _this.state;
        if (!newBill.tradeDate) {
            openNotificationWithIcon("warning", "提示", '请选择交易日期');
            return
        }
        if (!newBill.tradeType) {
            openNotificationWithIcon("warning", "提示", '请选择交易方式');
            return
        }
        if (!newBill.transactionAmount) {
            openNotificationWithIcon("warning", "提示", '请选择交易摘要');
            return
        }
        const format = 'YYYY-MM-DD';
        const oldDate = moment(bill.tradeDate,format);
        const newDate = moment(newBill.tradeDate,format);
        if((!oldDate.isSame(newDate)) || (bill.tradeType !== newBill.tradeType) || (bill.transactionAmount !== newBill.transactionAmount)){
            // 发生了变更
            const param = {
                tradeId: bill.tradeId,
                tradeType: newBill.tradeType,
                tradeDate: newDate.format('YYYY-MM-DD'),
                transactionAmount: newBill.transactionAmount,
            };
            const {msg, code} = await updateTransaction(param);
            if (code === 0) {
                openNotificationWithIcon("success", "操作结果", "修改成功");
                _this.props.refreshList();
            } else {
                openNotificationWithIcon("error", "错误提示", msg);
            }
        }else{
            openNotificationWithIcon("warning", "操作驳回", '在您本次提交保存中，您的交易日期、方式及摘要均未发生修改，保存操作已取消');
        }
    };

    /**
     * 初始化页面配置信息
     */
    componentDidMount() {
      // 初始化表格属性设置
      this.initColumns();
        // 加载页面数据
        const _this = this;
        _this.props.onRef(_this);
        _this.initFinancialType();
        _this.initFinancialAmount();
        const user = memoryUtils.user;
        // 如果内存没有存储user ==> 当前没有登陆
        if (!user || !user.user) {
            // 自动跳转到登陆(在render()中)
            return <Redirect to='/login'/>
        }
        _this.setState({
            bill:null,
            newBill:null,
            currentUser:user.user.user
        })
    };

    render() {
        const {bill,tradeId, newBill, listLoading,visibleModal,financialType,financialAmount} = this.state;
        return (
            <Modal
                title='收支详情'
                width="80%"
                okText='保存'
                visible={visibleModal}
                maskClosable={false}
                onCancel={() => this.handleCancel()}
                onOk={this.handleEdit}>
                <section className="transaction-detail">
                    <Row className='detail-addLine'>
                        <Col span={5} offset={19}>
                            <Tooltip placement="left" title="添加1行">
                                <PlusOutlined onClick={this.continueAdd}/>
                            </Tooltip>
                        </Col>
                    </Row>
                    <Row className="detail-header">
                        <Col span={12} offset={6}>
                          {!bill||!bill.tradeDate?'-':moment(bill.tradeDate).format('YYYY年MM月DD日')}收支明细
                        </Col>
                    </Row>
                    <Row className='detail-tradeNumber'>
                        <Col span={5} offset={19}>
                            <span className='input-label'>收支单号：</span>{tradeId}
                        </Col>
                    </Row>
                    <Row className="detail-tradeDate">
                        <Col span={5} offset={19}>
                            <span className='input-label'>交易日期：</span><DatePicker value={!newBill||!newBill.tradeDate?null:moment(newBill.tradeDate)} disabledDate={this.disabledDate} onChange={this.tradeDateChange} bordered={false} format={"YYYY-MM-DD"} placeholder="交易日期"/>
                        </Col>
                    </Row>
                    <Row gutter={[12, 12]}>
                        <Col className="gutter-row" span={8}>
                            <div><span className='input-label'>收支总额：</span>{formatMoney(!newBill?0:newBill.currencyNumber)}元</div>
                        </Col>
                        <Col className="gutter-row" span={8}>
                            <div><span className='input-label'>收入总额：</span>{formatMoney(!newBill?0:newBill.deposited)}元</div>
                        </Col>
                        <Col className="gutter-row" span={8}>
                            <div><span className='input-label'>支出总额：</span>{formatMoney(!newBill?0:newBill.expenditure)}元</div>
                        </Col>
                        <Col className="gutter-row" span={8}>
                            <div>
                                <span className='input-label'>交易方式：</span>
                                <Select value={!newBill||!newBill.tradeType?null:newBill.tradeType} className='declare-select' bordered={false} onChange={(e) => this.onChangeTypeAmount(e,'tradeType')}>
                                    {financialType}
                                </Select>
                            </div>
                        </Col>
                        <Col className="gutter-row" span={8}>
                            <div>
                                <span className='input-label'>交易摘要：</span>
                                <Select value={!newBill||!newBill.transactionAmount?null:newBill.transactionAmount} className='declare-select' bordered={false} onChange={(e) => this.onChangeTypeAmount(e,'transactionAmount')}>
                                    {financialAmount}
                                </Select>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <Table size="middle" className='detail-grid' rowKey="id" bordered pagination={false} loading={listLoading} columns={this.columns} dataSource={!newBill?null:newBill.infoList}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="gutter-row" span={6}>
                            <div><span className='input-label'>填报人：</span>{!bill||!bill.source?'-':bill.source}</div>
                        </Col>
                        <Col className="gutter-row" span={6}>
                            <div><span className='input-label'>填报时间：</span>{!bill||!bill.createTime?'-':moment(bill.createTime).format('YYYY年MM月DD日 HH:mm:ss')}</div>
                        </Col>
                        <Col className="gutter-row" span={6}>
                            <div><span className='input-label'>最后修改日期：</span>{!bill||!bill.updateTime?'-':moment(bill.updateTime).format('YYYY年MM月DD日 HH:mm:ss')}</div>
                        </Col>
                        <Col className="gutter-row" span={6}>
                          <div><span className='input-label'>打印时间：</span>{moment().format('YYYY年MM月DD日 HH:mm:ss')}</div>
                        </Col>
                    </Row>
                </section>
            </Modal>
        );
    }
}

// 对外暴露
export default Renew;
