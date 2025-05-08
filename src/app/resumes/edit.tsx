import {IResume} from "@/models/Resume";
import {ResponseObject} from "@/lib/db/utils";
import {useState} from "react";
import EditableText from "@/app/_components/editor/text/EditableText";
import {ITag} from "@/models/categories/Tag";
import MultiSelectFromDB from "@/app/_components/editor/common/MultiSelectFromDB";

interface EditResumeProps {
    resume?: IResume;
    onSave?: (resume: IResume) => ResponseObject;
}

export default function EditResume({resume, onSave}: EditResumeProps) {

    const [resumeData, setResumeData] = useState<Partial<IResume> | undefined>(resume);
    const handleSave = () => {
        if (onSave) {
            onSave(resumeData as IResume)
        }
    }
    return (
        <section className="w-full flex items-center justify-space-evenly">
            <section className="flex-1/3 flex flex-col gap-2">
                <EditableText
                    order="h1"
                    value={resumeData?.name}
                    label="Name"
                    placeholder="Enter name"
                    onUpdate={(value: string) => setResumeData({...resumeData, name: (value || "")})}
                />
                <EditableText
                    order="h2"
                    value={resumeData?.title}
                    label="Title/position"
                    placeholder="Enter title/position"
                    onUpdate={(value: string) => setResumeData({...resumeData, title: (value || "")})}
                />
                <EditableText
                    order="body"
                    label="Subtitle/short description"
                    value={resumeData?.subtitle}
                    placeholder="Write a subtitle/short description"
                    onUpdate={(value: string) => setResumeData({...resumeData, subtitle: (value || "")})}
                />
                <MultiSelectFromDB
                    label="Core competencies"
                    placeholder="Select tags"
                    values={resumeData?.tags as ITag[]}
                    onSelect={(value: ITag[]) => setResumeData({...resumeData, tags: (value || [])})}
                    dataKey={"tags"}
                />
            </section>
            <section className="flex-2/3">
                <button
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                    onClick={handleSave}
                >
                    Save
                </button>

            </section>
        </section>
    )
}

