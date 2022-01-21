import React, { useState, useEffect } from "react";
import Header from "./Header";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import MarketContract from './artifacts/contracts/ethMarket.sol/EthMarket.json';
import { marketContractAddress } from './config';
import SmallPost from "./SmallPost";

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

export default function MyPosts() {
    const navigate = useNavigate();
    const [contract, setContract] = useState<ethers.Contract>();
    const [posts, setPosts] = useState<JSX.Element[]>([]);
    const [rawPosts, setRawPosts] = useState<Post[]>([]);

    const initializeContract = async(signer: ethers.providers.JsonRpcSigner) => {
        const tempContract = new ethers.Contract(marketContractAddress, MarketContract.abi, signer);
        setContract(tempContract);
        if (!await tempContract!.isUser()){
            navigate('/login');
        } else {
            loadMyPosts(tempContract);
        }
    }

    const loadMyPosts = async(tempContract: ethers.Contract) => {
        let postsArray = await tempContract.getUserPosts();
        postsArray = await Promise.all(postsArray.map(async(i: Post)=>{
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
            };
            const daysLeft = ((parseInt(post.endDate) / 1000) - (Date.now() / 1000)) / (60 * 60 * 24);
            if (daysLeft <= 0){
                tempContract.sell(post.id);
                post.sold = true;
            }
            return post;
        }));
        setRawPosts(postsArray);
        buildPosts(postsArray);
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

    const goBack = () => {
        navigate(-1);
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
    }, [])

    return (
        <>
            <Header tab={2} />
            <div className="goBack" onClick={goBack}>
                &#8592; go back
            </div>
            <div className="centeringDiv">
                <div id="postContainer">
                    {posts}
                </div>
            </div>
        </>
    )
}