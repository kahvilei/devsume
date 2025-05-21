
import {NextRequest, NextResponse} from "next/server";
import {deleteCategory, getCategoryById, updateCategory} from "@/actions/categories";
import {PageProps} from "@/interfaces/api";

const get = async (request: NextRequest, { params }: PageProps) => {
    //id will be passed in the url
    const id = (await params).slug;
    const internalResponse = await getCategoryById(id);
    return NextResponse.json(internalResponse);
}

const patch = async (request: NextRequest, { params }: PageProps) => {
    const id = (await params).slug;
    const newCategory = await request.json();
    const internalResponse = await updateCategory(id, newCategory);
    return NextResponse.json(internalResponse);
}

const delete_ = async (request: NextRequest, { params }: PageProps) => {
    const id = (await params).slug;
    const internalResponse = await deleteCategory(id);
    return NextResponse.json(internalResponse);
}

export { get as GET, patch as PATCH, delete_ as DELETE }