import { lazy } from 'react'

interface Router {
    name: string,
    path: string,
    exact: boolean,
    element: any
}
const routes : Array<Router> = [
    {
        name:'Home',
        path:'/home',
        exact: true,
        element: lazy(() => import('../pages/home'))
    },
    {
        name:'About',
        path:'/about',
        exact: true,
        element: lazy(() => import('../pages/about'))
    },
    {
        name:'NotFound',
        path:'/404',
        exact: true,
        element: lazy(() => import('../pages/not-found'))
    },
    {
        name:'News',
        path:'/news',
        exact: true,
        element: lazy(() => import('../pages/news'))
    }
]
export default routes