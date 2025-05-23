import {Item} from "@/server/models/schemas/data";

export interface PreviewProps<T extends Item> {
    item: T;
    onClick?: () => void;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    disabled?: boolean;
    onDelete?: (item: T) => void;
    setIsEditing?: (bool: boolean) => void;
}

export interface EditProps<T extends Item> {
    item: T;
    onSaveItem: (item: T) => void;
    onCancel: () => void;
    label: string;
}