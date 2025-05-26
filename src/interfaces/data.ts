import {IBaseItem} from "@/server/models/schemas/IBaseItem";
import {Item} from "@/app/_data/Items/Item";

export interface PreviewProps<T extends IBaseItem> {
    item: Item<T>;
    onClick?: () => void;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    disabled?: boolean;
    setIsEditing?: (bool: boolean) => void;
}

export interface EditProps<T extends IBaseItem> {
    item: Item<T>;
    onCancel: () => void;
    label: string;
}

