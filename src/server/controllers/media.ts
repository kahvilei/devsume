import {createController} from "@/lib/api/controller-factory";
import service from "@/server/actions/media";

const mediaController = createController(service);

export default mediaController;