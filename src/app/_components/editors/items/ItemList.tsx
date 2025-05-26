import ItemPreview from "@/app/_components/editors/items/ItemPreview";
import {Item} from "@/app/_data/Items/Item";

interface ItemListProps {
    items: Item<any>[];
    onSelect?: (item: Item<any>) => void;
}

export const ItemList = (
    {
        items,
        onSelect = () => {}
    }: ItemListProps,
) => {
    return (
        <div>
            {items.map(item =>
                <li
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onSelect(item);
                    }}
                    key={item.getData()._id}
                    role="option"
                    aria-label={item.getData().title}
                    className="flex items-center justify-between item-selector item cursor-pointer"
                    aria-selected={isSelected}
                >
                    <ItemPreview key={item.getData().id} item={item} onClick={onSelect}/>
                </li>
            )}
        </div>
    )
}