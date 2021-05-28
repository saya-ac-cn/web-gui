import React, { Component } from 'react';
import { Form, Input, message, Button, Checkbox } from 'antd';
import "./index.less"
import {clearTrimValueEvent} from "../../utils/string"
import {requestLogin} from '../../api'
import memoryUtils from '../../utils/memoryUtils'
import storageUtils from '../../utils/storageUtils'
/*
 * 文件名：index.jsx
 * 作者：liunengkai
 * 创建日期：2/8/21 - 9:25 PM
 * 描述：登录页面
 */


const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

// 定义组件（ES6）
class LoginPage extends Component {

  loginFormRef = React.createRef();

  state = {
    // 给用户输入的文本框和密码框
    userName: '---',
    passWord: '---',
  };


  onFinish = (e) => {
    let _this = this;
    _this.loginFormRef.current.validateFields(['userName', 'passWord']).then(async value => {
      const loginParams = {user: value.userName, password: value.passWord};
      const result = await requestLogin(loginParams);
      let {code, data} = result;
      _this.setState({loading: false});
      if (code === 0) {
        memoryUtils.user = data;// 保存在内存中
        storageUtils.saveUser(data); // 保存到local中
        // 跳转到管理界面 (不需要再回退回到登陆),push是需要回退
        this.props.history.replace('/backstage/home')
      } else if (code === 5) {
        message.error('请输入用户名和密码');
      } else {
        message.error('用户名或密码错误');
      }
    }).catch(e => console.log("登录失败",e));

    // 跳转到管理界面 (不需要再回退回到登陆),push是需要回退
    //this.props.history.replace('/backstage')
  };

  // 初始化窗口
  initWindow = () =>{
    const {ipcRenderer} =  window.electron;
    ipcRenderer.send('switchLoginWindowSize')
  };

  componentDidMount() {
    const _this= this;
    _this.initWindow();
  }
  render() {
    let {userName,passWord} = this.state;
    return (
      <div style={{backgroundImage: `url('${process.env.PUBLIC_URL}/picture/login/login_background.png')`}} className='login-page'>
        <Form
            {...layout}
            name="login"
            initialValues={{ remember: true }}
            onFinish={this.onFinish}
            ref={this.loginFormRef}
        >
          <h2 className="title">统一身份认证入口</h2>
          <Form.Item
              label="用户名"
              name="userName"
              initialValue={userName}
              getValueFromEvent={ (e) => clearTrimValueEvent(e)}
              rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
              label="密码"
              name="passWord"
              initialValue={passWord}
              getValueFromEvent={ (e) => clearTrimValueEvent(e)}
              rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item {...tailLayout} name="remember" valuePropName="checked">
            <Checkbox>记住我</Checkbox>
          </Form.Item>

          <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit">
              登录
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  }
}

// 对外暴露
export default LoginPage;