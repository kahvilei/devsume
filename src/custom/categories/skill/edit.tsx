import React from "react";
import {EditProps} from "@/interfaces/data";
import EditableText from "@/app/_components/editor/text/EditableText";
import {Save, X} from "lucide-react";
import ActionIcon from "@/app/_components/common/ActionIcon";
import {ISkill} from "@/custom/categories/skill/model";


export default function EditSkill({item: skill = {title: ""}, onSaveItem: onSaveTag, onCancel}: EditProps<ISkill>) {

    const [title, setTitle] = React.useState(skill.title);
    const [description, setDescription] = React.useState(skill.description);

    //if value has an _id, it's an existing skill
    const handleSaveTag = () => {
        console.log(skill);
        onSaveTag({...skill, title, description})
    };

    return (
        <div className='rounded-full'>
            <form
                tabIndex={0}
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveTag();
                }}
            >
                <div className='tag md primary btn-shadow-filled rounded-full no-hover flex-between'>
                    <span className="tag-label flex gap-xxs">
                        <EditableText value={title} label={'skill name'} placeholder={'Name'}
                                      onUpdate={(value: string) => setTitle(value)} required/>
                        <EditableText value={description} label={'skill description'} placeholder={'Description'}
                                      onUpdate={(value: string) => setDescription(value)}/>
                    </span>
                    <span className={"flex gap-xxs"}>
                        <ActionIcon
                            type= "submit"
                            icon={<Save/>}
                            tooltip={"Save"}
                            size="xs"
                            variant="btn-light"
                            color="background"
                            radius="rounded-full"
                        />
                        <ActionIcon
                            onClick={() => onCancel()}
                            icon={<X/>}
                            tooltip="Cancel edit"
                            size="xs"
                            variant="btn-light"
                            color="background"
                            radius="rounded-full"
                        />
                    </span>
                </div>
            </form>
        </div>
    )
}