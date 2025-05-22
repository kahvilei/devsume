import {createController} from "@/lib/api/controller-factory";
import service from "@/server/services/resumes";

const resumeController = createController(service);

export default resumeController;