import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import { ethers } from 'ethers';
import Web3Modal from "web3modal";
import MarketContract from './artifacts/contracts/ethMarket.sol/EthMarket.json';
import { marketContractAddress } from './config';
import { Box, TextField, Button } from '@mui/material';
import MetaMaskOnboarding from '@metamask/onboarding';
import SmallPost from './SmallPost';
import { Tabs, Tab } from '@mui/material';
import Highlights from "./Highlights";

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

export default function Market() {
    const [posts, setPosts] = useState<JSX.Element[]>([]);
    const [rawPosts, setRawPosts] = useState<Post[]>([]);
    const [loggedUser, setLoggedUser] = useState(false);
    const [username, setUsername] = useState("");
    const [usernameError, setUsernameError] = useState(false);
    const marketContract = useRef<ethers.Contract>();
    const [metamaskConnection, setMetamaskConnection] = useState(false);
    const [category, setCategory] = useState(0);

    const initializeContracts = async() => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        marketContract.current = new ethers.Contract(marketContractAddress, MarketContract.abi, signer);
        checkUser();
    }

    const checkUser = async() => {
        if (marketContract.current != undefined){
            const user = await marketContract.current.isUser();
            setLoggedUser(user);
            if (user){
                loadPosts();
            }
        } else {
            console.log('contract not initialized');
        }
    }

    const loadPosts = async () => {
        if (marketContract.current != undefined){
            let postsArray = await marketContract.current.getPosts();

            postsArray = await Promise.all(postsArray.map(async (i: Post) => {
                let post = {
                    id: i.id.toString(),
                    name: i.name.toString(),
                    description: i.description.toString(),
                    category: i.category.toString(),
                    imageUrl: i.imageUrl.toString(),
                    owner: i.owner,
                    startDate: i.startDate.toString(),
                    endDate: i.endDate.toString(),
                    price: i.price.toString(),
                    sold: i.sold
                }
                return post;
            }))
            setRawPosts(postsArray);
            buildPosts(postsArray);
        }
    }   

    const buildPosts = (postsArray: Post[]) => {
        if (postsArray.length > 0){
            let result: JSX.Element[] = [];
            for (let i=0;i<postsArray.length;i++){
                result.push(<SmallPost key={i} post={postsArray[i]}/>);
            }
            setPosts(result);
        } else {
            setPosts([
                <div>
                    No product found with this name.
                </div>
            ]);
        }
    }

    const click = async() =>{
        if (marketContract.current != undefined){
            await marketContract.current.createPost("test", "desc test", "image", 1641359145, 100);
        }
        loadPosts();
    }

    const createUserClick = async() => {
        if (username === ""){
            setUsernameError(true);
        }
        else if (marketContract.current != undefined){
            marketContract.current.createUser(username);
            setLoggedUser(true);
        } else {
            console.log('contract not initialized')
        }
    }

    // const checkChangeAccount = async() => {
    //     try {
    //         const { ethereum } = window;
    //         if (await ethereum.request({method: 'eth_requestAccounts'}) !== userAddress){
    //             await initializeContracts();
    //         }
    //     } catch (e) {
    //         console.log(e);
    //     }
    // }

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
        try {
            await window.ethereum.request({method: 'eth_requestAccounts'});
            await checkMetamaskConnection();
        } catch (e) {
            console.log(e);
        }
    }

    const checkMetamaskConnection = async() => {
        if (isMetamaskInstalled()){
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const accounts = await provider.listAccounts();
            if (accounts.length > 0) {
                setMetamaskConnection(true);
                initializeContracts();
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

    const handleCategoryChange = (e: React.SyntheticEvent, category: number) => {
        setCategory(category);
        filterPosts(category);
    }

    const currentCategory = (cat: number) => {
        switch(cat){
            case(0):
                return "All";
            case(1):
                return "Sports";
            case(2):
                return "Tech";
            case(3):
                return "Cars";
            case(4):
                return "Clothes";
            case(5):
                return "Furnishing";
            case(6):
                return "Other";
        }
        return "None";
    }

    const filterPosts = (cat: number) => {
        let result: Post[] = [];
        if (cat == 0){
            result = rawPosts;
        } else {
            rawPosts.forEach((post)=>{
                if (post.category === currentCategory(cat)){
                    result.push(post);
                }
            });
        }
        buildPosts(result);
    }

    const buildNameArray = () => {
        let result: string[] = [];
        rawPosts.forEach((post)=>{
            result.push(post.name);
        });
        return result;
    }

    const matchName = (postName: string, search: string) => {
        if (search === ""){
            return true;
        }
        const name = postName.toLocaleLowerCase().split(" ");
        const text = search.toLocaleLowerCase().split(" ");
        for (let i=0;i<name.length;i++){
            for (let j=0;j<text.length;j++){
                if (name[i] === text[j]){
                    return true;
                }
            }
        }
        return false;
    }

    const searchClick = () => {
        const text = (document.getElementById("search") as HTMLInputElement)!.value;
        let result: Post[] = [];
        rawPosts.forEach((post)=>{
            if (matchName(post.name, text)){
                result.push(post);
            }
        })
        buildPosts(result);
    }

    useEffect(()=>{
        checkMetamaskConnection();
    }, [])

    return (
        <>
            <Header tab={1} />
            {metamaskConnection? 
                <div>
                    <div className="centeringDiv">
                        <Tabs value={category} onChange={handleCategoryChange} indicatorColor="secondary" textColor="secondary">
                            <Tab label="All" />
                            <Tab label="Sports" />
                            <Tab label="Tech" />
                            <Tab label="Cars" />
                            <Tab label="Clothes" />
                            <Tab label="Furnishing" />
                            <Tab label="Other" />
                        </Tabs>
                        <div id="searchContainer">
                            <Highlights posts={buildNameArray()} />
                            <Button id="searchButton" onClick={searchClick} variant="contained">Search</Button>
                        </div>
                    </div>
                    {loggedUser? 
                        <div className="centeringDiv">
                            <div id="postContainer">
                                {posts}
                            </div>
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
                        <b className="padding20">You need to be connected with MetaMask to see the posts.</b>
                        <Button className="padding20" sx={{marginTop: 5, padding: 2}} variant="contained" onClick={connectMetaMask}>Connect</Button>
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

//npx hardhat run scripts/deploy.js --network localhost


