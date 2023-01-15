import {Button, Col, DatePicker, Form, Input, Modal, Table} from "antd";
import moment from "moment";
import {DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined} from "@ant-design/icons";
import {disabledDate, extractUserName} from "@/utils/var"
import React, {useEffect, useRef, useState} from "react";
import {openNotificationWithIcon} from "@/utils/window";
import {deleteMemoApi, memoInfoApi, memoPageApi} from "@/http/api"
import Storage from "@/utils/storage";
import MemoFrom from "./edit";

const {RangePicker} = DatePicker;
const Memo = () => {

    const editRef = useRef();

    const [grid,setGrid] = useState([])
    const [pagination,setPagination] = useState({page_no:1,page_size:10,data_total:0})
    const [filters,setFilters] = useState({title:null,begin_time: null,end_time: null})
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
            title: '标题',
            dataIndex: 'title', // 显示数据对应的属性名
        },
        {
            title: '创建者',
            dataIndex: 'source', // 显示数据对应的属性名
            render:(value,row) => (extractUserName(organize, row.source))
        },
        {
            title: '创建时间',
            dataIndex: 'create_time', // 显示数据对应的属性名
        },
        {
            title: '修改时间',
            dataIndex: 'update_time', // 显示数据对应的属性名
        },
        {
            title: '操作',
            align:'center',
            render: (text, record) => (
                <div>
                    <Button type="primary" size="small" onClick={() => handleModalEdit(record)} shape="circle" icon={<EditOutlined/>}/>
                    &nbsp;
                    <Button type="danger" size="small" onClick={() => handleDellMemo(record)} shape="circle" icon={<DeleteOutlined/>}/>
                </div>
            ),
        }
    ]

    /**
     * 获取便利贴列表数据
     * @returns {Promise<void>}
     */
    const getData = async (_filters = filters,_pagination= pagination) => {
        let para = {
            title: _filters.title,
            page_no: _pagination.page_no,
            page_size: _pagination.page_size,
            begin_time: _filters.begin_time,
            end_time: _filters.end_time
        };
        console.log('getData',para)
        // 在发请求前, 显示loading
        setLoading(true)
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await memoPageApi(para);
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
        const _filters = {begin_time: null,end_time: null,title: null}
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
     * 双向绑定用户查询标题
     * @param event
     */
    const titleInputChange = (event) => {
        const value = event.target.value;
        const _filters = {...filters,title:value}
        setFilters(_filters)
        const _pagination = {...pagination,page_no:1}
        setPagination(_pagination)
        getData(_filters,_pagination)
    };

    /**
     * 显示添加的弹窗
     */
    const handleModalAdd = () => {
        editRef.current.handleDisplay(null);
    };

    /**
     * 显示修改的弹窗
     * @param value
     * @returns {Promise<void>}
     */
    const handleModalEdit = async (value) => {
        setLoading(true)
        const {msg, code, data} = await memoInfoApi(value.id).catch(()=>setLoading(false));
        setLoading(false)
        if (code === 0) {
            editRef.current.handleDisplay(data);
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };


    /**
     * 删除指定便利贴
     * @param item
     */
    const handleDellMemo = (item) => {
        Modal.confirm({
            title: '删除确认',
            content: `确认删除标题为:${item.title}的便利贴吗?`,
            cancelText: '再想想',
            okText: '不要啦',
            onOk: async () => {
                // 在发请求前, 显示loading
                setLoading(true)
                const {msg, code} = await deleteMemoApi(item.id).catch(()=>setLoading(false));
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

    return (
        <div>
            <div className='child-container'>
                <div className='header-tools'>
                    便利贴
                </div>
                <div className='child-content'>
                    <Col span={24} className="toolbar">
                        <Form layout="inline">
                            <Form.Item label="标题:">
                                <Input type='text' value={filters.title} allowClear={true} onChange={e=>titleInputChange(e)}
                                       placeholder='按标题检索'/>
                            </Form.Item>
                            <Form.Item label="填写时间:">
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
                                <Button type="primary" htmlType="button" onClick={handleModalAdd}>
                                    <PlusOutlined/>创建
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
                        <MemoFrom ref={editRef} refreshPage={getData}/>
                    </Col>
                </div>
            </div>
        </div>
    )
}

export default Memo