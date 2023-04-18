import {lazy} from 'react'
import {
    SolutionOutlined,
    PictureOutlined,
    SkinOutlined,
    CarryOutOutlined,
    CalendarOutlined,
    PushpinOutlined,
    ReadOutlined,
    HomeOutlined,
    FlagOutlined,
    DatabaseOutlined,
    UserOutlined,
    FileOutlined,
    SaveOutlined,
    NotificationOutlined,
    ScheduleOutlined,
    HistoryOutlined
} from '@ant-design/icons';

interface Router {
    name: string,   // 组件名
    path: string,   // 打开路由
    root: boolean, // 是否为根节点，由于在antd渲染根节点时，需要特殊处理，
    children: any,
    element: any,    // 组件
    display: boolean,  // 是否在菜单中显示
    icon: any
}

const routes: Array<Router> = [
    {
        name: '主页',
        path: '/home',
        root: true,
        children: null,
        element: lazy(() => import('../pages/home')),
        display: true,
        icon: HomeOutlined
    },
    {
        name: '我',
        path: '/me',
        root: true,
        children: [
            {
                name: '个人信息',
                path: '/me/info',
                root: false,
                children: null,
                element: lazy(() => import('../pages/me/info')),
                display: true,
                icon: SolutionOutlined
            },
            {
                name: '操作日志',
                path: '/me/logs',
                root: false,
                children: null,
                element: lazy(() => import('../pages/me/log')),
                display: true,
                icon: HistoryOutlined
            }
        ],
        element: null,
        display: true,
        icon: UserOutlined,
    },
    {
        name: '随心记',
        path: '/memory',
        root: true,
        children: [
            {
                name: '动态',
                path: '/memory/news',
                root: false,
                children: null,
                element: lazy(() => import('../pages/memory/news')),
                display: true,
                icon: NotificationOutlined
            },
            {
                name: '笔记',
                path: '/memory/note',
                root: false,
                children: null,
                element: lazy(() => import('../pages/memory/note')),
                display: true,
                icon: ReadOutlined
            },
            {
                name: '便利贴',
                path: '/memory/memo',
                root: false,
                children: null,
                element: lazy(() => import('../pages/memory/memo')),
                display: true,
                icon: PushpinOutlined
            },
        ],
        element: null,
        display: true,
        icon: ScheduleOutlined,
    },
    {
        name: '提醒事项',
        path: '/plan',
        root: true,
        children: [
            {
                name: '进行中的',
                path: '/plan/activity',
                root: false,
                children: null,
                element: lazy(() => import('../pages/plan/activity')),
                display: true,
                icon: CalendarOutlined
            },
            {
                name: '所有提醒',
                path: '/plan/archive',
                root: false,
                children: null,
                element: lazy(() => import('../pages/plan/archive')),
                display: true,
                icon: CarryOutOutlined
            }
        ],
        element: null,
        display: true,
        icon: FlagOutlined,
    },
    {
        name: '数据存储',
        path: '/oss',
        root: true,
        children: [
            {
                name: '图片壁纸',
                path: '/oss/wallpaper',
                root: false,
                children: null,
                element: lazy(() => import('../pages/oss/wallpaper')),
                display: true,
                icon: SkinOutlined
            },
            {
                name: '文章插图',
                path: '/oss/illustration',
                root: false,
                children: null,
                element: lazy(() => import('../pages/oss/illustration')),
                display: true,
                icon: PictureOutlined
            },
            {
                name: '文档资料',
                path: '/oss/files',
                root: false,
                children: null,
                element: lazy(() => import('../pages/oss/file')),
                display: true,
                icon: FileOutlined
            },
            {
                name: '数据备份',
                path: '/oss/db',
                root: false,
                children: null,
                element: lazy(() => import('../pages/oss/db')),
                display: true,
                icon: SaveOutlined
            }
        ],
        element: null,
        display: true,
        icon: DatabaseOutlined,
    }
]
export default routes