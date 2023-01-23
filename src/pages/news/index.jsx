import React, { Component } from 'react';
import {Route,Routes} from 'react-router-dom'

import NewsList from './list'
import EditNews from "./edit";
/*
 * 文件名：index.jsx
 * 作者：liunengkai
 * 创建日期：2022-10-06 - 22:01
 * 描述：
 */

// 定义组件（ES6）
class News extends Component {


  render() {
      return (
          <Routes>
              <Route path='/' element={<NewsList/>} exact/> {/*路径完全匹配*/}
              <Route path='/create' element={<EditNews/>}/>
              <Route path='/update' element={<EditNews/>}/>
          </Routes>
      )
  }
}

// 对外暴露
export default News;