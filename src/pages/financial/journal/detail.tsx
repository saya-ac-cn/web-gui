import React, {forwardRef, useImperativeHandle, useState} from 'react';
import {Button, Col, Drawer, Row, Space, Table} from 'antd';
import {generalJournalListApi} from "@/http/api";
import {openNotificationWithIcon} from "@/utils/window";
import {formatMoney} from '@/utils/var'
import moment from 'moment';

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
    // 'fontSize': '0.4em'
};

const detailGrid = {
    'marginTop': '1em',
    'marginBottom': '1em'
};


const JournalDetail = (props,ref) => {

    const [journal,setJournal] = useState({id:null,archive_date:null,total:null,income:null,outlay:null,payment_means_name:null,monetary_name:null,abstracts_name:null,remarks:null,source_name:null,create_time:null,update_time:null,})
    const [generalJournal,setGeneralJournal] = useState([])
    const [loading,setLoading] = useState(false)
    const [open, setOpen] = useState<boolean>(false);

    useImperativeHandle(ref,()=>({
        handleDisplay
    }))

    /**
     * 初始化Table所有列的数组
     */
    const columns = [
        {
            title: '编号',
            dataIndex: 'id', // 显示数据对应的属性名
            align: 'center',
        },
        {
            title: '用户',
            render: () => (!journal ? '-' : journal.source_name),
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

    /**
     * 获取财政列表数据
     * @returns {Promise<void>}
     */
    const getData = async (id) => {
        let para = {
            id: id
        };
        // 在发请求前, 显示loading
        setLoading(true);
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await generalJournalListApi(para).catch(()=>{setLoading(false)});
        // 在请求完成后, 隐藏loading
        setLoading(false);
        if (code === 0) {
            setGeneralJournal(data)
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    /**
     * 关闭弹窗
     */
    const handleCancel = () => {
        setOpen(false);
    };

    /**
     * 打印
     */
    const handlePrint = () => {
        window.document.body.innerHTML = window.document.getElementById('journal-details').innerHTML;
        window.print();
        window.location.reload();
    };

    /**
     * 由父页面发起打开弹窗
     * @param journal
     */
    const handleDisplay = (journal) => {
        setOpen(true);
        setJournal(journal);
        getData(journal.id);
    };

    return (
        <Drawer title='收支详情' width='80%' forceRender onClose={handleCancel} open={open} bodyStyle={{ paddingBottom: 80 }} maskClosable={false}
                footer={
                    <Space>
                        <Button onClick={handleCancel}>取消</Button>
                        <Button onClick={handlePrint} type="primary">打印</Button>
                    </Space>
                }
        >
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
                               loading={loading} columns={columns} dataSource={generalJournal}/>
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
        </Drawer>
    )
}

// 对外暴露
export default forwardRef(JournalDetail);
