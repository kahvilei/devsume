import React from "react";
import {ITag} from "@/models/categories/Tag";
import {EditProps} from "@/interfaces/data";
import EditableText from "@/app/_components/editor/text/EditableText";
import {Save, X} from "lucide-react";
import ActionIcon from "@/app/_components/common/ActionIcon";


export default function EditTag({item: tag = {title: ""}, onSaveItem: onSaveTag, onCancel}: EditProps<ITag>) {

    const [title, setTitle] = React.useState(tag.title);
    const [description, setDescription] = React.useState(tag.description);

    //if value has an _id, it's an existing tag
    const handleSaveTag = () => {
        console.log(tag);
        onSaveTag({...tag, title, description})
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
                        <EditableText value={title} label={'tag name'} placeholder={'Enter new tag name'}
                                      onUpdate={(value: string) => setTitle(value)} required/>
                        <EditableText value={description} label={'tag description'} placeholder={'Enter tag description'}
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