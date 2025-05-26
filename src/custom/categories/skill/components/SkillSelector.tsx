import {ISkill} from "@/custom/categories/skill/model";
import MultiSelectFromDB from "@/app/_components/select/MultiSelectFromDB";
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
            dataKey={"skill"}
            onSelect={onSelect}
            onRemove={onRemove}
        />
    )
}