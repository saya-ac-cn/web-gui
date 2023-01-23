import React, {Component} from 'react';
import {formatMoney, deepClone,accAdd} from "@/utils/var";
import {openNotificationWithIcon, showLoading} from "@/utils/window";
import {
    paymentMeansListApi,
    abstractsApi,
    generalJournalListApi,
    deleteGeneralJournalApi, addGeneralJournalApi, updateGeneralJournalApi, updateJournalApi, monetaryListApi
} from "../../../api";
import {Col, DatePicker, Input, InputNumber, Modal, Popconfirm, Row, Select, Table, Tooltip} from "antd";
import moment from 'moment';
import {CloseOutlined, ExclamationCircleOutlined, PlusOutlined, CheckOutlined} from "@ant-design/icons";
import storageUtils from "@/utils/storageUtils";

/*
 * 文件名：renew.jsx
 * 作者：liunengkai
 * 创建日期：2022/10/07 - 下午2:34
 * 描述：修改申报
 */
const {Option} = Select;

// 定义组件（ES6）
class Renew extends Component {

    state = {
        // 原始流水数据，以便对比
        journal: null,
        // 用户修改中的账单数据
        newJournal: null,
        // 流水明细
        details:[],
        // 是否显示加载
        listLoading: false,
        visibleModal: false,
        paymentMeans: [],
        abstracts: [],
        monetary: [],
        currentUser: ''
    };

    /**
     * 初始化Table所有列的数组
     */
    initColumns = () => {
        this.columns = [
            {
                title: '序号',
                render: (text, record, index) => (index + 1),
                align: 'center',
            },
            {
                title: '用户',
                dataIndex: 'source',
                align: 'center',
                render:(value) => (!value ? this.state.currentUser:value),
            },
            {
                title: '交易类型',
                dataIndex: 'flag', // 显示数据对应的属性名
                align: 'center',
                render: (text, record, index) => {
                    return <Select value={text} bordered={false} onChange={(e) => this.onChangeFlag(e, index)}>
                        <Option value={'1'}>收入</Option>
                        <Option value={'2'}>支出</Option>
                    </Select>
                }
            },
            {
                title: '交易说明',
                dataIndex: 'remarks', // 显示数据对应的属性名
                editable: true,
                render: (text, record, index) => {
                    return <Input type="text" value={text} maxLength={15} bordered={false} onChange={(e) => this.inputChange(e, record, index, 'remarks')}/>
                }
            },
            {
                title: '交易金额',
                dataIndex: 'amount', // 显示数据对应的属性名
                align: 'right',
                render: (text, record, index) => {
                    return <InputNumber value={text} precision={3} stringMode={true} className='input-amount' bordered={false} min={0}
                                        parser={value => value.replace(/\s?|(,*)/g, '')}
                                        onChange={(e) => this.inputChange(e, record, index, 'amount')}/>
                }
            },
            {
                title: '操作',
                align: 'center',
                render: (text, record, index) => {
                    let details = this.state.details;
                    const deleteControl = details.length > 1 ? (
                        <Popconfirm title="确定删除?" onConfirm={() => this.deleteLine(index)}>
                            <CloseOutlined/>
                        </Popconfirm>
                    ) : <Tooltip placement="left" title="填报的明细必须要有1条以上">
                        <ExclamationCircleOutlined/>
                    </Tooltip>;
                    const saveControl = <Popconfirm title="确定提交保存?" onConfirm={() => this.renewLine(index)}>
                        <CheckOutlined/>
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
            id: this.state.journal.id
        };
        // 在发请求前, 显示loading
        this.setState({listLoading: showLoading()});
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await generalJournalListApi(para);
        // 在请求完成后, 隐藏loading
        this.setState({listLoading: false});
        if (code === 0) {
            this.setState({
                details: data
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
        const newJournal = deepClone(val)
        _this.setState({
            journal: val,
            newJournal:newJournal,
            visibleModal: true
        }, function () {
            // 执行初始化加载页面数据
            _this.getDatas()
        });
    };

    /**
     * 继续添加财政明细
     */
    continueAdd = () => {
        const _this = this;
        let details = _this.state.details;
        const currentUser = _this.state.currentUser;
        let item = {
            id: (details[details.length - 1].id + 1),
            flag: '1',
            source: currentUser,
            amount: 0.0,
            remarks: ''
        };
        details = details.concat(item);
        this.setState({details})
    };

    /**
     * 删除明细行
     * @param index
     */
    deleteLine = (index) => {
        const _this = this;
        let details = _this.state.details
        if (details.length === 1) {
            openNotificationWithIcon("error", "错误提示", '每一笔流水申请下边必须要有一条详情记录');
        } else {
            const dependDelete = deepClone(details[index]);
            let findFlag = !dependDelete || !dependDelete.journal_id ? false : dependDelete.journal_id;
            if (findFlag) {
                // 发起后端删除
                _this.deleteTransactionItem(dependDelete);
            } else {
                details = details.filter((item, key) => key !== index);
                _this.setState({details}, function () {
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
        let {details} = _this.state;
        const dependSave = deepClone(details[index]);
        let findFlag = !dependSave || !dependSave.journal_id ? false : dependSave.journal_id;
        if (findFlag) {
            // 执行修改操作
            _this.renewTransactionItem(dependSave);
        } else {
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
    archiveDateChange = (date, dateString) => {
        const _this = this;
        let {newJournal} = _this.state;
        newJournal.archive_date = date;//!dateString?null:moment(dateString);
        _this.setState({newJournal});
    };

    /**
     * 交易类型改变事件
     * @param value
     * @param index
     */
    onChangeFlag = (value, index) => {
        const _this = this;
        let infos = _this.state.details;
        // 对象数组是引用方式 ,对于react来说它的值都是地址(涉及到tree diff)，因为没有被重新赋值(地址没有改变)，所以 react 会认为仍然是之前的元素(element)，则不更新视图。
        const details = deepClone(infos);
        if (details[index].flag !== value) {
            details[index].flag = value;
            _this.setState({details}, function () {
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
        let infos = _this.state.details;
        // 对象数组是引用方式 ,对于react来说它的值都是地址(涉及到tree diff)，因为没有被重新赋值(地址没有改变)，所以 react 会认为仍然是之前的元素(element)，则不更新视图。
        const details = deepClone(infos);
        if ('amount' === field) {
            // 修改了交易金额
            // 对于 InputNumber 类型的输入框需要另类处理
            let amount = e;
            if (typeof (amount) === "string") {
                amount = amount.replace(/[^0-9.]/ig, "");
            }
            // 替换后再次检查
            if ('' === amount) {
                amount = 0;
            }
            details[index].amount = amount;
            _this.setState({details}, function () {
                _this.renewList()
            });
        } else {
            // 修改了摘要
            details[index][field] = (e.target.value).replace(/(^\s*)|(\s*$)/g, '');
            _this.setState({details})
        }
    };


    /**
     * 获取所有的支付类别
     */
    initPaymentMeans = async () => {
        let _this = this;
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await paymentMeansListApi();
        if (code === 0) {
            let type = [];
            data.forEach(item => {
                type.push((<Option key={item.id} value={item.id}>{item.name}</Option>));
            });
            _this.setState({
                paymentMeans: type
            })
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    /**
     * 获取所有的交易摘要
     */
    initAbstracts = async () => {
        let _this = this;
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await abstractsApi();
        if (code === 0) {
            let type = [];
            data.forEach(item => {
                type.push((<Option key={item.id} value={item.id}>{item.tag}</Option>));
            });
            _this.setState({
                abstracts: type
            })
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    /**
     * 获取所有的币种
     */
    initMonetaryData = async () => {
        let _this = this;
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await monetaryListApi();
        if (code === 0) {
            let type = [];
            data.forEach(item => {
                type.push((<Option key={item.id} value={item.id}>{`${item.abbreviate}[${item.name}]`}</Option>));
            });
            let copyType = [];
            copyType.push(<Option key='' value="">请选择</Option>);
            copyType.push(type);
            _this.setState({
                monetary: copyType
            })
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    /**
     * 支付类型 或者 摘要 或者 货币 选择框改变事件
     * @param value
     * @param field
     */
    onSelectChange = (value, field) => {
        let _this = this;
        const newJournal = _this.state.newJournal;
        newJournal[field] = value;
        _this.setState({newJournal});
    };

    /**
     * 交易附言（用于双向绑定数据）
     * @param event
     */
    remarksInputChange = (event) => {
        let _this = this;
        const value = event.target.value.replace(/\s+/g, '');
        let newJournal = _this.state.newJournal;
        newJournal.remarks = value;
        _this.setState({newJournal})
    };

    /**
     * 删除一条明细数据
     * @param value
     * @returns {Promise<void>}
     */
    deleteTransactionItem = async (value) => {
        const {msg, code} = await deleteGeneralJournalApi(value.id);
        if (code === 0) {
            openNotificationWithIcon("success", "操作结果", "删除成功");
            this.getDatas();
            // 刷新父页面
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
        if (!value.remarks) {
            openNotificationWithIcon("warning", "提示", `请填写摘要`);
            return
        }
        if (value.amount <= 0) {
            openNotificationWithIcon("warning", "提示", `发现无效的交易金额(交易金额必须大于0)`);
            return
        }
        const _this = this;
        const journal_id = _this.state.newJournal.id;
        let para = {
            journal_id: journal_id,
            flag: value.flag,
            amount: value.amount,
            remarks: value.remarks
        };
        const {msg, code} = await addGeneralJournalApi(para);
        _this.setState({listLoading: false});
        if (code === 0) {
            openNotificationWithIcon("success", "操作结果", "添加流水明细成功");
            _this.getDatas();
            // 刷新父页面
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
        if (!value.remarks) {
            openNotificationWithIcon("warning", "提示", `请填写摘要`);
            return
        }
        if (value.amount <= 0) {
            openNotificationWithIcon("warning", "提示", `发现无效的交易金额(交易金额必须大于0)`);
            return
        }
        const _this = this;
        let para = {
            id: value.id,
            journal_id:_this.state.newJournal.id,
            flag: value.flag,
            amount: value.amount,
            remarks: value.remarks
        };
        const {msg, code} = await updateGeneralJournalApi(para);
        _this.setState({listLoading: false});
        if (code === 0) {
            openNotificationWithIcon("success", "操作结果", "流水明细修改成功");
            _this.getDatas();
            // 刷新父页面
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
        let {newJournal,details} = _this.state;
        let total = 0.0;
        let income = 0.0;
        let outlay = 0.0;
        details.forEach(item => {
            const amount = parseFloat(item.amount)
            if ('1' === item.flag) {
                income = accAdd(amount,income);
            } else {
                outlay = accAdd(amount,outlay);
            }
            total = accAdd(amount,total);
        });
        newJournal.total = total;
        newJournal.income = income;
        newJournal.outlay = outlay;
        _this.setState({newJournal})
    };


    /**
     * 提交到后台修改
     */
    handleEdit = async () => {
        const _this = this;
        let {journal, newJournal} = _this.state;
        if (!newJournal.archive_date) {
            openNotificationWithIcon("warning", "提示", '请选择交易日期');
            return
        }
        if (!newJournal.means_id) {
            openNotificationWithIcon("warning", "提示", '请选择交易方式');
            return
        }
        if (!newJournal.abstract_id) {
            openNotificationWithIcon("warning", "提示", '请选择交易摘要');
            return
        }
        if (!newJournal.monetary_id) {
            openNotificationWithIcon("warning", "提示", '请选择交易币种');
            return
        }
        const format = 'YYYY-MM-DD';
        const oldDate = moment(journal.archive_date, format);
        const newDate = moment(newJournal.archive_date, format);
        if ((!oldDate.isSame(newDate)) || (journal.means_id !== newJournal.means_id) || (journal.abstract_id !== newJournal.abstract_id) || (journal.monetary_id !== newJournal.monetary_id)|| (journal.remarks !== newJournal.remarks)) {
            // 发生了变更
            const param = {
                id: journal.id,
                means_id: newJournal.means_id,
                archive_date: newDate.format('YYYY-MM-DD'),
                abstract_id: newJournal.abstract_id,
                monetary_id:newJournal.monetary_id,
                remarks:newJournal.remarks
            };
            const {msg, code} = await updateJournalApi(param);
            if (code === 0) {
                openNotificationWithIcon("success", "操作结果", "修改成功");
                // 刷新父页面
                _this.props.refreshList();
            } else {
                openNotificationWithIcon("error", "错误提示", msg);
            }
        } else {
            openNotificationWithIcon("warning", "操作驳回", '在您本次提交保存中，您的交易日期、币种、方式及摘要均未发生修改，保存操作已取消');
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
        _this.initPaymentMeans();
        _this.initAbstracts();
        _this.initMonetaryData();
        let user = storageUtils.get(storageUtils.USER_KEY)
        this.setState({currentUser: user.name})
    };

    render() {
        const {journal,monetary, newJournal, listLoading, visibleModal, paymentMeans, abstracts,details} = this.state;
        return (
            <Modal
                title='收支详情'
                width="80%"
                okText='保存'
                open={visibleModal}
                maskClosable={false}
                onCancel={() => this.handleCancel()}
                onOk={this.handleEdit}>
                <section className="journal-details">
                    <Row className='detail-addLine'>
                        <Col span={5} offset={19}>
                            <Tooltip placement="left" title="添加1行">
                                <PlusOutlined onClick={this.continueAdd}/>
                            </Tooltip>
                        </Col>
                    </Row>
                    <Row className="detail-header">
                        <Col span={12} offset={6}>
                            {!journal || !journal.archive_date ? '-' : moment(journal.archive_date).format('YYYY年MM月DD日')}收支明细
                        </Col>
                    </Row>
                    <Row className='detail-tradeNumber'>
                        <Col span={5} offset={19}>
                            <span className='input-label'>收支单号：</span>{!newJournal ? '-' : newJournal.id}
                        </Col>
                    </Row>
                    <Row className="detail-archive-date">
                        <Col span={5} offset={19}>
                            <span className='input-label'>交易日期：</span><DatePicker
                            value={!newJournal || !newJournal.archive_date ? null : moment(newJournal.archive_date)}
                            disabledDate={this.disabledDate} onChange={this.archiveDateChange} bordered={false}
                            format={"YYYY-MM-DD"} placeholder="交易日期"/>
                        </Col>
                    </Row>
                    <Row gutter={[12, 12]}>
                        <Col className="gutter-row" span={8}>
                            <div><span
                                className='input-label'>收支总额：</span>{formatMoney(!newJournal ? 0 : newJournal.total)}
                            </div>
                        </Col>
                        <Col className="gutter-row" span={8}>
                            <div><span
                                className='input-label'>收入总额：</span>{formatMoney(!newJournal ? 0 : newJournal.income)}
                            </div>
                        </Col>
                        <Col className="gutter-row" span={8}>
                            <div><span
                                className='input-label'>支出总额：</span>{formatMoney(!newJournal ? 0 : newJournal.outlay)}元
                            </div>
                        </Col>
                        <Col className="gutter-row" span={8}>
                            <div>
                                <span className='input-label'>交易方式：</span>
                                <Select value={!newJournal || !newJournal.means_id ? null : newJournal.means_id}
                                        className='declare-select' bordered={false}
                                        onChange={(e) => this.onSelectChange(e, 'means_id')}>
                                    {paymentMeans}
                                </Select>
                            </div>
                        </Col>
                        <Col className="gutter-row" span={8}>
                            <div>
                                <span className='input-label'>交易币种：</span>
                                <Select value={!newJournal || !newJournal.monetary_id ? null : newJournal.monetary_id}
                                        className='declare-select' bordered={false}
                                        onChange={(e) => this.onSelectChange(e, 'monetary_id')}>
                                    {monetary}
                                </Select>
                            </div>
                        </Col>
                        <Col className="gutter-row" span={8}>
                            <div>
                                <span className='input-label'>交易摘要：</span>
                                <Select
                                    value={!newJournal || !newJournal.abstract_id ? null : newJournal.abstract_id}
                                    className='declare-select' bordered={false}
                                    onChange={(e) => this.onSelectChange(e, 'abstract_id')}>
                                    {abstracts}
                                </Select>
                            </div>
                        </Col>
                        <Col className="gutter-row" span={16}>
                            <div>
                                <span className='input-label'>交易附言：</span>
                                <Input type='text' maxLength={20} style={{width: '30em'}} bordered={false}
                                       value={!newJournal || !newJournal.remarks ? null : newJournal.remarks}
                                       onChange={(e) => this.remarksInputChange(e)}/>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <Table size="middle" className='detail-grid' rowKey="id" bordered pagination={false}
                                   loading={listLoading} columns={this.columns}
                                   dataSource={details}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="gutter-row" span={6}>
                            <div><span
                                className='input-label'>填报人：</span>{!journal || !journal.source ? '-' : journal.source}
                            </div>
                        </Col>
                        <Col className="gutter-row" span={6}>
                            <div><span
                                className='input-label'>填报时间：</span>{!journal || !journal.create_time ? '-' : moment(journal.create_time).format('YYYY年MM月DD日 HH:mm:ss')}
                            </div>
                        </Col>
                        <Col className="gutter-row" span={6}>
                            <div><span
                                className='input-label'>最后修改日期：</span>{!journal || !journal.update_time ? '-' : moment(journal.update_time).format('YYYY年MM月DD日 HH:mm:ss')}
                            </div>
                        </Col>
                        <Col className="gutter-row" span={6}>
                            <div><span className='input-label'>打印时间：</span>{moment().format('YYYY年MM月DD日 HH:mm:ss')}
                            </div>
                        </Col>
                    </Row>
                </section>
            </Modal>
        );
    }
}

// 对外暴露
export default Renew;
