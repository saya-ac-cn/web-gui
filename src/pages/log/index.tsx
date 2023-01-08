import {openNotificationWithIcon} from '@/utils/window'
import {Col, Form, Button, Table, DatePicker, Select} from 'antd';
import {useEffect,useState} from 'react';
import {logPageApi,logTypeListApi,downloadLogExcelApi} from "@/http/api"
import Storage from '@/utils/storage'
import {SearchOutlined,ReloadOutlined,FileExcelOutlined} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios'
import {disabledDate, extractUserName} from "@/utils/var"
import { writeBinaryFile,BaseDirectory } from '@tauri-apps/api/fs';



const {RangePicker} = DatePicker;
const {Option} = Select;

const Log = () => {

    const [grid,set_grid] = useState([])
    const [pagination,set_pagination] = useState({page_no:1,page_size:10,data_total:0})
    const [filters,set_filters] = useState({begin_time: null,end_time: null,category: null})
    const [type,set_type] = useState([])
    const [loading,set_loading] = useState(false)
    const organize = Storage.get(Storage.ORGANIZE_KEY)

    useEffect(()=>{
        getTypeData()
        getData()
    },[])

    const columns = [
        {
            title: '编号',
            dataIndex: 'id', // 显示数据对应的属性名
            align:'right',
        },
        {
            title: '用户',
            dataIndex: 'user', // 显示数据对应的属性名
            align:'left',
            render:(value,row) => (extractUserName(organize, row.user))
        },
        {
            title: '操作详情',
            dataIndex: 'detail', // 显示数据对应的属性名
        },
        {
            title: 'ip',
            dataIndex: 'ip', // 显示数据对应的属性名
            align:'left',
        },
        {
            title: '城市',
            dataIndex: 'city', // 显示数据对应的属性名
        },
        {
            title: '日期',
            dataIndex: 'date', // 显示数据对应的属性名
            align:'left'
        }
    ]


    /**
     * 获取日志类别
     * @returns {Promise<void>}
     */
    const getTypeData = async () => {
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await logTypeListApi();
        if (code === 0) {
            // 利用更新状态的回调函数，渲染下拉选框
            let type = [];
            type.push((<Option key={-1} value="">请选择</Option>));
            data.forEach(item => {
                type.push((<Option key={item.category} value={item.category}>{item.detail}</Option>));
            });
           set_type(type)
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    /**
     * 获取日志数据
     * @returns {Promise<void>}
     */
    const getData = async () => {
        let para = {
            page_no: pagination.page_no,
            page_size: pagination.page_size,
            category: filters.category,
            begin_time: filters.begin_time,
            end_time: filters.end_time,
        };
        // 在发请求前, 显示loading
        set_loading(true)
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await logPageApi(para);
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
        filters.category = null;
        set_filters(filters);
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

    /**
     * 日志选框发生改变
     * @param value
     */
    const onChangeType = (value) => {
        filters.category = value;
        set_filters(filters)
        pagination.page_no = 1
        set_pagination(pagination)
        getData()
    };

    /**
     * 导出Excel
     */
    const exportExcel = () => {
        // 在发请求前, 显示loading
        set_loading(true);
        let access_token = Storage.get(Storage.ACCESS_KEY)
        let para = {
            type: filters.category,
            begin_time: filters.begin_time,
            end_time: filters.end_time,
        };
        let fileName = '操作日志报表.xlsx';
        axios({
            method: "GET",
            url: downloadLogExcelApi,   //接口地址
            params: para,           //接口参数
            responseType: 'blob',
            //上面这个参数不加会乱码，据说{responseType: 'arraybuffer'}也可以
            headers: {
                "Content-Type": "application/json",
                "access_token":access_token
            },
        }).then( async (res) => {
            set_loading(false);
            console.log(res)
            let blob = new Blob([res.data]);
            blob.arrayBuffer().then(async buffer => {
                await writeBinaryFile({path: fileName, contents: buffer}, {dir: BaseDirectory.Desktop});
                openNotificationWithIcon("success","导出提示", `${fileName}已经导出到桌面，请及时查阅`)
            })
        }).catch((res) =>{
            set_loading(false);
            console.log(res)
            openNotificationWithIcon("error", "错误提示", "导出日志报表失败");
        });
    };


    return (
        <div>
            <div className='child-container'>
                <div className='header-tools'>
                    操作日志
                </div>
                <div className='child-content'>
                    <Col span={24} className="toolbar">
                        <Form layout="inline">
                            <Form.Item label="操作类别:">
                                <Select value={filters.category} style={{width:'10em'}} showSearch onChange={onChangeType}
                                        placeholder="请选择操作类别">
                                    {type}
                                </Select>
                            </Form.Item>
                            <Form.Item label="操作时间:">
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

export default Log