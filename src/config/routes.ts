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
        name: '概览',
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
        element: lazy(() => import('../pages/me/info')),
        display: true,
        icon: HomeOutlined
    },
    {
        name: '记账本',
        path: '/journal',
        exact: true,
        element: lazy(() => import('../pages/financial/journal')),
        display: true,
        icon: MoneyCollectOutlined
    },
    {
        name: '收支预览',
        path: '/statistics',
        exact: true,
        element: lazy(() => import('../pages/financial/day')),
        display: true,
        icon: ProfileOutlined
    },
    {
        name: '动态说说',
        path: '/news',
        exact: true,
        element: lazy(() => import('../pages/memory/news')),
        display: true,
        icon: NotificationOutlined
    },
    {
        name: '笔记簿',
        path: '/note',
        exact: true,
        element: lazy(() => import('../pages/memory/note')),
        display: true,
        icon: FileTextOutlined
    },
    {
        name: '待提醒项',
        path: '/activity',
        exact: true,
        element: lazy(() => import('../pages/plan/activity')),
        display: true,
        icon: ScheduleOutlined
    },
    {
        name: '已提醒项',
        path: '/archive',
        exact: true,
        element: lazy(() => import('../pages/plan/archive')),
        display: true,
        icon: ScheduleOutlined
    },
    {
        name: '便利贴',
        path: '/memo',
        exact: true,
        element: lazy(() => import('../pages/memory/memo')),
        display: true,
        icon: TagOutlined
    },
    {
        name: '文件夹',
        path: '/file',
        exact: true,
        element: lazy(() => import('../pages/file')),
        display: true,
        icon: TagOutlined
    },
    {
        name: '数据备份',
        path: '/data',
        exact: true,
        element: lazy(() => import('../pages/data')),
        display: true,
        icon: HistoryOutlined
    },
    {
        name: '操作日志',
        path: '/log',
        exact: true,
        element: lazy(() => import('../pages/me/log')),
        display: true,
        icon: HistoryOutlined
    }
]
export default routes