import React, {useEffect, useRef, useState} from 'react';
import {Button, Col, DatePicker, Table, Form, Input, Modal} from "antd";
import {
    archivePlanPageApi,
    deleteArchivePlanApi,
} from "@/http/api";
import {openNotificationWithIcon} from "@/utils/window";
import moment from 'moment';
import {DeleteOutlined, EditOutlined, ReloadOutlined, SearchOutlined} from "@ant-design/icons";
import {extractUserName} from "@/utils/var";
import EditArchivePlan from "./edit";
import Storage from "@/utils/storage";


const {RangePicker} = DatePicker;

// 定义组件（ES6）
const ArchivePlan = () => {

    const editRef = useRef();

    const [grid,setGrid] = useState([])
    const [pagination,setPagination] = useState({page_no:1,page_size:10,data_total:0})
    const [filters,setFilters] = useState({title:null,content:null,begin_time: null,end_time: null})
    const [loading,setLoading] = useState(false)
    const organize = Storage.get(Storage.ORGANIZE_KEY)

    useEffect(()=>{
        getData()
    },[])

    /**
     * 初始化Table所有列的数组
     */
    const columns = [
        {
            title: '编号',
            dataIndex: 'id', // 显示数据对应的属性名
        },
        {
            title: '执行时间',
            dataIndex: 'archive_time', // 显示数据对应的属性名
        },
        {
            title: '标题',
            dataIndex: 'title', // 显示数据对应的属性名
        },
        {
            title: '完成状态',
            dataIndex: 'status', // 显示数据对应的属性名
            render: (text, record) => {
                if (1 === record.status) {
                    return '进行中'
                } else if (2 === record.status) {
                    return '未完成'
                }else if (3 === record.status) {
                    return '已完成'
                } else {
                    return '未知'
                }
            }
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
            render:(value,row) => (extractUserName(organize, row.user))
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
                    <Button type="primary" size="small" onClick={() => handleModalEdit(record)} shape="circle" icon={<EditOutlined/>}/>
                    &nbsp;
                    <Button type="danger" size="small" onClick={() => handleDell(record)} shape="circle" icon={<DeleteOutlined/>}/>
                </div>
            ),
        },
    ]

    /**
     * 获取归档的计划提醒列表数据
     * @returns {Promise<void>}
     */
    const getData = async (_filters = filters,_pagination= pagination) => {
        let para = {
            page_no: _pagination.page_no,
            page_size: _pagination.page_size,
            begin_time: _filters.begin_time,
            end_time: _filters.end_time,
            title: _filters.title,
            content: _filters.content,
        };
        // 在发请求前, 显示loading
        setLoading(true)
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await archivePlanPageApi(para).catch(()=>{setLoading(false)});
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
        // 重置查询条件
        const _filters = {title:null,content:null,begin_time: null,end_time: null}
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
     * 双向绑定用户文本输入框
     * @param event
     * @param field
     */
    const textInputChange = (event,field) => {
        const value = event.target.value;
        const _filters = {...filters}
        _filters[field]  = value;
        setFilters(_filters)
        const _pagination = {...pagination,page_no:1}
        setPagination(_pagination)
        getData(_filters,_pagination)
    };

    /**
     * 删除指定已提醒计划
     * @param item
     */
    const handleDell = (item) => {
        Modal.confirm({
            title: '删除确认',
            content: `确认删除标题为:'${item.title}'的提醒计划吗?`,
            cancelText: '再想想',
            okText: '不要啦',
            onOk: async () => {
                // 在发请求前, 显示loading
                setLoading(true)
                const {msg, code} = await deleteArchivePlanApi(item.id).catch(()=>setLoading(false));
                // 在请求完成后, 隐藏loading
                setLoading(false)
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
     * 显示编辑的弹窗
     * @param value
     * @returns {Promise<void>}
     */
    const handleModalEdit = (value) => {
        editRef.current.handleDisplay(value);
    };

    return (
        <div>
            <div className='child-container'>
                <div className='header-tools'>
                    已归档的计划提醒
                </div>
                <div className='child-content'>
                    <Col span={24} className="toolbar">
                        <Form layout="inline">
                            <Form.Item label="标题:">
                                <Input type='text' value={filters.title} allowClear={true} onChange={(e)=>textInputChange(e,'title')}
                                       placeholder='按内容标题'/>
                            </Form.Item>
                            <Form.Item label="内容:">
                                <Input type='text' value={filters.content} allowClear={true} onChange={(e)=>textInputChange(e,'content')}
                                       placeholder='按内容检索'/>
                            </Form.Item>
                            <Form.Item label="执行时间:">
                                <RangePicker value={(filters.begin_time !== null && filters.end_time !== null)?[moment(filters.begin_time),moment(filters.end_time)]:[null,null]} onChange={onChangeDate}/>
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
                    <EditArchivePlan ref={editRef} refreshPage={getData}/>
                </div>
            </div>
        </div>
    )
}

// 对外暴露
export default ArchivePlan;
