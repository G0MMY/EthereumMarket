import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "./Header";
import { ethers } from 'ethers';
import MarketContract from './artifacts/contracts/ethMarket.sol/EthMarket.json';
import { marketContractAddress } from './config';
import { Button, TextField, CircularProgress, Fade } from '@mui/material';

interface Bid{
    id: number,
    postId: number,
    from: string,
    amount: number,
    time: number
}
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
interface User {
    username: string,
    balance: number,
    posts: Post[],
    bids: Bid[]
}

export default function Profile() {
    const navigate = useNavigate();
    const [contract, setContract] = useState<ethers.Contract>();
    const [mint, setMint] = useState("");
    const [burn, setBurn] = useState("");
    const [user, setUser] = useState<User>({
        username: "",
        balance: 0,
        posts: [],
        bids: []
    });
    const [loading, setLoading] = useState(false);

    const initializeContract = async(signer: ethers.providers.JsonRpcSigner) => {
        const tempContract = new ethers.Contract(marketContractAddress, MarketContract.abi, signer);
        setContract(tempContract);
        if (!await tempContract!.isUser()){
            navigate('/login');
        } else {
            loadProfile(tempContract);
            listenContract(tempContract);
        }
    }

    const listenContract = async(tempContract: ethers.Contract) => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        const address = accounts[0];

        tempContract.on("Deposit", async(sender: string) => {
            if (address === sender){
                setLoading(false);
                setUser({
                    username: user.username, 
                    balance: parseInt(await tempContract.getBalance(address)),
                    posts: user.posts,
                    bids: user.bids    
                });
            }
        });
        tempContract.on("Burn", async(sender: string) => {
            if (address === sender){
                setLoading(false);
                setUser({
                    username: user.username, 
                    balance: parseInt(await tempContract.getBalance(address)),
                    posts: user.posts,
                    bids: user.bids    
                });
            }
        })
    }

    const loadProfile = async(tempContract: ethers.Contract) => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        setUser({
            username: await tempContract.getUsername(accounts[0]), 
            balance: parseInt(await tempContract.getBalance(accounts[0])), 
            posts: await tempContract.getUserPosts(), 
            bids: await tempContract.getUserBids()
        });
    }

    const isMetamaskInstalled = () => {
        const { ethereum } = window;

        return Boolean(ethereum && ethereum.isMetaMask);
    }

    const checkUser = async() => {
        if (isMetamaskInstalled()){
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const accounts = await provider.listAccounts();
            if (accounts.length > 0){
                initializeContract(provider.getSigner());
            } else {
                navigate('/login');
            }
        } else {
            navigate('/login');
        }
    }

    const mintButton = async() => {
        if (mint !== ""){
            setLoading(true);
            await contract!.mint({value: mint});
        }
    }

    const handleMintChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const currentBid = e.currentTarget.value;
        if (currentBid.match("^[0-9]*$")){
            setMint(e.currentTarget.value);
        }
    }

    const handleBurnChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const currentBid = e.currentTarget.value;
        if (currentBid.match("^[0-9]*$")){
            setBurn(e.currentTarget.value);
        }
    }

    const burnButton = async() => {
        if (burn !== "" && parseInt(burn) <= user.balance){
            setLoading(true);
            await contract!.burn(burn);
        }
    }

    const createPostClick = () => {
        if (contract !== undefined){
            navigate("/create-post");
        }
    }

    const myPostsClick = () => {
        navigate("/my-posts");
    }

    useEffect(()=>{
        checkUser();
    }, [])

    return (
        <>
            <Header tab={2} />
            <div className="centeringDiv" id="profileTitle"> 
                Welcome {user.username}!
            </div>
            <div className="profileBalance">
                <p>Current Balance: {user.balance} WEI</p>
                <div>
                    <TextField value={mint} label="Deposit WEI" onChange={(e)=>{
                        handleMintChange(e);
                    }}/>
                    <Button id="mintButton" variant="contained" disabled={loading} onClick={mintButton}>mint</Button>
                    <Fade in={loading}>
                        <CircularProgress />
                    </Fade>
                </div>
            </div>
            <div className="profileBalance">
                <p>Enter the amount of money you want to whithdraw</p>
                <div>
                    <TextField value={burn} label="Withdraw WEI" onChange={(e)=>{
                        handleBurnChange(e);
                    }}/>
                    <Button id="burnButton" variant="contained" disabled={loading} onClick={burnButton}>Withdraw</Button>
                    <Fade in={loading}>
                        <CircularProgress />
                    </Fade>
                </div>
            </div>
            <div className="centeringDiv">
                <div id="postProfile">
                    <>Click here to create a new post</>
                    <Button variant="contained" onClick={createPostClick}>Create Post</Button>
                    <>Click here to see all your posts</>
                    <Button variant="contained" onClick={myPostsClick}>My Posts</Button>
                </div>
            </div>
        </>
    )
}