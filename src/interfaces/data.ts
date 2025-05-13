

export interface BaseDataModel {
    _id?: string;
    title: string;
}

export interface PreviewProps<T extends BaseDataModel> {
    item: T;
    onClick?: () => void;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    disabled?: boolean;
    onDelete?: (item: T) => void;
    setIsEditing?: (bool: boolean) => void;
}

export interface EditProps<T extends BaseDataModel> {
    item: T;
    onSaveItem: (item: T) => void;
    onCancel: () => void;
    label: string;
}