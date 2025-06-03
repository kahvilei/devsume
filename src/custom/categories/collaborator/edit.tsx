import React from "react";
import {EditProps} from "@/interfaces/data";
import TextInput from "@/app/_components/input/TextInput";
import TextAreaInput from "@/app/_components/input/select/TextAreaInput";
import TagInput from "@/app/_components/input/TagInput";
import {Button} from "@/app/_components/buttons/Button";
import {Separator} from "@/app/_components/display/Seperator";
import {Plus, Save, Trash, X} from "lucide-react";
import ActionIcon from "@/app/_components/buttons/ActionIcon";
import {ICollaborator} from "@/custom/categories/collaborator/model";
import {IImage} from "@/custom/media/image/model";
import {MediaSelect} from "@/app/_components/input/select/MediaSelect";

export default function EditCollaborator({item, onFinished}: EditProps<ICollaborator>) {
    const collaborator = item.getData();
    const [title, setTitle] = React.useState(collaborator.title);
    const [description, setDescription] = React.useState(collaborator.description);
    const [tags, setTags] = React.useState<string[]>(collaborator.tags??[]);
    const [image, setImage] = React.useState<IImage>(collaborator.img);

    const mode = collaborator._id ? 'edit' : 'create';

    //if value has an _id, it's an existing collaborator
    const handleSaveCollaborator = () => {
        item.setDataAndSave({...collaborator, title, description, tags, img:image}).then(
            onFinished
        );
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this collaborator?')) {
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
                    handleSaveCollaborator();
                }}
                className="flex flex-col gap-sm max-w-full w-50"
            >
                <div className="flex flex-row gap-xs justify-between items-end">
                    <h3>{mode === 'edit' ? "Edit collaborator" : "Add a new collaborator"}</h3>
                    <ActionIcon icon={<X/>} onClick={onFinished} variant="btn-shadow-spread" size="sm" tooltip={"Cancel"}/>
                </div>

                <Separator/>
                <section className="flex flex-row gap-xs items-center">
                    <section className={'flex-1'}>
                        <MediaSelect
                            type={"Image"}
                            value={image}
                            onSelect = {setImage}
                        />
                    </section>
                    <section className={'flex-2 flex flex-col gap-xs justify-center'}>
                        <TextInput
                            value = {title}
                            onChange = {setTitle}
                            label = "Colloborator name"
                            placeholder = "Collaborator name"
                            required = {true}
                            className={'w-full'}
                        />
                        <TextAreaInput
                            value = {description??""}
                            onChange = {setDescription}
                            label = "Description"
                            placeholder = "Collaborator description"
                            className={'w-full'}
                        />
                    </section>
                </section>
                <Separator/>
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