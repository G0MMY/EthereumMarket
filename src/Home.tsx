import React, { useContext, useEffect, useState } from "react";
import Header from "./Header";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button } from '@mui/material';


export default function Home() {

    
    return (
        <div>
            <Header tab={0}/>
            Home
        </div>
    )
}