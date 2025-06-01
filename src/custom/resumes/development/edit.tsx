import {ResponseObject} from "@/lib/db/utils";
import {useState} from "react";
import WysiwygText from "@/app/_components/input/WysiwygText";
import {Section} from "@/server/models/schemas/section";
import {ICategory} from "@/server/models/Category";
import {IDevelopmentResume} from "@/custom/resumes/development/model";
import {IExperience} from "@/custom/posts/experience/model";

interface EditResumeProps {
    resume?: IDevelopmentResume;
    onSave?: (resume:  IDevelopmentResume) => ResponseObject;
}

export default function EditResume({resume}: EditResumeProps) {

    const [resumeData, setResumeData] = useState<Partial<IDevelopmentResume> | undefined>(resume);
    return (
        <section className="resume">
            <section className="right">
                <section className="title-description">
                    <WysiwygText
                        order="h1"
                        value={resumeData?.name}
                        label="Name"
                        placeholder="Enter name"
                        onUpdate={(value: string) => setResumeData({...resumeData, name: (value || "")})}
                    />
                    <WysiwygText
                        order="h2"
                        value={resumeData?.title}
                        label="Title/position"
                        placeholder="Enter title/position"
                        onUpdate={(value: string) => setResumeData({...resumeData, title: (value || "")})}
                    />
                    <WysiwygText
                        order="body"
                        label="Subtitle/short description"
                        value={resumeData?.subtitle}
                        placeholder="Write a subtitle/short description"
                        onUpdate={(value: string) => setResumeData({...resumeData, subtitle: (value || "")})}
                    />
                </section>
                <section className="categories">

                </section>
            </section>
            <section className="left">
                <WysiwygText
                    order="body"
                    label="About you"
                    value={resumeData?.about}
                    placeholder="Write a subtitle/short description"
                    onUpdate={(value: string) => setResumeData({...resumeData, about: (value || "")})}
                    toolTipPosition={"right"}
                />
                <section className="work">

                </section>
            </section>

        </section>
    )
}

