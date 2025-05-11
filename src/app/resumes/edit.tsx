import {IResume} from "@/models/Resume";
import {ResponseObject} from "@/lib/db/utils";
import {useState} from "react";
import EditableText from "@/app/_components/editor/text/EditableText";
import {ITag} from "@/models/categories/Tag";
import MultiSelectFromDB from "@/app/_components/editor/common/MultiSelectFromDB";
import {DataQuery} from "@/interfaces/api";

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
        <section className="resume">
            <section className="right">
                <section className="title-description">
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
                </section>
                <section className="tags">
                    <MultiSelectFromDB
                        label="Core competencies"
                        placeholder="Select tags"
                        values={resumeData?.tags as ITag[]}
                        onSelect={(value: ITag[] | DataQuery<ITag>) => setResumeData({
                            ...resumeData,
                            tags: [{title: "Core", tags: (value || [])}]
                        })}
                        dataKey={"tags"}
                    />
                </section>
            </section>
            <section className="left">
                <EditableText
                    order="body"
                    label="Subtitle/short description"
                    value={resumeData?.about}
                    placeholder="Write a subtitle/short description"
                    onUpdate={(value: string) => setResumeData({...resumeData, about: (value || "")})}
                />
            </section>
        </section>
    )
}

