import React, {forwardRef, useImperativeHandle, useState} from 'react';
import {disabledDate,formatMoney, deepClone,accAdd} from "@/utils/var";
import {openNotificationWithIcon} from "@/utils/window";
import {
    paymentMeansListApi,
    abstractsApi,
    generalJournalListApi,
    deleteGeneralJournalApi, addGeneralJournalApi, updateGeneralJournalApi, updateJournalApi, monetaryListApi
} from "@/http/api";
import {
    Button,
    Col,
    DatePicker,
    Drawer,
    Input,
    InputNumber,
    Popconfirm,
    Row,
    Select,
    Space,
    Table,
    Tooltip
} from "antd";
import moment from 'moment';
import {CloseOutlined, ExclamationCircleOutlined, PlusOutlined, CheckOutlined} from "@ant-design/icons";
import Storage from "@/utils/storage";
import './detail.less'
const {Option} = Select;

const JournalRenew = (props,ref) => {

    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
    const [payment,setPayment] = useState([])
    const [monetary,setMonetary] = useState([])
    const [abstracts,setAbstracts] = useState([])
    const currentUser = Storage.get(Storage.USER_KEY)
    const [journal,setJournal] = useState({id:null,monetary_id:null, means_id:null, abstract_id:null, remarks:null, archive_date: null, total:0.0, income:0.0, outlay:0.0,source:null,create_time:null,update_time:null})
    const [latestJournal,setLatestJournal] = useState({id:null,monetary_id:null, means_id:null, abstract_id:null, remarks:null, archive_date: null, total:0.0, income:0.0, outlay:0.0})
    const [generalJournal,setGeneralJournal] = useState([{index:1, flag: '1', source: null, amount: 0, remarks: ''}])

    useImperativeHandle(ref,()=>({
        handleDisplay
    }))

    const handleDisplay = (val) => {
        setOpen(true);
        initPaymentMeans();
        initAbstracts();
        initMonetaryData();
        setLatestJournal({...val});
        setJournal({...val})
        getData(val.id);
    };



    /**
     * 初始化Table所有列的数组
     */
    const columns = [
        {
            title: '序号',
            render: (text, record, index) => (index + 1),
            align: 'center',
        },
        {
            title: '用户',
            dataIndex: 'source',
            align: 'center',
            render:(value) => (!value ? currentUser.name:value),
        },
        {
            title: '交易类型',
            dataIndex: 'flag', // 显示数据对应的属性名
            align: 'center',
            render: (text, record, index) => {
                return <Select value={text} bordered={false} onChange={(e) => onChangeFlag(e, index)}>
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
                return <Input type="text" value={text} maxLength={15} bordered={false} onChange={(e) => inputChange(e, record, index, 'remarks')}/>
            }
        },
        {
            title: '交易金额',
            dataIndex: 'amount', // 显示数据对应的属性名
            align: 'right',
            render: (text, record, index) => {
                return <InputNumber value={text} precision={3} stringMode={true} className='input-amount' bordered={false} min={0}
                                    parser={value => value.replace(/\s?|(,*)/g, '')}
                                    onChange={(e) => inputChange(e, record, index, 'amount')}/>
            }
        },
        {
            title: '操作',
            align: 'center',
            render: (text, record, index) => {
                const deleteControl = generalJournal.length > 1 ? (
                    <Popconfirm title="确定删除?" placement="leftTop" onConfirm={() => deleteLine(index)}>
                        <CloseOutlined/>
                    </Popconfirm>
                ) : <Tooltip placement="left" title="填报的明细必须要有1条以上">
                    <ExclamationCircleOutlined/>
                </Tooltip>;
                const saveControl = <Popconfirm title="确定提交保存?" onConfirm={() => renewLine(index)}>
                    <CheckOutlined/>
                </Popconfirm>;
                return <div> {saveControl} &nbsp; {deleteControl} </div>;
            }
        }
    ]

    /**
     * 获取财政列表数据
     * @returns {Promise<void>}
     */
    const getData = async (id) => {
        let para = {
            id: id
        };
        // 在发请求前, 显示loading
        setLoading(true);
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await generalJournalListApi(para).catch(()=>setLoading(false));
        // 在请求完成后, 隐藏loading
        setLoading(false);
        if (code === 0) {
            setGeneralJournal(data)
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    const handleCancel = () => {
        setOpen(false);
    };


    /**
     * 继续添加财政明细
     */
    const continueAdd = () => {
        let item = {
            index:generalJournal[generalJournal.length-1].index+1,
            flag: '1',
            source:currentUser.name,
            amount: 0.0,
            remarks: ''
        };
        setGeneralJournal([...generalJournal,item])
    };

    /**
     * 删除明细行
     * @param index
     */
    const deleteLine = (index) => {
        if (generalJournal.length === 1) {
            openNotificationWithIcon("error", "错误提示", '每一笔流水申请下边必须要有一条详情记录');
        } else {
            const dependDelete = deepClone(generalJournal[index]);
            let findFlag = !dependDelete || !dependDelete.journal_id ? false : dependDelete.journal_id;
            let array = deepClone(generalJournal);
            array = array.filter((item, key) => key !== index);

            if (findFlag) {
                // 发起后端删除
                deleteTransactionItem(dependDelete.id,latestJournal,array);
            }else {
                setGeneralJournal(array);
                renewList(latestJournal,array)
            }
        }
    };

    /**
     * 修改该行数据
     * @param index
     */
    const renewLine = (index) => {
        const dependSave = deepClone(generalJournal[index]);
        let findFlag = !dependSave || !dependSave.journal_id ? false : dependSave.journal_id;
        if (findFlag) {
            // 执行修改操作
            renewTransactionItem(dependSave);
        } else {
            // 执行保存操作
            addTransactionItem(dependSave);
        }
    };


    /**
     * 申报时间改变事件
     * @param date
     * @param dateString
     */
    const archiveDateChange = (date, dateString) => {
        setLatestJournal({...latestJournal,archive_date:date});
    };

    /**
     * 交易类型改变事件
     * @param value
     * @param index
     */
    const onChangeFlag = (value, index) => {
        // 对象数组是引用方式 ,对于react来说它的值都是地址(涉及到tree diff)，因为没有被重新赋值(地址没有改变)，所以 react 会认为仍然是之前的元素(element)，则不更新视图。
        const _generalJournal = deepClone(generalJournal);
        if (_generalJournal[index].flag !== value){
            _generalJournal[index].flag = value;
            setGeneralJournal(_generalJournal);
            renewList(latestJournal,_generalJournal);
        }
    };

    /**
     * input改变事件
     * @param e
     * @param record
     * @param index
     * @param field
     */
    const inputChange = (e, record, index, field) => {
        // 对象数组是引用方式 ,对于react来说它的值都是地址(涉及到tree diff)，因为没有被重新赋值(地址没有改变)，所以 react 会认为仍然是之前的元素(element)，则不更新视图。
        const _generalJournal = deepClone(generalJournal);
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
            _generalJournal[index].amount = amount;
            setGeneralJournal(_generalJournal);
            renewList(latestJournal,_generalJournal);
        } else {
            // 修改了摘要
            _generalJournal[index][field] = (e.target.value).replace(/(^\s*)|(\s*$)/g, '');
            setGeneralJournal(_generalJournal)
        }
    };


    /**
     * 获取所有的支付类别
     */
    const initPaymentMeans = async () => {
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await paymentMeansListApi();
        if (code === 0) {
            let type = [];
            data.forEach(item => {
                type.push((<Option key={item.id} value={item.id}>{item.name}</Option>));
            });
            setPayment(type);
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    /**
     * 获取所有的交易摘要
     */
    const initAbstracts = async () => {
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await abstractsApi();
        if (code === 0) {
            let type = [];
            data.forEach(item => {
                type.push((<Option key={item.id} value={item.id}>{item.tag}</Option>));
            });
            setAbstracts(type);
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    /**
     * 获取所有的币种
     */
    const initMonetaryData = async () => {
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await monetaryListApi();
        if (code === 0) {
            let type = [];
            data.forEach(item => {
                type.push((<Option key={item.id} value={item.id}>{`${item.abbreviate}[${item.name}]`}</Option>));
            });
            setMonetary(type);
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    /**
     * 支付类型 或者 摘要 或者 货币 选择框改变事件
     * @param value
     * @param field
     */
    const onSelectChange = (value, field) => {
        const _journal = {...latestJournal};
        _journal[field] = value;
        setLatestJournal(_journal);
    };

    /**
     * 交易附言（用于双向绑定数据）
     * @param event
     */
    const remarksInputChange = (event) => {
        const value = event.target.value.replace(/\s+/g, '');
        setLatestJournal({...latestJournal,remarks: value})
    };

    /**
     * 删除一条明细数据
     * @param id
     * @param _journal
     * @param _generalJourna
     * @returns {Promise<void>}
     */
    const deleteTransactionItem = async (id,_journal,_generalJourna) => {
        setLoading(true);
        const {msg, code} = await deleteGeneralJournalApi(id).catch(()=>setLoading(false));
        setLoading(false);
        if (code === 0) {
            openNotificationWithIcon("success", "操作结果", "删除成功");
            getData(latestJournal.id);
            // 接口完全返回成功，页面才删除
            setGeneralJournal(_generalJourna);
            renewList(_journal,_generalJourna)
            // 调用父页面的刷新数据方法
            props.refreshPage();
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    /**
     * 追加一条明细
     * @param value
     * @returns {Promise<void>}
     */
    const addTransactionItem = async (value) => {
        if (!value.remarks) {
            openNotificationWithIcon("warning", "提示", `请填写摘要`);
            return
        }
        if (value.amount <= 0) {
            openNotificationWithIcon("warning", "提示", `发现无效的交易金额(交易金额必须大于0)`);
            return
        }
        let para = {
            journal_id: latestJournal.id,
            flag: value.flag,
            amount: value.amount,
            remarks: value.remarks
        };
        setLoading(true);
        const {msg, code} = await addGeneralJournalApi(para).catch(()=>setLoading(false));
        setLoading(false);
        if (code === 0) {
            openNotificationWithIcon("success", "操作结果", "添加流水明细成功");
            getData(latestJournal.id);
            // 调用父页面的刷新数据方法
            props.refreshPage();
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    /**
     * 更新一条明细
     * @param value
     * @returns {Promise<void>}
     */
    const renewTransactionItem = async (value) => {
        if (!value.remarks) {
            openNotificationWithIcon("warning", "提示", `请填写摘要`);
            return
        }
        if (value.amount <= 0) {
            openNotificationWithIcon("warning", "提示", `发现无效的交易金额(交易金额必须大于0)`);
            return
        }
        let para = {
            id: value.id,
            journal_id:latestJournal.id,
            flag: value.flag,
            amount: value.amount,
            remarks: value.remarks
        };
        setLoading(true);
        const {msg, code} = await updateGeneralJournalApi(para).catch(()=>setLoading(false));
        setLoading(false);
        if (code === 0) {
            openNotificationWithIcon("success", "操作结果", "流水明细修改成功");
            getData(latestJournal.id);
            // 调用父页面的刷新数据方法
            props.refreshPage();
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };


    /**
     * 更新列表数据
     */
    const renewList = (_journal = latestJournal,_generalJournal = generalJournal) => {
        let total = 0.0;
        let income = 0.0;
        let outlay = 0.0;
        _generalJournal.forEach(item => {
            const amount = parseFloat(String(item.amount))
            if ('1' === item.flag) {
                income = accAdd(amount,income);
            } else {
                outlay = accAdd(amount,outlay);
            }
            total = accAdd(amount,total);
        });
        setLatestJournal({..._journal,total:total,income:income,outlay:outlay})
    };


    /**
     * 提交到后台修改
     */
    const handleEdit = async () => {
        if (!latestJournal.archive_date) {
            openNotificationWithIcon("warning", "提示", '请选择交易日期');
            return
        }
        if (!latestJournal.means_id) {
            openNotificationWithIcon("warning", "提示", '请选择交易方式');
            return
        }
        if (!latestJournal.abstract_id) {
            openNotificationWithIcon("warning", "提示", '请选择交易摘要');
            return
        }
        if (!latestJournal.monetary_id) {
            openNotificationWithIcon("warning", "提示", '请选择交易币种');
            return
        }
        const format = 'YYYY-MM-DD';
        const oldDate = moment(journal.archive_date, format);
        const newDate = moment(latestJournal.archive_date, format);
        if ((!oldDate.isSame(newDate)) || (journal.means_id !== latestJournal.means_id) || (journal.abstract_id !== latestJournal.abstract_id) || (journal.monetary_id !== latestJournal.monetary_id)|| (journal.remarks !== latestJournal.remarks)) {
            // 发生了变更
            const param = {
                id: journal.id,
                means_id: latestJournal.means_id,
                archive_date: newDate.format('YYYY-MM-DD'),
                abstract_id: latestJournal.abstract_id,
                monetary_id:latestJournal.monetary_id,
                remarks:latestJournal.remarks
            };
            setConfirmLoading(true);
            const {msg, code} = await updateJournalApi(param).catch(()=>setConfirmLoading(false));
            setConfirmLoading(false);
            if (code === 0) {
                openNotificationWithIcon("success", "操作结果", "修改成功");
                // 调用父页面的刷新数据方法
                props.refreshPage();
            } else {
                openNotificationWithIcon("error", "错误提示", msg);
            }
        } else {
            openNotificationWithIcon("warning", "操作驳回", '在您本次提交保存中，您的交易日期、币种、方式及摘要均未发生修改，保存操作已取消');
        }
    };

    return (
        <Drawer title='编辑收支详情' width='80%' forceRender onClose={handleCancel} open={open} bodyStyle={{ paddingBottom: 80 }} maskClosable={false}
                footer={
                    <Space>
                        <Button onClick={handleCancel}>取消</Button>
                        <Button onClick={handleEdit} loading={confirmLoading} type="primary">保存</Button>
                    </Space>
                }
        >
            <section className="journal-details">
                <Row className='detail-addLine'>
                    <Col span={5} offset={19}>
                        <Tooltip placement="left" title="添加1行">
                            <PlusOutlined onClick={continueAdd}/>
                        </Tooltip>
                    </Col>
                </Row>
                <Row className="detail-header">
                    <Col span={12} offset={6}>
                        {!journal || !journal.archive_date ? '-' : moment(journal.archive_date).format('YYYY年MM月DD日')}收支明细
                    </Col>
                </Row>
                <Row className='detail-tradeNumber'>
                    <Col span={6} offset={18}>
                        <span className='input-label'>收支单号：</span>{!latestJournal ? '-' : latestJournal.id}
                    </Col>
                </Row>
                <Row className="detail-archive-date">
                    <Col span={6} offset={18}>
                        <span className='input-label'>交易日期：</span><DatePicker
                        value={!latestJournal || !latestJournal.archive_date ? null : moment(latestJournal.archive_date)}
                        disabledDate={disabledDate} onChange={archiveDateChange} bordered={false}
                        format={"YYYY-MM-DD"} placeholder="交易日期"/>
                    </Col>
                </Row>
                <Row gutter={[12, 12]}>
                    <Col className="gutter-row" span={8}>
                        <div><span
                            className='input-label'>收支总额：</span>{formatMoney(!latestJournal ? 0 : latestJournal.total)}
                        </div>
                    </Col>
                    <Col className="gutter-row" span={8}>
                        <div><span
                            className='input-label'>收入总额：</span>{formatMoney(!latestJournal ? 0 : latestJournal.income)}
                        </div>
                    </Col>
                    <Col className="gutter-row" span={8}>
                        <div><span
                            className='input-label'>支出总额：</span>{formatMoney(!latestJournal ? 0 : latestJournal.outlay)}元
                        </div>
                    </Col>
                    <Col className="gutter-row" span={8}>
                        <div>
                            <span className='input-label'>交易方式：</span>
                            <Select value={!latestJournal || !latestJournal.means_id ? null : latestJournal.means_id}
                                    className='declare-select' bordered={false}
                                    onChange={(e) => onSelectChange(e, 'means_id')}>
                                {payment}
                            </Select>
                        </div>
                    </Col>
                    <Col className="gutter-row" span={8}>
                        <div>
                            <span className='input-label'>交易币种：</span>
                            <Select value={!latestJournal || !latestJournal.monetary_id ? null : latestJournal.monetary_id}
                                    className='declare-select' bordered={false}
                                    onChange={(e) => onSelectChange(e, 'monetary_id')}>
                                {monetary}
                            </Select>
                        </div>
                    </Col>
                    <Col className="gutter-row" span={8}>
                        <div>
                            <span className='input-label'>交易摘要：</span>
                            <Select
                                value={!latestJournal || !latestJournal.abstract_id ? null : latestJournal.abstract_id}
                                className='declare-select' bordered={false}
                                onChange={(e) => onSelectChange(e, 'abstract_id')}>
                                {abstracts}
                            </Select>
                        </div>
                    </Col>
                    <Col className="gutter-row" span={16}>
                        <div>
                            <span className='input-label'>交易附言：</span>
                            <Input type='text' maxLength={20} style={{width: '30em'}} bordered={false}
                                   value={!latestJournal || !latestJournal.remarks ? null : latestJournal.remarks}
                                   onChange={(e) => remarksInputChange(e)}/>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Table size="small" className='detail-grid' rowKey="id" bordered pagination={false}
                               loading={loading} columns={columns}
                               dataSource={generalJournal}/>
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
        </Drawer>
    )
}

// 对外暴露
export default forwardRef(JournalRenew);
