import React, { useState } from "react";
import { Tabs, Tab } from '@mui/material';
import { useNavigate } from "react-router-dom";

export default function Header(props: {tab: number}) {  
    const [value, setValue] = useState(props.tab);

    const handleTabChange = (e: React.SyntheticEvent, val: number) => {
        setValue(val);
    }

    return (
        <nav id="header">
            <a id="haderTitle">EthMarket</a>
            <Tabs value={value} onChange={handleTabChange} id="headerLinks">
                <LinkTab label="Home" href="/" />
                <LinkTab label="Market" href="/market" />
                <LinkTab label="Your Profile" href="/profile" />
            </Tabs>
        </nav>
    )
}

function LinkTab(props: {label: string, href: string}) {

    const navigate = useNavigate();

    return (
      <Tab
        component="a"
        onClick={() => {
          navigate(props.href);
        }}
        {...props}
      />
    );
}