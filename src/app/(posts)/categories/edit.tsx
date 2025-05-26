import React from "react";
import {EditProps} from "@/interfaces/data";
import WysiwygText from "@/app/_components/input/WysiwygText";
import {Save, X} from "lucide-react";
import ActionIcon from "@/app/_components/buttons/ActionIcon";
import {ICategory} from "@/server/models/Category";


export default function EditCategory({item: category = {title: ""}, onSaveItem: onSaveTag, onCancel}: EditProps<ICategory>) {

    const [title, setTitle] = React.useState(category.title);

    //if value has an _id, it's an existing categories
    const handleSaveTag = () => {
        console.log(category);
        onSaveTag({...category, title})
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
                        <WysiwygText value={title} label={'categories name'} placeholder={'Name'}
                                     onUpdate={(value: string) => setTitle(value)} required/>
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