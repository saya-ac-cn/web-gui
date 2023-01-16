import React, {Component} from 'react';
import {Button, Col, Row, DatePicker, Menu, Table, Form, Modal, Tag, Select, Tooltip, Input} from "antd";
import {notePageApi, deleteNoteApi, noteBookListApi, deleteNoteBookApi} from "@/api";
import {openNotificationWithIcon} from "@/utils/window";
import {Link} from "react-router-dom";
import DocumentTitle from 'react-document-title'
import moment from 'moment';
import {
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    MenuOutlined,
    EllipsisOutlined,
    ReloadOutlined,
    SearchOutlined,
    LineOutlined,
    EyeOutlined,
    EyeInvisibleOutlined
} from "@ant-design/icons";
import './list.less'
import {disabledDate, extractUserName} from "@/utils/var"
import {getUrlParameter} from "@/utils/url"
import EditNoteBook from "./book";
import withRouter from '@/utils/withRouter'
import storageUtils from "@/utils/storageUtils";
/*
 * 文件名：list.jsx
 * 作者：liunengkai
 * 创建日期：2022-10-05 - 21:09
 * 描述：笔记列表
 * 注意：在本页面中，不显示笔记搜索框
 */
const {SubMenu} = Menu;
const {RangePicker} = DatePicker;
const {Option} = Select;

// 定义组件（ES6）
class NotesList extends Component {

    bookFormRef = React.createRef();

    constructor(props) {
        super(props);
        let _this = this
        // 提取参数
        const search = getUrlParameter('search', props.location.search);
        let state = {
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
            notebooks: [],
            notebookMap: {},
            organize:storageUtils.get(storageUtils.ORGANIZE_KEY),
        };
        if (!!search) {
            state.filters = {
                begin_time: null,// 搜索表单的开始时间
                end_time: null,// 搜索表单的结束时间
                topic: search, // 主题
                notebook_id: null
            }
        } else {
            state.filters = {
                begin_time: null,// 搜索表单的开始时间
                end_time: null,// 搜索表单的结束时间
                topic: null, // 主题
                notebook_id: null
            }
        }
        _this.state = state
    }


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
                        <Button type="primary"
                                onClick={() => window.location.href = `./note/update?id=${record.id}`}
                                shape="circle" icon={<EditOutlined/>}/>
                        &nbsp;
                        <Button type="danger" shape="circle" onClick={() => this.handleDeleteNotes(record)}
                                icon={<DeleteOutlined/>}/>
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
     * 获取笔记列表数据
     * @returns {Promise<void>}
     */
    getDatas = async () => {
        let para = {
            page_no: this.state.page_no,
            topic: this.state.filters.topic,
            notebook_id: this.state.filters.notebook_id,
            begin_time: this.state.filters.begin_time,
            end_time: this.state.filters.end_time,
            page_size: this.state.page_size,
        };
        // 在发请求前, 显示loading
        this.setState({listLoading: true});
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await notePageApi(para);
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
     * 得到笔记簿下拉选择列表数据
     */
    getNoteBooks = async () => {
        let _this = this;
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await noteBookListApi()
        // 在请求完成后, 隐藏loading
        // 所有的笔记簿一级选项
        let notebooks = [];
        // 所有的笔记簿二级选项
        let notebook_item = [];
        // 构建一个全部的选项
        const allSelectObject = <div style={{width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between"}}><span>全部</span></div>
        notebook_item.push({label: allSelectObject,key: 0})

        // 设置第一个为选中
        _this.noteBookSelect({key: 0})
        let notebookMap = {};
        if (code === 0) {
            let index = 0;
            for (let key in data) {
                let item = data[key];
                notebookMap[item.id] = item;
                const itemSelectObject = <div
                    style={{width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                        <span>{item.name}&nbsp;&nbsp;{(1 === item.status) ? <EyeOutlined style={{color: '#389e0d'}}/> :
                            <EyeInvisibleOutlined style={{color: '#ff4d4f'}}/>}</span>
                    <Tooltip placement="right" trigger='click' color='#fff' title={<div>
                        <Button type="primary" shape="circle" onClick={() => _this.handleModalGroupEdit(item)}
                                icon={<EditOutlined/>} size='small'/>&nbsp;
                        <Button type="primary" shape="circle" onClick={() => _this.handleDeleteNoteBook(item)}
                                icon={<LineOutlined/>} size='small' danger/>
                    </div>}>
                        <EllipsisOutlined/>
                    </Tooltip>
                </div>;
                notebook_item.push({label: itemSelectObject,key: item.id})
                index = index + 1
            }
            const submenu = {
                label: <span style={{float: "right"}}><PlusOutlined title='添加笔记簿'  onClick={this.handleModalGroupAdd}/></span>,
                key: -1,
                icon: <MenuOutlined title='展开/收起'/>,
                children: notebook_item,
            }
            notebooks.push(submenu)
            _this.setState({
                notebooks: notebooks,
                notebookMap: notebookMap
            })
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    }


    /**
     * 刷新
     */
    reloadPage = () => {
        // 重置查询条件
        let _this = this;
        let filters = _this.state.filters;
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

    // 回调函数,改变页宽大小
    changePageSize = (page_size, current) => {
        // react在生命周期和event handler里的setState会被合并（异步）处理,需要在回调里回去获取更新后的 state.
        this.setState({
            page_no: 1,
            page_size: page_size
        }, function () {
            this.getDatas();
        });
    };

    // 回调函数，页面发生跳转
    changePage = (current) => {
        this.setState({
            page_no: current,
        }, function () {
            this.getDatas();
        });
    };

    // 日期选择发生变化
    onChangeDate = (date, dateString) => {
        let _this = this;
        let {filters} = _this.state;
        // 为空要单独判断
        if (dateString[0] !== '' && dateString[1] !== '') {
            filters.begin_time = dateString[0];
            filters.end_time = dateString[1];
        } else {
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
     * 显示创建笔记簿的弹框
     */
    handleModalGroupAdd = (e) => {
        // 阻止默认的事件
        e.stopPropagation();
        this.bookFormRef.handleDisplay({});
    };

    /**
     * 显示修改笔记簿的弹框
     * @param value
     */
    handleModalGroupEdit = (value) => {
        this.bookFormRef.handleDisplay(value);
    };

    /**
     * 删除指定笔记簿
     * @param item
     */
    handleDeleteNoteBook = (item) => {
        let _this = this;
        let tips = '';
        if (item.notes_count > 0) {
            tips = `“${item.name}”笔记簿下还有：${item.notes_count}条笔记，您确认删除该笔记簿及该笔记簿下的所有笔记？`
        } else {
            tips = `您确认删除“${item.name}”空笔记簿？`
        }
        let alreadySelectBook = _this.state.alreadySelectBook;
        Modal.confirm({
            title: '删除确认',
            content: tips,
            cancelText: '再想想',
            okText: '不要啦',
            onOk: async () => {
                // 在发请求前, 显示loading
                _this.setState({listLoading: true});
                const {msg, code} = await deleteNoteBookApi(item.id);
                // 在请求完成后, 隐藏loading
                _this.setState({listLoading: false});
                if (code === 0) {
                    openNotificationWithIcon("success", "操作结果", "删除成功");
                    // 如果删除的笔记簿正好是当前选中的，则跳转到全部
                    if (alreadySelectBook === (item.id)) {
                        _this.setState({alreadySelectBook: 0});
                    }
                    _this.getNoteBooks();
                } else {
                    openNotificationWithIcon("error", "错误提示", msg);
                }
            }
        })
    };

    bindBookFormRef = (ref) => {
        this.bookFormRef = ref
    };

    refreshListFromBookForm = () => {
        this.getNoteBooks();
    };


    /**
     * 用户所选笔记簿发生改变
     * @param e
     */
    noteBookSelect = (e) => {
        let _this = this;
        let filters = _this.state.filters;
        if (!e || 0 === e.key) {
            // 看全部
            filters.notebook_id = null;
        } else {
            filters.notebook_id = e.key;
        }
        _this.setState({
            filters,
            alreadySelectBook: e.key,
            page_no: 1,
        }, function () {
            _this.getDatas()
        });
    };

    /**
     * 删除指定笔记
     * @param item
     */
    handleDeleteNotes = (item) => {
        let _this = this;
        Modal.confirm({
            title: '删除确认',
            content: `确认删除主题为:${item.topic}的笔记吗?`,
            onOk: async () => {
                // 在发请求前, 显示loading
                _this.setState({listLoading: true});
                const {msg, code} = await deleteNoteApi(item.id);
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
     * 为第一次render()准备数据
     * 因为要异步加载数据，所以方法改为async执行
     */
    componentDidMount() {
        // 初始化表格属性设置
        this.initColumns();
        // 初始化用户笔记簿数据
        this.getNoteBooks()
        // // 加载页面数据
        // this.getDatas();
    };

    render() {
        // 读取状态数据
        const {datas, dataTotal, page_no, page_size, listLoading, filters, notebooks, alreadySelectBook} = this.state;
        let {begin_time, end_time, topic} = filters;
        let rangeDate;
        if (begin_time !== null && end_time !== null) {
            rangeDate = [moment(begin_time), moment(end_time)]
        } else {
            rangeDate = [null, null]
        }
        return (
            <DocumentTitle title="笔记">
                <div className='child-container'>
                    <div className='header-tools'>
                        笔记
                    </div>
                    <div className='child-content bv1-notes-list'>
                        <EditNoteBook onRef={this.bindBookFormRef.bind(this)} refreshList={this.refreshListFromBookForm}/>
                        <Row className="note-data">
                            <Col span={5} className="tree-area">
                                <Menu mode="inline"
                                      defaultSelectedKeys={[alreadySelectBook ? alreadySelectBook : 0]}
                                      defaultOpenKeys={['-1']} onSelect={this.noteBookSelect} items={notebooks}>
                                </Menu>
                            </Col>
                            <Col span={19} className="table-area">
                                <Row>
                                    <Col span={24} className="toolbar">
                                        <Form layout="inline">
                                            <Form.Item label="主题:">
                                                <Input type='text' value={topic} allowClear={true}
                                                       onChange={this.topicInputChange}
                                                       placeholder='按主题检索'/>
                                            </Form.Item>
                                            <Form.Item label="添加时间:">
                                                <RangePicker value={rangeDate} disabledDate={disabledDate}
                                                             onChange={this.onChangeDate}/>
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
                                                    <Link to='/backstage/memory/note/create'><PlusOutlined/>发布</Link>
                                                </Button>
                                            </Form.Item>
                                        </Form>
                                    </Col>
                                    <Col span={24} className="dataTable">
                                        <Table size="middle" rowKey="id" loading={listLoading} bordered
                                               columns={this.columns} dataSource={datas}
                                               pagination={{
                                                   current: page_no,
                                                   showTotal: () => `当前第${page_no}页 共${dataTotal}条`,
                                                   pageSize: page_size,
                                                   showQuickJumper: true,
                                                   total: dataTotal,
                                                   showSizeChanger: true,
                                                   onShowSizeChange: (current, page_size) => this.changePageSize(page_size, current),
                                                   onChange: this.changePage,
                                               }}/>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </div>
                </div>
            </DocumentTitle>
        );
    }
}

// 对外暴露
export default withRouter(NotesList);
