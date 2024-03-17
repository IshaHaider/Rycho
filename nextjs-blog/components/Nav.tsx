"use client";

import React from 'react'
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const Nav = () => {
    const router = useRouter();
    const [token, setToken] = React.useState<string | null>(null);
    const [activeSearch, setActiveSearch] = React.useState<string[]>([]);
    const [activeSearchIds, setActiveSearchIds] = React.useState<string[]>([]);    

    const userNames = [
        { id: '1', name: 'Zoraiz' },
        { id: '2', name: 'Mahianmuhammad' }
    ];

    React.useEffect(() => {
        const storedToken = window.localStorage.getItem("token");
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    const logout = () => {
        window.localStorage.removeItem("token");
        router.push('/login')
        setToken(null);      
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchTerm = e.target.value.trim();
        if (searchTerm === '') {
            setActiveSearch([]);
            setActiveSearchIds([]);
            return;
        }
        const filteredUsers = userNames.filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 8);
        const names = filteredUsers.map(user => user.name);
        const ids = filteredUsers.map(user => user.id);
        setActiveSearch(names);
        setActiveSearchIds(ids);
        console.log(names)
        console.log(ids)
    }

    const getUsersList = async () => {
        try {
            const response = await axios.get("/api/users/profile",{
                method: "getUsers",
            });
            console.log("Users:", response.data);
        } catch (error: any) {
            console.log("Unable to retrieve users", error.message);
        }
    }
    getUsersList()
    return (
        <nav className="bg-[#202020] flex justify-between items-center w-full pt-1 pb-2">
            <a href={token ? '/profile' : '/login'} className="flex gap-2 flex-center pl-5 pt-2 ml-4 max-w-fit">
                <Image className="bg-[#ffffff] rounded-full object-contain max-h-8"
                    src="/user.png"
                    alt="image not found"
                    width={30} 
                    height={30} 
                />
                <p className="font-bebas-neue-regular text-4xl">Rycho</p>
            </a>
            {token && (
                <div className="flex justify-end ">
                    <div className="relative">
                        <form className='relative'>
                            <div className='relative'>
                                <input
                                    type="text"
                                    placeholder="Search User..."
                                    className="bg-gray-200 mt-3 mr-4 pl-4 pr-8 py-1 rounded-full focus:outline-none focus:ring focus:border-blue-300 max-w-52 text-black" 
                                    onChange={(e) => handleSearch(e)}
                                />
                            </div>
                            {
                                activeSearch.length > 0 && (
                                    <div className="absolute top-14 p-4 bg-[#383838] text-white w-full rounded-xl left-24 ml-2 -translate-x-1/2 flex flex-col gap-2 max-w-52">
                                        {
                                            activeSearch.map(s => (
                                                <span>{s}</span>
                                            ))
                                        }
                                    </div>                                                                
                                )
                            }
                            
                        </form>
                        <div className="absolute inset-y-0 mt-1 ml-1 left-44 flex items-center">
                            <Image 
                            src="/search.png" 
                            alt="Search" 
                            width={20}
                            height={12}
                            />
                        </div>
                    </div>
                    <div className="transition duration-500 border-2 border-white-500 hover:border-[#202020] bg-[#000000] rounded-full h-10 mt-2 w-10 mr-4 flex justify-center items-center cursor-pointer">
                        <Image
                            src="/notification.png"
                            alt="image not found"
                            width={32}
                            height={12}
                        />
                    </div>
                    <button 
                        onClick={logout}
                        className="font-semibold rounded-full transition duration-500 border-2 border-white-500 hover:border-[#202020] bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 py-1.5 px-4 mt-2.5 mb-1 mr-10 text-sm">
                            Sign out
                    </button>        
                </div>   
            )}
        </nav>
    )
}

export default Nav