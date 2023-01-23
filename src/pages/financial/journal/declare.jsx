import React, {Component } from 'react';
import {Row, Col, Input, InputNumber, Table, DatePicker, Tooltip, Popconfirm, Select, List, Modal} from 'antd';
import {PlusOutlined,CloseOutlined,ExclamationCircleOutlined} from '@ant-design/icons';
import './detail.less'
import {openNotificationWithIcon} from "@/utils/window";
import {paymentMeansListApi, abstractsApi, addJournalApi, monetaryListApi} from "@/api";
import {formatMoney,deepClone,accAdd} from '@/utils/var'
import moment from 'moment';
import storageUtils from "@/utils/storageUtils";
/*
 * 文件名：declare.jsx
 * 作者：saya
 * 创建日期：2022/10/06 - 下午5:38
 * 描述：收支申报
 */
const {Option} = Select;
// 定义组件（ES6）
class Declare extends Component {
  state = {
    visibleModal:false,
    // 是否显示加载
    listLoading: false,
    // 下拉选框准备
    paymentMeans:[],
    abstracts:[],
    monetary:[],
    currentUser:'',
    journal: {
      monetary_id:null,
      means_id:null,
      abstract_id:null,
      remarks:null,
      archive_date: null,
      total:0.0,
      income:0.0,
      outlay:0.0
    },

    infoList: [{
      index:1,
      flag: '1',
      source: null,
      amount: 0,
      remarks: ''
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
        dataIndex: 'flag', // 显示数据对应的属性名
        align:'center',
        render: (text, record, index) => {
          return <Select value={text} bordered={false} onChange={(e) => this.onChangeFlag(e,index)}>
            <Option value={'1'}>收入</Option>
            <Option value={'2'}>支出</Option>
          </Select>
        }
      },
      {
        title: '交易说明',
        dataIndex: 'remarks', // 显示数据对应的属性名
        editable: true,
        render: (text, record, index) => {
          return <Input type="text" value={text} maxLength={15} bordered={false} onChange={(e) => this.inputChange(e, record, index, 'remarks')}/>
        }
      },
      {
        title: '交易金额',
        dataIndex: 'amount', // 显示数据对应的属性名
        align:'right',
        render: (text, record, index) => {
          return <InputNumber value={text} bordered={false} precision={2} stringMode={true} className='input-amount' min={0} parser={value => value.replace(/\s?|(,*)/g, '')} onChange={(e) => this.inputChange(e, record, index, 'amount')}/>
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
      flag: '1',
      source:currentUser,
      amount: 0.0,
      remarks: ''
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
    let infos = _this.state.infoList;
    // 对象数组是引用方式 ,对于react来说它的值都是地址(涉及到tree diff)，因为没有被重新赋值(地址没有改变)，所以 react 会认为仍然是之前的元素(element)，则不更新视图。
    const infoList = deepClone(infos);

    if ('amount' === field){
      // 修改了交易金额
      // 对于 InputNumber 类型的输入框需要另类处理
      let amount = e;
      if (typeof(amount) === "string"){
        amount = amount.replace(/[^0-9.]/ig,"");
      }
      // 替换后再次检查
      if ('' === amount) {
        amount = 0;
      }
      // 核对本次修改了值和上次是否一致，如果不一致需要触发重新计算
      if(infoList[index].amount !== amount){
        infoList[index].amount = amount
      }
      infoList[index].amount = amount;
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
    let infos = _this.state.infoList;
    // 对象数组是引用方式 ,对于react来说它的值都是地址(涉及到tree diff)，因为没有被重新赋值(地址没有改变)，所以 react 会认为仍然是之前的元素(element)，则不更新视图。
    const infoList = deepClone(infos);
    if (infoList[index].flag !== value){
      infoList[index].flag = value;
      _this.setState({infoList},function () {
        _this.renewList()
      });
    }
  };

  /**
   * 获取所有的支付类别
   */
  initPaymentMeans = async () => {
    let _this = this;
    // 发异步ajax请求, 获取数据
    const {msg, code, data} = await paymentMeansListApi();
    if (code === 0) {
      let type = [];
      data.forEach(item => {
        type.push((<Option key={item.id} value={item.id}>{item.name}</Option>));
      });
      _this.setState({
        paymentMeans: type
      })
    } else {
      openNotificationWithIcon("error", "错误提示", msg);
    }
  };

  /**
   * 获取所有的交易摘要
   */
  initAbstracts = async () => {
    let _this = this;
    // 发异步ajax请求, 获取数据
    const {msg, code, data} = await abstractsApi();
    if (code === 0) {
      let type = [];
      data.forEach(item => {
        type.push((<Option key={item.id} value={item.id}>{item.tag}</Option>));
      });
      _this.setState({
        abstracts: type
      })
    } else {
      openNotificationWithIcon("error", "错误提示", msg);
    }
  };

  /**
   * 获取所有的币种
   */
  initMonetaryData = async () => {
    let _this = this;
    // 发异步ajax请求, 获取数据
    const {msg, code, data} = await monetaryListApi();
    if (code === 0) {
      let type = [];
      data.forEach(item => {
        type.push((<Option key={item.id} value={item.id}>{`${item.abbreviate}[${item.name}]`}</Option>));
      });
      let copyType = [];
      copyType.push(<Option key='' value="">请选择</Option>);
      copyType.push(type);
      _this.setState({
        monetary: copyType
      })
    } else {
      openNotificationWithIcon("error", "错误提示", msg);
    }
  };

  /**
   * 支付类型 或者 摘要 或者 货币 选择框改变事件
   * @param value
   * @param field
   */
  onSelectChange = (value,field) => {
    let _this = this;
    let { journal } = this.state;
    journal[field] = value;
    _this.setState({journal});
  };

  /**
   * 交易附言（用于双向绑定数据）
   * @param event
   */
  remarksInputChange = (event) => {
    let _this = this;
    const value = event.target.value.replace(/\s+/g, '');
    let journal = _this.state.journal;
    journal.remarks = value;
    _this.setState({journal})
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
   */
  archiveDateChange = (date) => {
    const _this = this;
    let { journal } = _this.state;
    journal.archive_date = date;
    _this.setState({journal});
  };

  /**
   * 更新列表数据
   */
  renewList = () => {
    let _this = this;
    let { infoList,journal } = _this.state;
    let total = 0.0;
    let income = 0.0;
    let outlay = 0.0;
    infoList.forEach(item => {
      const amount = parseFloat(item.amount)
      if ('1' === item.flag) {
        income = accAdd(amount,income);
      } else {
        outlay = accAdd(amount,outlay);
      }
      total = accAdd(amount,total);
    });
    journal.total = total;
    journal.income = income;
    journal.outlay = outlay;
    _this.setState({journal})
  };

  /**
   * 递交申请
   */
  handleApply = async () => {
    const _this = this;
    let { infoList,journal } = _this.state;
    if (!journal.archive_date) {
      openNotificationWithIcon("warning", "提示", '请选择交易日期');
      return
    }
    //journal.archive_date = (journal.archive_date).toString();
    if (!journal.means_id) {
      openNotificationWithIcon("warning", "提示", '请选择交易方式');
      return
    }
    if (!journal.abstract_id) {
      openNotificationWithIcon("warning", "提示", '请选择交易摘要');
      return
    }
    if (!journal.monetary_id) {
      openNotificationWithIcon("warning", "提示", '请选择交易币种');
      return
    }
    for(let index = 0 ;index < infoList.length; index++){
      let item = infoList[index];
      if(!item.remarks){
        openNotificationWithIcon("warning", "提示", `您在第${item.index}行的摘要还未填写`);
        return
      }
      if(item.amount <= 0){
        openNotificationWithIcon("warning", "提示", `在您填写的第${item.index}行中，发现无效的交易金额(交易金额必须大于0)`);
        return
      }
    }
    let param = {
      means_id: journal.means_id,
      archive_date: (journal.archive_date).format('YYYY-MM-DD'),
      abstract_id: journal.abstract_id,
      monetary_id:journal.monetary_id,
      remarks:journal.remarks,
      details: infoList
    };
    const {msg, code} = await addJournalApi(param);
    if (code === 0) {
      _this.resetForm();
      // 刷新父页面
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
    const journal = {
      means_id:null,
      monetary_id:null,
      abstract_id:null,
      archive_date: null,
      remarks:null,
      total:0.0,
      income:0.0,
      outlay:0.0
    };
    const infoList =[{
      index:1,
      flag: '1',
      amount: 0,
      remarks: ''
    }];
    this.setState({journal,infoList})
  };


  /**
   * 初始化页面配置信息
   */
  componentDidMount() {
    // 初始化表格属性设置
    this.initColumns();
    this.props.onRef(this);
    // 准备下拉选框数据
    this.initPaymentMeans();
    this.initAbstracts();
    this.initMonetaryData();
    let user = storageUtils.get(storageUtils.USER_KEY)
    this.setState({currentUser:user.name})
  };


  render() {
    const {visibleModal,journal, listLoading,infoList,paymentMeans,abstracts,monetary} = this.state;
    return (
        <Modal
            title="流水申报"
            width="80%"
            open={visibleModal}
            okText='申报'
            maskClosable={false}
            onCancel={() => this.handleCancel()}
            onOk={this.handleApply}>
          <section className="journal-details">
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
            <Row className="detail-archive-date">
              <Col span={5} offset={19}>
                <span className='input-label'>交易日期：</span><DatePicker value={journal.archive_date} disabledDate={this.disabledDate} onChange={this.archiveDateChange} bordered={false} format={"YYYY-MM-DD"} placeholder="交易日期"/>
              </Col>
            </Row>
            <Row gutter={[12, 12]}>
              <Col className="gutter-row" span={8}>
                <div><span className='input-label'>收支总额：</span>{formatMoney(!journal?0:journal.total)}</div>
              </Col>
              <Col className="gutter-row" span={8}>
                <div><span className='input-label'>收入总额：</span>{formatMoney(!journal?0:journal.income)}</div>
              </Col>
              <Col className="gutter-row" span={8}>
                <div><span className='input-label'>支出总额：</span>{formatMoney(!journal?0:journal.outlay)}</div>
              </Col>
              <Col className="gutter-row" span={8}>
                <div>
                  <span className='input-label'>交易方式：</span>
                  <Select value={journal.means_id} className='declare-select' bordered={false} onChange={(e) => this.onSelectChange(e,'means_id')}>
                    {paymentMeans}
                  </Select>
                </div>
              </Col>
              <Col className="gutter-row" span={8}>
                <div>
                  <span className='input-label'>交易币种：</span>
                  <Select value={journal.monetary_id} className='declare-select' bordered={false} onChange={(e) => this.onSelectChange(e,'monetary_id')}>
                    {monetary}
                  </Select>
                </div>
              </Col>
              <Col className="gutter-row" span={8}>
                <div>
                  <span className='input-label'>交易摘要：</span>
                  <Select value={journal.abstract_id} className='declare-select' bordered={false} onChange={(e) => this.onSelectChange(e,'abstract_id')}>
                    {abstracts}
                  </Select>
                </div>
              </Col>
              <Col className="gutter-row" span={16}>
                <div>
                  <span className='input-label'>交易附言：</span>
                  <Input type='text' maxLength={20} style={{width:'30em'}} bordered={false} value={journal.remarks} onChange={(e)=>this.remarksInputChange(e)}/>
                </div>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Table size="middle" className='detail-grid' rowKey="index" bordered pagination={false} loading={listLoading} columns={this.columns} dataSource={infoList}/>
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