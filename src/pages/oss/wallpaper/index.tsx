import {useEffect, useState} from "react";
import {Button, Row, Col, Input, Form, DatePicker, Modal, Spin, Upload} from "antd";
import './index.less'
import {picturePageApi, deletePictureApi, uploadWallpaperApi, editUserInfoApi, getToken} from "@/http/api";
import {openNotificationWithIcon} from "@/utils/window";
import axios from 'axios'
import Storage from "@/utils/storage";
import {ReloadOutlined, SearchOutlined,CloudUploadOutlined,DeleteOutlined,HeartOutlined,MinusOutlined,MoreOutlined,CheckOutlined} from "@ant-design/icons";
import {disabledDate,isEmptyObject,deepClone} from "@/utils/var";

/*
 * 文件名：index.jsx
 * 作者：liunengkai
 * 创建日期：2022-10-04 - 20:40
 * 描述：壁纸管理
 */
const {RangePicker} = DatePicker;

// 定义组件（ES6）
const Wallpaper = () => {

    const [grid,setGrid] = useState([])
    const [pagination,setPagination] = useState({next_page:1,page_size:10})
    const [filters,setFilters] = useState({begin_time: null,end_time: null,file_name: null})
    const [loading,setLoading] = useState(false)
    // 是否显示上传层
    const [uploadVisible,setUploadVisible] = useState(false)
    const [previewVisible,setPreviewVisible] = useState(false)
    const [accessToken,setAccessToken] = useState('')
    const [previewImage,setPreviewImage] = useState('')
    const [fileList,setFileList] = useState([])
    const [currentUser,setCurrentUser] = useState({account:null,background:null})
    const [token,setToken] = useState('');


    useEffect(()=>{
        getData()
        initParam()
    },[])

    const initParam = async () => {
        setCurrentUser(Storage.get(Storage.USER_KEY))
        setAccessToken(Storage.get(Storage.ACCESS_KEY))
        setToken(await getToken())
    }

    /**
     * 获取插图列表数据
     * @returns {Promise<void>}
     */
    const getData = async (_filters = filters,_pagination= pagination) => {
        let para = {
            category: 1,
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
            console.error('获取壁纸数据异常:',err)
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
        const _pagination = {...pagination,next_page:1}
        setPagination(_pagination)
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
        let id =  e.currentTarget.getAttribute('data-id')
        Modal.confirm({
            title: '删除确认',
            content: `确认编号为:'${id}'的壁纸吗?`,
            onOk: () => {
                deletePicture(id)
            }
        })
    };

    /**
     * 设置壁纸
     * @param e
     */
    const handleSetBackbround = async (e) => {
        // 得到自定义属性
        let src =  e.currentTarget.getAttribute('data-src')
        let id =  e.currentTarget.getAttribute('data-id')
        let flag = false;
        // 利用axios检测该壁纸能否打开
        await axios.get(src).then((response) => {
                flag = true
            })
            .catch((err) => {
                flag = false
            });
        if (true === flag) {
            let para = {
                account: currentUser.account,
                background: parseInt(id),
                token: token
            };
            // 在发请求前, 显示loading
            setLoading(true);
            const {err,result} = await editUserInfoApi(para);
            if (err){
                console.error('设置壁纸异常:',err)
                setLoading(false);
                return
            }
            const {msg, code} = result
            // 在请求完成后, 隐藏loading
            setLoading(false);
            // 为下一次的提交申请一个token
            setToken(await getToken());
            if (code === 0) {
                currentUser.background = parseInt(id);
                currentUser.background_url = src;
                Storage.add(Storage.USER_KEY,currentUser); // 保存到local中
                setCurrentUser(currentUser)
                openNotificationWithIcon("success", "操作结果", "壁纸设置成功");
            } else {
                openNotificationWithIcon("error", "错误提示", msg);
            }
        }else{
            openNotificationWithIcon("error", "错误提示", '当前壁纸图片无效，该壁纸不能设置');
        }
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

    /**
     * 取消上传
     */
    const handleCancelUpload = () => {
        setUploadVisible(false)
        setFileList([])
    };

    /**
     * 打开上传框
     */
    const handleOpenUpload = () => {
        setUploadVisible(true)
    };

    /**
     * 处理图片为Base64
     * @param file
     * @returns {Promise<any>}
     */
    const getBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    /**
     * 关闭图片预览
     */
    const handleCancel = () => {
        setPreviewVisible(false)
    };

    /**
     * 预览图片
     * @param file
     * @returns {Promise<void>}
     */
    const handlePreview = async (file) => {
        // if (!file.url && !file.preview) {
        //     file.preview = this.getBase64(file.originFileObj);
        // }
        setPreviewImage(file.url || file.thumbUrl)
        setPreviewVisible(true)
    };

    /**
     * 上传前添加到list，
     * @param fileList
     */
    const handleChange = (info) => {
        let fileList = info.fileList;
        const { status } = info.file;
        // 注意，发生一次上传后，会有三个顺序的status变化，done，uploading，dong，而，只需要处理最后一个状态即可
        if (status !== 'uploading') {
            console.log(info.file, info.fileList);
        }
        if (status === 'done') {
            openNotificationWithIcon("success", "上传成功", `${info.file.name} file uploaded successfully.`);
            getData();
        } else if (status === 'error') {
            openNotificationWithIcon("error", "错误提示", `${info.file.name} file upload failed.`);
        }
        setFileList(fileList)
    };

    /**
     * 删除图片
     * @param file
     */
    const handleDelete = (file) => {
        //console.log(file)
        const index = fileList.indexOf(file);
        //console.log(index)
        const newFileList = fileList.slice();
        newFileList.splice(index, 1);
        setFileList(newFileList)
    };

    /**
     * 大图预览
     */
    const previewPhoto = (url) => {
        setPreviewImage(url)
        setPreviewVisible(true)
    };

    return (
        <div>
            <div className='child-container'>
                <div className='header-tools'>
                    壁纸管理
                </div>
                <div className='child-content'>
                    <Modal
                        title="壁纸文件"
                        open={uploadVisible}
                        onOk={handleCancelUpload}
                        onCancel={handleCancelUpload}>
                        <Upload
                            action={uploadWallpaperApi}
                            listType="picture-card"
                            accept="image/jpeg,image/jpg,image/png,image/bmp"
                            fileList={fileList}
                            headers={{accessToken}}
                            onPreview={handlePreview}
                            onChange={handleChange}
                            onRemove={handleDelete}>
                            {fileList.length >= 8 ? null : (<div><CloudUploadOutlined/><div className="ant-upload-text">Upload</div></div>)}
                        </Upload>
                    </Modal>
                    <Modal open={previewVisible} footer={null} onCancel={handleCancel}>
                        <img alt="example" style={{ width: '100%' }} src={previewImage} />
                    </Modal>
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
                                <Form.Item>
                                    <Button type="primary" htmlType="button" onClick={handleOpenUpload}>
                                        <CloudUploadOutlined/>上传
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Col>
                    </Row>
                    <Row style={{height: '100%',alignItems: 'center',justifyContent: 'center'}}>
                        {
                            loading ? <Spin size="large"/> :
                                <ul className="wallpaper-ul">
                                    {grid !== null ? grid.map((item) => (
                                            <li span={6} className="album-div-imgdiv" key={item.id}>
                                                <div className="tools">
                                                    <Button type="primary" shape="circle" icon={<DeleteOutlined/>} data-id={item.id} onClick={handleDeleteFile} size="small" title="删除"/>
                                                    {
                                                        currentUser.background === item.id ?
                                                            null
                                                            :
                                                            <Button type="primary" style={{marginLeft: '0.5em'}} shape="circle" icon={<HeartOutlined />} data-id={item.id} data-src={item.web_url} onClick={handleSetBackbround} size="small" title="设为壁纸"/>
                                                    }
                                                </div>
                                                <a href="#toolbar" onClick={() => previewPhoto(item.web_url)} rel="noopener noreferrer" className="a-img">
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
                                            <Button type="primary" shape="circle" icon={<CheckOutlined/>} size="small" title="已经加载完壁纸了"/>
                                        </li>
                                    }
                                </ul>
                        }
                    </Row>
                </div>
            </div>
        </div>
    );
}

// 对外暴露
export default Wallpaper;
