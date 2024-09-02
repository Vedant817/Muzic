import { NextRequest, NextResponse } from "next/server";
import { z } from 'zod';
import { prismaClient } from "@/lib/db";
import { YT_REGEX } from "@/lib/utils";

const CreateStreamSchema = z.object({
    creatorId: z.string(),
    url: z.string()
})

export async function POST(req: NextRequest) {
    try {
        const data = CreateStreamSchema.parse(await req.json());
        const isYt = YT_REGEX.test(data.url);

        if (!isYt) {
            return NextResponse.json({
                message: 'Url must be from Youtube'
            }, {
                status: 411
            })
        }

        const extractedId = data.url.split('?v=')[1];

        if (!extractedId) {
            return NextResponse.json({
                message: 'Invalid Youtube URL'
            }, {
                status: 411
            })
        }

        const stream = await prismaClient.stream.create({
            data: {
                userId: data.creatorId,
                url: data.url,
                extractedId,
                type: 'Youtube'
            }
        })

        return NextResponse.json({
            message: 'Stream added successfully',
            id: stream.id
        }, { status: 201 })
    } catch (error) {
        return NextResponse.json({
            message: 'Error while adding a stream',
        }, {
            status: 411
        })
    }
}

export async function GET(req: NextRequest) {
    const creatorId = req.nextUrl.searchParams.get('creatorId');
    const streams = await prismaClient.stream.findMany({
        where: {
            userId: creatorId ?? ''
        }
    });

    return NextResponse.json({ streams });
}