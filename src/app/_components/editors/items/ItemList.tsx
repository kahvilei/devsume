import {ItemPreview} from "@/app/_components/editors/items/ItemPreview";
import {Item} from "@/app/_data/Items/Item";
import {IBaseItem} from "@/server/models/schemas/IBaseItem";

interface ItemListProps<T extends IBaseItem> {
    items: Item<T>[];
}

export const ItemList = <T extends IBaseItem>(
    {
        items,
    }: ItemListProps<T>) => {

    return (
        <ul role="listbox" className="item-list">
            {items.map(item =>
                <li
                    key={item.getData()._id}
                    aria-label={item.getData().title}
                    className="flex items-center justify-between item cursor-pointer"
                >
                    <ItemPreview
                        item={item}
                    />
                </li>
            )}
        </ul>
    );
};