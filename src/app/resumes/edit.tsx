import {IResume} from "@/server/models/Resume";
import {ResponseObject} from "@/lib/db/utils";
import {useState} from "react";
import EditableText from "@/app/_components/editor/text/EditableText";
import ItemSectionEditor from "@/app/_components/editor/common/ItemSectionEditor";
import {Section} from "@/server/models/schemas/section";
import {IPost} from "@/server/models/Post";
import {ICategory} from "@/server/models/Category";

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
                <section className="categories">
                    <ItemSectionEditor
                        max={100}
                        sectionTypes={["categories"]}
                        sectionData={resumeData?.categories ?? []}
                        onSave={(sections: Section<ICategory>[]) => setResumeData({
                            ...resumeData,
                            categories: sections
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
                    <ItemSectionEditor
                        max={100}
                        sectionTypes={["posts"]}
                        sectionData={resumeData?.posts ?? []}
                        onSave={(sections: Section<IPost>[]) => setResumeData({
                            ...resumeData,
                            posts: sections
                        })}
                    />
                </section>
            </section>

        </section>
    )
}

