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

    const [grid,set_grid] = useState([])
    const [pagination,set_pagination] = useState({page_no:1,page_size:10,data_total:0})
    const [filters,set_filters] = useState({title:null,begin_time: null,end_time: null})
    const [loading,set_loading] = useState(false)
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
    const getData = async () => {
        let para = {
            title: filters.title,
            page_no: pagination.page_no,
            page_size: pagination.page_size,
            begin_time: filters.begin_time,
            end_time: filters.end_time
        };
        console.log('getData',para)
        // 在发请求前, 显示loading
        set_loading(true)
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await memoPageApi(para);
        // 在请求完成后, 隐藏loading
        set_loading(false)
        if (code === 0) {
            set_grid(data.records);
            set_pagination({...pagination,data_total: data.total_row})
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    /**
     * 重置查询条件
     */
    const reloadPage = () => {
        filters.begin_time = null;
        filters.end_time = null;
        filters.title = null;
        set_filters(filters);
        pagination.page_no = 1
        set_pagination(pagination)
        getData()
    };

    /**
     * 回调函数,改变页宽大小
     * @param page_size
     * @param current
     */
    const changePageSize = (page_size, current) => {
        pagination.page_no = 1
        pagination.page_size = page_size
        set_pagination(pagination)
        getData()
    };

    /**
     * 回调函数，页面发生跳转
     * @param current
     */
    const changePage = (current) => {
        pagination.page_no = current
        set_pagination(pagination)
        getData()
    };

    /**
     * 日期选择发生变化
     * @param date
     * @param dateString
     */
    const onChangeDate = (date, dateString) => {
        // 为空要单独判断
        // console.log(filters)
        // console.log({...filters,begin_time:dateString[0],end_time:dateString[1]})
        // if (dateString[0] !== '' && dateString[1] !== ''){
        //     console.log('1',dateString)
        //     set_filters({...filters,begin_time:dateString[0],end_time:dateString[1]})
        // }else{
        //     console.log('2',dateString)
        //     set_filters({...filters,begin_time:null,end_time:null})
        // }
        // set_pagination({...pagination,page_no:1})
        // getData()
        if (dateString[0] !== '' && dateString[1] !== ''){
            filters.begin_time = dateString[0];
            filters.end_time = dateString[1];
        }else{
            filters.begin_time = null;
            filters.end_time = null;
        }
        set_filters(filters)
        pagination.page_no = 1
        set_pagination(pagination)
        getData()
    };

    /**
     * 双向绑定用户查询标题
     * @param event
     */
    const titleInputChange = (event) => {
        set_filters({...filters,title: event.target.value})
        // pagination.page_no = 1
        // set_pagination(pagination)
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
        set_loading(true)
        const {msg, code, data} = await memoInfoApi(value.id).catch(()=>set_loading(false));
        set_loading(false)
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
                set_loading(true)
                const {msg, code} = await deleteMemoApi(item.id).catch(()=>set_loading(false));
                // 在请求完成后, 隐藏loading
                set_loading(false);
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