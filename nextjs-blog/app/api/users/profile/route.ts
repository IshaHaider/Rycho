import { NextRequest, NextResponse } from "next/server";
import {connect} from "@/dbConfig/dbConfig";
import User from "@/models/UserModel";

connect()

export async function POST(request: NextRequest) {
    const req = await request.json()
    if (req.method === 'addUser') {
        try {
            const { spotifyId, username, followers, following } = req.body;
            const existingUser = await User.findOne({ spotifyId });

            if (existingUser) {
                return NextResponse.json({error: "User already exists"}, {status: 400});
            } else {
                const newUser = new User ({
                    spotifyId,
                    username,
                    followers,
                    following
                })
        
                const savedUser = await newUser.save()
                console.log(savedUser);
        
                return NextResponse.json({
                    message: "User created successfully",
                    success: true,
                    savedUser
                })
            }
        } catch (error: any) {
            return NextResponse.json({error: error.message},
                {status: 500})
        }
    } else {
        return NextResponse.json({error: 'Method Not Allowed'},
            {status: 405})
    }
}

export async function PUT(request: NextRequest) {
    try {
        const reqBody = await request.json();

        if (!reqBody.action) {
            return NextResponse.json({ error: "Action parameter is missing" }, { status: 400 });
        }

        if (reqBody.action === 'addFollowing') {
            const { userId, followUserId } = reqBody;

            const user = await User.findById(userId);

            if (!user) {
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }

            const followUser = await User.findById(followUserId);

            if (!followUser) {
                return NextResponse.json({ error: "User to follow not found" }, { status: 404 });
            }

            if (user.following.includes(followUserId)) {
                return NextResponse.json({ error: "User already follows this user" }, { status: 400 });
            }

            user.following.push(followUserId);
            await user.save();

            return NextResponse.json({
                message: "User is now following the user",
                success: true
            });
        } else if (reqBody.action === 'addFollower') {
                const { userId, followUserId } = reqBody;

                const user = await User.findById(userId);

                if (!user) {
                    return NextResponse.json({ error: "User not found" }, { status: 404 });
                }

                const followUser = await User.findById(followUserId);

                if (!followUser) {
                    return NextResponse.json({ error: "User to follow not found" }, { status: 404 });
                }

                if (user.followers.includes(followUserId)) {
                    return NextResponse.json({ error: "User already follows this user" }, { status: 400 });
                }

                user.followers.push(followUserId);
                await user.save();

                return NextResponse.json({
                    message: "User is now following the user",
                    success: true
                });
        } else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const reqBody = await request.json();

        // Check if 'action' property exists in the request body
        if (!reqBody.action) {
            return NextResponse.json({ error: "Action parameter is missing" }, { status: 400 });
        }

        // Perform action based on the value of 'action' property
        if (reqBody.action === 'removeFollowing') {
            const { userId, followUserId } = reqBody;

            // Continue with removeFollowing logic
            const user = await User.findById(userId);

            if (!user) {
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }

            // Check if followUserId exists in user's following list
            const index = user.following.indexOf(followUserId);
            if (index === -1) {
                return NextResponse.json({ error: "User is not following this user" }, { status: 400 });
            }

            // Remove followUserId from user's following list
            user.following.splice(index, 1);
            await user.save();

            return NextResponse.json({
                message: "User is no longer following the user",
                success: true
            });
        } else if (reqBody.action === 'removeFollower') {
            const { userId, followUserId } = reqBody;

            // Continue with removeFollowing logic
            const user = await User.findById(userId);

            if (!user) {
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }

            // Check if followUserId exists in user's following list
            const index = user.followers.indexOf(followUserId);
            if (index === -1) {
                return NextResponse.json({ error: "User is not following this user" }, { status: 400 });
            }

            // Remove followUserId from user's following list
            user.followers.splice(index, 1);
            await user.save();

            return NextResponse.json({
                message: "User is no longer following the user",
                success: true
            });
        } else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


