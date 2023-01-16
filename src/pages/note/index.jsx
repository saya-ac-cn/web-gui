import React, { Component } from 'react';
import {Route,Routes} from 'react-router-dom'
import NotesList from './list'
import EditNote from "./note";
/*
 * 文件名：index.jsx
 * 作者：liunengkai
 * 创建日期：2022-10-05 - 22:01
 * 描述：笔记便笺管理
 */

// 定义组件（ES6）
class Note extends Component {


  render() {
      return (
          <Routes>
              <Route path='/' element={<NotesList/>} exact/> {/*路径完全匹配*/}
              <Route path='/create' element={<EditNote/>}/>
              <Route path='/update' element={<EditNote/>}/>
          </Routes>
      )
  }
}

// 对外暴露
export default Note;
