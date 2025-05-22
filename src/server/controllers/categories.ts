import {createController} from "@/lib/api/controller-factory";
import service from "@/server/services/categories";

const categoryController = createController(service);

export default categoryController;