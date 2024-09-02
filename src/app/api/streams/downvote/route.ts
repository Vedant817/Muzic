import { NextRequest, NextResponse } from "next/server";
import {z} from 'zod';
import { auth } from "@/auth";
import { prismaClient } from "@/lib/db";

const UpvoteSchema = z.object({
    streamId: z.string(),

})

export async function POST(req: NextRequest){
    const session = await auth();

    const user = await prismaClient.user.findFirst({
        where: {
            email: session?.user?.email ?? ''
        }
    })

    if(!user){
        return NextResponse.json({message: 'Unauthenticated'}, {status: 403});
    }
    
    try {
        const data = UpvoteSchema.parse(await req.json());
        await prismaClient.upVote.delete({
            where: {
                userId_streamId:{
                    userId: user.id,
                    streamId: data.streamId
                }
            }
        });
    } catch (error) {
        return NextResponse.json({
            message: 'Error while DownVoting stream'
        }, {
            status: 403
        })
    }
}