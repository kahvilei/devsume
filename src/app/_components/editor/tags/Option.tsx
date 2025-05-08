import { ITag } from "@/models/categories/Tag";
import {useState} from "react";
import Edit from "@/app/_components/editor/tags/Edit";

interface TagOptionProps {
    tag: ITag;
    isSelected?: boolean;
    onSelect?: (tag: ITag) => void;
    onDelete?: (tag: ITag) => void;
    onEdit?: (tag: ITag) => void;
}

export default function Option({
      tag,
      isSelected,
      onSelect = () => {},
                                      onDelete = () => {},
      onEdit = () => {},
  }: TagOptionProps) {

    const [editTag, setEditTag] = useState<boolean>(false)

    const edit = (tag: ITag) => {
        onEdit(tag);
        setEditTag(false);
    };

    return (
        <li
            onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onSelect(tag)
            }}
            key={tag.title}
            role="option"
            aria-label={tag.title}
            className="flex items-center justify-between tag-selector tag cursor-pointer"
            aria-selected={isSelected}
        >
            <div className="flex items-center">
                <span className="mr-2">{tag.title}</span>
                {isSelected && <span className="text-xs text-gray-500">Selected</span>}
            </div>
            <div className="flex items-center">
                <button onClick={() => {setEditTag(true)}} className="mr-2">Edit</button>
                <button onClick={() => onDelete(tag)}>Delete</button>
            </div>
            {editTag &&
                <Edit
                    label="Edit tag"
                    value={tag}
                    onSaveTag={edit}
                />
            }
        </li>
    );
}
