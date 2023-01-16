import React, {Component} from 'react';
import ForEditor from 'for-editor'
import axios from "axios";
import {uploadBase64PictureApi} from "@/api";
import {openNotificationWithIcon} from "@/utils/window";
import {isEmptyObject} from "@/utils/var"
import storageUtils from "@/utils/storageUtils";
/*
 * 文件名：index.jsx
 * 作者：liunengkai
 * 创建日期：2022-10-06 - 17:37
 * 描述：for-editor编辑器（markdown）
 */

// 定义组件（ES6）
class Editor extends Component {

    editorRef = React.createRef();

    state = {
      value: '', // 创建一个没有内容的编辑对象
    };

    /**
     * 初始化Markdown编辑器，本方法由外界触发
     * @param val
     */
    initEditor = (val) => {
      const _this = this;
      _this.setState({
        value: val
      });
    };

    //内容改变时回调
    handleChange = (value) => {
        this.setState({
            value
        })
    };

    //添加图片时回调
    handleAddImg = async (file) => {
        const {data} = await this.addImg(file);
        if (!isEmptyObject(data)) {
            // 第一个参数，图片的显示的描述信息，第二个参数，图片的url
            this.editorRef.current.$img2Url(file.name, data.link)
        } else {
            this.editorRef.current.$img2Url(file.name, 'file_url')
        }
    };

    //向后台添加图片
    addImg = (file) => {
        let access_token = storageUtils.get(storageUtils.ACCESS_KEY)
        const headers = {'access_token': access_token}
        return new Promise(
            (resolve, reject) => {
                let img = new Image();
                let reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function (e) {
                    img.src = this.result;
                };
                img.onload = function () {
                    let para = {
                        name: file.name,
                        content: img.src
                    };
                    axios.post(uploadBase64PictureApi, para,{headers}).then(response => {
                        const data = response.data; // 得到响应数据
                        if (data.code === 0) {
                            resolve({data: {link: data.data}})
                        } else {
                            openNotificationWithIcon("error", "错误提示", data.msg);
                            resolve({data: {link: ''}})
                        }
                        // /files/picture/illustrated/Pandora/20190728/2019072823539.png
                    }).catch(error => {
                        openNotificationWithIcon("error", "请求出错了", error.message);
                        reject(error)
                    })
                }
            })
    };

    /**
     * 判断是否为空
     * @returns {boolean}
     */
    isNull = () => {
        return null === this.state.value || "" === (this.state.value).trim();
    };

    /**
     * 获取markdown
     * @returns {*}
     */
    getValue = () => {
        return this.state.value;
    };

    /**
     * 执行异步任务: 发异步ajax请求
     */
    componentDidMount() {
      // 加载页面数据
      const _this = this;
      _this.props.onRef(_this);
    };

    render() {
        const {value} = this.state;
        return (
            <ForEditor
                ref={this.editorRef}
                value={value}
                lineNum={false}
                style={{border:'none',boxShadow:'none',maxWidth:'80em',maxHeight:'35em'}}
                addImg={(file) => this.handleAddImg(file)}
                onChange={value => this.handleChange(value)}
            />
        );
    }
}

// 对外暴露
export default Editor;
