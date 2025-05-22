import {addCategory, getCategories} from "@/server/actions/categories";
import {NextRequest, NextResponse} from "next/server";

const get = async (request: NextRequest) => {
    const query = request.nextUrl.searchParams;
    const internalResponse = await getCategories(query);
    return NextResponse.json(internalResponse);
}

const post = async (request: NextRequest) => {
    const body = await request.json();
    const internalResponse = await addCategory(body);
    return NextResponse.json(internalResponse);
}


export { get as GET, post as POST }