import React, {useState, forwardRef, useImperativeHandle, useRef, useEffect} from 'react';
import { PlusOutlined } from '@ant-design/icons';
import {Button, Tag, Drawer, Form, Input, Space, InputRef} from 'antd';

import {clearTrimValueEvent} from "@/utils/string";
import {createNewsApi, editNewsApi, newsInfoApi} from "@/http/api"
import {openNotificationWithIcon} from "@/utils/window";
import './edit.less'
import Editor from "@/component/editor";

const formItemLayout = {
    labelCol: {span: 2},
    wrapperCol: {span: 20},
};

const EditNews = (props,ref) => {

    //操作dom节点
    const editorRef = useRef<any>();
    const labelRef = useRef<InputRef>();

    const [newsForm] = Form.useForm();
    const [news,setNews] = useState({id:null,topic: null,label: [],content: null})
    const [open, setOpen] = useState<boolean>(false);
    const tagColor = ['magenta', 'red', 'volcano', 'orange', 'gold', 'lime', 'green', 'cyan', 'blue', 'geekblue', 'purple']
    const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
    const [labelVisible,setLabelVisible] = useState<boolean>(false);
    const [label,setLabel] = useState<string>(null);

    // 暴露方法给父组件
    useImperativeHandle(ref,()=>({
        handleDisplay
    }))

    useEffect(() => {
        if (labelVisible) {
            labelRef.current?.focus();
        }
    }, [labelVisible]);

    /**
     * 初始化数据
     * @param val
     */
    const handleDisplay = async (val: number) => {
        if (val) {
            // 发异步ajax请求, 获取数据
            const {msg, code, data} = await newsInfoApi(val);
            if (code === 0) {
                const label = data.label === null ? [] : (data.label).split(';')
                setNews({id:data.id,topic: data.topic,label: label,content: data.content})
                newsForm.setFieldsValue({topic: data.topic});
                editorRef.current.initEditor(data.content);
            } else {
                openNotificationWithIcon("error", "错误提示", msg);
                setNews({id:null,topic: null,label: [],content: null})
                newsForm.setFieldsValue({topic: null});
                editorRef.current.initEditor(null);
            }
        } else {
            setNews({id:null,topic: null,label: [],content: null})
            newsForm.setFieldsValue({topic: null});
            console.log("1==",editorRef?.current)
            console.log("2==",editorRef?.current)
            editorRef.current.initEditor(null);
        }
        setOpen(true);
    };

    const handleCancel = () => {
        setNews({id:null,topic: null,label: [],content: null})
        newsForm.setFieldsValue({label: null});
        setOpen(false);
    };

    /**
     * 删除label
     * @param removedTag
     */
    const handleLabelDelete = removedTag => {
        const label = news.label;
        const tags = label.filter(tag => tag !== removedTag);
        setNews({...news,label: tags});
    };

    /**
     * 显示文本框，让用户可输入Label
     */
    const showLabelInput = () => {
        // 至多允许用户输入5个tag
        if (news.label.length < 5){
            setLabelVisible(true);
        }
    };

    const handleLabelInputChange = e => {
        setLabel(e.target.value);
    };

    /**
     * 添加tag
     */
    const handleLabelInputConfirm = () => {
        let _label = news.label;
        if (label && _label.indexOf(label) === -1) {
            _label = [..._label, label];
        }
        setLabelVisible(false);
        setLabel(null);
        setNews({...news,label: _label})
    };


    const forMap = tag => {
        const tagElem = (
            <Tag
                closable
                color={tagColor[Math.floor(Math.random()*10)]}
                onClose={e => {
                    e.preventDefault();
                    handleLabelDelete(tag);
                }}
            >
                {tag}
            </Tag>
        );
        return (<span key={tag} style={{ display: 'inline-block' }}>{tagElem}</span>
        );
    };

    /**
     * 响应用户提交事件
     */
    const handleSubmit = () => {
        let content = editorRef.current.getContent();
        if (null == content || content === ''){
            openNotificationWithIcon("error", "错误提示", "请填写您要发布的内容");
            return
        }
        newsForm.validateFields(['topic']).then((values) => {
            let label = null;
            if (news.label.length > 1){
                label = news.label.join(';')
            } else if(news.label.length === 1){
                label = news.label[0]
            } else {
                label = null
            }
            let param = {topic: values.topic,label: label,content: content};
            if (news.id){
                // 执行修改
                param.id = news.id;
                updateNews(param)
            } else{
                // 执行添加
                createNews(param)
            }
        }).catch(e => {
            console.log("修改或添加动态说说错误",e)
        });
    };

    // 更新动态
    const updateNews = async (param) => {
        setConfirmLoading(true);
        const {msg, code} = await editNewsApi(param).catch(()=>setConfirmLoading(false));
        setConfirmLoading(false);
        if (code === 0) {
            openNotificationWithIcon("success", "操作结果", "动态修改成功");
            handleCancel();
            // 调用父页面的刷新数据方法
            props.refreshPage();
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    // 创建动态
    const createNews = async (param) => {
        setConfirmLoading(true);
        const {msg, code} = await createNewsApi(param).catch(()=>setConfirmLoading(false));
        setConfirmLoading(false);
        if (code === 0) {
            openNotificationWithIcon("success", "操作结果", "动态发布成功");
            handleCancel();
            // 调用父页面的刷新数据方法
            props.refreshPage();
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    };

    return (
        <Drawer title={news && news.id ? '编辑动态说说':'发布动态说说'} width='75%' forceRender onClose={handleCancel} open={open} bodyStyle={{ paddingBottom: 80 }} maskClosable={false}
                footer={
                <Space>
                    <Button onClick={handleCancel}>取消</Button>
                    <Button loading={confirmLoading} onClick={handleSubmit} type="primary">
                        保存
                    </Button>
                </Space>
            }
        >
            <Form {...formItemLayout} form={newsForm} className="bk-transparent">
                <Form.Item label="标题" {...formItemLayout} name='topic' getValueFromEvent={ (e) => clearTrimValueEvent(e.target.value)} rules={[ {required: true, message: '请输入标题'}, {max: 50, message: '最多不超过50个字符'},]}>
                    <Input type='text' style={{width:'40em'}}/>
                </Form.Item>
                <Form.Item label="标签" {...formItemLayout}>
                    <div style={{display: 'inline'}}>
                        {news.label.map(forMap)}
                    </div>
                    {labelVisible && (
                        <Input
                            ref={labelRef}
                            type="text"
                            size="small"
                            style={{ width: 78 }}
                            value={label}
                            onChange={handleLabelInputChange}
                            onBlur={handleLabelInputConfirm}
                            onPressEnter={handleLabelInputConfirm}
                        />
                    )}
                    {!labelVisible && (
                        <Tag onClick={showLabelInput} >
                            <PlusOutlined/>  New Tag
                        </Tag>
                    )}
                </Form.Item>
                <Form.Item label="内容" {...formItemLayout}>
                    <Editor ref={editorRef}/>
                </Form.Item>
            </Form>
        </Drawer>
    )
}

export default forwardRef(EditNews)