import {IBaseItem} from "@/server/models/schemas/IBaseItem";

export interface PreviewProps<T extends IBaseItem> {
    item: T;
    onClick?: () => void;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    disabled?: boolean;
    onDelete?: (item: T) => void;
    setIsEditing?: (bool: boolean) => void;
}

export interface EditProps<T extends IBaseItem> {
    item: T;
    onSaveItem: (item: T) => void;
    onCancel: () => void;
    label: string;
}

