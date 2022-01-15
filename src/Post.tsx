import React, { useState, useEffect } from "react";
import Header from "./Header";
import { useLocation, useNavigate } from "react-router-dom";
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { ethers } from 'ethers';
import MarketContract from './artifacts/contracts/ethMarket.sol/EthMarket.json';
import { marketContractAddress } from './config';
import { Button, TextField } from '@mui/material';

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
interface Row {
    id: number,
    amount: number,
    from: string,
    time: number
}


export default function Post() {
    const location = useLocation();
    const state = location.state as Post;
    const navigate = useNavigate();
    const [bids, setBids] = useState<Row[]>([]);
    const [contract, setContract] = useState<ethers.Contract>();
    const [price, setPrice] = useState(state.price);
    const [bid, setBid] = useState("");
    const [username, setUsername] = useState("");

    const columns: GridColDef[] = [
        {field: 'id', headerName: 'ID', sortable: false, width: 90},
        {field: 'amount', headerName: 'Amount', sortable: false, width: 100},
        {field: 'from', headerName: 'From', sortable: false, width: 150},
        {field: 'time', headerName: 'Time', sortable: false, width: 100}
    ];

    const initializeContract = async(provider: ethers.providers.Web3Provider) => {
        const tempContract = new ethers.Contract(marketContractAddress, MarketContract.abi, provider.getSigner());
        setContract(tempContract);
        if (!await tempContract!.isUser()){
            navigate('/login');
        } else {
            loadBids(tempContract);
            const accounts = await provider.listAccounts();
            setUsername(await tempContract.getUsername(accounts[0]));
        }
    }

    const loadBids = async (tempContract: ethers.Contract) => {
        if (tempContract != undefined){
            let bidsArray = await tempContract.getBids(state.id);

            bidsArray = await Promise.all(bidsArray.map(async (i: Bid) => {
                let bid = {
                    id: i.id.toString(),
                    from: await contract!.getUsername(i.from),
                    amount: i.amount.toString(),
                    time: i.time
                }
                return bid;
            }))
            bidsSort(bidsArray);
        }
    }  

    const bidsSort = (bidsArray: Row[]) => {
        let result: Row[] = [];
        bidsArray.forEach((bid)=>{
            result.unshift(bid);
        });
        setBids(result);
        if (result.length > 0){
            setPrice(result[0].amount);
        }
    }

    const goBack = () => {
        navigate('/market');
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
                initializeContract(provider);
            } else {
                navigate('/login');
            }
        } else {
            navigate('/login');
        }
    }

    const handleBidChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const currentBid = e.currentTarget.value;
        if (currentBid.match("^[0-9]*$")){
            setBid(e.currentTarget.value);
        }
    }

    const bidButton = () => {
        if (parseInt(bid) > price){
            contract!.bid(state.id, price);
            loadBids(contract!);
        }
    }

    useEffect(()=>{
        checkUser();
    }, []);

    return (
        <div>
            <Header tab={1}/>
            <div className="goBack" onClick={goBack}>
                &#8592; go back
            </div>
            <div className="centeringDiv">
                <div id="productContainer">
                    <img id="imgPost" src={state.imageUrl}/>
                    <div>
                        <p>{state.name}</p>
                        <p>{username}</p>
                        <p>{price} WEI</p>
                        <p>{state.endDate}</p>
                        <p>{state.description}</p>
                        <div>
                            <TextField value={bid} onChange={(e)=>{
                                handleBidChange(e);
                            }} />
                            <Button id="bidButton" variant="contained" onClick={bidButton}>Bid</Button>
                        </div>
                    </div>
                </div>
                <p id="bidHistoryTitle">Bids History</p>
                <div id="bidContainer">
                    <DataGrid columns={columns} rows={bids} pageSize={5} />
                </div>
            </div>
        </div>
    )
}