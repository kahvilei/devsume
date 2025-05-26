import {IResume} from "@/server/models/Resume";
import {ResponseObject} from "@/lib/db/utils";
import {useState} from "react";
import WysiwygText from "@/app/_components/input/WysiwygText";
import ItemSelectFromDB from "@/app/_components/editors/items/ItemSelectFromDB";

interface EditResumeProps {
    resume?: IResume;
    onSave?: (resume: IResume) => ResponseObject;
}

export default function EditResume({resume}: EditResumeProps) {

    const [resumeData, setResumeData] = useState<Partial<IResume> | undefined>(resume);

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
                <ItemSelectFromDB
                    type={"categories"}
                    onSelect={() => {}}
                    />
            </section>

        </section>
    )
}

