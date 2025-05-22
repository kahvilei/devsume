import {NextRequest, NextResponse} from "next/server";
import service from "@/server/actions/posts";
import {PageProps} from "@/interfaces/api";

const get = async (request: NextRequest, { params }: PageProps) => {
    //id will be passed in the url
    const type = (await params).type;
    const id = (await params).slug;
    const internalResponse = await service.getById(id, type);
    return NextResponse.json(internalResponse);
}

const patch = async (request: NextRequest, { params }: PageProps) => {
    const type = (await params).type;
    const id = (await params).slug;
    const newPost = await request.json();
    const internalResponse = await service.update(id, newPost, type);
    return NextResponse.json(internalResponse);
}

const delete_ = async (request: NextRequest, { params }: PageProps) => {
    const type = (await params).type;
    const id = (await params).slug;
    const internalResponse = await service.delete(id, type);
    return NextResponse.json(internalResponse);
}

export { get as GET, patch as PATCH, delete_ as DELETE }