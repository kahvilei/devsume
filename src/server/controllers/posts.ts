import {createController} from "@/lib/api/controller-factory";
import service from "@/server/services/posts";

const postsController = createController(service);

export default postsController;