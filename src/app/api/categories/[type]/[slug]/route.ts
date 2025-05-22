import {NextRequest, NextResponse} from "next/server";
import {deleteCategory, getCategoryById, updateCategory} from "@/server/actions/categories";
import {PageProps} from "@/interfaces/api";

const get = async (request: NextRequest, { params }: PageProps) => {
    //id will be passed in the url
    const type = (await params).type;
    const id = (await params).slug;
    const internalResponse = await getCategoryById(id, type);
    return NextResponse.json(internalResponse);
}

const patch = async (request: NextRequest, { params }: PageProps) => {
    const type = (await params).type;
    const id = (await params).slug;
    const newCategory = await request.json();
    const internalResponse = await updateCategory(id, newCategory, type);
    return NextResponse.json(internalResponse);
}

const delete_ = async (request: NextRequest, { params }: PageProps) => {
    const type = (await params).type;
    const id = (await params).slug;
    const internalResponse = await deleteCategory(id, type);
    return NextResponse.json(internalResponse);
}

export { get as GET, patch as PATCH, delete_ as DELETE }