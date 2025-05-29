import {ItemPreview} from "@/app/_components/editors/items/ItemPreview";
import {Item} from "@/app/_data/Items/Item";
import {IBaseItem} from "@/server/models/schemas/IBaseItem";

type SingleSelectValue<T extends IBaseItem> = Item<T> | undefined;
type MultipleSelectValue<T extends IBaseItem> = Item<T>[];
export type SelectValue<T extends IBaseItem> = SingleSelectValue<T> | MultipleSelectValue<T>;

interface ItemSelectListProps<T extends IBaseItem> {
    items: Item<T>[];
    selectType: "single" | "multiple";
    selected: SelectValue<T>;
    onSelect: (value: SelectValue<T>) => void;
}

export const ItemSelectList = <T extends IBaseItem>(
    {
        items,
        selectType,
        selected,
        onSelect
    }: ItemSelectListProps<T>) => {
    const handleClick = (item: Item<T>) => {
        if (selectType === "single") {
            onSelect(item);
            return;
        }

        const selectedItems = selected as MultipleSelectValue<T>;
        if (selectedItems.includes(item)) {
            onSelect(selectedItems.filter(i => i !== item));
        } else {
            onSelect([...selectedItems, item]);
        }
    };

    const isSelected = (item: Item<T>): boolean => {
        if (selectType === "single") {
            return item === selected;
        }
        return (selected as MultipleSelectValue<T>).includes(item);
    };

    return (
        <ul role="listbox" className="item-select-list">
            {items.map(item =>
                <li
                    key={item.getData()._id}
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleClick(item);
                    }}
                    role="option"
                    aria-label={item.getData().title}
                    aria-selected={isSelected(item)}
                    className="flex items-center justify-between item-selector item cursor-pointer"
                >
                    <ItemPreview
                        item={item}
                        onClick={() => handleClick(item)}
                    />
                </li>
            )}
        </ul>
    );
};

interface ItemSingleSelectProps<T extends IBaseItem> {
    items: Item<T>[];
    selected: SingleSelectValue<T>;
    onSelect: (item: SingleSelectValue<T>) => void;
}

export const ItemSingleSelect = <T extends IBaseItem>(
    {
        items,
        selected,
        onSelect
    }: ItemSingleSelectProps<T>) => (
    <ItemSelectList<T>
        items={items}
        selectType="single"
        selected={selected}
        onSelect={value => onSelect(value as SingleSelectValue<T>)}
    />
);

interface ItemMultipleSelectProps<T extends IBaseItem> {
    items: Item<T>[];
    selected: MultipleSelectValue<T>;
    onSelect: (items: MultipleSelectValue<T>) => void;
}

export const ItemMultipleSelect = <T extends IBaseItem>(
    {
        items,
        selected,
        onSelect
    }: ItemMultipleSelectProps<T>) => (
    <ItemSelectList<T>
        items={items}
        selectType="multiple"
        selected={selected}
        onSelect={value => onSelect(value as MultipleSelectValue<T>)}
    />
);
