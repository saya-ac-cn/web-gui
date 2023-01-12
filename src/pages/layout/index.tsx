import routes from "@/config/routes";
import {Routes,Route,useNavigate,useLocation} from "react-router-dom";
import {Suspense,useState,useEffect} from "react";
import moment from 'moment';
import "./index.less"
import Storage from '@/utils/storage'
import {isEmptyObject} from "@/utils/var"

const Layout = () => {

    const [greet,setGreet] = useState({when:'',text:''})
    const [user,setUser] = useState({logo:null,name:null})
    const [plan,setPlan] = useState({})
    const [log,setLog] = useState({date:null,city:null,ip:null})

    const navigate = useNavigate()

    const location = useLocation()

    useEffect(()=>{
        const user = Storage.get(Storage.USER_KEY) || {};
        const plan = Storage.get(Storage.PLAN_KEY) || [];
        const log = Storage.get(Storage.LOG_KEY) || {};
        setUser(user)
        setPlan(plan)
        setLog(log)
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

    const pageDirect = (path) => {
        if (path === location.pathname){
            return
        }
        navigate(path)
    };

    /**
     * 根据小时，得到问候词
     * @return
     */
    const getGreetText = () => {
        let hour = moment().format("HH");
        let text = "好久不见，甚是想念，记得爱护自己！";
        let when = '早上好！'
        if(hour >= 0 && hour < 7){
            text = "天还没亮，夜猫子，要注意身体哦！";
            when = '凌晨好！'
        }else if(hour>=7 && hour<12){
            text = "上午好！又是元气满满的一天，奥利给！";
            when = '上午好！'
        }else if(hour >= 12 && hour < 14){
            text = "中午好！吃完饭记得午休哦！";
            when = '中午好！'
        }else if(hour >= 14 && hour < 18){
            text = "下午茶的时间到了，休息一下吧！";
            when = '下午好！'
        }else if(hour >= 18 && hour < 22){
            text = "晚上到了，多陪陪家人吧！";
            when = '晚上好！'
        }else if(hour >= 22 && hour < 24){
            text = "很晚了哦，注意休息呀！";
            when = '晚上好！'
        }
        setGreet({when,text})
    };

    const menu = routes.map((item, index) => {
        const path = '/stage'+item.path;
        return (<div className={path === location.pathname?'menu-item menu-item-selected':'menu-item'} key={item.path} onClick={()=>pageDirect(path)}>
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
                <div style={{backgroundImage:`url('${user.logo?user.logo:'/picture/layout/user.png'}')`}} className='user-logo'></div>
                <div className='greetings-area'>
                    <p className='user-name'>{greet.when+' '+user.name}</p>
                    <p className='greetings-word'>{greet.text}</p>
                    <p className='pre-log'>
                        {
                            !(isEmptyObject(log)) ?
                                <span>{`最后一次操作：${log.date} ${log.city}(${log.ip})`}</span> :
                                <span>Hi，这是您第一次使用吧？如有需要帮助的请及时联系运营团队。</span>
                        }
                    </p>
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