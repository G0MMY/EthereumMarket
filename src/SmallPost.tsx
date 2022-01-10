import React from "react";
import { useNavigate } from "react-router-dom";

interface Post{
    id: number,
    name: string,
    description: string,
    imageUrl: string,
    owner: string, 
    startDate: number,
    endDate: number,
    price: number,
    sold: boolean
}


export default function Post(props: {post: Post}) {
    const navigate = useNavigate();

    //need to change this it dosent work
    const formatDaysLeft = () => {
        return Math.floor((Date.now() - props.post.endDate) / (60 * 60 * 24));
    }

    const postClick = () => {
        navigate('/post', {state: props.post});
    }

    return (
        <div id="post" onClick={postClick}>
            <img className="postImg" src={props.post.imageUrl} />
            <p className="postInfo"><b>{props.post.name}</b></p>
            <p className="postInfo">{props.post.price} Wei</p>
            <p className="postInfo">{formatDaysLeft()} Days Left</p>
        </div>
    )
}