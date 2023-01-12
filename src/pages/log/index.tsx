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

    const [grid,setGrid] = useState([])
    const [pagination,setPagination] = useState({page_no:1,page_size:10,data_total:0})
    const [filters,setFilters] = useState({begin_time: null,end_time: null,category: null})
    const [type,setType] = useState([])
    const [loading,setLoading] = useState(false)
    const organize = Storage.get(Storage.ORGANIZE_KEY)

    useEffect(()=>{
        getTypeData()
        getData(filters,pagination)
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
           setType(type)
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    /**
     * 获取日志数据
     * @returns {Promise<void>}
     */
    const getData = async (_filters,_pagination) => {
        let para = {
            page_no: _pagination.page_no,
            page_size: _pagination.page_size,
            category: _filters.category,
            begin_time: _filters.begin_time,
            end_time: _filters.end_time,
        };
        // 在发请求前, 显示loading
        setLoading(true)
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await logPageApi(para);
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
        const _filters = {begin_time: null,end_time: null,category: null}
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
     * 日志选框发生改变
     * @param value
     */
    const onChangeType = (value) => {
        const _filters = {...filters,category:value}
        setFilters(_filters)
        const _pagination = {...pagination,page_no:1}
        setPagination(_pagination)
        getData(_filters,_pagination)
    };

    /**
     * 导出Excel
     */
    const exportExcel = () => {
        // 在发请求前, 显示loading
        setLoading(true);
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
                                <Button type="primary" htmlType="button" onClick={()=>getData(filters,pagination)}>
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