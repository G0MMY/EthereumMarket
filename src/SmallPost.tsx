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

    const formatDaysLeft = () => {
        let delta = (props.post.endDate - Date.now()) / 1000;
        const days = Math.floor(delta / 86400);
        delta -= days * 86400
        const hours = Math.floor(delta / 3600) % 24
        delta -= hours * 3600
        const minutes = Math.floor(delta / 60) % 60
        delta -= minutes * 60
        const seconds = Math.floor(delta % 60)

        if (days >= 1){
            if (days === 1){
                return days + " Day";
            }
            return days + " Days";
        } else if (hours >= 1){
            if (hours === 1){
                return hours + " Hour";
            }
            return hours + " Hours";
        } else if (minutes >= 1){
            if (minutes === 1){
                return minutes + " Minute";
            }
            return minutes + " Minutes";
        } 
        if (seconds === 1){
            return seconds + " Second";
        }
        return seconds + " Seconds";
    }

    const postClick = () => {
        navigate('/post', {state: props.post});
    }

    return (
        <div id="post" onClick={postClick}>
            <img className="postImg" src={props.post.imageUrl} />
            <p className="postInfo"><b>{props.post.name}</b></p>
            <p className="postInfo">{props.post.price} Wei</p>
            <p className="postInfo">{formatDaysLeft()}</p>
        </div>
    )
}