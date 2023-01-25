import React, {forwardRef, useImperativeHandle, useState} from 'react';
import {
  Row,
  Col,
  Input,
  InputNumber,
  Table,
  DatePicker,
  Tooltip,
  Popconfirm,
  Select,
  List,
  Drawer,
  Space, Button
} from 'antd';
import {PlusOutlined,CloseOutlined,ExclamationCircleOutlined} from '@ant-design/icons';
import './detail.less'
import {openNotificationWithIcon} from "@/utils/window";
import {paymentMeansListApi, abstractsApi, addJournalApi, monetaryListApi} from "@/http/api";
import {disabledDate,formatMoney,deepClone,accAdd} from '@/utils/var'
import Storage from "@/utils/storage";


const {Option} = Select;
const JournalDeclare = (props,ref) => {

  const [open, setOpen] = useState<boolean>(false);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [payment,setPayment] = useState([])
  const [monetary,setMonetary] = useState([])
  const [abstracts,setAbstracts] = useState([])
  const currentUser = Storage.get(Storage.USER_KEY)
  const [journal,setJournal] = useState({monetary_id:null, means_id:null, abstract_id:null, remarks:null, archive_date: null, total:0.0, income:0.0, outlay:0.0})
  const [generalJournal,setGeneralJournal] = useState([{index:1, flag: '1', source: null, amount: 0, remarks: ''}])

  useImperativeHandle(ref,()=>({
    handleDisplay
  }))

  /**
   * 初始化Table所有列的数组
   */
  const columns = [
    {
      title: '序号',
      render: (text, record,index) => (index+1),
      align:'center',
    },
    {
      title: '用户',
      dataIndex: 'source',
      render:(value) => (!value ? currentUser.name:value),
      align:'center',
    },
    {
      title: '交易类型',
      dataIndex: 'flag', // 显示数据对应的属性名
      align:'center',
      render: (text, record, index) => {
        return <Select value={text} bordered={false} onChange={(e) => onChangeFlag(e,index)}>
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
        return <Input type="text" value={text} maxLength={15} bordered={false} onChange={(e) => inputChange(e, record, index, 'remarks')}/>
      }
    },
    {
      title: '交易金额',
      dataIndex: 'amount', // 显示数据对应的属性名
      align:'right',
      render: (text, record, index) => {
        return <InputNumber value={text} bordered={false} precision={2} stringMode={true} className='input-amount' min={0} parser={value => value.replace(/\s?|(,*)/g, '')} onChange={(e) => inputChange(e, record, index, 'amount')}/>
      }
    },
    {
      title: '操作',
      align:'center',
      render: (text, record,index) =>
          generalJournal.length > 1 ? (
              <Popconfirm title="确定删除?" placement="leftTop" onConfirm={() => deleteLine(index)}>
                <CloseOutlined/>
              </Popconfirm>
          ) : <Tooltip placement="left" title="填报的明细必须要有1条以上">
            <ExclamationCircleOutlined/>
          </Tooltip>,
    },
  ]

  /**
   * 继续添加财政明细
   */
  const continueAdd = () => {
    let item = {
      index:generalJournal[generalJournal.length-1].index+1,
      flag: '1',
      source:currentUser.name,
      amount: 0.0,
      remarks: ''
    };
    setGeneralJournal([...generalJournal,item])
  };

  /**
   * 删除明细添加行
   * @param index
   */
  const deleteLine = (index) => {
    if(generalJournal.length === 1){
      openNotificationWithIcon("error", "错误提示", '每一笔流水申请下边必须要有一条详情记录');
    }else{
      let array = deepClone(generalJournal);
      array = array.filter((item, key) => key !== index);
      setGeneralJournal(array);
      renewList(journal,array)
    }
  };

  /**
   * input改变事件
   * @param e
   * @param record
   * @param index
   * @param field
   */
  const inputChange = (e, record, index, field) => {
    // 对象数组是引用方式 ,对于react来说它的值都是地址(涉及到tree diff)，因为没有被重新赋值(地址没有改变)，所以 react 会认为仍然是之前的元素(element)，则不更新视图。
    const _generalJournal = deepClone(generalJournal);
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
      _generalJournal[index].amount = amount;
      setGeneralJournal(_generalJournal);
      renewList(journal,_generalJournal);
    }else{
      // 修改了摘要
      _generalJournal[index][field] = (e.target.value).replace(/(^\s*)|(\s*$)/g, '');
      setGeneralJournal(_generalJournal)
    }
  };

  /**
   * 交易类型改变事件
   * @param value
   * @param index
   */
  const onChangeFlag = (value,index) => {
    // 对象数组是引用方式 ,对于react来说它的值都是地址(涉及到tree diff)，因为没有被重新赋值(地址没有改变)，所以 react 会认为仍然是之前的元素(element)，则不更新视图。
    const _generalJournal = deepClone(generalJournal);
    if (_generalJournal[index].flag !== value){
      _generalJournal[index].flag = value;
      setGeneralJournal(_generalJournal);
      renewList(journal,_generalJournal);
    }
  };

  /**
   * 获取所有的支付类别
   */
  const initPaymentMeans = async () => {
    // 发异步ajax请求, 获取数据
    const {msg, code, data} = await paymentMeansListApi();
    if (code === 0) {
      let type = [];
      data.forEach(item => {
        type.push((<Option key={item.id} value={item.id}>{item.name}</Option>));
      });
      setPayment(type);
    } else {
      openNotificationWithIcon("error", "错误提示", msg);
    }
  };

  /**
   * 获取所有的交易摘要
   */
  const initAbstracts = async () => {
    // 发异步ajax请求, 获取数据
    const {msg, code, data} = await abstractsApi();
    if (code === 0) {
      let type = [];
      data.forEach(item => {
        type.push((<Option key={item.id} value={item.id}>{item.tag}</Option>));
      });
      setAbstracts(type);
    } else {
      openNotificationWithIcon("error", "错误提示", msg);
    }
  };

  /**
   * 获取所有的币种
   */
  const initMonetaryData = async () => {
    // 发异步ajax请求, 获取数据
    const {msg, code, data} = await monetaryListApi();
    if (code === 0) {
      let type = [];
      data.forEach(item => {
        type.push((<Option key={item.id} value={item.id}>{`${item.abbreviate}[${item.name}]`}</Option>));
      });
      setMonetary(type);
    } else {
      openNotificationWithIcon("error", "错误提示", msg);
    }
  };

  /**
   * 支付类型 或者 摘要 或者 货币 选择框改变事件
   * @param value
   * @param field
   */
  const onSelectChange = (value,field) => {
    const _journal = {...journal};
    _journal[field] = value;
    setJournal(_journal);
  };

  /**
   * 交易附言（用于双向绑定数据）
   * @param event
   */
  const remarksInputChange = (event) => {
    const value = event.target.value.replace(/\s+/g, '');
    setJournal({...journal,remarks: value})
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const handleDisplay = () => {
    initPaymentMeans();
    initAbstracts();
    initMonetaryData();
    setOpen(true);
  };

  /**
   * 申报时间改变事件
   * @param date
   */
  const archiveDateChange = (date) => {
    setJournal({...journal,archive_date:date});
  };

  /**
   * 更新列表数据
   */
  const renewList = (_journal = journal,_generalJournal = generalJournal) => {
    let total = 0.0;
    let income = 0.0;
    let outlay = 0.0;
    _generalJournal.forEach(item => {
      const amount = parseFloat(String(item.amount))
      if ('1' === item.flag) {
        income = accAdd(amount,income);
      } else {
        outlay = accAdd(amount,outlay);
      }
      total = accAdd(amount,total);
    });
   setJournal({..._journal,total:total,income:income,outlay:outlay})
  };

  /**
   * 递交申请
   */
  const handleApply = async () => {
    if (!journal.archive_date) {
      openNotificationWithIcon("warning", "提示", '请选择交易日期');
      return
    }
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
    for(let index = 0 ;index < generalJournal.length; index++){
      let item = generalJournal[index];
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
      details: generalJournal
    };
    setConfirmLoading(true)
    const {msg, code} = await addJournalApi(param).catch(()=>setConfirmLoading(false));
    setConfirmLoading(false)
    if (code === 0) {
      resetForm();
      // 调用父页面的刷新数据方法
      props.refreshPage();
      openNotificationWithIcon("success", "操作结果", "申报成功");
      handleCancel();
    } else {
      openNotificationWithIcon("error", "错误提示", msg);
    }
  };

  /**
   * 重置表单
   */
  const resetForm = () => {
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
    const generalJournal =[{
      index:1,
      flag: '1',
      source: currentUser.name,
      amount: 0,
      remarks: ''
    }];
    setJournal(journal);
    setGeneralJournal(generalJournal);
  };

  return (
      <Drawer title='流水申报' width='80%' forceRender onClose={handleCancel} open={open} bodyStyle={{ paddingBottom: 80 }} maskClosable={false}
              footer={
                <Space>
                  <Button onClick={handleCancel}>取消</Button>
                  <Button onClick={handleApply} loading={confirmLoading} type="primary">申报</Button>
                </Space>
              }
      >

        <section className="journal-details">
          <Row className='detail-addLine'>
            <Col span={6} offset={18}>
              <Tooltip placement="left" title="添加1行">
                <PlusOutlined onClick={continueAdd}/>
              </Tooltip>
            </Col>
          </Row>
          <Row className="detail-header">
            <Col span={12} offset={6}>
              收支明细
            </Col>
          </Row>
          <Row className="detail-archive-date">
            <Col span={6} offset={18}>
              <span className='input-label'>交易日期：</span><DatePicker value={journal.archive_date} disabledDate={disabledDate} onChange={archiveDateChange} bordered={false} format={"YYYY-MM-DD"} placeholder="交易日期"/>
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
                <Select value={journal.means_id} className='declare-select' bordered={false} onChange={(e) => onSelectChange(e,'means_id')}>
                  {payment}
                </Select>
              </div>
            </Col>
            <Col className="gutter-row" span={8}>
              <div>
                <span className='input-label'>交易币种：</span>
                <Select value={journal.monetary_id} className='declare-select' bordered={false} onChange={(e) => onSelectChange(e,'monetary_id')}>
                  {monetary}
                </Select>
              </div>
            </Col>
            <Col className="gutter-row" span={8}>
              <div>
                <span className='input-label'>交易摘要：</span>
                <Select value={journal.abstract_id} className='declare-select' bordered={false} onChange={(e) => onSelectChange(e,'abstract_id')}>
                  {abstracts}
                </Select>
              </div>
            </Col>
            <Col className="gutter-row" span={16}>
              <div>
                <span className='input-label'>交易附言：</span>
                <Input type='text' maxLength={20} style={{width:'30em'}} bordered={false} value={journal.remarks} onChange={(e)=>remarksInputChange(e)}/>
              </div>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Table size="small" className='detail-grid' rowKey="index" bordered pagination={false} columns={columns} dataSource={generalJournal}/>
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

      </Drawer>
  )
}

// 对外暴露
export default forwardRef(JournalDeclare);