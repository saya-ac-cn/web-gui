import React, {Component, useEffect, useState} from 'react';
import {Button, Col, DatePicker, Table, Form, Input, Modal, Upload} from "antd";
import {filePageApi, editFileApi, uploadFileApi, downloadFileApi, deleteFileApi} from "@/http/api"
import {openNotificationWithIcon} from "@/utils/window";
import moment from 'moment';
import axios from "axios";
import {InboxOutlined,DeleteOutlined, CloudDownloadOutlined, EditOutlined, ReloadOutlined, SearchOutlined,CloudUploadOutlined} from "@ant-design/icons";
import {disabledDate, extractUserName} from "@/utils/var";
import Storage from "@/utils/storage";
import {BaseDirectory, writeBinaryFile} from "@tauri-apps/api/fs";

const {RangePicker} = DatePicker;
const { Dragger } = Upload;
const File = () => {

    const [grid,set_grid] = useState([])
    const [pagination,set_pagination] = useState({page_no:1,page_size:10,data_total:0})
    const [filters,set_filters] = useState({file_name:null,begin_time: null,end_time: null})
    const [modal,set_modal] = useState(false)
    const [loading,set_loading] = useState(false)
    const organize = Storage.get(Storage.ORGANIZE_KEY)

    useEffect(()=>{
        getData()
    },[])

    /**
     * 初始化上传组件信息
     */
    const uploadConfig = {
        name: 'file',
        multiple: true,
        action: uploadFileApi,
        headers:{access_token:Storage.get(Storage.ACCESS_KEY)},
        data: file => ({
            // data里存放的是接口的请求参数
            // 这里文件传递唯一序列码（前端生成）
            uid: file.uid,
        }),
        onRemove: file => {
            const { uid ,response} = file;
            // 如果response.code不为0，则表示这个文件在服务器端已经上传失败了，此时调用删除方法只需要删除浏览器上的即可
            if (response && 0 === response.code){
                // 删除文件
                deleteFile({'uid':uid})
            }
        },
        onChange(info) {
            // 状态有：uploading done error removed
            const { status ,response} = info.file;
            if (status === 'done' || status === 'error') {
                if (0 === response.code){
                    openNotificationWithIcon("success", "上传成功", `${info.file.name} file uploaded successfully.`);
                    getData();
                }else{
                    openNotificationWithIcon("error", "错误提示", `${info.file.name} file upload failed.cause by:${response.msg}`);
                }
            }
        }
    };


    const columns = [
        {
            title: '文件名',
            dataIndex: 'file_name', // 显示数据对应的属性名
        },
        {
            title: '上传者',
            dataIndex: 'source', // 显示数据对应的属性名
            render:(value,row) => (extractUserName(organize, row.source))
        },
        {
            title: '状态',
            align: 'center',
            render: (text, record) => {
                if (1 === record.status) {
                    return '已显示'
                } else if (2 === record.status) {
                    return '已屏蔽'
                } else {
                    return '未知'
                }
            }
        },
        {
            title: '上传时间',
            dataIndex: 'create_time', // 显示数据对应的属性名
        },
        {
            title: '修改时间',
            dataIndex: 'update_time', // 显示数据对应的属性名
        },
        {
            title: '下载',
            render: (text, record) => (
                <div>
                    <Button type="primary" size="small" onClick={() => downloadFile(record)} shape="circle" icon={<CloudDownloadOutlined/>}/>
                    &nbsp;
                    <Button type="primary" size="small" onClick={() => handleChangeFile(record)} shape="circle" icon={<EditOutlined/>}/>
                    &nbsp;
                    <Button type="danger" size="small" onClick={() => handleDeleteFile(record)} shape="circle" icon={<DeleteOutlined/>}/>
                </div>
            ),
        },
    ]

    /**
     * 获取文件列表数据
     * @returns {Promise<void>}
     */
    const getData = async () => {
        let para = {
            page_no: pagination.page_no,
            page_size: pagination.page_size,
            file_name: filters.file_name,
            begin_time: filters.begin_time,
            end_time: filters.end_time,
        };
        // 在发请求前, 显示loading
        set_loading(true);
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await filePageApi(para);
        // 在请求完成后, 隐藏loading
        set_loading(false);
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
        // filters.begin_time = null;
        // filters.end_time = null;
        // filters.file_name = null;
        set_filters({begin_time:null,end_time:null,file_name:null});
        pagination.page_no = 1
        set_pagination(pagination)
        getData();
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
        // if (dateString[0] !== '' && dateString[1] !== ''){
        //     filters.begin_time = dateString[0];
        //     filters.end_time = dateString[1];
        // }else{
        //     filters.begin_time = null;
        //     filters.end_time = null;
        // }
        if (dateString[0] !== '' && dateString[1] !== ''){
            console.log('1',dateString)
            set_filters({...filters,begin_time:dateString[0],end_time: dateString[1]})
        }else{
            console.log('2',dateString)
            set_filters({...filters,begin_time:null,end_time:null})
        }
        // pagination.page_no = 1
        // set_pagination(pagination)
        set_pagination({...pagination,page_no:1})
        getData()
    };

    /**
     * 接口名文本框内容改变事件（用于双向绑定数据）
     * @param event
     */
    const fileInputChange = (event) => {
        const value = event.target.value;
        filters.file_name = value;
        set_filters(filters)
        pagination.page_no = 1
        set_pagination(pagination)
    };

    /**
     * 删除文件
     */
    const deleteFile = async (para) => {
        // 在发请求前, 显示loading
        set_loading(true);
        // 发异步ajax请求, 获取数据
        const {msg, code} = await deleteFileApi(para);
        // 在请求完成后, 隐藏loading
        set_loading(false);
        if (code === 0) {
            openNotificationWithIcon("success", "操作结果", "删除成功");
            getData();
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    /**
     * 弹框确认删除
     */
    const handleDeleteFile = (item) => {
        Modal.confirm({
            title: '删除确认',
            content: `确认文件名为:'${item.file_name}'的文件吗?`,
            onOk: () => {
                let para = { id: item.id };
                deleteFile(para)
            }
        })
    };

    /**
     * 下载文件
     * @param row
     */
    const downloadFile = (row) => {
        // 在发请求前, 显示loading
        set_loading(true);
        let access_token = Storage.get(Storage.ACCESS_KEY)
        axios({
            method: "GET",
            url: downloadFileApi+row.id,   //接口地址
            responseType: 'blob',
            //上面这个参数不加会乱码，据说{responseType: 'arraybuffer'}也可以
            headers: {
                "Content-Type": "application/json",
                "access_token":access_token
            },
        }).then(function (res) {
            set_loading(false);
            let blob = new Blob([res.data]);
            blob.arrayBuffer().then(async buffer => {
                await writeBinaryFile({path: row.file_name, contents: buffer}, {dir: BaseDirectory.Desktop});
                openNotificationWithIcon("success","导出提示", `${row.file_name}已经导出到桌面，请及时查阅`)
            })
        }).catch(res => {
            set_loading(false);
            openNotificationWithIcon("error", "错误提示", "下载文件失败"+res);
        });
    };

    /**
     * 改变文件状态
     * @param item
     */
    const handleChangeFile = (item) => {
        let message = '';
        let sendStatus = null;
        if (1 === item.status) {
            // 屏蔽
            sendStatus = 2;
            message = `您确定要屏蔽文件名为：' ${item.file_name} '的文件吗？`
        } else {
            // 显示
            sendStatus = 1;
            message = `您确定要显示文件名为：' ${item.file_name} '的文件吗？`
        }
        Modal.confirm({
            title: '修改确认',
            content: message,
            onOk: async () => {
                let para = { id: item.id, status: sendStatus };
                // 在发请求前, 显示loading
                set_loading(true);
                // 发异步ajax请求, 获取数据
                const {msg, code} = await editFileApi(para);
                // 在请求完成后, 隐藏loading
                set_loading(false);
                if (code === 0) {
                    openNotificationWithIcon("success", "操作结果", "修改成功");
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
                    文件夹
                </div>
                <div className='child-content'>
                    <Col span={24} className="toolbar">
                        <Form layout="inline">
                            <Form.Item label="文件名:">
                                <Input type='text' value={filters.file_name} onChange={fileInputChange}
                                       placeholder='请输入文件名'/>
                            </Form.Item>
                            <Form.Item label="上传时间:">
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
                                <Button type="primary" htmlType="button" onClick={()=>set_modal(true)}>
                                    <CloudUploadOutlined/>上传
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
                    <Modal
                        title="上传文件"
                        open={modal}
                        onOk={()=>set_modal(false)}
                        onCancel={()=>set_modal(false)}>
                        <Dragger {...uploadConfig}>
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">单击或拖动文件到此区域进行上传</p>
                            <p className="ant-upload-hint">
                                支持单个或批量上传，单个文件大小不能超过10M，禁止上传exe/bat等可执行文件。
                            </p>
                        </Dragger>
                    </Modal>
                </div>
            </div>
        </div>
    )
}

export default File