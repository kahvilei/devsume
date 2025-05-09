import {addTag, getTags} from "@/actions/tags";
import {NextRequest, NextResponse} from "next/server";

const get = async (request: NextRequest) => {
    const query = request.nextUrl.searchParams;
    const internalResponse = await getTags(query);
    return NextResponse.json(internalResponse);
}

const post = async (request: NextRequest) => {
    const body = await request.json();
    const internalResponse = await addTag(body);
    return NextResponse.json(internalResponse);
}


export { get as GET, post as POST }