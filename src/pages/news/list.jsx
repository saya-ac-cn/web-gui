import React, {Component} from 'react';
import {Button, Col, Table, DatePicker, Input, Form, Modal, Tag} from "antd";
import {deleteNewsApi, newsPageApi} from "@/api";
import {openNotificationWithIcon} from "@/utils/window";
import moment from 'moment';
import {DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined} from "@ant-design/icons";
import {Link} from "react-router-dom";
import DocumentTitle from 'react-document-title'
import {disabledDate, extractUserName} from "@/utils/var";
import storageUtils from "@/utils/storageUtils";
/*
 * 文件名：list.jsx
 * 作者：liunengkai
 * 创建日期：2022-10-06 - 22:28
 * 描述：动态管理页面
 */
const {RangePicker} = DatePicker;
// 定义组件（ES6）
class List extends Component {

    state = {
        // 返回的单元格数据
        datas: [],
        // 总数据行数
        dataTotal: 0,
        // 当前页
        page_no: 1,
        // 页面宽度
        page_size: 10,
        // 是否显示加载
        listLoading: false,
        tagColor: ['magenta', 'red', 'volcano', 'orange', 'gold', 'lime', 'green', 'cyan', 'blue', 'geekblue', 'purple'],
        organize:storageUtils.get(storageUtils.ORGANIZE_KEY),
        filters: {
            begin_time: null,// 搜索表单的开始时间
            end_time: null,// 搜索表单的结束时间
            topic: null // 主题
        },
    };


    /**
     * 初始化Table所有列的数组
     */
    initColumns = () => {
        this.columns = [
            {
                title: '作者',
                dataIndex: 'source', // 显示数据对应的属性名
                render:(value,row) => (extractUserName(this.state.organize, row.source))
            },
            {
                title: '标题',
                dataIndex: 'topic', // 显示数据对应的属性名
            },
            {
                title: '标签',
                render: (value, row) => {
                    const tags = row.label === null ? [] : (row.label).split(';')
                    if (tags.length > 0) {
                        return tags.map(this.forTagMap)
                    } else {
                        return ''
                    }
                },
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
                title: '管理',
                render: (text, record) => (
                    <div>
                        <Button type="primary" onClick={() => window.location.href = `./news/update?id=${record.id}`} shape="circle" icon={<EditOutlined/>}/>
                        &nbsp;
                        <Button type="danger" onClick={() => this.handleDellNews(record)}  shape="circle" icon={<DeleteOutlined/>}/>
                    </div>
                ),
            },
        ]
    };

    /**
     * 生成tag标签
     * @param tag
     * @returns {JSX.Element}
     */
    forTagMap = tag => {
        let colors = this.state.tagColor;
        const tagElem = (
            <Tag color={colors[Math.floor(Math.random() * 10)]}>
                {tag}
            </Tag>
        );
        return (<span key={tag} style={{display: 'inline-block'}}>{tagElem}</span>);
    };

    /**
     * 获取动态列表数据
     * @returns {Promise<void>}
     */
    getDatas = async () => {
        let para = {
            topic: this.state.filters.topic,
            page_no: this.state.page_no,
            page_size: this.state.page_size,
            begin_time: this.state.filters.begin_time,
            end_time: this.state.filters.end_time,
        };
        // 在发请求前, 显示loading
        this.setState({listLoading: true});
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await newsPageApi(para);
        // 在请求完成后, 隐藏loading
        this.setState({listLoading: false});
        if (code === 0) {
            this.setState({
                // 总数据量
                dataTotal: data.total_row,
                // 表格数据
                datas: data.records
            });
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    /**
     * 删除指定动态
     * @param item
     */
    handleDellNews = (item) => {
        let _this = this;
        Modal.confirm({
            title: '删除确认',
            content: `确认删除主题为:${item.topic}的动态吗?`,
            onOk: async () => {
                // 在发请求前, 显示loading
                _this.setState({listLoading: true});
                const {msg, code} = await deleteNewsApi(item.id);
                // 在请求完成后, 隐藏loading
                _this.setState({listLoading: false});
                if (code === 0) {
                    openNotificationWithIcon("success", "操作结果", "删除成功");
                    _this.getDatas();
                } else {
                    openNotificationWithIcon("error", "错误提示", msg);
                }
            }
        })
    };

    /**
     * 刷新
     */
    reloadPage = () => {
        // 重置查询条件
        let _this = this;
        let filters= _this.state.filters;
        filters.begin_time = null;
        filters.end_time = null;
        filters.topic = null;
        _this.setState({
            page_no: 1,
            filters: filters,
        }, function () {
            _this.getDatas()
        });
    };

    /**
     * 回调函数,改变页宽大小
     * @param page_size
     * @param current
     */
    changePageSize = (page_size, current) => {
        // react在生命周期和event handler里的setState会被合并（异步）处理,需要在回调里回去获取更新后的 state.
        this.setState({
            page_no: 1,
            page_size: page_size
        }, function () {
            this.getDatas();
        });
    };

    /**
     * 回调函数，页面发生跳转
     * @param current
     */
    changePage = (current) => {
        this.setState({
            page_no: current,
        }, function () {
            this.getDatas();
        });
    };

    /**
     * 日期选择发生变化
     * @param date
     * @param dateString
     */
    onChangeDate = (date, dateString) => {
        let _this = this;
        let {filters} = _this.state;
        // 为空要单独判断
        if (dateString[0] !== '' && dateString[1] !== ''){
            filters.begin_time = dateString[0];
            filters.end_time = dateString[1];
        }else{
            filters.begin_time = null;
            filters.end_time = null;
        }
        _this.setState({
            page_no: 1,
            filters
        }, function () {
            _this.getDatas()
        });
    };


    /**
     * 双向绑定用户查询主题
     * @param event
     */
    topicInputChange = (event) => {
        let _this = this;
        const value = event.target.value;
        let filters = _this.state.filters;
        filters.topic = value;
        _this.setState({
            page_no: 1,
            filters
        })
    };

    /**
     * 为第一次render()准备数据
     * 因为要异步加载数据，所以方法改为async执行
     */
    componentDidMount() {
        // 初始化表格属性设置
        this.initColumns();
        // 加载页面数据
        this.getDatas();
    }


    render() {
        // 读取状态数据
        const {datas, dataTotal, page_no, page_size, listLoading,filters} = this.state;
        let {begin_time,end_time,topic} = filters;
        let rangeDate;
        if (begin_time !== null && end_time !== null){
            rangeDate = [moment(begin_time),moment(end_time)]
        } else {
            rangeDate = [null,null]
        }
        return (
            <DocumentTitle title='动态'>
                <div className='child-container'>
                    <div className='header-tools'>
                        动态
                    </div>
                    <div className='child-content'>
                        <Col span={24} className="toolbar">
                            <Form layout="inline">
                                <Form.Item label="主题:">
                                    <Input type='text' value={topic} allowClear={true} onChange={this.topicInputChange}
                                           placeholder='按主题检索'/>
                                </Form.Item>
                                <Form.Item label="发布时间:">
                                    <RangePicker value={rangeDate} disabledDate={disabledDate} onChange={this.onChangeDate}/>
                                </Form.Item>
                                <Form.Item>
                                    <Button type="primary" htmlType="button" onClick={this.getDatas}>
                                        <SearchOutlined/>查询
                                    </Button>
                                </Form.Item>
                                <Form.Item>
                                    <Button type="primary" htmlType="button" onClick={this.reloadPage}>
                                        <ReloadOutlined/>重置
                                    </Button>
                                </Form.Item>
                                <Form.Item>
                                    <Button type="primary" htmlType="button">
                                        <Link to='/backstage/memory/news/create'><PlusOutlined/>发布</Link>
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Col>
                        <Col span={24} className="dataTable">
                            <Table size="middle" rowKey="id" bordered loading={listLoading} columns={this.columns} dataSource={datas}
                                   pagination={{
                                       current:page_no,
                                       showTotal: () => `当前第${page_no}页 共${dataTotal}条`,
                                       pageSize: page_size, showQuickJumper: true, total: dataTotal, showSizeChanger: true,
                                       onShowSizeChange: (current, page_size) => this.changePageSize(page_size, current),
                                       onChange: this.changePage,
                                   }}/>
                        </Col>
                    </div>
                </div>
            </DocumentTitle>
        );
    }
}

// 对外暴露
export default List;
