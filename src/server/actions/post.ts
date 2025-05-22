import { Post } from "@/server/models";
import { IPost } from "@/server/models/Post";
import { createServiceFactory } from "@/lib/db/service-factory";
import {Document} from "mongoose";

const postService = createServiceFactory<Document, IPost>(
    Post,
    "posts",
    "Post"
);

export const getAllPosts = postService.getAll;
export const getPosts = postService.get;
export const getPostBySlug = postService.getBySlug;
export const getPostById = postService.getById;
export const addPost = postService.add;
export const updatePost = postService.update;
export const deletePost = postService.delete;
export const addManyPosts = postService.addMany;
export const getPostCount = postService.getCount;
export const postExists = postService.exists;
