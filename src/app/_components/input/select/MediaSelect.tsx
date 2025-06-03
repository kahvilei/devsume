import {ItemSingleSelect} from "@/app/_components/editors/items/ItemSelect";
import {IMedia} from "@/server/models/Media";
import {Item} from "@/app/_data/Items/Item";

interface MediaSelectProps<T extends IMedia> {
    type?: string;
    value?: T;
    onSelect: (media: T) => void;
}

export const MediaSelect = <T extends IMedia>({type, value, onSelect}: MediaSelectProps<T>) => {

    const handleSelect = (item: Item<T>) => {
        if (!item) return;
        onSelect(item.getData())
    }

    return (
        <ItemSingleSelect
            type={type??"Media"}
            value={new Item<T>(value??{} as T, value?.__t??"Media")}
            onSelect={handleSelect}
        />
    );
}