import React, {useEffect, useState} from 'react';
import {Card, Col, DatePicker, Divider, List, Row, Skeleton, Statistic} from 'antd';
import {DualAxes, Progress, Rose, TinyArea, TinyColumn, WordCloud} from '@ant-design/charts';
import {
  getAccountGrowthRate,
  getActivityRate,
  getCountAndWordCloud,
  getIncomePercentage,
  getNewsRate,
  getOrderByAmount,
  getPreSixMonthBill
} from "@/http/api";
import moment from 'moment';
import './index.less'
import {disabledMonth, formatMoney} from "@/utils/var";
import {openNotificationWithIcon} from "@/utils/window";


const Chart = () => {

  // 收支增长率
  const [accountGrowthRate,setAccountGrowthRate] = useState({
    loading:true,
    tradeDate:moment(),
    serverData:{
      m2m: 0,
      y2y: 0,
      avg: 0,
      account: 0
    }
  })

  // 收支率
  const [incomePercentage,setIncomePercentage] = useState({
    loading:true,
    tradeDate:moment(),
    serverData:{
      account: 0,
      percentage: 0
    }
  })

  // 活跃度
  const [activityRate,setActivityRate] = useState({
    loading:true,
    tradeDate:moment(),
    serverData:{
      avg: 0,
      count: 0,
      log6:{
        month:[],
        count:[]
      }
    }
  })

  // 动态发布
  const [newsRate,setNewsRate] = useState({
    loading:true,
    tradeDate:moment(),
    serverData:{
      avg: 0,
      count: 0,
      news6:{
        month:[],
        count:[]
      }
    }
  })

  // tradeDate:前半年统计图 和 摘要排名 共用的查询时间条件
  const [queryWhere,setQueryWhere] = useState({tradeDate:moment()})

  // 摘要排名
  const [amountOrder,setAmountOrder] = useState({
    loading:true,
    serverData:[]
  })

  // 前半年账单
  const [financial6,setFinancial6] = useState({
    config:{
      autoFit: true,
      xField: 'time',
      yField: ['value', 'count'],
      geometryOptions: [
        {
          geometry: 'column',
          isGroup: true,
          seriesField: 'type',
          columnWidthRatio: 0.4,
          label: {},
          color: ['#5B8FF9', '#5D7092'],
        },
        {
          geometry: 'line',
          color: '#5AD8A6',
        },
      ],
      meta: {
        count: {
          alias: '收支总额',
        },
      },
    },
    loading:true,
    serverData:{
      currencyNumber:[],
      incomeAndPay:[],
    }
  })

  // 数据分布 及 词云
  const [countAndWordCloud,setCountAndWordCloud] = useState({
    loading:true,
    wordCloudConfig:{
      height: 260,
      autoFit: true,
      wordField: 'name',
      weightField: 'value',
      colorField: 'name',
      wordStyle: {
        fontFamily: 'Verdana',
        fontSize: [
          8,
          32
        ],
        rotation: 0
      },
      random: function random() {
        return 0.5;
      }
    },
    serverRoseData:[],
    serverWordCloudData:[]
  })

  useEffect(()=>{
    const date = moment();//.format('YYYY-MM-DD');
    setAccountGrowthRate({...accountGrowthRate,tradeDate: date})
    loadAccountGrowthRate(date);
    setIncomePercentage({...incomePercentage,tradeDate: date})
    loadIncomePercentage(date);
    setActivityRate({...activityRate,tradeDate: date})
    loadActivityRate(date);
    setNewsRate({...newsRate,tradeDate: date})
    loadNewsRate(date);
    setQueryWhere({tradeDate: date})
    loadOrderByAmount(date);
    loadPreSixMonthBill(date);
    loadCountAndWordCloud();
  },[])


  /**
   * 收支增长率
   * @returns {Promise<void>}
   */
  const loadAccountGrowthRate = async (queryDate = accountGrowthRate.tradeDate) => {
    setAccountGrowthRate({...accountGrowthRate,loading: true});
    // 发异步ajax请求, 获取数据
    const {msg, code, data} = await getAccountGrowthRate({archive_date:(queryDate).format('YYYY-MM-DD')});
    accountGrowthRate.loading = false;
    if (code === 0) {
      setAccountGrowthRate({...accountGrowthRate,loading: false,serverData:data});
    }else {
      setAccountGrowthRate({...accountGrowthRate,loading: false});
      openNotificationWithIcon("error", "错误提示", msg);
    }
  };

  /**
   * 收支率
   * @returns {Promise<void>}
   */
  const loadIncomePercentage = async (queryDate = incomePercentage.tradeDate) => {
    setIncomePercentage({...incomePercentage,loading: true})
    // 发异步ajax请求, 获取数据
    const {msg, code, data} = await getIncomePercentage({archive_date:(queryDate).format('YYYY-MM-DD')});
    incomePercentage.loading = false;
    if (code === 0) {
      setIncomePercentage({...incomePercentage,loading: false,serverData:data})
    }else {
      setIncomePercentage({...incomePercentage,loading: false})
      openNotificationWithIcon("error", "错误提示", msg);
    }
  };

  /**
   * 活跃度
   * @returns {Promise<void>}
   */
  const loadActivityRate= async (queryDate = activityRate.tradeDate) => {
    setActivityRate({...activityRate,loading: true})
    // 发异步ajax请求, 获取数据
    const {msg, code, data} = await getActivityRate({archive_date:(queryDate).format('YYYY-MM-DD')});
    if (code === 0) {
      const serverData = {...activityRate.serverData};
      serverData.avg = data.avg;
      serverData.count = data.count;
      const log6 = data.log6;
      let count = [];
      let month = [];
      for(let key in log6){
        let item = log6[key];
        month.push(item.total_month);
        count.push(item.count)
      }
      serverData.log6 = {month: month, count: count};
      setActivityRate({...activityRate,loading: false,serverData: serverData})
    }else {
      setActivityRate({...activityRate,loading: false})
      openNotificationWithIcon("error", "错误提示", msg);
    }
  };

  /**
   * 动态发布
   * @returns {Promise<void>}
   */
  const loadNewsRate = async (queryDate = newsRate.tradeDate) => {
    setNewsRate({...newsRate,loading: true})
    // 发异步ajax请求, 获取数据
    const {msg, code, data} = await getNewsRate({archive_date:(queryDate).format('YYYY-MM-DD')});
    if (code === 0) {
      const serverData = {...newsRate.serverData}
      serverData.avg = data.avg;
      serverData.count = data.count;
      const news6 = data.news6;
      let month = [];
      let count = [];
      // 这里的key是月份
      for(let key in news6){
        let item = news6[key];
        month.push(item.total_month);
        count.push(item.count)
      }
      serverData.news6 = {month: month, count: count};
      setNewsRate({...newsRate,loading: false,serverData: serverData})
    }else {
      setNewsRate({...newsRate,loading: false})
      openNotificationWithIcon("error", "错误提示", msg);
    }
  };

  /**
   * 账单排名
   * @returns {Promise<void>}
   */
  const loadOrderByAmount = async (queryDate = queryWhere.tradeDate) => {
    setAmountOrder({...amountOrder,loading: true})
    // 发异步ajax请求, 获取数据
    const {msg, code, data} = await getOrderByAmount({archive_date:(queryDate).format('YYYY-MM-DD')});
    if (code === 0) {
      let array = [];
      for (let i = 0; i < 6 && i < data.length; i++) {
        array.push({'index':(i+1),'name':data[i].abstracts_name,'count':data[i].total})
      }
      setAmountOrder({...amountOrder,loading: false,serverData:array})
    }else {
      setAmountOrder({...amountOrder,loading: false})
      openNotificationWithIcon("error", "错误提示", msg);
    }
  };

  /**
   * 前6个月账单
   * @returns {Promise<void>}
   */
  const loadPreSixMonthBill = async (queryDate = queryWhere.tradeDate) => {
    setFinancial6({...financial6,loading: true})
    // 发异步ajax请求, 获取数据
    const {msg, code, data} = await getPreSixMonthBill({archive_date:(queryDate).format('YYYY-MM-DD')});
    if (code === 0) {
      let currencyNumber = [];
      let incomeAndPay = [];
      for (let i = 0; i < data.length; i++) {
        let item = data[i];
        // 总收支
        currencyNumber.push({time:item.archive_date,count:item.total?item.total:0})
        // 总收入
        incomeAndPay.push({time:item.archive_date,value:item.income?item.income:0,type:'收入'})
        // 总支出
        incomeAndPay.push({time:item.archive_date,value:item.outlay?item.outlay:0,type:'支出'})
      }
      const serverData = {currencyNumber:currencyNumber,incomeAndPay:incomeAndPay}
      setFinancial6({...financial6,loading: false,serverData:serverData})
    }else {
      setFinancial6({...financial6,loading: false})
      openNotificationWithIcon("error", "错误提示", msg);
    }
  };

  /**
   * 数据总量及词云数据
   * @returns {Promise<void>}
   */
  const loadCountAndWordCloud = async () => {
    setCountAndWordCloud({...countAndWordCloud,loading: true})
    const {msg, code, data} = await getCountAndWordCloud();
    if (code === 0) {
      // 发异步ajax请求, 获取数据
      setCountAndWordCloud({...countAndWordCloud,loading: false,serverRoseData:data.rose_data,serverWordCloudData:data.word_cloud})
    }else {
      setCountAndWordCloud({...countAndWordCloud,loading: false})
      openNotificationWithIcon("error", "错误提示", msg);
    }
  };

  /**
   * 页面中日期发生变化后的时间
   * @param date 时间
   * @param filed 所属统计面板
   */
  const tradeDateChange = (date,filed) => {
    if(!date){
      return;
    }
    switch (filed) {
      case "accountGrowthRate":
        setAccountGrowthRate({...accountGrowthRate,tradeDate: date})
        loadAccountGrowthRate(date);
        break;
      case "incomePercentage":
        setIncomePercentage({...incomePercentage,tradeDate: date})
        loadIncomePercentage(date);
        break;
      case "activityRate":
        setActivityRate({...activityRate,tradeDate: date})
        loadActivityRate(date);
        break;
      case "newsRate":
        setNewsRate({...newsRate,tradeDate: date})
        loadNewsRate(date);
        break;
      case "financial":
        setQueryWhere({tradeDate: date})
        loadOrderByAmount(date);
        loadPreSixMonthBill(date);
        break;
      default:
        break
    }
  }

  /**
   * 鼠标放置活动率面积图事件
   * @param title
   * @param data
   * @returns {string}
   */
  const activityCustomContent = (index, data) => {
    let label = '操作次数:';
    if (activityRate&&activityRate.serverData&&activityRate.serverData.log6&&activityRate.serverData.log6.month&&activityRate.serverData.log6.month[index]) {
      label = activityRate.serverData.log6.month[index]+'&nbsp;操作次数:';
    }
    let _data$, _data$$data;
    return label.concat(
            (_data$ = data[0]) === null || _data$ === void 0
                ? void 0
                : (_data$$data = _data$.data) === null || _data$$data === void 0
                ? void 0
                : _data$$data.y,
        );
  };

  /**
   * 鼠标放置动态柱状图事件
   * @param title
   * @param data
   * @returns {string}
   */
  const newsCustomContent = (index,data) => {
    let label = '撰写篇数:';
    if (newsRate&&newsRate.serverData&&newsRate.serverData.news6&&newsRate.serverData.news6.month&&newsRate.serverData.news6.month[index]) {
      label = newsRate.serverData.news6.month[index]+'&nbsp;撰写篇数:';
    }
    let _data$, _data$$data;
    return label.concat(
        (_data$ = data[0]) === null || _data$ === void 0
            ? void 0
            : (_data$$data = _data$.data) === null || _data$$data === void 0
            ? void 0
            : _data$$data.y,
    );
  }


  return (
      <div className='background-chart'>
        <Row gutter={[16, 16]}>
          <Col span={6}>
            {
              accountGrowthRate.loading?
                  <Card><Skeleton active/></Card>
                  :
                  <Card>
                    <Statistic title={<div className='notice-tooltip'>收支总额<DatePicker bordered={false} disabledDate={disabledMonth} onChange={(e)=>tradeDateChange(e,'accountGrowthRate')}  picker="month" className='date-switch' value={accountGrowthRate.tradeDate} format='YYYY年MM月'/></div>} value={(accountGrowthRate.serverData && accountGrowthRate.serverData.account)?accountGrowthRate.serverData.account:0} prefix={'￥'} />
                    <div className='rate-area'>
                      <div className='m2m-rate'>
                        <span className='rate-tag'>环比增长</span>
                        {
                          (!accountGrowthRate.serverData || !accountGrowthRate.serverData.m2m)
                              ? '-':
                              <div>
                                {accountGrowthRate.serverData.m2m+'%'}
                                <div style={{width:'1em',height:'1em',backgroundSize: 'cover',backgroundImage:`url('${'/svg/'+(accountGrowthRate.serverData.m2m>0?'caret-up.svg':'caret-down.svg')}')`}}></div>
                              </div>
                        }
                      </div>
                      <div className='y2y-rate'>
                        <span className='rate-tag'>同比增长</span>
                        {
                          (!accountGrowthRate.serverData || !accountGrowthRate.serverData.y2y)
                              ? '-':
                              <div>
                                {accountGrowthRate.serverData.y2y+'%'}
                                <div style={{width:'1em',height:'1em',backgroundSize: 'cover',backgroundImage:`url('${'/svg/'+(accountGrowthRate.serverData.y2y>0?'caret-up.svg':'caret-down.svg')}')`}}></div>
                              </div>
                        }
                      </div>
                    </div>
                    <Divider className='extra-divider'/>
                    <div>
                      日均收支金额(元)：{(accountGrowthRate.serverData && accountGrowthRate.serverData.avg)?formatMoney(accountGrowthRate.serverData.avg,2):'-'}
                    </div>
                  </Card>
            }
          </Col>
          <Col span={6}>
            {
              incomePercentage.loading?
                  <Card><Skeleton active/></Card>
                  :
                  <Card>
                    <Statistic title={<div className='notice-tooltip'>收支率<DatePicker bordered={false} disabledDate={disabledMonth} onChange={(e)=>tradeDateChange(e,'incomePercentage')}  picker="month" className='date-switch' value={incomePercentage.tradeDate} format='YYYY年MM月'/></div>} valueStyle={{ color: ((incomePercentage.serverData && incomePercentage.serverData.percentage)?incomePercentage.serverData.percentage:0)>=0.5?'#cf1322':'#3f8600' }} value={(incomePercentage.serverData && incomePercentage.serverData.percentage)?incomePercentage.serverData.percentage*100:'-'} precision={2} suffix="%"/>
                    <Progress height={70} autoFit={true} percent={(incomePercentage.serverData && incomePercentage.serverData.percentage)?incomePercentage.serverData.percentage:0} barWidthRatio={0.1} color={['#cf1322','#3f8600']} />
                    <Divider className='extra-divider'/>
                    <div>
                      总收支金额(元)：{(incomePercentage.serverData && incomePercentage.serverData.account)?incomePercentage.serverData.account:'-'}
                    </div>
                  </Card>
            }
          </Col>
          <Col span={6}>
            {
              activityRate.loading?
                  <Card><Skeleton active/></Card>
                  :
                  <Card>
                    <Statistic title={<div className='notice-tooltip'>活跃度<DatePicker bordered={false} disabledDate={disabledMonth} onChange={(e)=>tradeDateChange(e,'activityRate')}  picker="month" className='date-switch' value={activityRate.tradeDate} format='YYYY年MM月'/></div>} value={(activityRate.serverData && activityRate.serverData.count)?activityRate.serverData.count:0} suffix="次"/>
                    <TinyArea height={70} autoFit={true} data={activityRate.serverData.log6.count} smooth={true} tooltip={{customContent:activityCustomContent}} areaStyle={{fill: '#975fe4'}} line={{color:'#975fe4'}}/>
                    <Divider className='extra-divider'/>
                    <div>
                      日均操作次数(次)：{(activityRate.serverData && activityRate.serverData.avg)?activityRate.serverData.avg:'-'}
                    </div>
                  </Card>
            }
          </Col>
          <Col span={6}>
            {
              newsRate.loading?
                  <Card><Skeleton active/></Card>
                  :
                  <Card>
                    <Statistic title={<div className='notice-tooltip'>笔记数<DatePicker bordered={false} disabledDate={disabledMonth} onChange={(e)=>tradeDateChange(e,'newsRate')}  picker="month" className='date-switch' value={newsRate.tradeDate} format='YYYY年MM月'/></div>} value={(newsRate.serverData && newsRate.serverData.count)?newsRate.serverData.count:0} suffix="篇"/>
                    <TinyColumn height={70} autoFit={true} data={newsRate.serverData.news6.count} tooltip={{customContent:newsCustomContent}}/>
                    <Divider className='extra-divider'/>
                    <div>
                      日均撰写(篇)：{(newsRate.serverData && newsRate.serverData.avg)?newsRate.serverData.avg:'-'}
                    </div>
                  </Card>
            }
          </Col>

          <Col span={24}>
            <Card title="收入支出" bordered={false} extra={<DatePicker bordered={false} disabledDate={disabledMonth} onChange={(e)=>tradeDateChange(e,'financial')}  picker="month" className='date-switch' value={queryWhere.serverData} format='YYYY年MM月'/>}>
              <Row gutter={50} style={{minHeight:'25em'}}>
                <Col span={18}>
                  {
                    financial6.loading?
                        <Skeleton active/>
                        :
                        <DualAxes {...financial6.config} data={[financial6.serverData.incomeAndPay, financial6.serverData.currencyNumber]}/>
                  }
                </Col>
                <Col span={6}>
                  {
                    amountOrder.loading?
                        <Skeleton active/>
                        :
                        <List
                            header={<div style={{fontWeight:'bold'}}>收支构成排行</div>}
                            split={false}
                            dataSource={amountOrder.serverData}
                            renderItem={item => (
                                <List.Item>
                                  {item.index}、{item.name}<span style={{float:'right'}}>¥{formatMoney(item.count,2)}</span>
                                </List.Item>
                            )}
                        />
                  }
                </Col>
              </Row>
            </Card>
          </Col>

          <Col span={15}>
            {
              countAndWordCloud.loading?
                  <Card><Skeleton active/></Card>
                  :
                  <Card title="数据分布" bordered={false}>
                    <Rose height={260} autoFit={true} xField='name' yField='value' seriesField='name' radius={0.9} label={{ offset: -15 }} data={countAndWordCloud.serverRoseData}/>
                  </Card>
            }
          </Col>
          <Col span={9}>
            {
              countAndWordCloud.loading?
                  <Card><Skeleton active/></Card>
                  :
                  <Card title="活跃笔记簿" bordered={false}>
                    <WordCloud {...countAndWordCloud.wordCloudConfig} data={countAndWordCloud.serverWordCloudData}/>
                  </Card>
            }
          </Col>
        </Row>
      </div>
  );

}

// 对外暴露
export default Chart;