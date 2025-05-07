import {addTag, getAllTags} from "@/actions/tags";
import {NextRequest, NextResponse} from "next/server";

const get = async () => {
    const internalResponse = await getAllTags();
    return NextResponse.json(internalResponse);
}

const post = async (request: NextRequest) => {
    const body = await request.json();
    const internalResponse = await addTag(body);
    return NextResponse.json(internalResponse);
}


export { get as GET, post as POST }