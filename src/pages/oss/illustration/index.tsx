import {useEffect, useState} from "react";
import {Button, Row, Col, Input, Form, DatePicker, Modal, Spin} from "antd";
import dayjs from 'dayjs';
import './index.less'
import {picturePageApi, deletePictureApi} from "@/http/api";
import {openNotificationWithIcon} from "@/utils/window";
import DocumentTitle from 'react-document-title'
import {disabledDate,isEmptyObject,deepClone} from "@/utils/var";
import {
  CheckOutlined,
  DeleteOutlined,
  MinusOutlined,
  MoreOutlined,
  ReloadOutlined,
  SearchOutlined
} from "@ant-design/icons";

/*
 * 文件名：index.tsx
 * 作者：liunengkai
 * 创建日期：2022-10-04 - 20:40
 * 描述：插图管理
 */
const {RangePicker} = DatePicker;

// 定义组件（ES6）
const Illustration = () => {

    const [grid,setGrid] = useState([])
    const [pagination,setPagination] = useState({next_page:1,page_size:10})
    const [filters,setFilters] = useState({begin_time: null,end_time: null,file_name: null})
    const [loading,setLoading] = useState(false)

    useEffect(()=>{
        getData()
    },[])

    /**
     * 获取插图列表数据
     * @returns {Promise<void>}
     */
    const getData = async (_filters = filters,_pagination= pagination) => {
        let para = {
            category: 2,
            now_page: null === _pagination.next_page ? 1 : _pagination.next_page,
            page_size: _pagination.page_size,
            begin_time: _filters.begin_time,
            end_time: _filters.end_time,
            file_name: _filters.file_name,
        };
        // 在发请求前, 显示loading
        setLoading(true)
        // 发异步ajax请求, 获取数据
        const {err, result} = await picturePageApi(para);
        if (err){
            setLoading(false)
            console.error('获取插图数据异常:',err)
            return
        }
        const {msg, code,data} = result
        // 在请求完成后, 隐藏loading
        setLoading(false)
        if (code === 0) {
            // 表格数据
            rendering(data);
        } else {
            setPagination({..._pagination,next_page: null})
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    /**
     * 表格数据渲染
     * @param data
     */
    const rendering = (data) => {
        let _grid = deepClone(grid);
        // 渲染数据
        if (isEmptyObject(data.records)) {
            _grid = [];
        } else {
            //第一页采用直接覆盖的显示方式
            if (data.page_no === 1) {
                _grid = data.records;
            } else {
                //追加，合并
                _grid = (_grid).concat(_grid.records);
            }
        }
        setGrid(_grid)
        let next_page = pagination.next_page;
        //显示是否加载下一页(当前页是最后一页)
        if (data.page_no === data.total_page) {
            next_page = null;
        } else {
            next_page = data.page_no + 1;
        }
        setPagination({...pagination,next_page: next_page})
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
        setPagination({...pagination,next_page:1})
        getData(_filters,_pagination)
    };

    /**
     * 重置查询条件
     */
    const reloadPage = () => {
        const _filters = {begin_time: null,end_time: null,file_name: null}
        setFilters(_filters);
        const _pagination = {...pagination,next_page:1}
        setPagination(_pagination)
        getData(_filters,_pagination)
    };

    /**
     * 文件名名文本框内容改变事件（用于双向绑定数据）
     * @param event
     */
    const fileInputInputChange = (event) => {
        const value = event.target.value;
        const _filters = {...filters,file_name:value}
        setFilters(_filters)
        const _pagination = {...pagination,next_page:1}
        setPagination(_pagination)
        getData(_filters,_pagination)
    };

    /**
     * 弹框确认删除
     */
    const handleDeleteFile = (e) => {
        // 得到自定义属性
        const id =  e.currentTarget.getAttribute('data-id')
        Modal.confirm({
            title: '删除确认',
            content: `确认编号为:'${id}'的壁纸吗?`,
            onOk: () => {
                deletePicture(id)
            }
        })
    };

    /**
     * 执行删除操作
     * @param id
     * @returns {Promise<void>}
     */
    const deletePicture = async (id) => {
        // 在发请求前, 显示loading
        setLoading(true);
        // 发异步ajax请求, 获取数据
        const {err, result} = await deletePictureApi(id);
        if (err){
            console.error('删除图片异常:',err)
            setLoading(false);
            return
        }
        const {msg, code} = result
        // 在请求完成后, 隐藏loading
        setLoading(false);
        if (code === 0) {
            openNotificationWithIcon("success", "操作结果", "删除成功");
            getData();
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    return (
        <DocumentTitle title='插图管理'>
            <div className='child-container'>
                <div className='header-tools'>
                    插图管理
                </div>
                <div className='child-content'>
                    <Row>
                        <Col span={24} className="toolbar">
                            <Form layout="inline">
                                <Form.Item label="文件名:">
                                    <Input type='text' value={filters.file_name} onChange={fileInputInputChange}
                                           placeholder='请输入文件名'/>
                                </Form.Item>
                                <Form.Item label="上传时间:">
                                    <RangePicker value={(filters.begin_time !== null && filters.end_time !== null)?[dayjs(filters.begin_time),dayjs(filters.end_time)]:[null,null]} disabledDate={disabledDate} onChange={onChangeDate}/>
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
                    </Row>
                    <Row style={{height: '100%',alignItems: 'center',justifyContent: 'center'}}>
                        {
                            loading ? <Spin size="large"/> :
                                <ul className="illustration-ul">
                                    {grid !==null ? grid.map((item) => (
                                            <li span={6} className="album-div-imgdiv" key={item.id}>
                                                <div className="tools">
                                                    <Button type="primary" shape="circle" icon={<DeleteOutlined/>} data-id={item.id} onClick={handleDeleteFile} size="small" title="删除"/>
                                                </div>
                                                <a href="#toolbar" rel="noopener noreferrer" className="a-img">
                                                    <img src={item.web_url} alt={item.file_name}
                                                         className="img-responsive"/>
                                                </a>
                                            </li>
                                        )):
                                        <li span={6} className="album-div-imgdiv">
                                            <Button type="primary" shape="circle" icon={<MinusOutlined/>} size="small" title="好像并没有照片诶"/>
                                        </li>
                                    }
                                    {pagination.next_page !== null ?
                                        <li span={6} className="album-div-imgdiv">
                                            <Button type="primary" onClick={getData} shape="circle" icon={<MoreOutlined/>} size="small" title="加载更多"/>
                                        </li>
                                        :
                                        <li span={6} className="album-div-imgdiv">
                                            <Button type="primary" shape="circle" icon={<CheckOutlined/>} size="small" title="已经加载完插图了"/>
                                        </li>
                                    }
                                </ul>
                        }
                    </Row>
                </div>
            </div>
        </DocumentTitle>
    );


}

// 对外暴露
export default Illustration;
