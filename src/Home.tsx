import React, { useContext, useEffect, useState } from "react";
import Header from "./Header";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button } from '@mui/material';


export default function Home() {

    
    return (
        <div>
            <Header tab={0}/>
            <div className="centeringDiv">
                <div id="homeWelcome">Welcome on EthMarket!</div>
                <div id="home">This is a dapp market place, so you can buy or sell random used items. This application is based on ethereum and uses Metamask to interact with the blockchain. To use this application, you will need a Metamask wallet with eth in it.</div>
            </div>
        </div>
    )
}