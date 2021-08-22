const {createProxyMiddleware} = require('http-proxy-middleware');

// 开发环境接口
//const url = "http://127.0.0.1:8080";
// 测试环境接口
 const url = "http://118.24.198.239:8080";
// 线上环境接口
//const url = "http://laboratory.saya.ac.cn";
// 配置多个跨域设置
//重要说明！！！
//页面路由绝对禁止出现/backend、/frontend、/warehouse（远景包括map）
//在定义接口代理时，上述的路由单词已经被定义，如果使用，刷新页面将出现404，
module.exports = function (app) {
    // ...You can now register proxies as you wish!
    app.use(createProxyMiddleware('/backend/**', {
        target: url,
        changeOrigin: true,
    }));
    app.use(createProxyMiddleware('/frontend/**', {
        target: url,
        changeOrigin: true,
    }));
    app.use(createProxyMiddleware('/warehouse/**', {
        target: url,
        changeOrigin: true,
    }));
};
