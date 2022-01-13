import React, { useState } from "react";
import Header from "./Header";
import { ethers } from "ethers";
import MarketContract from './artifacts/contracts/ethMarket.sol/EthMarket.json';
import { marketContractAddress } from './config';
import MetaMaskOnboarding from '@metamask/onboarding';
import { Box, TextField, Button } from '@mui/material';


export default function Login(){
    const [loggedUser, setLoggedUser] = useState(false);
    const [username, setUsername] = useState("");
    const [usernameError, setUsernameError] = useState(false);
    const [metamaskConnection, setMetamaskConnection] = useState(false);
    const [connectDisable, setConnectDisable] = useState(false);
    const [contract, setContract] = useState<ethers.Contract>();

    const initializeContracts = async() => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tempContract = new ethers.Contract(marketContractAddress, MarketContract.abi, signer);
        setContract(tempContract);
        setLoggedUser(await tempContract!.isUser());
    }
    

    const createUserClick = async() => {
        if (username === ""){
            setUsernameError(true);
        }
        else if (contract != undefined){
            contract.createUser(username);
            setLoggedUser(true);
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
                    initializeContracts();
                } else {
                    setLoggedUser(await contract.isUser());
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


    return (
        <>
            <Header tab={3}/>
            {metamaskConnection? 
                <div>
                    {loggedUser? 
                        <div className="centeringDiv">
                            
                        </div>
                       :
                       <Box component="form">
                            <TextField label="User Name" variant="outlined" value={username} error={usernameError} helperText={
                                usernameError? "Only letters or numbers are valid for the username": ""
                            } onChange={(e)=>{
                                handleUsername(e);
                            }}/>
                            <Button variant="contained" disabled={usernameError} onClick={createUserClick}>Create User</Button>
                        </Box>
                    }
                </div>
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