import React, { useState } from "react";
import Header from "./Header";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

interface Post{
    id: number,
    name: string,
    description: string,
    category: string,
    imageUrl: string,
    owner: string, 
    startDate: number,
    endDate: number,
    price: number,
    sold: boolean
}


export default function Post() {
    const location = useLocation();
    const state = location.state as Post;
    const navigate = useNavigate();
    const [bids, setBids] = useState();

    const goBack = () => {
        navigate('/market');
    }

    return (
        <div>
            <Header tab={1}/>
            <div onClick={goBack}>
                go back
            </div>
            <div className="centeringDiv">
                <div id="productContainer">
                    <img id="imgPost" src={state.imageUrl}/>
                    <div>
                        <p>{state.name}</p>
                        <p>{state.owner}</p>
                        <p>{state.price}</p>
                        <p>{state.endDate}</p>
                        <p>{state.description}</p>
                    </div>
                </div>
                <div id="bidsContainer">
                    
                </div>
            </div>
        </div>
    )
}