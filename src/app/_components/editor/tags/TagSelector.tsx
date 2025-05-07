import {ITag} from "@/models/categories/Tag";
import React, {useEffect, useState} from "react";
import {getAndDigest} from "@/lib/http/getAndDigest";
import {postAndDigest} from "@/lib/http/postAndDigest";
import {toggleArrayItem} from "@/lib/misc/toggleArrayItem";
import TagOption from "@/app/_components/editor/tags/TagOption";

interface TagSelectorProps {
    value?: ITag[]
    label: string
    placeholder: string
    setTags: (value: ITag[]) => void
}

export default function TagSelector({value = [], label, placeholder="Add some tags", setTags}: TagSelectorProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [options, setOptions] = React.useState<ITag[]>([]);
    const [currentSelection, setCurrentSelection] = React.useState<ITag[]>(value);
    const [newTagTitle, setNewTagTitle] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState<string>();
    const [warning, setWarning] = useState<string>();

    useEffect(() => {
        getAndDigest<ITag[]>("/api/tags", setOptions, setError, setWarning).then()
    }, []);

    useEffect(() => {
        setTags(currentSelection);
    }, [currentSelection]);


    const handleAddTag = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTagTitle.trim()) return;
        postAndDigest<ITag>("/api/tags", { title: newTagTitle } as ITag, addTag, setError, setWarning).then();
    };

    const addTag = (tag: ITag) => {
        setOptions(prev => [...prev, tag]);
        setNewTagTitle("");
        setIsAdding(false);
        setTags(currentSelection);
    }

    const removeTag = (tag: ITag) => {
        setOptions(prev => prev.filter(t => t._id !== tag._id));
        setCurrentSelection(prev => prev.filter(t => t._id !== tag._id));
        setTags(currentSelection);
    }

    return (
        <div className={"tag-selector-wrap"}>
            <div
                aria-label={label}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                onClick={() => setIsOpen(true)}
                className="tag-selector-button w-full cursor-pointer"
            >
                <ul role="tags" className="tag-selector-tags flex gap-2" aria-label="Tags" >
                    {currentSelection.map((tag) => (
                        <li
                            className="tag-selector tag" key={tag._id}
                            onClick={() => toggleArrayItem(tag, currentSelection, setCurrentSelection)}
                        >
                            {tag.title}
                        </li>
                    ))}
                </ul>
                {currentSelection?.length===0&&<div className="tag-selector-placeholder">{placeholder}</div>}
                {isOpen && (
                    <ul role="listbox">
                        {options.map((option: ITag) => (
                            <TagOption
                                key={option.title}
                                tag={option}
                                onSelect={() => toggleArrayItem(option, currentSelection, setCurrentSelection)}
                                isSelected={currentSelection.includes(option)}
                                onRemove={removeTag}
                            />
                        ))}
                        {isAdding ? (
                            <li className="p-2">
                                <form onSubmit={handleAddTag} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newTagTitle}
                                        onChange={(e) => setNewTagTitle(e.target.value)}
                                        placeholder="New tag name"
                                        className="border rounded px-2 py-1"
                                        autoFocus
                                    />
                                    <button
                                        type="submit"
                                        className="bg-blue-500 text-white px-2 py-1 rounded"
                                    >
                                        Add
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsAdding(false)}
                                        className="bg-gray-300 px-2 py-1 rounded"
                                    >
                                        Cancel
                                    </button>
                                </form>
                            </li>
                        ) : (
                            <li
                                className="tag-selector tag cursor-pointer text-blue-500"
                                onClick={() => setIsAdding(true)}
                            >
                                + Add new tag
                            </li>
                        )}

                    </ul>
                )}
                {error && <div className="error">{error}</div>}
                {warning && <div className="warning">{warning}</div>}
            </div>
        </div>
    );
}
