import React from "react";
import {BaseDataModel} from "@/interfaces/api";

interface ItemEditProps<T extends BaseDataModel> {
    value?: T
    label: string
    onSave: (item: T) => void
    onCancel?: () => void
}

export default function ItemEdit<T extends BaseDataModel & { title: string }>({
                                                                                  value = {title: ""} as T,
                                                                                  label,
                                                                                  onSave,
                                                                                  onCancel
                                                                              }: ItemEditProps<T>) {

    const [title, setTitle] = React.useState(value.title);

    const handleSave = () => {
        onSave({...value, title} as T);
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
    };

    return (
        <div>
            <form onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSave();
            }}
                  className="flex gap-2"
                  aria-label={label}>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter item name"
                    className="border rounded px-2 py-1"
                    autoFocus
                    required
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                >
                    Save
                </button>
                <button
                    type="button"
                    className="bg-gray-300 px-2 py-1 rounded"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCancel();
                    }}
                >
                    Cancel
                </button>
            </form>
        </div>
    );
}