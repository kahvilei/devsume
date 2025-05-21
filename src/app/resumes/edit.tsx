import {IResume} from "@/models/Resume";
import {ResponseObject} from "@/lib/db/utils";
import {useState} from "react";
import EditableText from "@/app/_components/editor/text/EditableText";
import {ITag} from "@/models/categories/Tag";
import MultiSelectFromDB from "@/app/_components/editor/common/MultiSelectFromDB";
import {DataQuery} from "@/interfaces/api";
import TagSelector from "@/app/_components/editor/categories/tags/TagSelector";
import ItemSectionEditor from "@/app/_components/editor/common/ItemSectionEditor";
import {Section} from "@/interfaces/data";

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
                    <ItemSectionEditor
                        max={100}
                        sectionTypes={["tags"]}
                        sectionData={resumeData?.tags ?? []}
                        onSave={(sections: Section<ITag>[]) => setResumeData({
                            ...resumeData,
                            tags: sections
                        })}
                    />
                </section>
            </section>
            <section className="left">
                <EditableText
                    order="body"
                    label="About you"
                    value={resumeData?.about}
                    placeholder="Write a subtitle/short description"
                    onUpdate={(value: string) => setResumeData({...resumeData, about: (value || "")})}
                    toolTipPosition={"right"}
                />
                <section className="work">
                    <TagSelector
                        label="Core competencies"
                        values={resumeData?.tags as ITag[]}
                        onSelect={(value: ITag[] | DataQuery<ITag>) => setResumeData({
                            ...resumeData,
                            tags: [{title: "Core", tags: (value || [])}]
                        })}
                    />
                </section>
            </section>

        </section>
    )
}

