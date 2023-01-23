import React, {Component} from 'react';
import {Col, Modal, Row, Table} from 'antd';
import {generalJournalListApi} from "@/api";
import {openNotificationWithIcon, showLoading} from "@/utils/window";
import {formatMoney} from '@/utils/var'
import moment from 'moment';
/*
 * 文件名：detail.jsx
 * 作者：saya
 * 创建日期：2022/10/6 - 下午1:59
 * 描述：账单详情
 */

/**
 * 由于在调用浏览器的打印功能时，会丢失外部的css样式，针对这个问题，统一写成内联样式
 */
const detailHeader = {
    'height': '5em',
    'display': 'flex',
    'alignItems': 'center',
    'justifyItems': 'center',
    'textAlign': 'center',
    'fontSize': '1.4em'
};

const detailTradeNumber = {
    'display': 'flex',
    'alignItems': 'center',
    'justifyItems': 'left',
    'textAlign': 'left',
    'fontSize': '1.1em'
};

const detailTradeDate = {
    'height': '4em',
    'display': 'flex',
    'alignItems': 'center',
    'justifyItems': 'left',
    'textAlign': 'left',
    'fontSize': '1.1em',
};

const inputLabel = {
    'fontWeight': 'bold'
};

const tableFooter = {
    'fontSize': '0.4em'
};

const detailGrid = {
    'marginTop': '1em',
    'marginBottom': '1em'
};

// 定义组件（ES6）
class JournalDetail extends Component {

    state = {
        // 流水
        journal: null,
        // 流水明细
        generalJournal: [],
        // 是否显示加载
        listLoading: false,
        visibleModal: false
    };

    /**
     * 初始化Table所有列的数组
     */
    initColumns = () => {
        this.columns = [
            {
                title: '编号',
                dataIndex: 'id', // 显示数据对应的属性名
                align: 'center',
            },
            {
                title: '用户',
                render: () => (!this.state.journal ? '-' : this.state.journal.source_name),
                align: 'center',
            },
            {
                title: '交易类型',
                align: 'center',
                render: (text, record) => {
                    if (record.flag === '1') {
                        return '收入'
                    } else if (record.flag === '2') {
                        return '支出'
                    } else {
                        return '未知'
                    }
                }
            },
            {
                title: '交易说明',
                dataIndex: 'remarks', // 显示数据对应的属性名
            },
            {
                title: '交易金额',
                dataIndex: 'amount', // 显示数据对应的属性名
                align: 'right',
                render: (value, row) => (formatMoney(row.amount))
            }
        ]
    };

    /**
     * 获取财政列表数据
     * @returns {Promise<void>}
     */
    getDatas = async () => {
        let para = {
            id: this.state.journal.id
        };
        // 在发请求前, 显示loading
        this.setState({listLoading: showLoading()});
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await generalJournalListApi(para);
        // 在请求完成后, 隐藏loading
        this.setState({listLoading: false});
        if (code === 0) {
            this.setState({
                generalJournal: data
            });
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    /**
     * 关闭弹窗
     */
    handleCancel = () => {
        this.setState({visibleModal: false});
    };

    /**
     * 打印
     */
    handlePrint = () => {
        window.document.body.innerHTML = window.document.getElementById('journal-details').innerHTML;
        window.print();
        window.location.reload();
    };

    /**
     * 由父页面发起打开弹窗
     * @param journal
     */
    handleDisplay = (journal) => {
        let _this = this;
        _this.setState({
            journal: journal,
            visibleModal: true
        }, function () {
            // 执行初始化加载页面数据
            _this.getDatas()
        });
    };


    /**
     * 初始化页面配置信息
     */
    componentDidMount() {
        // 初始化表格属性设置
        this.initColumns();
        // 加载页面数据
        const _this = this;
        _this.props.onRef(_this);
    };

    render() {
        const {generalJournal, journal, listLoading, visibleModal} = this.state;
        return (
            <Modal
                title='收支详情'
                width="80%"
                open={visibleModal}
                maskClosable={false}
                onOk={() => this.handlePrint()}
                onCancel={() => this.handleCancel()}
                cancelText='取消'
                okText='打印'>
                <section className='journal-details' id='journal-details'>
                    <Row style={detailHeader}>
                        <Col span={12} offset={6}>
                            {!journal || !journal.archive_date ? '-' : moment(journal.archive_date).format('YYYY年MM月DD日')}收支明细
                        </Col>
                    </Row>
                    <Row style={detailTradeNumber}>
                        <Col span={5} offset={19}>
                            <span style={inputLabel}>收支单号：</span>{!journal ? '-' : journal.id}
                        </Col>
                    </Row>
                    <Row style={detailTradeDate}>
                        <Col span={5} offset={19}>
                            <span
                                style={inputLabel}>交易日期：</span>{!journal ? '-' : moment(journal.archive_date).format('YYYY年MM月DD日')}
                        </Col>
                    </Row>
                    <Row gutter={[12, 12]}>
                        <Col span={8}>
                            <div><span style={inputLabel}>收支总额：</span>{formatMoney(!journal ? '-' : journal.total)}
                            </div>
                        </Col>
                        <Col span={8}>
                            <div><span style={inputLabel}>收入总额：</span>{formatMoney(!journal ? '-' : journal.income)}
                            </div>
                        </Col>
                        <Col span={8}>
                            <div><span style={inputLabel}>支出总额：</span>{formatMoney(!journal ? '-' : journal.outlay)}
                            </div>
                        </Col>
                        <Col span={8}>
                            <div><span
                                style={inputLabel}>交易方式：</span>{!journal || !journal.payment_means_name ? '-' : journal.payment_means_name}
                            </div>
                        </Col>
                        <Col span={8}>
                            <div><span
                                style={inputLabel}>交易币种：</span>{!journal || !journal.monetary_name ? '-' : journal.monetary_name}
                            </div>
                        </Col>
                        <Col span={8}>
                            <div><span
                                style={inputLabel}>交易摘要：</span>{!journal || !journal.abstracts_name ? '-' : journal.abstracts_name}
                            </div>
                        </Col>
                        <Col span={24}>
                            <div><span
                                style={inputLabel}>交易附言：</span>{!journal || !journal.remarks ? '-' : journal.remarks}
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <Table size="middle" style={detailGrid} rowKey="id" bordered pagination={false}
                                   loading={listLoading} columns={this.columns} dataSource={generalJournal}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col style={tableFooter} span={6}>
                            <div><span style={inputLabel}>填报人：</span>{!journal ? '-' : journal.source_name}</div>
                        </Col>
                        <Col style={tableFooter} span={6}>
                            <div><span
                                style={inputLabel}>填报时间：</span>{!journal || !journal.create_time ? '-' : moment(journal.create_time).format('YYYY年MM月DD日 HH:mm:ss')}
                            </div>
                        </Col>
                        <Col style={tableFooter} span={6}>
                            <div><span
                                style={inputLabel}>最后修改时间：</span>{!journal || !journal.update_time ? '-' : moment(journal.update_time).format('YYYY年MM月DD日 HH:mm:ss')}
                            </div>
                        </Col>
                        <Col style={tableFooter} span={6}>
                            <div><span style={inputLabel}>打印时间：</span>{moment().format('YYYY年MM月DD日 HH:mm:ss')}</div>
                        </Col>
                    </Row>
                </section>
            </Modal>
        );
    }
}

// 对外暴露
export default JournalDetail;
