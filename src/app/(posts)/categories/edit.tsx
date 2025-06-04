import React from "react";
import {EditProps} from "@/interfaces/data";
import {Plus, Save, Trash, X} from "lucide-react";
import ActionIcon from "@/app/_components/buttons/ActionIcon";
import {ICategory} from "@/server/models/Category";
import {Separator} from "@/app/_components/display/Seperator";
import TextInput from "@/app/_components/input/TextInput";
import TagInput from "@/app/_components/input/TagInput";
import {Button} from "@/app/_components/buttons/Button";


export default function EditCategory({item, onCancel}: EditProps<ICategory>) {

    const category = item.getData();
    const [title, setTitle] = React.useState(category.title);
    const [tags, setTags] = React.useState(category.tags??[]);

    const mode = item.getData()._id ? 'edit' : 'add';

    const handleDelete = () => {
        item.delete().then(() => {
            onCancel();
        });
    }

    //if value has an _id, it's an existing categories
    const handleSaveTag = () => {
        console.log(category);
        category.title = title;
        item.setDataAndSave({...item, tags, title}).then(() => {
            onCancel();
        });
    };

    return (
        <form
            tabIndex={0}
            autoFocus={true}
            onSubmit={(e) => {
                e.preventDefault();
                handleSaveTag();
            }}
            className="flex flex-col gap-sm max-w-full w-50"
        >
            <div className="flex flex-row gap-xs justify-between items-end">
                <h3>{mode === 'edit' ? "Edit skill" : "Add a _new skill"}</h3>
                <ActionIcon icon={<X/>} onClick={onCancel} variant="btn-shadow-spread" size="sm" tooltip={"Cancel"}/>
            </div>

            <Separator/>
            <TextInput
                value = {title}
                onChange = {setTitle}
                label = "Title"
                placeholder = "Skill title"
                required = {true}
            />
            <TagInput value={tags} onChange={setTags} label={"Enter tags"}/>
            <Separator/>
            <div className="flex flex-row gap-xs justify-center">
                <Button icon={mode === 'edit' ?<Save/>:<Plus/>} variant={"btn-shadow-filled"} type="submit" color="primary">
                    {mode === 'edit' ? (<>Save</>) :  (<>Add</>)}
                </Button>
                { mode === 'edit' && (
                    <Button icon={<Trash/>} onClick={handleDelete} color="danger">Delete</Button>
                )}
            </div>
        </form>
    )
}