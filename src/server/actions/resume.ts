"use server"
import Resume, {IResume} from "@/server/models/Resume";
import {createFailResponse, createSuccessResponse, dbOperation, ResponseObject} from "@/lib/db/utils";

export const addResume = async (values: Partial<IResume>):Promise<ResponseObject> => {
    return dbOperation(async () => {
        // Validate required fields upfront
        if (!values.title) {
            return createFailResponse("Resume title is required" );
        }

        const resumeFound = await Resume.findOne({ title: values.title }).lean();
        if (resumeFound) {
            return createFailResponse("Resume with this title already exists." );
        }

        await new Resume(values).save();
        return createSuccessResponse({});
    });
};

export const saveResume = async (resume: IResume):Promise<ResponseObject> => {
    return dbOperation(async () => {
        if (!resume._id) {
            return createFailResponse("Resume ID is required for updates")
        }

        const result = await Resume.findByIdAndUpdate(
            resume._id,
            resume,
            { upsert: true, new: true }
        );

        return createSuccessResponse(result);
    });
};

export const getResumeBySlug = async (resumeSlug: string):Promise<ResponseObject> => {
    return dbOperation(async () => {
        if (!resumeSlug) {
            return createFailResponse("Resume slug is required" );
        }

        const resume = await Resume.findOne({ slug: resumeSlug }).lean();
        if (!resume) {
            return createFailResponse("Resume not found" );
        }

        return createSuccessResponse(resume);
    });
};

export const getResumes = async ():Promise<ResponseObject> => {
    return dbOperation(async () => {
        const resumes = await Resume.find().lean();
        return createSuccessResponse(resumes);
    });
};