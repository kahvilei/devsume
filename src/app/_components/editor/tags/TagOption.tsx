import { ITag } from "@/models/categories/Tag";
import { deleteAndDigest } from "@/lib/http/deleteAndDigest";
import { patchAndDigest } from "@/lib/http/patchAndDigest";

interface TagOptionProps {
    tag: ITag;
    isSelected?: boolean;
    onSelect?: (tag: ITag) => void;
    onRemove?: (tag: ITag) => void;
    onEdit?: (tag: ITag) => void;
    onError?: (error: string) => void;
    onWarning?: (warning: string) => void;
}

export default function TagOption({
      tag,
      isSelected,
      onSelect = () => {},
      onRemove = () => {},
      onEdit = () => {},
      onError = () => {},
      onWarning = () => {}
  }: TagOptionProps) {

    const remove = async () => {
        await deleteAndDigest<ITag>(
            `/api/tags/${tag._id}`,
            (deletedTag) => onRemove(deletedTag),
            onError,
            onWarning
        );
    };

    const edit = async () => {
        await patchAndDigest<ITag>(
            `/api/tags/${tag._id}`,
            tag,
            (updatedTag) => onEdit(updatedTag),
            onError,
            onWarning
        );
    };

    return (
        <li
            onClick={() => onSelect(tag)}
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
                <button onClick={edit} className="mr-2">Edit</button>
                <button onClick={remove}>Remove</button>
            </div>
        </li>
    );
}
