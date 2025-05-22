import {ISkill} from "@/custom/categories/skills/model";
import MultiSelectFromDB from "@/app/_components/editor/common/MultiSelectFromDB";
import {Data} from "@/server/models/schemas/data";

interface TagSelectProps {
    values?: Data<ISkill>;
    title: string;
    onSelect: (value: Data<ISkill>) => void;
    onRemove?: () => void;
}

export default function SkillSelector({values, title, onSelect, onRemove}: TagSelectProps) {
    return (
        <MultiSelectFromDB
            values={values}
            title={title}
            dataKey={"skills"}
            onSelect={onSelect}
            onRemove={onRemove}
        />
    )
}