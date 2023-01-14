import {Button, Col, DatePicker, Form, Table} from "antd";
import moment from "moment";
import {disabledDate} from "@/utils/var";
import {ReloadOutlined, SearchOutlined} from "@ant-design/icons";
import {useEffect, useState} from "react";
import {openNotificationWithIcon} from "@/utils/window";
import {dbDumpPageApi} from "@/http/api"


const {RangePicker} = DatePicker;
const Data = () => {

    const [grid,set_grid] = useState([])
    const [pagination,set_pagination] = useState({page_no:1,page_size:10,data_total:0})
    const [filters,set_filters] = useState({begin_time: null,end_time: null})
    const [loading,set_loading] = useState(false)

    useEffect(()=>{
        getData()
    },[])

    /**
     * 初始化Table所有列的数组
     */
    const columns = [
        {
            title: '执行编号',
            dataIndex: 'id', // 显示数据对应的属性名
        },
        {
            title: '归档日期',
            dataIndex: 'archive_date', // 显示数据对应的属性名
        },
        {
            title: '归档目录',
            dataIndex: 'url', // 显示数据对应的属性名
        },
        {
            title: '备份时间',
            dataIndex: 'execute_data', // 显示数据对应的属性名
        }
    ]

    /**
     * 获取备份数据
     * @returns {Promise<void>}
     */
    const getData = async () => {
        let para = {
            page_no: pagination.page_no,
            page_size: pagination.page_size,
            begin_time: filters.begin_time,
            end_time: filters.end_time
        };
        // 在发请求前, 显示loading
        set_loading(true)
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await dbDumpPageApi(para);
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

    return (
        <div>
            <div className='child-container'>
                <div className='header-tools'>
                    数据备份
                </div>
                <div className='child-content'>
                    <Col span={24} className="toolbar">
                        <Form layout="inline">
                            <Form.Item label="归档时间:">
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
                </div>
            </div>
        </div>
    )
}

export default Data