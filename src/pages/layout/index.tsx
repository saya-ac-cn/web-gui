import { Button } from 'antd'
import routes from "@/config/routes";
import {Routes,Route} from "react-router-dom";
import {Suspense,useState,useEffect} from "react";
import moment from 'moment';
import "./index.less"


const Layout = () => {

    const [greet,setGreet] = useState('')

    useEffect(()=>{
        getGreetText()
    },[])

    const page = routes.map((item, i) => {
        return (
            <Route key={i} path={item.path} element={
                <Suspense fallback={<div>路由懒加载...</div>}>
                    < item.element />
                </Suspense>
            } />
        )
    })

    /**
     * 根据小时，得到问候词
     * @return
     */
    const getGreetText = () => {
        let hour = moment().format("HH");
        let greetText = "好久不见，甚是想念，记得爱护自己！";
        if(hour >= 0 && hour < 7){
            greetText = "天还没亮，夜猫子，要注意身体哦！";
        }else if(hour>=7 && hour<12){
            greetText = "上午好！又是元气满满的一天，奥利给！";
        }else if(hour >= 12 && hour < 14){
            greetText = "中午好！吃完饭记得午休哦！";
        }else if(hour >= 14 && hour < 18){
            greetText = "下午茶的时间到了，休息一下吧！";
        }else if(hour >= 18 && hour < 22){
            greetText = "晚上到了，多陪陪家人吧！";
        }else if(hour >= 22 && hour < 24){
            greetText = "很晚了哦，注意休息呀！";
        }
        setGreet(greetText)
    };

    const menu = routes.map((item, index) => {
        return (<div className={item.path==='/home'?'menu-item menu-item-selected':'menu-item'} key={item.path}>
            <div className='menu-icon'>{<item.icon/>}</div>
            <div className='menu-name'>{item.name}</div>
        </div>);
    })


    return (
        <div style={{backgroundImage: `url('/picture/layout/animation.svg')`}} className='layout-page'>
            <div data-tauri-drag-region className='window-title'>
                <a className='light red'/>
                <a className='light yellow'/>
                <a className='light green'/>
            </div>
            <div className='menu-area'>
                <div style={{backgroundImage: `url('/picture/layout/user.png')`}} className='user-logo'></div>
                <div className='greetings-area'>
                    <p className='user-name'>早上好！Pandora</p>
                    <p className='greetings-word'>{greet}</p>
                    <p className='pre-log'>最后一次操作：2023-01-01 00:00:00 四川省自贡市</p>
                    <p className='today-plan'>今日安排：无</p>
                </div>
                <div className='calendar'>
                    <div className='calendar-month'>2021年03月</div>
                    <div className='calendar-day'>23</div>
                </div>
                <div className='menu'>
                    {menu}
                </div>
            </div>
            <div className='main-area'>
                <Routes>
                    {page}
                </Routes>
            </div>
        </div>
    )
}

export default Layout