import React from "react";
import {ITag} from "@/models/categories/Tag";

interface TagEditProps {
    value?: ITag
    label: string
    onSaveTag: (tag: ITag) => void
}
export default function Edit({value = { title: ""}, label, onSaveTag}: TagEditProps) {

    const [title, setTitle] = React.useState(value.title);

    //if value has an _id, it's an existing tag
    const handleSaveTag = () => {
        console.log(value);
        onSaveTag({...value, title})
    };

    return (
        <div>
            <form onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSaveTag();
            }
            } className="flex gap-2" aria-label={label}>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="New tag name"
                    className="border rounded px-2 py-1"
                    autoFocus
                    required
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                >
                    Add
                </button>
                <button
                    type="button"
                    className="bg-gray-300 px-2 py-1 rounded"
                >
                    Cancel
                </button>
            </form>
        </div>
    )
}