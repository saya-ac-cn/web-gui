import React, {useEffect, useState} from 'react';
import {totalJournalForDayApi, journalForDayExcelApi} from "@/http/api";
import {openNotificationWithIcon} from "@/utils/window";
import moment from 'moment';
import axios from 'axios';
import {SearchOutlined, ReloadOutlined, FileExcelOutlined} from '@ant-design/icons';
import {Button, Col, DatePicker, Table, Form} from "antd";
import {disabledDate, formatMoney} from "@/utils/var";
import Storage from "@/utils/storage";
import {BaseDirectory, writeBinaryFile} from "@tauri-apps/api/fs";


const {RangePicker} = DatePicker;
const FinancialForDay = () => {

    const [grid,setGrid] = useState([])
    const [pagination,setPagination] = useState({page_no:1,page_size:10,data_total:0})
    const [filters,setFilters] = useState({begin_time: null,end_time: null})
    const [loading,setLoading] = useState(false)

    useEffect(()=>{
        getData(filters,pagination)
    },[])

    /**
     * 初始化Table所有列的数组
     */
    const columns = [
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

    /**
     * 获取页面数据
     * @returns {Promise<void>}
     */
    const getData = async (_filters = filters,_pagination= pagination) => {
        let para = {
            begin_time: _filters.begin_time,
            end_time: _filters.end_time,
            now_page: _pagination.now_page,
            page_size: _pagination.page_size,
        };
        // 在发请求前, 显示loading
        setLoading(true)
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await totalJournalForDayApi(para).catch(()=>setLoading(false));
        // 在请求完成后, 隐藏loading
        setLoading(false);
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
        const _filters = {begin_time: null,end_time: null}
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
     * 导出财务流水
     */
    const exportExcel = () =>{
        // 在发请求前, 显示loading
        setLoading(true);
        let access_token = Storage.get(Storage.ACCESS_KEY)
        let para = {
            begin_time: filters.begin_time,
            end_time: filters.end_time,
        };
        //const fileName = '财务流水日度报表.xlsx';
        const fileName = '收支预览报表.xlsx';
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
        }).then( async (res) => {
            setLoading(false);
            console.log(res)
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
                    收支预览
                </div>
                <div className='child-content'>
                    <Col span={24} className="toolbar">
                        <Form layout="inline">
                            <Form.Item label="时间范围:">
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
                                <Button type="primary" htmlType="button" onClick={exportExcel}>
                                    <FileExcelOutlined/>导出
                                </Button>
                            </Form.Item>
                        </Form>
                    </Col>
                    <Col span={24} className="dataTable">
                        <Table size="small" rowKey="archive_date" bordered loading={loading} columns={columns} dataSource={grid}
                               pagination={{
                                   current:pagination.page_no,
                                   showTotal: () => `当前第${pagination.page_no}页 共${pagination.data_total}条`,
                                   pageSize: pagination.page_size, showQuickJumper: true, total: pagination.data_total, showSizeChanger: true,
                                   onShowSizeChange: (current, page_size) => changePageSize(page_size, current),
                                   onChange: changePage,
                               }}/>
                    </Col>
                </div>
            </div>
        </div>
    )
}

// 对外暴露
export default FinancialForDay;