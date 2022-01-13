import React, { useContext, useEffect, useState } from "react";
import Header from "./Header";
import { useNavigate } from "react-router-dom";
import { ethers } from 'ethers';
import MarketContract from './artifacts/contracts/ethMarket.sol/EthMarket.json';
import { marketContractAddress } from './config';
import { Box, TextField, Button } from '@mui/material';


export default function Home() {
    const [contract, setContract] = useState<ethers.Contract>();

    const initializeContracts = async() => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        setContract(new ethers.Contract(marketContractAddress, MarketContract.abi, signer));
    }
    


    return (
        <div>
            <Header tab={0}/>
            Home
        </div>
    )
}