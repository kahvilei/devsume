import {IResume} from "@/server/models/Resume";
import {useState} from "react";
import WysiwygText from "@/app/_components/input/WysiwygText";
import {ItemSingleSelect} from "@/app/_components/items/ItemSelect";
import RichTextEditor from "@/app/_components/editors/RichTextEditor";
import {LinksEditor} from "@/app/_components/editors/LinkEditor";
import {Link} from "@/server/models/schemas/link";
import {EditProps} from "@/interfaces/data";
import {Button} from "@/app/_components/buttons/Button";

export default function EditResume({item}: EditProps<IResume>) {
    const resume = item.getData();
    const [resumeData, setResumeData] = useState<Partial<IResume> | undefined>(resume);

    const handleSave = () => {
        if (resumeData !== undefined) {
            item.setDataAndSave(resumeData as IResume).then(() => {})
        }
    }

    return (
        <form className="resume">
            <div className="form-group">
                <Button type={"submit"} onClick={handleSave}>Save</Button>
            </div>
            <section className="right">
                <section className="title-description">
                    <ItemSingleSelect
                        type={"Image"}
                        onSelect={() => {}}
                    />
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
                    <LinksEditor
                        links={resumeData?.links}
                        onChange={(value: Link[]) => setResumeData({...resumeData, links: (value || [])})}
                    />

                </section>
            </section>
            <section className="left">
                <RichTextEditor
                    order="body"
                    label="About you"
                    value={resumeData?.about}
                    placeholder="Write a subtitle/short description"
                    onUpdate={(value: string) => setResumeData({...resumeData, about: (value || "")})}
                />
            </section>
        </form>
    )
}

