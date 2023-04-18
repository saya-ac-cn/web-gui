import {Suspense,useState,useEffect} from "react";

import './index.less'
import {Routes,Route,useNavigate,useLocation,NavLink} from "react-router-dom";
import Storage from '@/utils/storage'
import routes from "@/menu/routes";
import {isEmptyObject} from "@/utils/var"
import { Button, Input, Menu, Popover, Avatar, Spin, Badge, Modal} from 'antd';
import {FlagOutlined,RightOutlined,LeftOutlined,MenuOutlined, HomeOutlined,NotificationOutlined,MessageOutlined, DatabaseOutlined,HistoryOutlined,SearchOutlined,UserOutlined,AccountBookOutlined,ScheduleOutlined,PushpinOutlined,CarryOutOutlined,PayCircleOutlined,SkinOutlined} from '@ant-design/icons';
import {logoutApi} from "@/http/api"
import {appWindow} from "@tauri-apps/api/window";
import {openLoginWindow} from "@/windows/actions";
/*
 * 文件名：index.jsx
 * 作者：saya
 * 创建日期：2020/7/15 - 10:20 下午
 * 描述：后台主页
 */
const pages = () => {
    let page = [];
    for(let branch of routes){
        if (branch.children){
            // 还有子级
            for(let leaf of branch.children){
                page.push(
                    <Route key={leaf.path} path={leaf.path} element={
                        <Suspense fallback={<div><Spin size="large"/></div>}>
                            <leaf.element/>
                        </Suspense>
                    } />
                )
            }
        }else{
            page.push(
                <Route key={branch.path} path={branch.path} element={
                    <Suspense fallback={<div><Spin size="large"/></div>}>
                        <branch.element/>
                    </Suspense>
                } />
            )
        }
    }
    return page
}

// 定义组件（ES6）
const Layout = () => {

    // 当前已经登录的用户信息
    const [user,setUser] = useState({account:'shmily','name': '刘能凯',logo:null,backgroundUrl:null})
    // 本日计划
    const [plan,setPlan] = useState([])
    // 上次操作记录
    const [log,setLog] = useState({date:null,city:null,ip:null,detail:null})
    // 左右侧的菜单切换
    const [leftCollapsed,setLeftCollapsed] = useState(false)
    const [rightCollapsed,setRightCollapsed] = useState(false)
    // 当前展开的菜单数组
    const [openKeys,setOpenKeys] = useState([])
    // 左侧菜单
    const [menuNodes,setMenuNodes] = useState([])
    // 搜索框的文本
    const [searchValue,setSearchValue] = useState<string>()

    const location = useLocation()
    const navigate = useNavigate();


    useEffect(()=>{
        const user = Storage.get(Storage.USER_KEY) || {};
        const plan = Storage.get(Storage.PLAN_KEY) || [];
        const log = Storage.get(Storage.LOG_KEY) || {};
        setUser(user)
        setPlan(plan)
        setLog(log)
        // 初始化左侧导航
        setMenuNodes(getMenuNodes(routes,location.pathname));
    },[])


    // 左侧切换面板
    const handleLeftTabClick = () => {
        setLeftCollapsed(!leftCollapsed)
    };

    // 右侧面板切换
    const handleRightTabClick = () => {
        setRightCollapsed(!rightCollapsed)
    }

    /**
     * 初始化头像下拉菜单
     */
    const initHeaderMenu = (user) => (
        <div className="backend-layout-header-info-hover">
            <div className='user-img-div'>
                <Avatar size={64} icon={<UserOutlined/>} src={user.logo ? user.logo : '/picture/layout/user.png'}/>
                <div className='operator-img'>
                    <span>{user.name || '用户'}</span>
                    <Button type="link" href='/backstage/me/info'>更换头像</Button>
                </div>
            </div>
            <div className='system-operator'>
                <Button type="link" href='/backstage/me/info'>设置</Button>
                <Button type="link" onClick={logout}>退出</Button>
            </div>
        </div>
    )


    /**
     * 根据menu的数据数组生成对应的标签数组
     * 使用reduce() + 递归调用
     * @param menuList 原始配置的菜单数据
     * @param currentPath 当前url
     * @returns {*}
     */
    const getMenuNodes = (menuList,currentPath=location.pathname) => {
        return menuList.reduce((pre, item) => {
            const _path = `/backstage${item.path}`;
            // 向pre添加<Menu.Item>
            if (!item.children && item.display === true) {
                if(item.root){
                    // 处理只有根节点，无子节点的菜单
                    if(currentPath===item.path){
                        // 当前打开的是根节点且无子节点，无须展开
                        setOpenKeys([])
                    }
                    pre.push(({ label: <NavLink to={_path} onClick={()=>pageHandle(_path)} style={{color: `${currentPath===_path?'#7bc0fe':''}`}}>{item.name}</NavLink>, key: _path,icon: <item.icon/>}))
                }else{
                    pre.push(({ label: <NavLink to={_path} onClick={()=>pageHandle(_path)} style={{color: `${currentPath===_path?'#7bc0fe':''}`}}>{item.name}</NavLink>, key: _path,icon: <item.icon/>}))
                }

            } else if (item.children && item.display === true) {
                // 查找一个与当前请求路径匹配的子Item
                const cItem = item.children.find(cItem => currentPath.indexOf('/backstage'+cItem.path) === 0);
                // console.log(path,item.children,cItem,_path)
                // 如果存在, 说明当前item的子列表需要打开
                if (cItem) {
                    setOpenKeys([_path])
                }
                // 向pre添加<SubMenu>
                pre.push((
                    {
                        label: item.name,
                        key: _path,
                        icon: <item.icon/>,
                        children: getMenuNodes(item.children,currentPath),
                    })
                );
            }
            return pre
        }, [])
    };

    /**
     * 监听页面切换事件（用于页面上的按钮在发生跳转时，及时回显作用到菜单）
     * @param path 要跳转的路径
     */
    const pageHandle = (exceptUrl:string) => {
        setMenuNodes(getMenuNodes(routes,exceptUrl));
    }

    /**
     * 一级菜单点击展开事件
     * @param _openKeys
     */
    const onOpenChange = (_openKeys) => {
        const latestOpenKey = _openKeys.find(key => openKeys.indexOf(key) === -1);
        routes.reduce((pre, item) => {
            if (item.display){
                const cItem = _openKeys.find(cItem => openKeys.indexOf(cItem) === -1);
                // 如果存在, 说明当前item的子列表需要打开
                if (cItem) {
                    // 切换
                    setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
                }else {
                    // 不切换保持原样
                    setOpenKeys(_openKeys);
                }
            }
        }, [])
    };

    /**
     * 退出登陆
     */
    const logout = () => {
        // 显示确认框
        Modal.confirm({
            title: '操作确认',
            content:'确定退出吗?',
            onOk: async () => {
                // 请求注销接口
                await logoutApi();
                // 删除保存的user数据
                Storage.removeAll();
                // 跳转到login
                navigate('/')
            }
        })
    };

    /**
     * 搜索框内容改变事件（用于双向绑定数据）
     * @param event
     */
    const searchInputChange = (event) => {
        const value = event.target.value
        setSearchValue(value)
    };

    /**
     * 执行搜索
     */
    const handleSearch = () =>{
        let _searchValue = searchValue || ""
        _searchValue = _searchValue.trim()
        if (_searchValue) {
            // 有效内容可以搜索
            // 跳转到笔记列表界面 (需要再回退到当前页面),replace是不需要回退
            // window.location.href = `/backstage/memory/note?search=${searchValue}`
        }
    }

    /**
     * 写笔记
     */
    const addNotes = () => {
        navigate('/backstage/memory/note')
    }

    // 关闭
    const handleAppClose = async() => {
        Modal.confirm({
            title: '操作确认',
            content:'确定关闭吗?',
            onOk: async () => {
                // 请求注销接口
                // await requestLogout();
                // 删除保存的user数据
                Storage.removeAll();
                // 跳转到login
                openLoginWindow()
            }
        })
    }

    // 最小化
    const handleAppMinimize = async() => {
        await appWindow.minimize()
    }

    // 最大化/还原
    const handleAppToggle = async() => {
        await appWindow.toggleMaximize()
    }

    return (
        <div className="backend-container">
            <div data-tauri-drag-region className='window-title'>
                <a onClick={handleAppClose} className='light red'/>
                <a onClick={handleAppMinimize} className='light yellow'/>
                <a onClick={handleAppToggle} className='light green'/>
            </div>
            <div className='background-div' style={{backgroundImage:`url('${user.background_url ? user.background_url:'/picture/layout/background_2.jpg'}')`}}>
            </div>
            <header className="this-header">
                <div className='header-logo'>
                    <div className='tab-operation'>
                        <Button type="link" size='large' onClick={handleLeftTabClick}>
                            <MenuOutlined/>
                        </Button>
                    </div>
                    <div className='project-div' style={{backgroundImage:`url('/picture/project.svg')`}}>
                    </div>
                    <div className='project-name'>
                        亲亲里
                    </div>
                </div>
                <div className='header-search'>
                    <div className='header-search-form'>
                        {
                            (location.pathname).indexOf('/backstage/memory/note') !== 0 ?
                                <div className='header-search-form-input'>
                                    <Button onClick={handleSearch}><SearchOutlined/></Button>
                                    <Input placeholder="搜索笔记" maxLength={32}
                                           value={searchValue}
                                           onChange={searchInputChange}
                                           onPressEnter={handleSearch}/>
                                </div>
                                : null
                        }
                    </div>
                    <div className='header-search-menu'>
                        {
                            !(isEmptyObject(plan)) ?
                                <Popover content={plan.reduce((pre, item) => {pre.push(<p key={item.item}>{item.item}</p>);return pre},[])} title="今天计划">
                                    <Badge dot color="#2db7f5">
                                        <NotificationOutlined/>
                                    </Badge>
                                </Popover> :
                                <Popover content="暂无计划" title="今天计划">
                                    <Badge>
                                        <NotificationOutlined/>
                                    </Badge>
                                </Popover>
                        }
                    </div>
                </div>
                <div className='header-info'>
                    <Popover trigger="hover" mouseEnterDelay={0.2} mouseLeaveDelay={0.4} content={initHeaderMenu(user)}  placement="bottomRight">
                            <span className="el-dropdown-link">
                                <img src={user.logo ? user.logo : '/picture/layout/user.png'} alt={user.name || '用户'}/>
                            </span>
                    </Popover>
                </div>
            </header>
            <section className="this-content">
                <div className={`left-menu ${leftCollapsed ? 'left-menu-close' : 'left-menu-open'}`}>
                    <div className='menu-logo'>
                        <div className={`logo-item ${leftCollapsed?"menu-logo-close":""}`} onClick={addNotes}>
                            写笔记
                        </div>
                    </div>
                    <div className='menu-list'>
                        <Menu className='menu-list-ul' subMenuCloseDelay={1}  subMenuOpenDelay={1}  onOpenChange={onOpenChange} openKeys={openKeys} defaultOpenKeys={openKeys} mode="inline"
                              inlineCollapsed={leftCollapsed} items={menuNodes}>
                        </Menu>
                    </div>
                    <div className={`menu-copyright ${leftCollapsed?"menu-copyright-close":""}`}>
                        <Button type="link" title='切换壁纸' href="/backstage/oss/wallpaper"><SkinOutlined/></Button>
                        <Button type="link" title='数据统计' href="/backstage/home"><HomeOutlined/></Button>
                        <Button type="link" title='操作日志' href="/backstage/me/logs"><HistoryOutlined/></Button>
                    </div>
                </div>
                <div className='content-container'>
                    <div className='content-div'>
                        <div className='container-div'>
                            <Suspense>
                                <Routes>
                                    {pages()}
                                </Routes>
                            </Suspense>
                        </div>
                    </div>
                    <div className='operation-info'>
                        {
                            !(isEmptyObject(log)) ?
                                <span>{`您上次操作时间:${log.date}，操作地点:${log.city}(${log.ip})，操作明细:${log.detail}`}</span> :
                                <span>Hi，这是您第一次使用吧？如有需要帮助的请及时联系运营团队。</span>
                        }
                    </div>
                </div>
                <div className={rightCollapsed?'show-quick-div':'hide-quick-div'}>
                    <div className="quick-div-menu">
                        <Button type="link" title='记账' href="/backstage/financial/journal"><PayCircleOutlined/></Button>
                        <Button type="link" title='发布动态' href="/backstage/memory/news"><NotificationOutlined/></Button>
                        <Button type="link" title='提醒事项' href="/backstage/plan/activity"><CarryOutOutlined/></Button>
                        <Button type="link" title='便利贴' href="/backstage/memory/memo"><PushpinOutlined/></Button>
                    </div>
                    <div className="quick-div-button">
                        <div className="button-square" title="关闭侧边栏" onClick={handleRightTabClick}>
                            <RightOutlined />
                        </div>
                    </div>
                </div>
                <div className={rightCollapsed?'hide-open-quick-div':'show-open-quick-div'}>
                    <div className="button-square" title="显示侧边栏" onClick={handleRightTabClick}>
                        <LeftOutlined />
                    </div>
                </div>
            </section>
        </div>
    )
}

// 对外暴露
export default Layout
