import React, { useEffect, useState } from "react";
import Header from "./Header";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import MarketContract from './artifacts/contracts/ethMarket.sol/EthMarket.json';
import { marketContractAddress } from './config';
import MetaMaskOnboarding from '@metamask/onboarding';
import { Box, TextField, Button, Fade, CircularProgress } from '@mui/material';


export default function Login(){
    const [username, setUsername] = useState("");
    const [usernameError, setUsernameError] = useState(false);
    const [metamaskConnection, setMetamaskConnection] = useState(false);
    const [connectDisable, setConnectDisable] = useState(false);
    const [contract, setContract] = useState<ethers.Contract>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const initializeContract = async(signer: ethers.providers.JsonRpcSigner) => {
        const tempContract = new ethers.Contract(marketContractAddress, MarketContract.abi, signer);
        setContract(tempContract);
        if (await tempContract!.isUser()){
            navigate('/profile');
        }
    }
    
    const createUserClick = async() => {
        if (username === ""){
            setUsernameError(true);
        }
        else if (contract != undefined){
            if (username !== ""){
                setLoading(true);
                contract.createUser(username);
                contract.on("UserCreated", () => {
                    setLoading(false);
                    navigate('/profile');
                });
            }
        } else {
            console.log('contract not initialized')
        }
    }

    const handleUsername = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        if (e.currentTarget.value.match("^[A-Za-z0-9]+$")){
            setUsername(e.currentTarget.value);
            setUsernameError(false);
        } else {
            setUsernameError(true);
            setUsername(e.currentTarget.value);
        }
    }

    const connectMetaMask = async() => {
        setConnectDisable(true);
        try {
            await window.ethereum.request({method: 'eth_requestAccounts'});
            await checkMetamaskConnection();
        } catch (e) {
            console.log(e);
        }
        setConnectDisable(false);
    }

    const checkMetamaskConnection = async() => {
        if (isMetamaskInstalled()){
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const accounts = await provider.listAccounts();
            if (accounts.length > 0) {
                setMetamaskConnection(true);
                if (contract === undefined){
                    initializeContract(provider.getSigner());
                } else if (await contract.isUser()) {
                    navigate('/profile');
                }
            } else {
                setMetamaskConnection(false);
            }
        }
    }

    const isMetamaskInstalled = () => {
        const { ethereum } = window;

        return Boolean(ethereum && ethereum.isMetaMask);
    }

    const installMetamask = () => {
        const onboarding = new MetaMaskOnboarding();
        onboarding.startOnboarding();
    }

    useEffect(()=>{
        checkMetamaskConnection();
    }, [])


    return (
        <>
            <Header tab={2}/>
            {metamaskConnection? 
                <Box component="form">
                    <TextField label="User Name" variant="outlined" value={username} error={usernameError} helperText={
                        usernameError? "Only letters or numbers are valid for the username": ""
                    } onChange={(e)=>{
                        handleUsername(e);
                    }}/>
                    <Button variant="contained" disabled={loading} onClick={createUserClick}>Create User</Button>
                    <Fade in={loading}>
                        <CircularProgress />
                    </Fade>
                </Box>
                :
                <div>
                {isMetamaskInstalled()? 
                    <div className="metaMaskCheck">
                        <b className="padding20">You need to be connected with MetaMask to interact with this application.</b>
                        <Button className="padding20" disabled={connectDisable} id="metamaskConnect" sx={{marginTop: 5, padding: 2}} variant="contained" onClick={connectMetaMask}>Connect</Button>
                    </div>
                    :
                    <div className="metaMaskCheck">
                        <b className="padding20">You need to install Metamask to interact with this application.</b>
                        <Button className="padding20" sx={{marginTop: 5, padding: 2}} variant="contained" onClick={installMetamask}>Install MetaMask</Button>
                    </div>
                }
                </div>
            }
        </>
    )
}