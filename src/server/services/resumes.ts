import { Resume } from "@/server/models";
import { IResume } from "@/server/models/Resume";
import { createServiceFactory } from "@/lib/db/service-factory";

const categoryService = createServiceFactory<IResume>(
    Resume,
    "resumes",
    "Resume"
);

export default categoryService;