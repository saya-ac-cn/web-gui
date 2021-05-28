import React, {Component} from 'react';
import {Col,Row} from "antd";

/*
 * 文件名：index.jsx
 * 作者：liunengkai
 * 创建日期：5/4/21 - 2:57 PM
 * 描述：
 */

// 定义组件（ES6）
class Note extends Component {


    render() {
        return (
            <div className="note-page">
                <header>
                    <div className="page-name">笔记便笺</div>
                    <div className="tools-bar">
                        查询
                    </div>
                </header>
                <section>
                    <Row>
                        <Col span={6}>

                        </Col>
                        <Col span={18}>

                        </Col>
                    </Row>
                </section>
            </div>
        );
    }
}

// 对外暴露
export default Note;