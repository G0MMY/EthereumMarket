import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Market from './Market';
import Profile from './Profile';
import Post from './Post';
import Login from './Login';
import CreatePost from './CreatePost';
import MyPosts from './MyPosts';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/market" element={<Market />}/>
        <Route path="/profile" element={<Profile />}/>
        <Route path="/post" element={<Post />}/>
        <Route path="/login" element={<Login />}/>
        <Route path="/create-post" element={<CreatePost />}/>
        <Route path="/my-posts" element={<MyPosts />} />
      </Routes>
    </Router>
  );
}

