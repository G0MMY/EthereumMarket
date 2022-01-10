import React from "react";
import Header from "./Header";
import { useNavigate } from "react-router-dom";


export default function Home() {
    return (
        <div>
            <Header tab={0}/>
            Home
        </div>
    )
}