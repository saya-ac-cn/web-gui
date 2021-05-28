import React, { Component } from 'react';
import {HomeOutlined,UserOutlined,MoneyCollectOutlined,ProfileOutlined,NotificationOutlined,FileTextOutlined,ScheduleOutlined,TagOutlined,HistoryOutlined} from '@ant-design/icons';
import { Avatar, Badge} from 'antd';
import {Redirect, Route, Switch, Link, withRouter} from 'react-router-dom'
import moment from 'moment';
import './backend.less'
import menuConfig from '../../../config/menuConfig.js'
import Home from "../../home";
import Logs from "../../logs";
import Memo from "../../memo";
import Plan from "../../plan";
import Note from "../../note";
import Statistics from "../../statistics"
/*
 * 文件名：backend.jsx
 * 作者：liunengkai
 * 创建日期：2/8/21 - 9:27 PM
 * 描述：后台模板
 */

// 定义组件（ES6）
class Backend extends Component {

  state = {
    greetText: '好久不见，甚是想念，记得爱护自己！'
  };

  /**
   * 根据小时，得到问候词
   * @return
   */
  getGreetText = () => {
    let hour = moment().format("HH");
    var greetText = "好久不见，甚是想念，记得爱护自己！";
    if(hour >= 0 && hour < 7){
      greetText = "天还没亮，夜猫子，要注意身体哦！";
    }else if(hour>=7 && hour<12){
      greetText = "上午好！又是元气满满的一天，奥利给！";
    }else if(hour >= 12 && hour < 14){
      greetText = "中午好！吃完饭记得午休哦！";
    }else if(hour >= 14 && hour < 18){
      greetText = "下午茶的时间到了，休息一下吧！";
    }else if(hour >= 18 && hour < 22){
      greetText = "晚上到了，多陪陪家人吧！";
    }else if(hour >= 22 && hour < 24){
      greetText = "很晚了哦，注意休息呀！";
    }
    this.setState({greetText});
  };

  /***
   * 将字符串转换成组件
   * @param value
   * @returns {*}
   */
  transformComponent = (value) => {
    switch(value) {
      case 'HomeOutlined':{
        return <HomeOutlined/>
      }
      case 'UserOutlined':{
        return <UserOutlined/>
      }
      case 'MoneyCollectOutlined':{
        return <MoneyCollectOutlined/>
      }
      case 'ProfileOutlined':{
        return <ProfileOutlined/>
      }
      case 'NotificationOutlined':{
        return <NotificationOutlined/>
      }
      case 'FileTextOutlined':{
        return <FileTextOutlined/>
      }
      case 'ScheduleOutlined':{
        return <ScheduleOutlined/>
      }
      case 'TagOutlined':{
        return <TagOutlined/>
      }
      case 'HistoryOutlined':{
        return <HistoryOutlined/>
      }
      default: {
        return <UserOutlined/>
      }
    }
  };

  renderMenu = ()=>{
    const _this = this;
    const path = _this.props.location.pathname;
    return menuConfig.map((item, index) => {
      return  (<div className={item.key===path?'menu-item menu-item-selected':'menu-item'} key={item.key} onClick={()=>this.pageDirect(item.key)}>
        <div className='menu-icon'>{_this.transformComponent(item.icon)}</div>
        <div className='menu-name'>{item.title}</div>
      </div>);
    })
  };

  pageDirect = (url) => {
    // 得到当前请求的路由路径
    const path = this.props.location.pathname;
    if (path === url){
      return
    }
    this.props.history.push(url);
  };

  // 初始化窗口
  initWindow = () =>{
    const {ipcRenderer} =  window.electron;
    ipcRenderer.send('switchMainWindowSize')
  };

  componentDidMount() {
    const _this= this;
    _this.initWindow();
    _this.getGreetText();
  }


  render() {
    const {greetText} = this.state;
    return (
      <div style={{backgroundImage: `url('${process.env.PUBLIC_URL}/picture/home/animation.svg')`}} className='layout-page'>
        <div className='menu-area'>
          <div style={{backgroundImage: `url('${process.env.PUBLIC_URL}/picture/home/user.png')`}} className='user-logo'></div>
          <div className='greetings-area'>
            <p className='user-name'>早上好！Pandora</p>
            <p className='greetings-word'>{greetText}</p>
            <p className='pre-log'>最后一次操作：2021:03:20 00:00:00 四川省自贡市</p>
            <p className='today-plan'>今日安排：无</p>
          </div>
          <div className='calendar'>
            <div className='calendar-month'>2021年03月</div>
            <div className='calendar-day'>23</div>
          </div>
          <div className='menu'>
            {this.renderMenu()}
          </div>
        </div>
        <div className='main-area'>
          <Switch>
            <Route path='/backstage/home' component={Home}/>
            <Route path='/backstage/logs' component={Logs}/>
            <Route path='/backstage/memo' component={Memo}/>
            <Route path='/backstage/plan' component={Plan}/>
            <Route path='/backstage/note' component={Note}/>
            <Route path='/backstage/statistics' component={Statistics}/>
          </Switch>
        </div>
      </div>
    );
  }
}

// 对外暴露
export default Backend;