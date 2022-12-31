import { Button } from 'antd'
import routes from "@/config/routes";
import {Routes,Route} from "react-router-dom";
import {Suspense} from "react";

const Layout = () => {

    const page = routes.map((item, i) => {
        return (
            <Route key={i} path={item.path} element={
                <Suspense fallback={<div>路由懒加载...</div>}>
                    < item.element />
                </Suspense>
            } />
        )
    })

    return (
        <div>
            <h4>后台主页</h4>
            <Button type="primary">按钮</Button>
            <Routes>
                {page}
            </Routes>
        </div>
    )
}

export default Layout