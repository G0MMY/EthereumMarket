import React, { useEffect, useState, useRef, useContext } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Header from "./Header";
import { Contract, ethers } from 'ethers';
import Web3Modal from "web3modal";
import { Box, TextField, Button } from '@mui/material';
import SmallPost from './SmallPost';
import { Tabs, Tab } from '@mui/material';
import MarketContract from './artifacts/contracts/ethMarket.sol/EthMarket.json';
import { marketContractAddress } from './config';
import Highlights from './Highlights';

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
    const [category, setCategory] = useState(0);
    const navigate = useNavigate();
    const [contract, setContract] = useState<ethers.Contract>();

    const initializeContract = async(signer: ethers.providers.JsonRpcSigner) => {
        const tempContract = new ethers.Contract(marketContractAddress, MarketContract.abi, signer);
        setContract(tempContract);
        if (!await tempContract!.isUser()){
            navigate('/login');
        } else {
            loadPosts(tempContract);
            listenContract(tempContract);
        }
    }

    const listenContract = (tempContract: ethers.Contract) => {
        tempContract.on("CreatePost", () => {
            loadPosts(tempContract);
        });
    }

    const loadPosts = async (tempContract: ethers.Contract) => {
        if (tempContract != undefined){
            let postsArray = await tempContract.getPosts();

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
                    No products found 
                </div>
            ]);
        }
    }

    // const click = async() =>{
    //     if (marketContract.current != undefined){
    //         await marketContract.current.createPost("test", "desc test", "image", 1641359145, 100);
    //     }
    //     loadPosts();
    // }


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

    useEffect(()=>{
        checkUser();
    }, []);

    return (
        <>
            <Header tab={1} />
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
                <div className="centeringDiv">
                    <div id="postContainer">
                        {posts}
                    </div>
                </div>
            </div>
        </>
    )
}

//npx hardhat run scripts/deployDev.js --network localhost





