import {ITag} from "@/models/categories/Tag";
import MultiSelectFromDB from "@/app/_components/editor/common/MultiSelectFromDB";
import {Data} from "@/models/schemas/data";

interface TagSelectProps {
    values?: Data<ITag>;
    label: string;
    onSelect: (value: Data<ITag>) => void;
    onRemove?: () => void;
}

export default function TagSelector({values, label, onSelect, onRemove}: TagSelectProps) {
    return (
        <MultiSelectFromDB
            values={values}
            label={label}
            dataKey={"tags"}
            onSelect={onSelect}
            onRemove={onRemove}
        />
    )
}