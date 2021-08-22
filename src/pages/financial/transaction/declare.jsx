import React, {Component } from 'react';
import {Row, Col, Input, InputNumber, Table, DatePicker, Tooltip, Popconfirm, Select, List, Modal} from 'antd';
import {PlusOutlined,CloseOutlined,ExclamationCircleOutlined} from '@ant-design/icons';
import memoryUtils from "../../../utils/memoryUtils";
import './detail.less'
import {Redirect} from "react-router-dom";
import {openNotificationWithIcon} from "../../../utils/window";
import {getFinancialType, getFinancialAmount, applyTransaction} from "../../../api";
import {formatMoney} from '../../../utils/var'
import moment from 'moment';
/*
 * 文件名：declare.jsx
 * 作者：saya
 * 创建日期：2021/1/3 - 下午5:38
 * 描述：收支申报
 */
const {Option} = Select;
// 定义组件（ES6）
class Declare extends Component {
  state = {
    visibleModal:false,
    // 是否显示加载
    listLoading: false,
    financialType:[],
    financialAmount:[],
    currentUser:'',
    bill: {
      tradeType:null,
      transactionAmount:null,
      tradeDate: null,
      currencyNumber:0.0,
      deposited:0.0,
      expenditure:0.0
    },
    infoList: [{
      index:1,
      flog: 1,
      source: null,
      currencyNumber: 0,
      currencyDetails: ''
    }]
  };

  /**
   * 初始化Table所有列的数组
   */
  initColumns = () => {
    this.columns = [
      {
        title: '序号',
        render: (text, record,index) => (index+1),
        align:'center',
      },
      {
        title: '用户',
        dataIndex: 'source',
        render:(value) => (!value ? this.state.currentUser:value),
        align:'center',
      },
      {
        title: '交易类型',
        dataIndex: 'flog', // 显示数据对应的属性名
        align:'center',
        render: (text, record, index) => {
          return <Select value={text} bordered={false} onChange={(e) => this.onChangeFlag(e,index)}>
            <Option value={1}>收入</Option>
            <Option value={2}>支出</Option>
          </Select>
        }
      },
      {
        title: '交易说明',
        dataIndex: 'currencyDetails', // 显示数据对应的属性名
        editable: true,
        render: (text, record, index) => {
          return <Input type="text" value={text} maxLength={15} bordered={false} onChange={(e) => this.inputChange(e, record, index, 'currencyDetails')}/>
        }
      },
      {
        title: '交易金额（元）',
        dataIndex: 'currencyNumber', // 显示数据对应的属性名
        align:'right',
        render: (text, record, index) => {
          return <InputNumber value={text} className='input-currencyNumber' ordered={false} min={0} parser={value => value.replace(/\s?|(,*)/g, '')} onChange={(e) => this.inputChange(e, record, index, 'currencyNumber')}/>
        }
      },
      {
        title: '操作',
        align:'center',
        render: (text, record,index) =>
          this.state.infoList.length > 1 ? (
            <Popconfirm title="确定删除?" onConfirm={() => this.deleteLine(index)}>
              <CloseOutlined/>
            </Popconfirm>
          ) : <Tooltip placement="left" title="填报的明细必须要有1条以上">
            <ExclamationCircleOutlined/>
          </Tooltip>,
      },
    ]
  };

  /**
   * 继续添加财政明细
   */
  continueAdd = () => {
    let {infoList,currentUser} = this.state;
    let item = {
      index:infoList[infoList.length-1].index+1,
      flog: 1,
      source:currentUser,
      currencyNumber: 0,
      currencyDetails: ''
    };
    infoList = infoList.concat(item);
    this.setState({infoList})
  };

  /**
   * 删除明细添加行
   * @param index
   */
  deleteLine = (index) => {
    const _this = this;
    let infoList = _this.state.infoList;
    if(infoList.length === 1){
      openNotificationWithIcon("error", "错误提示", '每一笔流水申请下边必须要有一条详情记录');
    }else{
      infoList = infoList.filter((item, key) => key !== index);
      _this.setState({ infoList },function () {
        _this.renewList()
      });
    }
  };

  /**
   * input改变事件
   * @param e
   * @param record
   * @param index
   * @param field
   */
  inputChange = (e, record, index, field) => {
    const _this = this;
    let { infoList } = _this.state;
    if ('currencyNumber' === field){
      // 修改了交易金额
      // 对于 InputNumber 类型的输入框需要另类处理
      let currencyNumber = e;
      if (typeof(currencyNumber) === "string"){
        currencyNumber = currencyNumber.replace(/[^0-9.]/ig,"");
      }
      // 替换后再次检查
      if ('' === currencyNumber) {
        currencyNumber = 0;
      }
      // 核对本次修改了值和上次是否一致，如果不一致需要触发重新计算
      if(infoList[index].currencyNumber !== currencyNumber){
        infoList[index].currencyNumber = currencyNumber
      }
      infoList[index].currencyNumber = currencyNumber;
      _this.setState({ infoList },function () {
        _this.renewList()
      });
    }else{
      // 修改了摘要
      infoList[index][field] = (e.target.value).replace(/(^\s*)|(\s*$)/g, '');
      _this.setState({ infoList })
    }
  };

  /**
   * 交易类型改变事件
   * @param value
   * @param index
   */
  onChangeFlag = (value,index) => {
    let _this = this;
    let { infoList } = this.state;
    if (infoList[index].flog !== value){
      infoList[index].flog = value;
      _this.setState({infoList},function () {
        _this.renewList()
      });
    }
  };

  /**
   * 获取所有的支付类别
   */
  initFinancialType = async () => {
    let _this = this;
    // 发异步ajax请求, 获取数据
    const {msg, code, data} = await getFinancialType();
    if (code === 0) {
      let type = [];
      data.forEach(item => {
        type.push((<Option key={item.id} value={item.id}>{item.transactionType}</Option>));
      });
      _this.setState({
        financialType: type
      })
    } else {
      openNotificationWithIcon("error", "错误提示", msg);
    }
  };

  /**
   * 获取所有的交易摘要
   */
  initFinancialAmount = async () => {
    let _this = this;
    // 发异步ajax请求, 获取数据
    const {msg, code, data} = await getFinancialAmount();
    if (code === 0) {
      let type = [];
      data.forEach(item => {
        type.push((<Option key={item.id} value={item.id}>{item.tag}</Option>));
      });
      _this.setState({
        financialAmount: type
      })
    } else {
      openNotificationWithIcon("error", "错误提示", msg);
    }
  };

  /**
   * 支付类型 或者 摘要 选择框改变事件
   * @param value
   * @param field
   */
  onChangeTypeAmount = (value,field) => {
    let _this = this;
    let { bill } = this.state;
    bill[field] = value;
    _this.setState({bill});
  };

  handleCancel = () => {
    this.setState({visibleModal: false});
  };

  handleDisplay = () => {
    let _this = this;
    _this.setState({
      visibleModal: true
    });
  };

  /**
   * 只能选择今天及其以前的日期
   * @param current
   * @returns {*|boolean}
   */
  disabledDate = (current) => {
    return current && current > moment();
  };

  /**
   * 申报时间改变事件
   * @param date
   * @param dateString
   */
  tradeDateChange = (date, dateString) => {
    const _this = this;
    let { bill } = _this.state;
    bill.tradeDate = date;//!dateString?null:moment(dateString);
    _this.setState({bill});
  };

  /**
   * 更新列表数据
   */
  renewList = () => {
    let _this = this;
    let { infoList,bill } = _this.state;
    let currencyNumber = 0.0;
    let deposited = 0.0;
    let expenditure = 0.0;
    infoList.forEach(item => {
      if(1 === item.flog){
        deposited += item.currencyNumber;
      }else{
        expenditure += item.currencyNumber;
      }
      currencyNumber += item.currencyNumber;
    });
    bill.currencyNumber = currencyNumber;
    bill.deposited = deposited;
    bill.expenditure = expenditure;
    _this.setState({bill})
  };

  /**
   * 递交申请
   */
  handleApply = async () => {
    const _this = this;
    let { infoList,bill } = _this.state;
    if (!bill.tradeDate) {
      openNotificationWithIcon("warning", "提示", '请选择交易日期');
      return
    }
    //bill.tradeDate = (bill.tradeDate).toString();
    if (!bill.tradeType) {
      openNotificationWithIcon("warning", "提示", '请选择交易方式');
      return
    }
    if (!bill.transactionAmount) {
      openNotificationWithIcon("warning", "提示", '请选择交易摘要');
      return
    }
    for(let index = 0 ;index < infoList.length; index++){
      let item = infoList[index];
      if(!item.currencyDetails){
        openNotificationWithIcon("warning", "提示", `您在第${item.index}行的摘要还未填写`);
        return
      }
      if(item.currencyNumber <= 0){
        openNotificationWithIcon("warning", "提示", `在您填写的第${item.index}行中，发现无效的交易金额(交易金额必须大于0)`);
        return
      }
    }
    let param = {
      tradeType: bill.tradeType,
      tradeDate: (bill.tradeDate).format('YYYY-MM-DD'),
      transactionAmount: bill.transactionAmount,
      infoList: infoList
    };
    const {msg, code} = await applyTransaction(param);
    if (code === 0) {
      _this.resetForm();
      _this.props.refreshList();
      openNotificationWithIcon("success", "操作结果", "申报成功");
      _this.handleCancel();
    } else {
      openNotificationWithIcon("error", "错误提示", msg);
    }
  };

  /**
   * 重置表单
   */
  resetForm = () => {
    const bill = {
      tradeType:null,
          transactionAmount:null,
          tradeDate: null,
          currencyNumber:0.0,
          deposited:0.0,
          expenditure:0.0
    };
    const infoList =[{
      index:1,
      flog: 1,
      currencyNumber: 0,
      currencyDetails: ''
    }];
    this.setState({bill,infoList})
  };


  /**
   * 初始化页面配置信息
   */
  componentDidMount() {
    // 初始化表格属性设置
    this.initColumns();
    this.props.onRef(this);
    this.initFinancialType();
    this.initFinancialAmount();
    const user = memoryUtils.user;
    // 如果内存没有存储user ==> 当前没有登陆
    if (!user || !user.user) {
      // 自动跳转到登陆(在render()中)
      return <Redirect to='/login'/>
    }
    this.setState({currentUser:user.user.user})
  };


  render() {
    const {visibleModal,bill, listLoading,infoList,financialType,financialAmount} = this.state;
    return (
        <Modal
            title="流水申报"
            width="80%"
            visible={visibleModal}
            okText='申报'
            maskClosable={false}
            onCancel={() => this.handleCancel()}
            onOk={this.handleApply}>
          <section className="transaction-detail">
            <Row className='detail-addLine'>
              <Col span={6} offset={18}>
                <Tooltip placement="left" title="添加1行">
                  <PlusOutlined onClick={this.continueAdd}/>
                </Tooltip>
              </Col>
            </Row>
            <Row className="detail-header">
              <Col span={12} offset={6}>
                收支明细
              </Col>
            </Row>
            <Row className="detail-tradeDate">
              <Col span={5} offset={19}>
                <span className='input-label'>交易日期：</span><DatePicker value={bill.tradeDate} disabledDate={this.disabledDate} onChange={this.tradeDateChange} bordered={false} format={"YYYY-MM-DD"} placeholder="交易日期"/>
              </Col>
            </Row>
            <Row gutter={[12, 12]}>
              <Col className="gutter-row" span={8}>
                <div><span className='input-label'>收支总额：</span>{formatMoney(!bill?0:bill.currencyNumber)}元</div>
              </Col>
              <Col className="gutter-row" span={8}>
                <div><span className='input-label'>收入总额：</span>{formatMoney(!bill?0:bill.deposited)}元</div>
              </Col>
              <Col className="gutter-row" span={8}>
                <div><span className='input-label'>支出总额：</span>{formatMoney(!bill?0:bill.expenditure)}元</div>
              </Col>
              <Col className="gutter-row" span={8}>
                <div>
                  <span className='input-label'>交易方式：</span>
                  <Select value={bill.tradeType} className='declare-select' bordered={false} onChange={(e) => this.onChangeTypeAmount(e,'tradeType')}>
                    {financialType}
                  </Select>
                </div>
              </Col>
              <Col className="gutter-row" span={8}>
                <div>
                  <span className='input-label'>交易摘要：</span>
                  <Select value={bill.transactionAmount} className='declare-select' bordered={false} onChange={(e) => this.onChangeTypeAmount(e,'transactionAmount')}>
                    {financialAmount}
                  </Select>
                </div>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Table size="middle" className='detail-grid' rowKey="index" bordered pagination={false} loading={listLoading} columns={this.columns} dataSource={!infoList?null:infoList}/>
              </Col>
            </Row>
            <Row>
              <List size="small" split={false} header={'注意：'}>
                <List.Item>1、请依次从第一条开始，逐上而下填写，中间不要跳过空白行；</List.Item>
                <List.Item>2、同一天可以申报多次；</List.Item>
                <List.Item>3、同一笔流水申请只能对应一种交易方式；</List.Item>
                <List.Item>4、一笔流水下面必须有一条交易明细，最多不超过十条；</List.Item>
              </List>
            </Row>
          </section>
        </Modal>
    );
  }
}

// 对外暴露
export default Declare;
