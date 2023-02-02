import React, {useState} from "react";
import './index.less'
import Storage from "@/utils/storage";
import {openNotificationWithIcon} from "@/utils/window";
import {editUserInfoApi,editPwdApi} from "@/http/api";
import {Button, Input,DatePicker,Form} from "antd";
import {FormOutlined, CheckOutlined,CloseOutlined} from "@ant-design/icons";
import './index.less'
import Cropper from '@/component/cropper'
import {clearTrimValueEvent} from "@/utils/string";
import moment from "moment";
import {disabledDate, returnDefaultValue} from '@/utils/var'

const formItemLayout = {
    labelCol: {span: 8},
    wrapperCol: {span: 16},
};
const buttonItemLayout = {
    wrapperCol: {span: 16, offset: 8},
};
const Info = () => {

    const [passwordForm] = Form.useForm();
    const [loading, setLoading] = useState({
        password:false,
        autograph:false,
        birthday:false,
        hometown:false,
    });
    const [status, setStatus] = useState({
        autograph:false,
        birthday:false,
        hometown:false,
        password:false,
    });
    const [currentUser,setCurrentUser] = useState(Storage.get(Storage.USER_KEY))
    const [form, setForm] = useState({});

    /**
     * 切换 文本框编辑状态
     * @param field 字段名
     * @param value 字段值
     */
    const handleEditInput = (field,value) => {
        const _status = {...status}
        _status[field] = value
        if (value){
            // 用户进入编辑
            const _form = {...form}
            _form[field] = currentUser[field]
            setForm(_form);
        }
        setStatus(_status);
    };

    /**
     * 文本框保存
     * @param field 字段名
     */
    const handleEditInputSubmit = async (field) => {
        // 首先是从form中提取数据，主要是判断是否为空
        const value = form[field]
        if (null === value || '' === value) {
            openNotificationWithIcon("error", "错误提示", '不允许提交空内容');
            return;
        }
        // 构造提交参数
        let args = {account: currentUser.account}
        args[field] = value
        // 修改loading
        let _loading = {...loading}
        _loading[field] = true
        setLoading(_loading)
        const result = await editUserInfoApi(args).catch(()=>{
            _loading = {...loading}
            _loading[field] = false
            setLoading(_loading)
        });
        _loading = {...loading}
        _loading[field] = false
        setLoading(_loading)
        let {msg, code} = result;
        if (code === 0) {
            // 修改成功后，及时回填值
            const _status = {...status}
            _status[field] = false
            setStatus(_status)

            const user = {...currentUser}
            user[field] = value
            setCurrentUser(user);
            Storage.add(Storage.USER_KEY,user)
            openNotificationWithIcon("success", "操作结果", "个人信息修改成功");
        } else {
            openNotificationWithIcon("error", "错误提示", msg);
        }
    }


    /**
     * 双向绑定日期选择
     * @param date
     * @param dateString
     */
    const dateChange = (date, dateString) => {
        setForm({...form,birthday:dateString})
    };

    /**
     * 双向绑定文本框
     * @param event 时间
     * @param field 字段
     */
    const inputChange = (event,field) => {
        const value = event.target.value;
        const _form = {...form};
        _form[field] = value.replace(/\s+/g, '');
        setForm(_form)
    };

    /**
     * 密码提交修改
     */
    const handlePwdFormSubmit = () => {
        passwordForm.validateFields(['password']).then( async value => {
            // 通过验证
            let args = {
                password: value.password,
                account:currentUser.account
            };
            setLoading({...loading,password: true});
            const result = await editPwdApi(args).catch(()=>{setLoading({...loading,password: true})});
            setLoading({...loading,password: false})
            let {msg, code} = result;
            if (code === 0) {
                handleEditInput('password',false)
                openNotificationWithIcon("success", "操作结果", "密码修改成功");
            } else {
                openNotificationWithIcon("error", "错误提示", msg);
            }
        })
    };


    return (
        <div>
            <div className='child-container'>
                <div className='header-tools'>
                    我
                </div>
                <div className='child-content'>
                    <div className='about-me'>
                        <div className='about-me-advance'>
                            <div className='about-me-basic'>
                                <div className='about-me-section'>基本信息</div>
                                <div className='about-me-logo'>
                                    <Cropper/>
                                </div>
                                <div className='about-me-advance-line'>
                                    <label className='about-me-lable'>账号</label>
                                    <div><span className='about-me-value'>{returnDefaultValue(currentUser.account)}</span></div>
                                </div>
                                <div className='about-me-advance-line'>
                                    <label className='about-me-lable'>姓名</label>
                                    <div><span className='about-me-value'>{returnDefaultValue(currentUser.name)}</span></div>
                                </div>
                                <div className='about-me-advance-line'>
                                    <label className='about-me-lable'>性别</label>
                                    <div><span className='about-me-value'>{returnDefaultValue(currentUser.sex)}</span></div>
                                </div>
                                <div className='about-me-advance-line'>
                                    <label className='about-me-lable'>生日</label>
                                    <div>
                                        {
                                            status.birthday
                                                ? <div className='about-me-advance-field-area'><DatePicker className='about-me-advance-value' onChange={dateChange} disabledDate={disabledDate} value={(form && form.birthday)?moment(form.birthday):null}/><Button type="primary" loading={loading.birthday} onClick={() => handleEditInputSubmit('birthday')} className='about-me-save-btn' htmlType="button">保存</Button> <Button className='about-me-cancel-btn' type="primary" onClick={() => handleEditInput('birthday',false)} htmlType="button">取消</Button></div>
                                                :<div className='about-me-advance-field-area'><span className='about-me-value'>{returnDefaultValue(currentUser.birthday)}</span><FormOutlined onClick={() => handleEditInput('birthday',true)} className='edit-status'/></div>
                                        }
                                    </div>
                                </div>
                                <div className='about-me-advance-line'>
                                    <label className='about-me-lable'>故乡</label>
                                    <div>
                                        {
                                            status.hometown
                                                ? <div className='about-me-advance-field-area'><Input className='about-me-advance-value' onChange={(e)=>inputChange(e,'hometown')} value={form.hometown} maxLength={20}/><Button type="primary" loading={loading.hometown} onClick={() => handleEditInputSubmit('hometown')} className='about-me-save-btn' htmlType="button">保存</Button> <Button className='about-me-cancel-btn' type="primary" onClick={() => handleEditInput('hometown',false)} htmlType="button">取消</Button></div>
                                                :<div className='about-me-advance-field-area'><span className='about-me-value'>{returnDefaultValue(currentUser.hometown)}</span><FormOutlined onClick={() => handleEditInput('hometown',true)} className='edit-status'/></div>
                                        }
                                    </div>
                                </div>
                            </div>
                            <div className='about-me-more'>

                                <div className='about-me-autograph'>
                                    <label className='about-me-section'>个性签名</label>
                                    <div>
                                        {
                                            status.autograph
                                                ? <div className='about-me-autograph-area'><Input className='about-me-autograph-value' onChange={(e)=>inputChange(e,'autograph')} value={form.autograph} maxLength={80}/><Button type="primary" loading={loading.autograph} onClick={() => handleEditInputSubmit('autograph')} className='about-me-save-btn' htmlType="button">保存</Button> <Button className='about-me-cancel-btn' type="primary" onClick={() => handleEditInput('autograph',false)} htmlType="button">取消</Button></div>
                                                :<div className='about-me-autograph-area'><span className='about-me-value'>{currentUser.autograph}</span><FormOutlined onClick={() => handleEditInput('autograph',true)} className='edit-status'/></div>
                                        }
                                    </div>
                                </div>

                                <div className='about-me-section'>通讯信息</div>
                                <div className='about-me-advance-line'>
                                    <label className='about-me-lable'>组织号</label>
                                    <div><span className='about-me-value'>{returnDefaultValue(currentUser.organize_id)}</span></div>
                                </div>
                                <div className='about-me-advance-line'>
                                    <label className='about-me-lable'>绑定QQ</label>
                                    <div><span className='about-me-value'>{returnDefaultValue(currentUser.qq)}</span></div>
                                </div>
                                <div className='about-me-advance-line'>
                                    <label className='about-me-lable'>绑定手机</label>
                                    <div><span className='about-me-value'>{returnDefaultValue(currentUser.phone)}</span></div>
                                </div>
                                <div className='about-me-advance-line'>
                                    <label className='about-me-lable'>绑定邮箱</label>
                                    <div><span className='about-me-value'>{returnDefaultValue(currentUser.email)}</span></div>
                                </div>
                                <div className='about-me-section about-me-security-section'>安全设置</div>
                                <div className='about-me-password-line'>
                                    {
                                        status.password
                                            ?
                                            <Form className='about-me-password-form' onFinish={handlePwdFormSubmit} {...formItemLayout} form={passwordForm}>
                                                <Form.Item name="password" label="密码" getValueFromEvent={ (e) => clearTrimValueEvent(e.target.value)} rules={[{required: true,message: '请输入密码!'},{min: 6, message: '长度在 6 到 32 个字符'}, {max: 32, message: '长度在 6 到 32 个字符'}]} hasFeedback>
                                                    <Input.Password />
                                                </Form.Item>
                                                <Form.Item name="confirm" label="确认密码" getValueFromEvent={ (e) => clearTrimValueEvent(e.target.value)} dependencies={['password']} hasFeedback
                                                           rules={[
                                                               {min: 6, message: '长度在 6 到 32 个字符'}, {max: 32, message: '长度在 6 到 32 个字符'},
                                                               {required: true,message: '请输入密码!'},
                                                               ({ getFieldValue }) => ({
                                                                   validator(_, value) {
                                                                       if (!value || getFieldValue('password') === value) {
                                                                           return Promise.resolve();
                                                                       }
                                                                       return Promise.reject(new Error('您两次输入的密码不一致!'));
                                                                   },
                                                               }),
                                                           ]}
                                                >
                                                    <Input.Password />
                                                </Form.Item>
                                                <Form.Item {...buttonItemLayout}>
                                                    <Button htmlType="submit" type="primary" loading={loading.password}>
                                                        保存
                                                    </Button>
                                                    <Button htmlType="button" style={{ margin: '0 8px' }} onClick={() => handleEditInput('password',false)}>
                                                        取消
                                                    </Button>
                                                </Form.Item>
                                            </Form>
                                            :<div className='about-me-advance-password'>
                                                <label className='about-me-lable'>密码</label>
                                                <div><span className='about-me-value'>********</span><FormOutlined onClick={() => handleEditInput('password',true)} className='edit-status'/></div>
                                            </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Info