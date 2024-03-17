"use client"

import axios from "axios";
import Image from "next/image";
import React, { useEffect } from 'react';


export default function Home({ params }) {

  const [token, setToken] = React.useState<string | null>(null);
  const [userName, setUserName] = React.useState<string | null>(null);
  const [userImage, setUserImage] = React.useState<string | null>(null);

  useEffect(() => {
    let storedToken = window.localStorage.getItem("token")
    setToken(storedToken)
  }, [])  

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    }
  }, [token]);

  const fetchUserProfile = async () => {
    const {data} = await axios.get('https://api.spotify.com/v1/users/' + params.id, {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })

    setUserName(data.display_name)
    if (data.images && data.images.length > 0) {
      setUserImage(data.images[1].url);
    }
  }
  

  return (
    <div className="flex min-h-screen flex-col bg-[#202020] mt-20 max-w-7xl min-h-96 mx-auto rounded-3xl p-10">
        <h1 className="text-4xl font-semibold text-center mb-8">Profile</h1>
        <Image className="bg-[#ffffff] mx-auto rounded-full mb-3"
            src={userImage || "/user.png"}
            alt="image not found"
            width={128} 
            height={128} 
            priority
          />
        
        <h3 className="text-sm text-center mb-3">{userName || ("")}</h3>
        <h3 className="text-center font-semibold mb-1">1k Followers | 100 Following</h3>
        <h3 className="text-center font-semibold mb-8">Monthly Listeners 10k</h3>
        <button className="font-semibold mx-auto max-w-fit transition duration-500 border-2 border-white-500 hover:border-[#202020] bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 rounded-full py-2 px-6 mb-12">
          Create Post
        </button>
        <div className="mx-auto w-4/6">
          <h3 className="text-2xl font-semibold pb-4">Recent Posts</h3>
          <div className="bg-[#000000] min-h-96 rounded-2xl">
            <h3 className="text-center pt-40">No posts available</h3>
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 h-20 bg-gradient-to-b from-transparent to-black"></div>
    </div>
  );
}
