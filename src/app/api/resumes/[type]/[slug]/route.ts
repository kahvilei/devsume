import controller from "@/server/controllers/resumes";

const get = controller.getBySlug;
const patch = controller.patch;
const delete_ = controller.delete;

export { get as GET, patch as PATCH, delete_ as DELETE }