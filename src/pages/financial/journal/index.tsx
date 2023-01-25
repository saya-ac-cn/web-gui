import React, {useEffect, useRef, useState} from 'react';
import {
    deleteJournalApi,
    JournalExcelApi,
    getTransactionList,
    monetaryListApi,
    generalJournalExcelApi,
    paymentMeansListApi,
} from '@/http/api'
import {
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    FileExcelOutlined,
    PlusOutlined,
    ReloadOutlined,
    SearchOutlined
} from '@ant-design/icons';
import moment from 'moment';
import {Button, Col, DatePicker, Form, Modal, Select, Table} from "antd";
import {openNotificationWithIcon} from "@/utils/window";
import axios from "axios";
import {disabledDate, extractUserName, formatMoney} from '@/utils/var'
import Storage from "@/utils/storage";
import {BaseDirectory, writeBinaryFile} from "@tauri-apps/api/fs";
import JournalDetail from './detail'
import JournalDeclare from './declare'
const {RangePicker} = DatePicker;
const {Option} = Select;

const Journal = () => {

    const detailRef = useRef();
    const declareRef = useRef();

    //journalDeclareRef = React.createRef();
    //journalRenewRef = React.createRef();

    const [grid,setGrid] = useState([])
    const [pagination,setPagination] = useState({page_no:1,page_size:10,data_total:0})
    const [filters,setFilters] = useState({means_id:null,monetary_id:null,begin_time: null,end_time: null})
    const [loading,setLoading] = useState(false)
    const [payment,setPayment] = useState([])
    const [monetary,setMonetary] = useState([])
    const organize = Storage.get(Storage.ORGANIZE_KEY)

    useEffect(()=>{
        getData();
        getPaymentMeansData();
        getMonetaryData()
    },[])


    /**
     * 初始化Table所有列的数组
     */
    const columns = [
        {
            title: '流水号',
            dataIndex: 'id', // 显示数据对应的属性名
            align:'left',
        },
        {
            title: '收入金额',
            dataIndex: 'income', // 显示数据对应的属性名
            align:'right',
            render:(value,row) => (formatMoney(row.income))
        },
        {
            title: '支出金额',
            dataIndex: 'outlay',// 显示数据对应的属性名
            align:'right',
            render:(value,row) => (formatMoney(row.outlay))
        },
        {
            title: '收支总额',
            dataIndex: 'total',// 显示数据对应的属性名
            align:'right',
            render:(value,row) => (formatMoney(row.total))
        },
        {
            title: '交易方式',
            dataIndex: 'payment_means_name',// 显示数据对应的属性名
            align:'left',
        },
        {
            title: '交易币种',
            dataIndex: 'monetary_name',// 显示数据对应的属性名
        },
        {
            title: '交易摘要',
            dataIndex: 'abstracts_name',// 显示数据对应的属性名
        },
        {
            title: '填报人',
            dataIndex: 'source',// 显示数据对应的属性名
            render:(value,row) => (extractUserName(organize, row.source))
        },
        {
            title: '交易日期',
            dataIndex: 'archive_date', // 显示数据对应的属性名
            align:'left',
        },
        {
            title: '交易附言',
            dataIndex: 'remarks', // 显示数据对应的属性名
            align:'left',
        },
        {
            title: '创建时间',
            dataIndex: 'create_time', // 显示数据对应的属性名
            align:'left'
        },
        {
            title: '修改时间',
            dataIndex: 'update_time', // 显示数据对应的属性名
            align:'left'
        },
        {
            title: '管理',
            align:'center',
            render: (value, row) => (
                <div>
                    <Button type="primary" size="small" onClick={() => openViewModal(row)} shape="circle"
                            icon={<EyeOutlined/>}/>
                    &nbsp;
                    <Button type="primary" size="small" onClick={() => openEditModal(row)} shape="circle"
                            icon={<EditOutlined/>}/>
                    &nbsp;
                    <Button type="danger" size="small" onClick={() => handleDelete(row)} shape="circle"
                            icon={<DeleteOutlined/>}/>
                </div>
            ),
        },
    ]

    /**
     * 获取财政列表数据
     * @returns {Promise<void>}
     */
    const getData = async (_filters = filters,_pagination= pagination) => {
        let para = {
            monetary_id: _filters.monetary_id,
            means_id: _filters.means_id,
            page_no: _pagination.page_no,
            page_size: _pagination.page_size,
            begin_time: _filters.begin_time,
            end_time: _filters.end_time
        };
        // 在发请求前, 显示loading
        setLoading(true);
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await getTransactionList(para).catch(()=>{setLoading(false)});
        // 在请求完成后, 隐藏loading
        setLoading(false)
        if (code === 0) {
            setGrid(data.records);
            setPagination({..._pagination,data_total: data.total_row})
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    /**
     * 重置查询条件
     */
    const reloadPage = () => {
        const _filters = {begin_time: null,end_time: null,means_id: null,monetary_id:null}
        setFilters(_filters);
        const _pagination = {...pagination,page_no:1}
        setPagination(_pagination)
        getData(_filters,_pagination)
    };


    /**
     * 回调函数,改变页宽大小
     * @param page_size
     * @param current
     */
    const changePageSize = (page_size, current) => {
        const _pagination = {...pagination,page_no:1,page_size:page_size}
        setPagination(pagination)
        getData(filters,_pagination)
    };

    /**
     * 回调函数，页面发生跳转
     * @param current
     */
    const changePage = (current) => {
        const _pagination = {...pagination,page_no:current}
        setPagination(_pagination)
        getData(filters,_pagination)
    };

    /**
     * 日期选择发生变化
     * @param date
     * @param dateString
     */
    const onChangeDate = (date, dateString) => {
        let _filters = {...filters}
        // 为空要单独判断
        if (dateString[0] !== '' && dateString[1] !== ''){
            _filters.begin_time = dateString[0];
            _filters.end_time = dateString[1];
        }else{
            _filters.begin_time = null;
            _filters.end_time = null;
        }
        setFilters(_filters)
        const _pagination = {...pagination,page_no:1}
        setPagination(_pagination)
        getData(_filters,_pagination)
    };

    /**
     * 得到交易方式
     */
    const getPaymentMeansData = async () => {
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await paymentMeansListApi();
        if (code === 0) {
            let type = [];
            data.forEach(item => {
                type.push((<Option key={item.id} value={item.id}>{item.name}</Option>));
            });
            let copyType = [];
            copyType.push(<Option key='-1' value="">请选择</Option>);
            copyType.push(type);
            setPayment(copyType)
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };


    /**
     * 得到币种
     */
    const getMonetaryData = async () => {
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
            setMonetary(copyType)
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };


    /**
     * 交易方式选框发生改变
     * @param value
     */
    const onPaymentMeansChangeType = (value) => {
        const _filters = {...filters,means_id: value}
        setFilters(_filters);
        const _pagination = {...pagination,page_no:1}
        setPagination(_pagination)
        getData(_filters,_pagination)
    };

    /**
     * 交易币种选框发生改变
     * @param value
     */
    const onMonetaryChangeType = (value) => {
        const _filters = {...filters,monetary_id: value}
        setFilters(_filters);
        const _pagination = {...pagination,page_no:1}
        setPagination(_pagination)
        getData(_filters,_pagination)
    };

    /**
     * 财务流水申报弹框事件
     */
    const handleAddModal = () => {
        // 触发子组件的调用
        declareRef.current.handleDisplay()
    };

    /**
     * 预览流水详情
     */
    const openViewModal = (value) => {
        value.source_name = extractUserName(organize, value.source)
        // 触发子组件的调用
        detailRef.current.handleDisplay(value)
    };

    /**
     * 打开编辑弹窗
     * @param value
     */
    const openEditModal = (value) => {
        // 触发子组件的调用
        // _this.journalRenewRef.handleDisplay(value);
    };


    /**
     * 删除流水申报
     */
    const handleDelete = (item) => {
        Modal.confirm({
            title: '删除确认',
            content: `您确定删除流水号为${item.id}的流水及该流水下的所有明细的记录吗?`,
            onOk: async () => {
                // 在发请求前, 显示loading
                setLoading(true);
                const {msg, code} = await deleteJournalApi(item.id).catch(()=>{setLoading(false)});
                // 在请求完成后, 隐藏loading
                setLoading(false);
                if (code === 0) {
                    openNotificationWithIcon("success", "操作结果", "删除成功");
                    getData();
                } else {
                    openNotificationWithIcon("error", "错误提示", msg);
                }
            }
        })
    };

    /**
     * 导出Excel
     */
    const exportListExcel = () => {
        // 在发请求前, 显示loading
        setLoading(true);
        let access_token = Storage.get(Storage.ACCESS_KEY)
        let para = {
            monetary_id: filters.monetary_id,
            means_id: filters.means_id,
            begin_time: filters.begin_time,
            end_time: filters.end_time,
        };
        let fileName = '财务流水报表.xlsx';
        axios({
            method: "GET",
            url: JournalExcelApi,   //接口地址
            params: para,           //接口参数
            responseType: 'blob',
            //上面这个参数不加会乱码，据说{responseType: 'arraybuffer'}也可以
            headers: {
                "Content-Type": "application/json",
                "access_token":access_token
            },
        }).then( async (res) => {
            setLoading(false);
            let blob = new Blob([res.data]);
            blob.arrayBuffer().then(async buffer => {
                await writeBinaryFile({path: fileName, contents: buffer}, {dir: BaseDirectory.Desktop});
                openNotificationWithIcon("success","导出提示", `${fileName}已经导出到桌面，请及时查阅`)
            })
        }).catch((res) =>{
            setLoading(false);
            console.log(res)
            openNotificationWithIcon("error", "错误提示", "导出日志报表失败");
        });
    };

    /**
     * 导出财务流水明细
     */
    const exportInfoExcel = () => {
        // 在发请求前, 显示loading
        setLoading(true);
        let access_token = Storage.get(Storage.ACCESS_KEY)
        let para = {
            monetary_id: filters.monetary_id,
            means_id: filters.means_id,
            begin_time: filters.begin_time,
            end_time: filters.end_time,
        };
        let fileName = '财务流水明细.xlsx';
        axios({
            method: "GET",
            url: generalJournalExcelApi,   //接口地址
            params: para,           //接口参数
            responseType: 'blob',
            //上面这个参数不加会乱码，据说{responseType: 'arraybuffer'}也可以
            headers: {
                "Content-Type": "application/json",
                "access_token":access_token
            },
        }).then( async (res) => {
            setLoading(false);
            let blob = new Blob([res.data]);
            blob.arrayBuffer().then(async buffer => {
                await writeBinaryFile({path: fileName, contents: buffer}, {dir: BaseDirectory.Desktop});
                openNotificationWithIcon("success","导出提示", `${fileName}已经导出到桌面，请及时查阅`)
            })
        }).catch((res) =>{
            setLoading(false);
            console.log(res)
            openNotificationWithIcon("error", "错误提示", "导出日志报表失败");
        });
    };

    return (
        <div>
            <div className='child-container'>
                <div className='header-tools'>
                    记账本
                </div>
                <div className='child-content'>
                    <Col span={24} className="toolbar">
                        <Form layout="inline">
                            <Form.Item label="交易方式:">
                                <Select style={{width: '130px'}} value={filters.means_id} showSearch
                                        onChange={onPaymentMeansChangeType} placeholder="请选择">
                                    {payment}
                                </Select>
                            </Form.Item>
                            <Form.Item label="交易币种:">
                                <Select style={{width: '130px'}} value={filters.monetary_id} showSearch
                                        onChange={onMonetaryChangeType} placeholder="请选择">
                                    {monetary}
                                </Select>
                            </Form.Item>
                            <Form.Item label="填报时间:">
                                <RangePicker value={(filters.begin_time !== null && filters.end_time !== null)?[moment(filters.begin_time),moment(filters.end_time)]:[null,null]} disabledDate={disabledDate} onChange={onChangeDate}/>
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="button" onClick={getData}>
                                    <SearchOutlined/>查询
                                </Button>
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="button" onClick={reloadPage}>
                                    <ReloadOutlined/>重置
                                </Button>
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="button" onClick={handleAddModal}>
                                    <PlusOutlined/>申报
                                </Button>
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="button" onClick={exportListExcel}>
                                    <FileExcelOutlined/>流水
                                </Button>
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="button" onClick={exportInfoExcel}>
                                    <FileExcelOutlined/>明细
                                </Button>
                            </Form.Item>
                        </Form>
                    </Col>
                    <Col span={24} className="dataTable">
                        <Table size="small" rowKey="id" bordered loading={loading} columns={columns} dataSource={grid}
                               pagination={{
                                   current:pagination.page_no,
                                   showTotal: () => `当前第${pagination.page_no}页 共${pagination.data_total}条`,
                                   pageSize: pagination.page_size, showQuickJumper: true, total: pagination.data_total, showSizeChanger: true,
                                   onShowSizeChange: (current, page_size) => changePageSize(page_size, current),
                                   onChange: changePage,
                               }}/>
                    </Col>
                    <JournalDetail ref={detailRef}/>
                    <JournalDeclare ref={declareRef} refreshPage={getData}/>
                </div>
            </div>
        </div>
    )
}

// 对外暴露
export default Journal;
