

export interface BaseDataModel {
    _id?: string;
    title: string;
}

export interface PreviewProps<T extends BaseDataModel> {
    item: T;
}

export interface EditProps<T extends BaseDataModel> {
    item: T;
    onSaveItem: (item: T) => void;
    onCancel: () => void;
    label: string;
}