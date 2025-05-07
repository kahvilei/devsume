"use client";

import EditResume from "@/app/resumes/edit";
import {IResume} from "@/models/Resume";
import {createSuccessResponse} from "@/lib/db/utils";

export default function AddResume() {
    const onSave = (resume: IResume) => {
        return createSuccessResponse(resume)
    }
    return (
        <EditResume onSave={onSave}/>
    );
};