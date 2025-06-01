import React from "react";
import {EditProps} from "@/interfaces/data";
import {ISkill} from "@/custom/categories/skill/model";
import TextInput from "@/app/_components/input/TextInput";
import TextAreaInput from "@/app/_components/input/select/TextAreaInput";
import TagInput from "@/app/_components/input/TagInput";
import {Button} from "@/app/_components/buttons/Button";
import {Separator} from "@/app/_components/display/Seperator";
import {Plus, Save, Trash, X} from "lucide-react";
import ActionIcon from "@/app/_components/buttons/ActionIcon";

export default function EditSkill({item, onFinished}: EditProps<ISkill>) {
    const skill = item.getData();
    const [title, setTitle] = React.useState(skill.title);
    const [description, setDescription] = React.useState(skill.description);
    const [tags, setTags] = React.useState<string[]>(skill.tags??[]);

    const mode = skill._id ? 'edit' : 'create';

    //if value has an _id, it's an existing skill
    const handleSaveSkill = () => {
        console.log(skill);
        item.setDataAndSave({...skill, title, description, tags}).then(
            onFinished
        );
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this skill?')) {
            item.delete().then(
                onFinished
            );
        }
    }

    return (
            <form
                tabIndex={0}
                autoFocus={true}
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveSkill();
                }}
                className="flex flex-col gap-sm max-w-full w-50"
            >
                <div className="flex flex-row gap-xs justify-between items-end">
                    <h3>{mode === 'edit' ? "Edit skill" : "Add a new skill"}</h3>
                    <ActionIcon icon={<X/>} onClick={onFinished} variant="btn-shadow-spread" size="sm" tooltip={"Cancel"}/>
                </div>

                <Separator/>
                <TextInput
                    value = {title}
                    onChange = {setTitle}
                    label = "Title"
                    placeholder = "Skill title"
                    required = {true}
                />
                <TextAreaInput
                    value = {description??""}
                    onChange = {setDescription}
                    label = "Description"
                    placeholder = "Skill description"
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