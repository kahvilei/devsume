import controller from "@/server/controllers/posts";

const get = controller.get
const post = controller.post

export { get as GET, post as POST }