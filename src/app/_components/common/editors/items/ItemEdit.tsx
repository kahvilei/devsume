import React from "react";
import {EditProps} from "@/interfaces/data";
import {IBaseItem} from "@/server/models/schemas/IBaseItem";

interface ItemEditProps<T extends IBaseItem> {
    item?: T;
    label: string;
    onSave: (item: T) => void;
    onCancel?: () => void;
    Form?: React.FC<EditProps<T>>;
}

export default function ItemEdit<T extends IBaseItem>(
    {
        item,
        label,
        onSave,
        onCancel = () => {
        },
        Form,
    }: ItemEditProps<T>) {
    // Create a default item if none provided
    const editItem = item || ({title: ""} as T);

    // Default form component
    const DefaultForm: React.FC<EditProps<T>> = ({item, onSaveItem, onCancel}) => (
        <form aria-label={label}>
            <div>{item.title}</div>
            <button onClick={() => onSaveItem(item)}>Save</button>
            <button onClick={onCancel}>Cancel</button>
        </form>
    );

    const FormComponent = Form || DefaultForm;

    return (
        <div>
            <FormComponent item={editItem} onSaveItem={onSave} label={label} onCancel={onCancel}/>
        </div>
    );
}