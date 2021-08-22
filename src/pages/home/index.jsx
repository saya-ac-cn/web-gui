import React, { Component } from 'react';
import './index.less'
/*
 * 文件名：index.jsx
 * 作者：liunengkai
 * 创建日期：4/12/21 - 11:02 PM
 * 描述：
 */

// 定义组件（ES6）
class Home extends Component {

  render() {
    return (
      <div className="home-page">
        <header>
            <div className="page-name">主页</div>
            <div className="tools-bar">
                查询
            </div>
        </header>
      </div>
    );
  }
}

// 对外暴露
export default Home;