/**
 * 后台菜单路由配置清单
 * 注意：仅支持 " 二 "级菜单
 * @type {*[]}
 * 重要说明！！！
 * 页面路由绝对禁止出现/backend、/frontend、/files（远景包括map）
 * 在定义接口代理时，上述的路由单词已经被定义，如果使用，刷新页面将出现404，
 */

const menuList = [
    {
      title: '主页',// 菜单标题名称
      key: '/backstage/home',// 对应的path
      icon: 'HomeOutlined',// 图标名称
      hidden: false, //是否隐藏
      requireAuth: true, // 是否需要登录后访问
      root:true, // 是否为根节点（当根节点下无子节点时，需要设置本位）
      children: null
    },
    {
        title: '我',// 菜单标题名称
        key: '/gui/me',// 对应的path
        icon: 'UserOutlined',// 图标名称
        hidden: false, //是否隐藏
        requireAuth: true, // 是否需要登录后访问
        root:true, // 是否为根节点（当根节点下无子节点时，需要设置本位）
        children: null
    },
    {
        title: '收入支出',// 菜单标题名称
        key: '/gui/financial',// 对应的path
        icon: 'MoneyCollectOutlined',// 图标名称
        hidden: false, //是否隐藏
        requireAuth: true, // 是否需要登录后访问
        root:true, // 是否为根节点（当根节点下无子节点时，需要设置本位）
        children: null
    },
    {
        title: '收支汇总',// 菜单标题名称
        key: '/backstage/statistics',// 对应的path
        icon: 'ProfileOutlined',// 图标名称
        hidden: false, //是否隐藏
        requireAuth: true, // 是否需要登录后访问
        root:true, // 是否为根节点（当根节点下无子节点时，需要设置本位）
        children: null
    },
    {
        title: '消息动态',// 菜单标题名称
        key: '/gui/news',// 对应的path
        icon: 'NotificationOutlined',// 图标名称
        hidden: false, //是否隐藏
        requireAuth: true, // 是否需要登录后访问
        root:true, // 是否为根节点（当根节点下无子节点时，需要设置本位）
        children: null
    },
    {
        title: '笔记便笺',// 菜单标题名称
        key: '/backstage/note',// 对应的path
        icon: 'FileTextOutlined',// 图标名称
        hidden: false, //是否隐藏
        requireAuth: true, // 是否需要登录后访问
        root:true, // 是否为根节点（当根节点下无子节点时，需要设置本位）
        children: null
    },
    {
        title: '日程安排',// 菜单标题名称
        key: '/backstage/plan',// 对应的path
        icon: 'ScheduleOutlined',// 图标名称
        hidden: false, //是否隐藏
        requireAuth: true, // 是否需要登录后访问
        root:true, // 是否为根节点（当根节点下无子节点时，需要设置本位）
        children: null
    },
    {
        title: '便利贴',// 菜单标题名称
        key: '/backstage/memo',// 对应的path
        icon: 'TagOutlined',// 图标名称
        hidden: false, //是否隐藏
        requireAuth: true, // 是否需要登录后访问
        root:true, // 是否为根节点（当根节点下无子节点时，需要设置本位）
        children: null
    },
    {
        title: '操作日志',// 菜单标题名称
        key: '/backstage/logs',// 对应的path
        icon: 'HistoryOutlined',// 图标名称
        hidden: false, //是否隐藏
        requireAuth: true, // 是否需要登录后访问
        root:true, // 是否为根节点（当根节点下无子节点时，需要设置本位）
        children: null
    },
];
export default menuList
