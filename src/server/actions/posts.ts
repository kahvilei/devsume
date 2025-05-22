import { Post } from "@/server/models";
import { IPost } from "@/server/models/Post";
import { createServiceFactory } from "@/lib/db/service-factory";
import {Document} from "mongoose";

const postService = createServiceFactory<Document, IPost>(
    Post,
    "posts",
    "Post"
);

export default postService;