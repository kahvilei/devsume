import { Post } from "@/server/models";
import { IPost } from "@/server/models/Post";
import { createServiceFactory } from "@/lib/db/service-factory";

const postService = createServiceFactory<IPost>(
    Post,
    "posts",
    "Post"
);

export default postService;