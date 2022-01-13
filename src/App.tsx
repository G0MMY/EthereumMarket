import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Market from './Market';
import Profile from './Profile';
import Post from './Post';
import Login from './Login';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/market" element={<Market />}/>
        <Route path="/profile" element={<Profile />}/>
        <Route path="/post" element={<Post />}/>
        <Route path="/login" element={<Login />}/>
      </Routes>
    </Router>
  );
}

