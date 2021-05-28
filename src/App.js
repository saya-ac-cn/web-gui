import React from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom'
import Backend from './pages/layout/v1/backend'
import Login from './pages/login/index'
/**
 * 应用根组件
 * @returns {*}
 * @constructor
 */
function App() {
  return (
      <BrowserRouter>
        {/*
            *只匹配其中一个，匹配到了就显示
            *重要说明！！！
            *因为，后台已对「/backend1，/frontend，/warehouse」接口代理,页面路由绝对禁止出现/backend1、/frontend、/warehouse（远景包括map）
            *在定义接口代理时，上述的路由单词已经被定义，如果使用，刷新页面将出现404，
            */}
        <Switch>
          <Route path={['/login','/']} exact={true} component={Login}/>
          <Route path='/backstage' component={Backend}/>
        </Switch>
      </BrowserRouter>
  );
}

export default App;