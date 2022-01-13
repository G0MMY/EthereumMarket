import React, { useState } from "react";
import Header from "./Header";
import { useLocation, useNavigate } from "react-router-dom";
import { DataGrid, GridColDef } from '@mui/x-data-grid';

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


export default function Post() {
    const location = useLocation();
    const state = location.state as Post;
    const navigate = useNavigate();
    const [bids, setBids] = useState();

    const columns: GridColDef[] = [
        {field: 'id', headerName: 'ID', sortable: false, width: 90},
        {field: 'amount', headerName: 'Amount', sortable: false, width: 100},
        {field: 'from', headerName: 'From', sortable: false, width: 150},
        {field: 'time', headerName: 'Time', sortable: false, width: 100}
    ];
    const rows = [
        {id: 3, amount: 34, from: 'wilfred', time: 164385943},
        {id: 2, amount: 20, from: 'john', time: 164385800},
        {id: 1, amount: 11, from: 'max', time: 164385743},
    ]

    const goBack = () => {
        navigate('/market');
    }

    return (
        <div>
            <Header tab={1}/>
            <div onClick={goBack}>
                go back
            </div>
            <div className="centeringDiv">
                <div id="productContainer">
                    <img id="imgPost" src={state.imageUrl}/>
                    <div>
                        <p>{state.name}</p>
                        <p>{state.owner}</p>
                        <p>{state.price}</p>
                        <p>{state.endDate}</p>
                        <p>{state.description}</p>
                    </div>
                </div>
                <div style={{ height: 400, width: '80%' }}>
                    <DataGrid columns={columns} rows={rows} pageSize={5} />
                </div>
            </div>
        </div>
    )
}