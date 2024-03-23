"use client";

import axios from "axios";
import Image from 'next/image';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
    followers: string[];
    following: string[];
    username: string;
    spotifyId: string;
    image: string;
}

export default function FollowingPage({ params }) {
    const router = useRouter();
    const [followingList, setFollowingList] = useState<User[]>([]);

    useEffect(() => {
        fetchFollowingList();
    }, []);

    useEffect(() => {
        if (followingList.length > 0) {
            fetchUserProfile();
        }
    }, [followingList]);

    const fetchFollowingList = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/api/users/profile?action=getFollowing&spotifyId=${params.id}`);
            const { following } = response.data;
            setFollowingList(following);
        } catch (error) {
            console.error("Error fetching following list: ", error);
        }
    };

    const fetchUserProfile = async () => {
        const token = window.localStorage.getItem("token");
        try {
            const promises = followingList.map(async (user) => {
                const { data } = await axios.get(`https://api.spotify.com/v1/users/${user.spotifyId}`, {
                    headers: {
                        Authorization: 'Bearer ' + token
                    }
                });
                return {
                    ...user,
                    image: data.images && data.images.length > 0 ? data.images[1].url : "/user.png"
                };
            });
            const updatedFollowingList = await Promise.all(promises);
            setFollowingList(updatedFollowingList);
        } catch (error) {
            console.error("Error fetching user profiles: ", error);
        }
    };

    const handleUserClick = (spotifyId: string) => {
        router.push(`/profile/${spotifyId}`);
    };

    return (
        <div className="container mx-auto mt-8 px-4">
            <h1 className="text-4xl font-semibold mb-8 text-center">Following</h1>
            <div className="flex flex-col items-center">
                {followingList.map((user) => (
                    <div key={user.spotifyId} className="flex items-center py-4 px-6 border-b border-gray-200 w-full max-w-xl">
                        <img
                            src={user.image || "/user.png"}
                            alt="User Avatar"
                            width={96} 
                            height={96} 
                            className="rounded-full mr-6" 
                        />
                        <button onClick={() => handleUserClick(user.spotifyId)} className="text-xl font-medium text-blue-600 hover:underline"> 
                            {user.username}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
