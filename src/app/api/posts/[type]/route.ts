import service from "@/server/actions/categories";
import {NextRequest, NextResponse} from "next/server";
import {PageProps} from "@/interfaces/api";

const get = async (request: NextRequest, { params }: PageProps) => {
    const query = request.nextUrl.searchParams;
    const type = (await params).type;
    const internalResponse = await service.get(query, type);
    return NextResponse.json(internalResponse);
}

const post = async (request: NextRequest, { params }: PageProps) => {
    const body = await request.json();
    const type = (await params).type;
    const internalResponse = await service.add(body, type);
    return NextResponse.json(internalResponse);
}


export { get as GET, post as POST }