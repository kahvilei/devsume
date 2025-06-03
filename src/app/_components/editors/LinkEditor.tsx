import React, {useState} from 'react';
import {Link} from '@/server/models/schemas/link';
import TextInput from '@/app/_components/input/TextInput';
import NumberInput from '@/app/_components/input/NumberInput';
import ActionIcon from '@/app/_components/buttons/ActionIcon';
import {Button} from '@/app/_components/buttons/Button';
import {ArrowDown, ArrowUp, Plus, Save, Trash, X} from 'lucide-react';
import IconSelect from '../input/select/IconSelect';

interface LinkEditorProps {
    link: Link;
    onSave: (link: Link) => void;
    onDelete: () => void;
    onCancel: () => void;
    isNew?: boolean;
}

export const LinkEditor: React.FC<LinkEditorProps> = (
    {
        link,
        onSave,
        onDelete,
        onCancel,
        isNew = false
    }) => {
    const [title, setTitle] = useState(link.title || '');
    const [url, setUrl] = useState(link.url || '');
    const [icon, setIcon] = useState(link.icon || '');
    const [order, setOrder] = useState(link.order || 0);

    const handleSave = () => {
        if (!title.trim() || !url.trim()) return;

        onSave({
            title: title.trim(),
            url: url.trim(),
            icon: icon || undefined,
            order
        });
    };

    const isValid = title.trim() && url.trim();

    return (
        <div className="content-style-3 p-xs rounded">
            <div className="flex-between mb-xs">
                <h4 className="h4">{isNew ? 'New link' : 'Edit link'}</h4>
                <ActionIcon
                    icon={<X/>}
                    onClick={onCancel}
                    size="sm"
                    tooltip="Cancel"
                />
            </div>

            <div className="separator"></div>

            <div className="flex flex-col gap-xs py-xs">
                <div className="flex flex-col sm:flex-row gap-xs">
                    <div className="flex-1">
                        <TextInput
                            label="Link title"
                            value={title}
                            onChange={setTitle}
                            placeholder="My website"
                            required={true}
                        />
                    </div>
                    <div className="w-full sm:w-20">
                        <NumberInput
                            label="Order"
                            value={order}
                            onChange={setOrder}
                            placeholder="0"
                            min={0}
                        />
                    </div>
                </div>

                <TextInput
                    label="URL"
                    value={url}
                    onChange={setUrl}
                    placeholder="https://example.com"
                    required={true}
                />

                <IconSelect
                    label="Icon (optional)"
                    value={icon}
                    onSelect={setIcon}
                />
            </div>

            <div className="separator"></div>

            <div className="flex gap-xs justify-end">
                <Button
                    icon={<Save/>}
                    onClick={handleSave}
                    color="primary"
                    disabled={!isValid}
                    size="sm"
                    variant="btn-shadow-filled"
                >
                    {isNew ? 'Add' : 'Save'}
                </Button>

                {!isNew && (
                    <Button
                        icon={<Trash/>}
                        onClick={onDelete}
                        color="danger"
                        size="sm"
                        variant="btn-light"
                    >
                        Delete
                    </Button>
                )}
            </div>
        </div>
    );
};

interface LinksEditorProps {
    links?: Link[];
    onChange: (links: Link[]) => void;
    label?: string;
    maxLinks?: number;
}

export const LinksEditor: React.FC<LinksEditorProps> = (
    {
        links = [],
        onChange,
        label = "Liens",
        maxLinks = 10
    }) => {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);

    const handleSaveLink = (linkData: Link, index?: number) => {
        const newLinks = [...links];

        if (index !== undefined) {
            // Modification d'un lien existant
            newLinks[index] = linkData;
        } else {
            // Ajout d'un nouveau lien
            newLinks.push(linkData);
        }

        // Trier par ordre
        newLinks.sort((a, b) => (a.order || 0) - (b.order || 0));

        onChange(newLinks);
        setEditingIndex(null);
        setIsAddingNew(false);
    };

    const handleDeleteLink = (index: number) => {
        const newLinks = links.filter((_, i) => i !== index);
        onChange(newLinks);
        setEditingIndex(null);
    };

    const moveLink = (index: number, direction: 'up' | 'down') => {
        const newLinks = [...links];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex >= 0 && targetIndex < newLinks.length) {
            [newLinks[index], newLinks[targetIndex]] = [newLinks[targetIndex], newLinks[index]];
            onChange(newLinks);
        }
    };

    return (
        <div className="rounded">
            <div className="flex-between p-xs rounded-t">
                <ActionIcon
                    icon={<Plus/>}
                    onClick={() => setIsAddingNew(true)}
                    size="sm"
                    tooltip="Add link"
                    disabled={links.length >= maxLinks}
                />
            </div>

            {links.length === 0 && !isAddingNew && (
                <div className="text-center py-md dimmed">
                    <p>No links added. Click + to add a link.</p>
                </div>
            )}

            <div className="flex flex-col gap-xs p-xs">
                {links.map((link, index) => (
                    <div key={index} className="link-item">
                        {editingIndex === index ? (
                            <LinkEditor
                                link={link}
                                onSave={(linkData) => handleSaveLink(linkData, index)}
                                onDelete={() => handleDeleteLink(index)}
                                onCancel={() => setEditingIndex(null)}
                            />
                        ) : (
                            <div className="content-style-3 p-xs rounded flex-between items-center">
                                <div className="flex items-center gap-xs flex-1">
                                    {link.icon && (
                                        <div className="flex-center w-6 h-6 background-fg rounded text-background">
                                            {/* Icon would render here */}
                                            <span className="text-xs">🔗</span>
                                        </div>
                                    )}
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <strong className="text-sm truncate">{link.title}</strong>
                                        <small className="dimmed text-xs truncate">{link.url}</small>
                                    </div>
                                </div>

                                <div className="flex items-center gap-xxs">
                                    <ActionIcon
                                        icon={<ArrowUp/>}
                                        onClick={() => moveLink(index, 'up')}
                                        disabled={index === 0}
                                        size="xs"
                                        tooltip="Move up"
                                        variant="btn-discreet"
                                    />
                                    <ActionIcon
                                        icon={<ArrowDown/>}
                                        onClick={() => moveLink(index, 'down')}
                                        disabled={index === links.length - 1}
                                        size="xs"
                                        tooltip="Move down"
                                        variant="btn-discreet"
                                    />
                                    <ActionIcon
                                        icon={<X/>}
                                        onClick={() => setEditingIndex(index)}
                                        size="xs"
                                        tooltip="Edit"
                                        variant="btn-discreet"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {isAddingNew && (
                    <div className="border-dashed border-2 border-success rounded">
                        <LinkEditor
                            link={{title: '', url: '', order: links.length}}
                            onSave={(linkData) => handleSaveLink(linkData)}
                            onDelete={() => {
                            }}
                            onCancel={() => setIsAddingNew(false)}
                            isNew={true}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default LinksEditor;