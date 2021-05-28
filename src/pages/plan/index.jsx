import React, {Component} from 'react';
import {Button, Col, DatePicker, Form, Row, Modal, Input, Spin, Popconfirm} from "antd";
import './index.less'
import {getPlanList, createPlan, updatePlan, deletePlan} from "../../api";
import {openNotificationWithIcon} from "../../utils/window";
import {LeftOutlined,RightOutlined} from "@ant-design/icons";
import moment from 'moment';
import PlanFrom from "./edit";

/*
 * 文件名：index.jsx
 * 作者：liunengkai
 * 创建日期：5/4/21 - 10:47 AM
 * 描述：
 */

// 定义组件（ES6）
class Plan extends Component {

    // 创建用来保存ref标识的标签对象的容器
    planFormRef = React.createRef();

    state = {
        listLoading: false,
        datas:[],
        outhtml:[],
        filters: {
            date: ""
        },
        //编辑界面数据
        editForm: {
            id: '',
            planDate: '',
            planContent: '',
        },
    };

    /**
     * 获取计划列表数据
     * @returns {Promise<void>}
     */
    getDatas = async () => {
        let _this = this;
        let filters = _this.state.filters;
        let para = {
            date: filters.date,
        };
        // 在发请求前, 显示loading
        _this.setState({listLoading: true});
        // 发异步ajax请求, 获取数据
        const {msg, code, data} = await getPlanList(para);
        // 在请求完成后, 隐藏loading
        _this.setState({listLoading: false});
        if (code === 0) {
            // 表格数据
            _this.setState({datas: data},function () {
                _this.rendering()
            });
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    rendering = () => {
        let isNowMonth = true;
        // 判断是否是本月
        let nowDate = new Date(this.getNowFormatDate());
        let nowYear = nowDate.getFullYear();//获取年
        let nowMonth = nowDate.getMonth();//获取月
        let nowday = nowDate.getDate();//获取天数
        let localDate = new Date(this.state.filters.date);
        let localYear = localDate.getFullYear();//获取年
        let localMonth = localDate.getMonth();//获取月
        if((nowYear === localYear)&&(nowMonth === localMonth)){
            isNowMonth = true;
        } else {
            isNowMonth = false;
        }
        // 在显示时，月份需要从1开始
        localMonth = localDate.getMonth()+1;//获取月
        let editDate = localYear + '-' + (localMonth<10?('0'+localMonth):localMonth) + '-';
        // 开始渲染
        let outhtml = [];//输出具体的日历
        let _thisLine = [];//处理的每一行
        let lineNum = 0;//行号
        for(let i = 0;i < this.state.datas.length;i++){
            const item = this.state.datas[i];
            const cellNum = i % 7;
            if(cellNum === 0){
                // 行开始
                _thisLine = [];
                lineNum++
            }
            if(item.flog === 1){
                // 需要渲染日历
                // 判断该天有无安排计划
                // 处理日期格式
                const dateKey = editDate + ((item.number<10)?('0'+item.number):item.number);
                if(item.value === 0){
                    // 没有安排计划
                    // 判断当前单元格是否是今天
                    if(isNowMonth === true && nowday === item.number){
                        _thisLine.push(<td key={i} onClick={this.clickTD} data-id={item.id} data-key={dateKey} className="today">{item.number}</td>)
                    }else {
                        _thisLine.push(<td key={i} onClick={this.clickTD} data-id={item.id} data-key={dateKey}>{item.number}</td>)
                    }
                }else{
                    // 有计划
                    _thisLine.push(<td key={i} onClick={this.clickTD} className="havetoday" data-id={item.id} data-key={dateKey} data-value={item.value}>{item.number}</td>)
                }
            }else{
                // 显示1号前和月尾的空白单元格
                _thisLine.push(<td key={i}></td>)
            }
            if(cellNum === 6){
                outhtml.push(<tr key={lineNum}>{_thisLine}</tr>)
            }
        }
        this.setState({
            outhtml
        })
    };

    /**
     * 获取当前日期
     * @returns {string}
     */
    getNowFormatDate = () => {
        let date = new Date();
        let seperator1 = '-';
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = '0' + month
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = '0' + strDate
        }
        let currentdate = year + seperator1 + month + seperator1 + strDate;
        return currentdate;
    };

    // 日期选择发生变化
    onChangeDate = (date, dateString) => {
        let _this = this;
        let filters = _this.state.filters;
        if (dateString === '' || JSON.stringify(dateString) === null || JSON.stringify(dateString) === 'null'){
            filters.date = this.getNowFormatDate()
        }else {
            filters.date = date.format('YYYY-MM-DD');// toString()
        }
        _this.setState({
            filters
        },function () {
            _this.getDatas()
        })
    }

    /**
     * 日期加减运算
     * @param _dateObject
     * @param x
     * @returns {string}
     */
    getOperationData = (_dateObject,x) => {
        //运算日期
        if( _dateObject === null || undefined === _dateObject || _dateObject === ''){
            _dateObject = new Date();
        }
        _dateObject.setMonth(_dateObject.getMonth() + x);
        let nd = _dateObject.valueOf() ;
        nd = new Date(nd);
        let y = nd.getFullYear();
        let m = nd.getMonth() + 1;
        let d = nd.getDate();
        if(m <= 9) m = '0' + m;
        if(d <= 9) d = '0'+ d;
        let cdate = y + '-' + m + '-01' ;
        return cdate;
    }

    /**
     * 日期加减事件
     * @param flog
     */
    buttonQuery = (flog) =>{
        let _this = this;
        // 通过上一个月，下一个月进行日期查询
        let filters = _this.state.filters;
        filters.date = _this.getOperationData(new Date(filters.date),flog);
        _this.setState({filters},function () {
            _this.getDatas()
        })
    };

    /**
     * 单击单元格事件
     * @param e
     */
    clickTD = (e) => {
        const _this = this;
        // 得到自定义属性
        // 得到计划的主键，没有计划时为-1
        let id =  e.currentTarget.getAttribute('data-id');
        // 得到当天的时间
        let key =  e.currentTarget.getAttribute('data-key');
        let {editForm} = _this.state;
        if (id === -1 || id === '-1'){
            const format = 'YYYY-MM-DD';
            const nowDate = moment().format(format);
            const clickData = moment(key,format);
            if (moment(clickData).isBefore(nowDate)){
                // 点击的时间早于当天的时间的，不允许创建计划
                openNotificationWithIcon("warning", "提示", '不能在过去的日期上创建计划');
                return
            }
            // 该天无计划
            editForm.planDate = key;
            editForm.planContent = null;
            editForm.id = null
        } else {
            // 该天有计划
            let value =  e.currentTarget.getAttribute('data-value');
            editForm.planContent = value;
            editForm.planDate = key;
            editForm.id = id;
        }
        console.log('this.planFormRef',this.planFormRef);
        this.planFormRef.handleDisplay(editForm);
    };

    bindPlanFormRef = (ref) => {
        this.planFormRef = ref
    };

    refreshPageFromPlanForm= () =>{
        this.getDatas();
    };

    /*
     * 为第一次render()准备数据
     * 因为要异步加载数据，所以方法改为async执行
     */
    componentDidMount() {
        let filters = this.state.filters;
        filters.date = this.getNowFormatDate();
        this.setState({
            filters
        });
        this.refreshPageFromPlanForm  = this.refreshPageFromPlanForm.bind(this);
        this.buttonItemLayout = {
            wrapperCol: {span: 14, offset: 4},
        };
        // 加载页面数据
        this.getDatas();
    };


    render() {
        const {listLoading} = this.state;
        const {date} = this.state.filters;
        let rangeDate;
        if (date){
            rangeDate = moment(date);
        } else{
            rangeDate = null;
        }
        const outhtml = this.state.outhtml;
        return (
            <div className="plan-page">
                <header>
                    <div className="page-name">日程安排</div>
                    <div className="tools-bar">
                        <Col span={24}>
                            <Form layout="inline">
                                <Form.Item label="计划时间:">
                                    <DatePicker value={rangeDate} picker="month" onChange={this.onChangeDate}/>
                                </Form.Item>
                            </Form>
                        </Col>
                    </div>
                </header>
                <section>
                    <Row>
                        <Col span={24}>
                            <div
                                style={{float: 'left',width: '30%',height: '100%',textAlign: 'left',lineHeight: '45px',cursor: 'pointer'}}>
                                <span onClick={() => this.buttonQuery(-1)}><LeftOutlined style={{color:'#000'}}/></span>
                            </div>
                            <div
                                style={{float: 'left',width: '40%',height: '100%',textAlign: 'center',lineHeight: '45px',fontSize: '20px',color:'#000'}}>
                                {date}
                            </div>
                            <div
                                style={{float: 'right',width: '28%',height: '100%',textAlign: 'right',lineHeight: '45px',cursor: 'pointer'}}>
                                <span onClick={() => this.buttonQuery(+1)}><RightOutlined style={{color:'#000'}}/></span>
                            </div>
                        </Col>
                    </Row>
                    <PlanFrom onRef={this.bindPlanFormRef.bind(this)} refreshPage={this.refreshPageFromPlanForm}/>
                    <Row>
                        <Col span={24}>
                            {listLoading === true ? <Spin/> :
                                <table id="plantanle" border="1px" cellPadding="0" cellSpacing="0">
                                    <thead>
                                    <tr>
                                        <td>星期日</td>
                                        <td>星期一</td>
                                        <td>星期二</td>
                                        <td>星期三</td>
                                        <td>星期四</td>
                                        <td>星期五</td>
                                        <td>星期六</td>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {outhtml}
                                    </tbody>
                                </table>
                            }
                        </Col>
                    </Row>
                </section>
            </div>
        );
    }
}

// 对外暴露
export default Plan;