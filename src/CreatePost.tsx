import React, { useState, useEffect } from "react";
import Header from "./Header";
import { useNavigate } from "react-router-dom";
import { TextField, Button, FormControl, Select, InputLabel, MenuItem, SelectChangeEvent, CircularProgress, Fade } from '@mui/material';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DatePicker from '@mui/lab/DatePicker';
import { ethers } from "ethers";
import MarketContract from './artifacts/contracts/ethMarket.sol/EthMarket.json';
import { marketContractAddress } from './config';


export default function CreatePost() {
    const [postName, setPostName] = useState("");
    const [description, setDescription] = useState("");
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [contract, setContract] = useState<ethers.Contract>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [dateError, setDateError] = useState(false);

    const handleNameChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        if (e.currentTarget.value.match("^[a-zA-Z]*$")){
            setPostName(e.currentTarget.value);
        }
    }

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        if (e.currentTarget.value.match("^[a-zA-Z ]*$")){
            setDescription(e.currentTarget.value);
        }
    }

    const handlePriceChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        if (e.currentTarget.value.match("^[0-9]*$")){
            setPrice(e.currentTarget.value);
        }
    }

    const handleCategoryChange = (e: SelectChangeEvent) => {
        setCategory(e.target.value as string);
    }

    const formatDate = () => {
        if (endDate !== null){
            return Date.parse(endDate.toDateString());
        }
    }

    const createPost = () => {
        const date = formatDate();
        if (postName !== "" && description !== "" && price !== "" && category !== "" && contract !== undefined && date !== undefined){
            if (date > Date.now()){
                contract.createPost(postName, description, category, "/photoTest.png", date, price);
                setLoading(true);
                document.getElementById("createPostBack")!.style.pointerEvents = "none";
                contract.on("CreatePost", async(id: number, name: string)=>{
                    if (name === postName){
                        setLoading(false);
                        navigate("/profile");
                    }
                });
            } else {
                setDateError(true);
            }
        }
    }

    const initializeContract = async(signer: ethers.providers.JsonRpcSigner) => {
        const tempContract = new ethers.Contract(marketContractAddress, MarketContract.abi, signer);
        setContract(tempContract);
        if (!await tempContract!.isUser()){
            navigate('/login');
        }
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

    const goBack = () => {
        navigate(-1);
    }

    useEffect(()=>{
        checkUser();
    }, [])

    return (
        <>
            <Header tab={2}/>
            <div className="goBack" id="createPostBack" onClick={goBack}>
                &#8592; go back
            </div>
            <div className="centeringDiv">
                <p id="createPostTitle">Create a new post</p>
                <TextField sx={{marginTop: 5}} value={postName} label="Name" onChange={(e)=>{
                    handleNameChange(e);
                }}/>
                <TextField value={description} sx={{width: 700, marginTop: 5}} multiline rows={5} label="Description" onChange={(e)=>{
                    handleDescriptionChange(e);
                }}/>
                <FormControl sx={{width: 150, marginTop: 5}}>
                    <InputLabel id="categoryLabel">Category</InputLabel>
                    <Select
                        labelId="categoryLabel"
                        value={category}
                        label="Category"
                        onChange={handleCategoryChange}
                    >
                    <MenuItem value="Sports">Sports</MenuItem>
                    <MenuItem value="Tech">Tech</MenuItem>
                    <MenuItem value="Cars">Cars</MenuItem>
                    <MenuItem value="Clothes">Clothes</MenuItem>
                    <MenuItem value="Furnishing">Furnishing</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                    </Select>
                </FormControl>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        label="End Date"
                        value={endDate}
                        onChange={(date) => {
                            setEndDate(date);
                        }}
                        renderInput={(params) => <TextField sx={{width: 200, marginTop: 5}} {...params} />}
                    />
                </LocalizationProvider>
                <TextField value={price} sx={{width: 150, marginTop: 5}} label="Price" onChange={(e)=>{
                    handlePriceChange(e);
                }}/>
                <Button variant="contained" sx={{marginTop: 5}} disabled={loading} onClick={createPost}>Create Post</Button>
                <Fade in={loading}>
                    <CircularProgress />
                </Fade>
            </div>
        </>
    )
}