import React from "react";
import {ITag} from "@/models/categories/Tag";
import {EditProps} from "@/interfaces/data";
import EditableText from "@/app/_components/editor/text/EditableText";


export default function EditTag({item = { title: ""}, onSaveItem: onSaveTag, onCancel}: EditProps<ITag>) {

    const [title, setTitle] = React.useState(item.title);
    const [description, setDescription] = React.useState(item.description);

    //if value has an _id, it's an existing tag
    const handleSaveTag = () => {
        console.log(item);
        onSaveTag({...item, title, description})
    };

    return (
        <div>
            <form onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSaveTag();
            }
            } className="flex flex-col gap-2" aria-label={item.title}>
                <EditableText value={title} label={'tag name'} placeholder={'Enter new tag name'} onUpdate={(value: string) =>setTitle(value)} required />
                <EditableText value={description} label={'tag name'} placeholder={'Enter tag description'} onUpdate={(value: string) =>setDescription(value)}/>
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                >
                    Add
                </button>
                <button
                    type="button"
                    className="bg-gray-300 px-2 py-1 rounded"
                    onClick={onCancel}
                >
                    Cancel
                </button>
            </form>
        </div>
    )
}