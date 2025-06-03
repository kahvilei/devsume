import {ItemPreview} from "@/app/_components/items/ItemPreview";
import {Item} from "@/app/_data/Items/Item";
import {IBaseItem} from "@/server/models/schemas/IBaseItem";
import {AnimatePresence} from "motion/react";
import PopInOut from "@/app/_components/animations/PopInOut";
import {SelectValue} from "@/app/_components/items/ItemSelect";

// Type definitions for select values
type SelectMode = "single" | "multiple";

interface ItemSelectListProps<T extends IBaseItem, Mode extends SelectMode> {
    items: Item<T>[];
    selectType: Mode;
    selected: SelectValue<T, Mode>;
    onSelect: (value: SelectValue<T, Mode>) => void;
}

export const ItemSelectList = <T extends IBaseItem, Mode extends SelectMode>(
    {
        items,
        selectType,
        selected,
        onSelect
    }: ItemSelectListProps<T, Mode>) => {
    const handleClick = (item: Item<T>) => {
        if (selectType === "single") {
            onSelect(item as SelectValue<T, Mode>);
            return;
        }

        const selectedItems = (selected || []) as Item<T>[];
        if (selectedItems.includes(item)) {
            onSelect(selectedItems.filter(i => i !== item) as SelectValue<T, Mode>);
        } else {
            onSelect([...selectedItems, item] as SelectValue<T, Mode>);
        }
    };

    const isSelected = (item: Item<T>): boolean => {
        if (selectType === "single") {
            return item === selected;
        }
        const selectedItems = (selected || []) as Item<T>[];
        return selectedItems.includes(item);
    };

    return (
        <ul role="listbox" className="item-select-list">
            <AnimatePresence>
                {items.map(item =>
                    <PopInOut key={item.getData()._id}>
                        <li
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
                    </PopInOut>
                )}
            </AnimatePresence>
        </ul>
    );
};

interface ItemSingleSelectProps<T extends IBaseItem> {
    items: Item<T>[];
    selected: SelectValue<T, "single">;
    onSelect: (item: SelectValue<T, "single">) => void;
}

export const ItemSingleSelect = <T extends IBaseItem>(
    {
        items,
        selected,
        onSelect
    }: ItemSingleSelectProps<T>) => (
    <ItemSelectList<T, "single">
        items={items}
        selectType="single"
        selected={selected}
        onSelect={onSelect}
    />
);

interface ItemMultipleSelectProps<T extends IBaseItem> {
    items: Item<T>[];
    selected: SelectValue<T, "multiple">;
    onSelect: (items: SelectValue<T, "multiple">) => void;
}

export const ItemMultipleSelect = <T extends IBaseItem>(
    {
        items,
        selected,
        onSelect
    }: ItemMultipleSelectProps<T>) => (
    <ItemSelectList<T, "multiple">
        items={items}
        selectType="multiple"
        selected={selected}
        onSelect={onSelect}
    />
);