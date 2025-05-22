import controller from "@/server/controllers/media";

const get = controller.get
const post = controller.post

export { get as GET, post as POST }