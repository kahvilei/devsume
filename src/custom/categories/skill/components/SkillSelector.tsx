import {ISkill} from "@/custom/categories/skill/model";
import {Data} from "@/server/models/schemas/data";
import {ItemMultiSelect} from "@/app/_components/editors/items/ItemSelect";

interface SkillSelectProps {
    values?: Data<ISkill>;
    label: string;
    onSelect: (value: Data<ISkill>) => void;
}

export default function SkillSelector({values, label, onSelect}: SkillSelectProps) {
    return (
        <ItemMultiSelect<ISkill>
            values={values}
            label={label}
            type={"Skill"}
            onSelect={onSelect}
        />
    )
}