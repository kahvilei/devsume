import {createController} from "@/lib/api/controller-factory";
import service from "@/server/actions/categories";

const categoryController = createController(service);

export default categoryController;