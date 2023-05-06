/**
 * Modal弹窗接口
 */
export interface ModalRef {
    // 打开弹窗&初始化
    handleDisplay: (value: any) => void;
}