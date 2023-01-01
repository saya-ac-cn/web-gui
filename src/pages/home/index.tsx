import React,{useState,useEffect} from "react";
import {planApi} from "@/http/api"

const Home = () => {

    const [plan,setPlan] = useState([])

    const getPlan = async () => {
        const param = {archive_date:'2022-12'}
        const response = await planApi(param);
        const data:any = response.data
        setPlan(data);
        console.log(data);
    }

    useEffect(() => {
        //getPlan();
    },[])

    return (
        <div>
            home page
            {/*<ul>*/}
            {/*    {*/}
            {/*        plan.map(item => (<li>{item.number}</li>))*/}
            {/*    }*/}
            {/*</ul>*/}
        </div>
    )
}

export default Home