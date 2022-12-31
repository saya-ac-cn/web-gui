import React,{useRef} from "react";
import { Button } from 'antd';
import EditNews from './edit'

const News:React.FC = () => {

    const editRef = useRef();

    const getData = () => {
        console.log("刷新页面的数据")
    };

    return (
        <div>
            动态页面
            <Button type="primary" onClick={() => editRef.current.handleDisplay(10)}>
                详情
            </Button>
            <EditNews ref={editRef} refreshPage={getData}/>
        </div>
    )
}

export default News