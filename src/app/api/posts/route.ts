import service from "@/server/actions/posts";
import {NextRequest, NextResponse} from "next/server";

const get = async (request: NextRequest) => {
    const query = request.nextUrl.searchParams;
    const internalResponse = await service.get(query);
    return NextResponse.json(internalResponse);
}

const post = async (request: NextRequest) => {
    const body = await request.json();
    const internalResponse = await service.add(body);
    return NextResponse.json(internalResponse);
}

export { get as GET, post as POST }