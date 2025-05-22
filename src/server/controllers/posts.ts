import {createController} from "@/lib/api/controller-factory";
import service from "@/server/actions/posts";

const postsController = createController(service);

export default postsController;