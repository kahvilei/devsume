import {createController} from "@/lib/api/controller-factory";
import service from "@/server/actions/resumes";

const resumeController = createController(service);

export default resumeController;