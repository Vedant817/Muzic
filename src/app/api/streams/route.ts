import { NextRequest, NextResponse } from "next/server";
import { z } from 'zod';
import { prismaClient } from "@/lib/db";
import { YT_REGEX } from "@/lib/utils";
import youtubesearchapi from "youtube-search-api"

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

        const response = await youtubesearchapi.GetVideoDetails(extractedId)
        const thumbnails = response.thumbnail.thumbnails;
        thumbnails.sort((a: { width: number }, b: { width: number }) => a.width < b.width ? -1 : 1);

        const stream = await prismaClient.stream.create({
            data: {
                userId: data.creatorId,
                url: data.url,
                extractedId,
                type: 'Youtube',
                title: response.title ?? 'Cannot Find the title',
                smallImg: (thumbnails.length > 1 ? thumbnails[thumbnails.length - 2].url : thumbnails[thumbnails.length - 1].url) ?? "https://cdn.pixabay.com/photo/2024/02/28/07/42/european-shorthair-8601492_640.jpg",
                bigImg: thumbnails[thumbnails.length - 1].url ?? "https://cdn.pixabay.com/photo/2024/02/28/07/42/european-shorthair-8601492_640.jpg"
            }
        })

        return NextResponse.json({
            message: 'Stream added successfully',
            id: stream.id
        }, { status: 201 })
    } catch (error) {
        console.log(error);
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