
import {NextRequest, NextResponse} from "next/server";
import {deleteTag, getTagById, updateTag} from "@/actions/tags";
import {PageProps} from "@/interfaces/api";

const get = async (request: NextRequest, { params }: PageProps) => {
    //id will be passed in the url
    const id = (await params).slug;
    const internalResponse = await getTagById(id);
    return NextResponse.json(internalResponse);
}

const patch = async (request: NextRequest, { params }: PageProps) => {
    const id = (await params).slug;
    const newTag = await request.json();
    const internalResponse = await updateTag(id, newTag);
    return NextResponse.json(internalResponse);
}

const delete_ = async (request: NextRequest, { params }: PageProps) => {
    const id = (await params).slug;
    const internalResponse = await deleteTag(id);
    return NextResponse.json(internalResponse);
}

export { get as GET, patch as PATCH, delete_ as DELETE }