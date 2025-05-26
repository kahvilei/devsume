import React from "react";
import {EditProps} from "@/interfaces/data";
import {IBaseItem} from "@/server/models/schemas/IBaseItem";
import {Item} from "@/app/_data/Items/Item";

interface ItemEditProps<T extends IBaseItem> {
    item: Item<T>;
    label: string;
    onCancel?: () => void;
}

export default function ItemEdit<T extends IBaseItem>(
    {
        item,
        label,
        onCancel = () => {
        },
    }: ItemEditProps<T>) {

    // Default form component
    const DefaultEditor: React.FC<EditProps<T>> = ({item, onCancel}) => (
        <form aria-label={label}>
            <div>{item.getData().title}</div>
            <button onClick={() => item.save()}>Save</button>
            <button onClick={onCancel}>Cancel</button>
        </form>
    );

    const EditorComponent = item.edit || DefaultEditor;

    return (
        <div>
            <EditorComponent item={item} label={label} onCancel={onCancel}/>
        </div>
    );
}