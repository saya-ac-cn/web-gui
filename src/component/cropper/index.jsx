import React, {Component} from 'react';
import Cropper from 'react-cropper'
import 'cropperjs/dist/cropper.css'
import {Modal} from 'antd';
import './index.less';
import {uploadLogoApi} from "@/api";
import {openNotificationWithIcon} from "@/utils/window";
import storageUtils from "@/utils/storageUtils";
import {EditOutlined} from "@ant-design/icons";


/*
 * 文件名：index.jsx
 * 作者：liunengkai
 * 创建日期：2022-10-05 - 22:04
 * 描述：
 * 参考1：https://www.jianshu.com/p/eeaa9fba56d0
 * 参考2：https://blog.csdn.net/qq_37043418/article/details/109238963
 */

// 定义组件（ES6）
class CropperComponent extends Component {

    state = {
        //模态框
        modalVisible: false,
        //上传的load
        confirmLoading: false,
        //文件路径（选择的）
        src: null,
        //文件名后才能
        headerImage: '',
    };

    onCropperInit = cropper => { this.cropper = cropper }

    /**
     * 为第一次render()准备数据  因为要异步加载数据，所以方法改为async执行
     */
    componentDidMount() {
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
          const dataURL = e.target.result;
          this.setState({src: dataURL})
        };
        // 从本地缓存取出当前用户的logo
        const user = storageUtils.get(storageUtils.USER_KEY);
        const headerImage = user.logo;
        this.setState({
          headerImage
        });
        let file = this.props.uploadedImageFile;
        if (file) {
          fileReader.readAsDataURL(this.props.uploadedImageFile)
        }
    }

    //选择图片
    handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          //文件最多不能超过5M
          if (file.size / 1024 <= 5 * 1024) {
              const reader = new FileReader();
              reader.onload = () => {
                  this.setState({
                      src: reader.result
                  }, () => {
                      this.setState({
                          modalVisible: true,
                      })
                  })
              };
              reader.readAsDataURL(file);

          } else {
              openNotificationWithIcon("error", "文件过大", "所选文件不能超过5M");
          }
      } else {
          openNotificationWithIcon("error", "上传提示", "请选择文件");
      }
      e.target.value = ''
    };

    //保存裁切
    saveCropperImg = () => {
      let _this = this;
        // 用户未选择
        if (_this.cropper.getCroppedCanvas() === 'null') {
            return false
        }
        // this.setState({
        //     confirmLoading: true,
        // });
        // Crop
        const croppedCanvas = _this.cropper.getCroppedCanvas();
        // Round
        let roundedCanvas = _this.getRoundedCanvas(croppedCanvas);
        //获取Canvas图片，base64
        let headerImage = roundedCanvas.toDataURL();
        _this.setState({
            headerImage
        }, function () {
            // 执行图片上传
            _this.upload(headerImage)
        })
    };

    upload = async (image) => {
        let _this = this;
        _this.setState({
            confirmLoading: true,
        });
        //这边写图片的上传
        let para = {
            content: image.toString()
        };
        const result = await uploadLogoApi(para);
        _this.setState({
            confirmLoading: false,
        });
        let {msg, code,data} = result;
        if (code === 0) {
            openNotificationWithIcon("success", "上传结果", "上传成功");
            // 覆写到本地缓存
            const user = storageUtils.get(storageUtils.USER_KEY);
            user.logo = data
            storageUtils.add(storageUtils.USER_KEY,user)
            _this.setState({
                modalVisible: false,
                headerImage: data
            });
        } else {
            openNotificationWithIcon("error", "上传结果", msg);
        }
    };

    // 裁剪一个圆形的图片
    getRoundedCanvas = (sourceCanvas) => {
        let canvas = document.createElement('canvas');
        let context = canvas.getContext('2d');
        let width = sourceCanvas.width;
        let height = sourceCanvas.height;
        canvas.width = width;
        canvas.height = height;
        context.imageSmoothingEnabled = true;
        context.drawImage(sourceCanvas, 0, 0, width, height);
        context.globalCompositeOperation = 'destination-in';
        context.beginPath();
        context.arc(width / 2, height / 2, Math.min(width, height) / 2, 0, 2 * Math.PI, true);
        context.fill();
        return canvas;
    };

    //取消裁切
    cancelCropper = () => {
        this.setState({
            modalVisible: false,
        });
    };


    render() {
        // 读取状态数据
        const {headerImage, modalVisible, confirmLoading, src} = this.state;
        return (
            <div className='upload-cropper'>
                {/* 选择图片按钮 */}
                <div className="show">
                    <div className="picture" style={{backgroundImage: 'url(' + headerImage + ')'}}></div>
                    <div className="mask-layer">
                        {/*<EditOutlined className='edit-user-logo'>*/}
                        {/*</EditOutlined>*/}
                        <span className="upload-span" role="button">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={this.handleFileChange}
                                />
                            </span>
                    </div>
                </div>
                {/* 裁切图片modal框 */}
                <Modal
                    title="图片裁切"
                    width="50vw"
                    closable={false}
                    destroyOnClose={true}
                    maskClosable={false}
                    open={modalVisible}
                    onOk={this.saveCropperImg}
                    confirmLoading={confirmLoading}
                    onCancel={this.cancelCropper}>
                    <div className="cropperModal">
                        <Cropper
                            src={src}//图片路径，即是base64的值，在Upload上传的时候获取到的
                            style={{height: 400, width: '100%'}}
                            preview='.cropper-preview'
                            className="company-cropper"
                            viewMode={1} //定义cropper的视图模式
                            zoomable={true} //是否允许放大图像
                            aspectRatio={1} //image的纵横比1:1
                            guides={false} //显示在裁剪框上方的虚线
                            background={false} //是否显示背景的马赛克
                            rotatable={true} //是否旋转
                            //ref='cropper'//在官方更新之后ref不在支持，应写为以下
                            //crop={this._crop.bind(this)}
                            onInitialized={this.onCropperInit.bind(this)}
                        />
                        <div className='preview-button'>
                            <div className="cropper-preview" style={{
                                borderRadius: '50%',
                                height: 100,
                                width: '100%'
                            }}></div>
                        </div>

                    </div>

                </Modal>

            </div>
        )
    }

}

// 对外暴露
export default CropperComponent;
