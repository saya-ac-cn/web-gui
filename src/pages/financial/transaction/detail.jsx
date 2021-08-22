import React, { Component } from 'react';
import {Row, Col, Table, Modal} from 'antd';
import {getTransactionDetail} from "../../../api";
import {openNotificationWithIcon,showLoading} from "../../../utils/window";
import {formatMoney} from '../../../utils/var'
import moment from 'moment';
/*
 * 文件名：detail.jsx
 * 作者：saya
 * 创建日期：2021/1/3 - 下午1:59
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
  'fontSize':'0.4em'
};

const detailGrid = {
  'paddingBottom': '0.5em'
};

// 定义组件（ES6）
class BillDetail extends Component {

  state = {
    // 返回的账单数据
    bill: null,
    // 是否显示加载
    listLoading: false,
    tradeId: -1,
    visibleModal:false
  };

  /**
  * 初始化Table所有列的数组
  */
  initColumns = () => {
    this.columns = [
      {
        title: '编号',
        dataIndex: 'id', // 显示数据对应的属性名
        align:'center',
      },
      {
        title: '用户',
        render:() => (!this.state.bill?'-':this.state.bill.source),
        align:'center',
      },
      {
        title: '交易类型',
        align:'center',
        render: (text, record) => {
          if (record.flog === 1) {
            return '收入'
          } else if (record.flog === 2) {
            return '支出'
          } else {
            return '未知'
          }
        }
      },
      {
        title: '交易说明',
        dataIndex: 'currencyDetails', // 显示数据对应的属性名
      },
      {
        title: '交易金额（元）',
        dataIndex: 'currencyNumber', // 显示数据对应的属性名
        align:'right',
        render:(value,row) => (formatMoney(row.currencyNumber))
      }
    ]
  };

  /**
   * 获取财政列表数据
   * @returns {Promise<void>}
   */
  getDatas = async () => {
    let para = {
      tradeId: this.state.tradeId
    };
    // 在发请求前, 显示loading
    this.setState({listLoading: showLoading()});
    // 发异步ajax请求, 获取数据
    const {msg, code, data} = await getTransactionDetail(para);
    // 在请求完成后, 隐藏loading
    this.setState({listLoading: false});
    if (code === 0) {
      this.setState({
        bill: data
      });
    } else {
      openNotificationWithIcon("error", "错误提示", msg);
    }
  };

  handleCancel = () => {
    this.setState({visibleModal: false});
  };

  handlePrint = () => {
    window.document.body.innerHTML = window.document.getElementById('billDetails').innerHTML;
    window.print();
    window.location.reload();
  };

  handleDisplay = (val) => {
    let _this = this;
    _this.setState({
      tradeId: val,
      visibleModal: true
    },function () {
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
    _this.setState({bill:null})
  };

  render() {
    const {tradeId, bill, listLoading,visibleModal} = this.state;
    return (
        <Modal
            title='收支详情'
            width="80%"
            visible={visibleModal}
            onOk={() => this.handlePrint()}
            onCancel={() => this.handleCancel()}
            cancelText='取消'
            okText='打印'>
          <section className="transaction-detail" id='billDetails'>
            <Row style={detailHeader}>
              <Col span={12} offset={6}>
                {!bill||!bill.tradeDate?'-':moment(bill.tradeDate).format('YYYY年MM月DD日')}收支明细
              </Col>
            </Row>
            <Row style={detailTradeNumber}>
              <Col span={5} offset={19}>
                <span style={inputLabel}>收支单号：</span>{tradeId}
              </Col>
            </Row>
            <Row style={detailTradeDate}>
              <Col span={5} offset={19}>
                <span style={inputLabel}>交易日期：</span>{!bill?'-':moment(bill.tradeDate).format('YYYY年MM月DD日')}
              </Col>
            </Row>
            <Row gutter={[12, 12]}>
              <Col span={8}>
                <div><span style={inputLabel}>收支总额：</span>{formatMoney(!bill?0:bill.currencyNumber)}元</div>
              </Col>
              <Col span={8}>
                <div><span style={inputLabel}>收入总额：</span>{formatMoney(!bill?0:bill.deposited)}元</div>
              </Col>
              <Col span={8}>
                <div><span style={inputLabel}>支出总额：</span>{formatMoney(!bill?0:bill.expenditure)}元</div>
              </Col>
              <Col span={8}>
                <div><span style={inputLabel}>交易方式：</span>{!bill||!bill.tradeTypeEntity?'-':bill.tradeTypeEntity.transactionType}</div>
              </Col>
              <Col span={8}>
                <div><span style={inputLabel}>交易摘要：</span>{!bill||!bill.tradeAmountEntity?'-':bill.tradeAmountEntity.tag}</div>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Table size="middle" style={detailGrid} rowKey="id" bordered pagination={false} loading={listLoading} columns={this.columns} dataSource={!bill?null:bill.infoList}/>
              </Col>
            </Row>
            <Row>
              <Col style={tableFooter} span={6}>
                <div><span style={inputLabel}>填报人：</span>{!bill?'-':bill.source}</div>
              </Col>
              <Col style={tableFooter} span={6}>
                <div><span style={inputLabel}>填报时间：</span>{!bill||!bill.createTime?'-':moment(bill.createTime).format('YYYY年MM月DD日 HH:mm:ss')}</div>
              </Col>
              <Col style={tableFooter} span={6}>
                <div><span style={inputLabel}>最后修改时间：</span>{!bill||!bill.updateTime?'-':moment(bill.updateTime).format('YYYY年MM月DD日 HH:mm:ss')}</div>
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
export default BillDetail;
