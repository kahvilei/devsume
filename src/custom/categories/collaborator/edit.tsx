import React from "react";
import {EditProps} from "@/interfaces/data";
import TextInput from "@/app/_components/input/TextInput";
import TextAreaInput from "@/app/_components/input/TextAreaInput";
import TagInput from "@/app/_components/input/TagInput";
import {Button} from "@/app/_components/buttons/Button";
import {Separator} from "@/app/_components/display/Seperator";
import {Plus, Save, Trash, X} from "lucide-react";
import ActionIcon from "@/app/_components/buttons/ActionIcon";
import {ICollaborator} from "@/custom/categories/collaborator/model";
import {IImage} from "@/custom/media/image/model";
import {MediaSelect} from "@/app/_components/input/select/MediaSelect";
import { Link } from "@/server/models/schemas/link";
import LinksEditor from "@/app/_components/editors/LinkEditor";

export default function EditCollaborator({item, onFinished}: EditProps<ICollaborator>) {
    const collaborator = item.getData();
    const [title, setTitle] = React.useState(collaborator.title);
    const [description, setDescription] = React.useState(collaborator.description);
    const [tags, setTags] = React.useState<string[]>(collaborator.tags ?? []);
    const [image, setImage] = React.useState<IImage>(collaborator.img);
    const [links, setLinks] = React.useState<Link[]>(collaborator.links ?? []);

    const mode = collaborator._id ? 'edit' : 'create';

    //if value has an _id, it's an existing collaborator
    const handleSaveCollaborator = () => {
        item.setDataAndSave({
            ...collaborator,
            title,
            description,
            tags,
            img: image,
            links
        }).then(onFinished);
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this collaborator?')) {
            item.delete().then(onFinished);
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
            className="flex flex-col gap-sm max-w-content w-60"
        >
            <div className="flex-between">
                <h3 className="h3">{mode === 'edit' ? "Edit collaborator" : "Add _new collaborator"}</h3>
                <ActionIcon
                    icon={<X/>}
                    onClick={onFinished}
                    variant="btn-shadow-spread"
                    size="sm"
                    tooltip="Cancel"
                />
            </div>

            <div className="separator"></div>

            {/* Main section with image and basic info */}
            <section className="flex flex-col sm:flex-row gap-xs items-start">
                <section className="w-full sm:w-1/3">
                    <MediaSelect
                        type={"Image"}
                        value={image}
                        onSelect={setImage}
                    />
                </section>
                <section className="flex-1 flex flex-col gap-xs">
                    <TextInput
                        value={title}
                        onChange={setTitle}
                        label="Collaborator name"
                        placeholder="Collaborator name"
                        required={true}
                    />
                    <TextAreaInput
                        value={description ?? ""}
                        onChange={setDescription}
                        label="Description"
                        placeholder="Collaborator description"
                    />
                </section>
            </section>

            <Separator/>

            {/* Links section */}
            <LinksEditor
                links={links}
                onChange={setLinks}
                label="Links associated with this collaborator"
                maxLinks={8}
            />

            <Separator/>

            {/* Tags section */}
            <TagInput
                value={tags}
                onChange={setTags}
                label="Enter tags"
            />

            <Separator/>

            {/* Save/delete actions */}
            <div className="flex gap-xs justify-center">
                <Button
                    icon={mode === 'edit' ? <Save/> : <Plus/>}
                    variant="btn-shadow-filled"
                    type="submit"
                    color="primary"
                >
                    {mode === 'edit' ? 'Save' : 'Add'}
                </Button>
                {mode === 'edit' && (
                    <Button
                        icon={<Trash/>}
                        onClick={handleDelete}
                        color="danger"
                        variant="btn-light"
                    >
                        Delete
                    </Button>
                )}
            </div>
        </form>
    )
}