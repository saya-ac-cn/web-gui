import {lazy, ReactElement} from 'react'
import {HomeOutlined,UserOutlined,MoneyCollectOutlined,ProfileOutlined,NotificationOutlined,FileTextOutlined,ScheduleOutlined,TagOutlined,HistoryOutlined} from '@ant-design/icons';
interface Router {
    name: string,   // 组件名
    path: string,   // 打开路由
    exact: boolean,
    element: any,    // 组件
    display: boolean,  // 是否在菜单中显示
    icon: any
}
const routes : Array<Router> = [
    {
        name: '主页',
        path: '/home',
        exact: true,
        element: lazy(() => import('../pages/home')),
        display: true,
        icon: HomeOutlined,
    },
    {
        name: '我',
        path: '/me',
        exact: true,
        element: lazy(() => import('../pages/home')),
        display: true,
        icon: HomeOutlined
    },
    {
        name: '收入支出',
        path: '/journal',
        exact: true,
        element: lazy(() => import('../pages/home')),
        display: true,
        icon: MoneyCollectOutlined
    },
    {
        name: '收支汇总',
        path: '/statistics',
        exact: true,
        element: lazy(() => import('../pages/home')),
        display: true,
        icon: ProfileOutlined
    },
    {
        name: '消息动态',
        path: '/news',
        exact: true,
        element: lazy(() => import('../pages/home')),
        display: true,
        icon: NotificationOutlined
    },
    {
        name: '笔记便笺',
        path: '/note',
        exact: true,
        element: lazy(() => import('../pages/home')),
        display: true,
        icon: FileTextOutlined
    },
    {
        name: '日程安排',
        path: '/plan',
        exact: true,
        element: lazy(() => import('../pages/home')),
        display: true,
        icon: ScheduleOutlined
    },
    {
        name: '便利贴',
        path: '/memo',
        exact: true,
        element: lazy(() => import('../pages/home')),
        display: true,
        icon: TagOutlined
    },
    {
        name: '操作日志',
        path: '/logs',
        exact: true,
        element: lazy(() => import('../pages/home')),
        display: true,
        icon: HistoryOutlined
    }
]
export default routes