import {IBaseItem} from "@/server/models/schemas/IBaseItem";
import {Item} from "@/app/_data/Items/Item";

export interface PreviewProps<T extends IBaseItem> {
    item: Item<T>;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
}

export interface EditProps<T extends IBaseItem> {
    item: Item<T>;
    onFinished: () => void;
    label?: string;
}

