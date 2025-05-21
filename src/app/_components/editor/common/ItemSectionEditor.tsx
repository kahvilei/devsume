import ITEMS, {ItemManifestList} from "@/config/itemConfig";
import {useState} from "react";
import ActionIcon from "@/app/_components/common/ActionIcon";
import {Plus} from "lucide-react";
import MultiSelectFromDB from "@/app/_components/editor/common/MultiSelectFromDB";
import PopInOut from "@/app/_components/animations/PopInOut";
import {Section} from "@/models/schemas/section";
import {DataQuery, DataType} from "@/models/schemas/data";

interface ItemSectionEditorProps {
    max: number; // maximum number of sections allowed
    sectionTypes: (keyof ItemManifestList)[], //allowed data types for each section, each section must be one of these types
    sectionData: Section<DataType>[], // pre-existing data for each section
    onSave: (data: Section<DataType>[]) => void;
}


export default function ItemSectionEditor({max, sectionTypes, sectionData, onSave}: ItemSectionEditorProps) {

    const [sections, setSections] = useState<Section<DataType>[]>(sectionData);

    const handleSave = () => {
        onSave(sections);
    }

    const handleAddSection = (newSection: Section<DataType>) => {
        if (sections.length < max) {
            setSections([...sections, newSection]);
        }
    }

    const handleRemoveSection = (sectionToRemove: Section<DataType>) => {
        setSections(sections.filter(section => section !== sectionToRemove));
        handleSave();
    }

    const handleUpdateSectionTitle = (index: number, newTitle: string) => {
        const newSections = sections.map((section, i) => i === index ? {...section, title: newTitle} : section);
        setSections(newSections);
    }

    const handleUpdateSectionContent = (index: number, newSection: DataType[] | DataQuery<DataType>) => {
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
                {sectionTypes.map((type, index) => (
                    <ActionIcon
                        key={index}
                        icon={ITEMS[type].icon??<Plus/>}
                        onClick={() => handleAddSection({
                            type,
                            data: [],
                            title: ""
                        })}
                        tooltip={`Add a new ${ITEMS[type].names?.singular ?? type} section`}
                    />
                    ))
                }
            </div>
        </section>
    )
}
