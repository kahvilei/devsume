import {getAllPossibleKeys, getConfig} from "@/config/items";
import {useState} from "react";
import ActionIcon from "@/app/_components/common/buttons/ActionIcon";
import {Plus} from "lucide-react";
import MultiSelectFromDB from "@/app/_components/common/select/MultiSelectFromDB";
import PopInOut from "@/app/_components/animations/PopInOut";
import {Section} from "@/server/models/schemas/section";
import {DataQuery} from "@/server/models/schemas/data";
import {IBaseItem} from "@/server/models/schemas/IBaseItem";

interface ItemSectionEditorProps<T extends IBaseItem> {
    max: number; // maximum number of sections allowed
    sectionTypes: string[], //allowed data types for each section, each section must be one of these types
    sectionData: Section<T>[], // pre-existing data for each section
    onSave: (data: Section<T>[]) => void;
}


export default function ItemSectionEditor<T extends IBaseItem>({max, sectionTypes, sectionData, onSave}: ItemSectionEditorProps<T>) {

    const [sections, setSections] = useState<Section<T>[]>(sectionData);

    const handleSave = () => {
        onSave(sections);
    }

    const allAllowedTypes = getAllPossibleKeys(sectionTypes);

    const handleAddSection = (newSection: Section<T>) => {
        if (sections.length < max) {
            setSections([...sections, newSection]);
        }
    }

    const handleRemoveSection = (sectionToRemove: Section<T>) => {
        setSections(sections.filter(section => section !== sectionToRemove));
        handleSave();
    }

    const handleUpdateSectionTitle = (index: number, newTitle: string) => {
        const newSections = sections.map((section, i) => i === index ? {...section, title: newTitle} : section);
        setSections(newSections);
    }

    const handleUpdateSectionContent = (index: number, newSection: T[] | DataQuery<T>) => {
        const newSections = sections.map((section, i) => i === index ? {...section, data: newSection} : section);
        setSections(newSections);
    }

    return (
        <section className={"content-sections flex flex-col gap-md"}>
            {sections.map((section, index) => (
                <PopInOut key={index}>
                    <MultiSelectFromDB
                        values={section.data}
                        title={section.title}
                        dataKey={section.type}
                        onSelect={(section) => handleUpdateSectionContent(index, section)}
                        onUpdateTitle={(title) => handleUpdateSectionTitle(index, title)}
                        onRemove={() => handleRemoveSection(section)}
                    />
                </PopInOut>
            ))}

            <div className={"add-new h-10"}>
                {allAllowedTypes.map((type, index) => (
                    <ActionIcon
                        key={index}
                        icon={getConfig(type).icon??<Plus/>}
                        onClick={() => handleAddSection({
                            type,
                            data: [],
                            title: ""
                        })}
                        tooltip={`Add a new ${getConfig(type).names?.singular ?? type} section`}
                    />
                    ))
                }
            </div>
        </section>
    )
}
