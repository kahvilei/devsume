import ITEMS, {ItemManifestList} from "@/config/itemConfig";
import {useState} from "react";
import ActionIcon from "@/app/_components/common/ActionIcon";
import {Plus} from "lucide-react";
import MultiSelectFromDB from "@/app/_components/editor/common/MultiSelectFromDB";
import {AnimatePresence} from "motion/react";
import PopInOut from "@/app/_components/animations/PopInOut";
import {Section} from "@/models/schemas/section";
import {DataQuery, DataType} from "@/models/schemas/data";

interface ItemSectionEditorProps {
    max: number; // maximum number of sections allowed
    sectionTypes: (keyof ItemManifestList)[], //allowed data types for each section, each section must be one of these types
    sectionData: Section<DataType>[], // pre-existing data for each section
    onSave: (data: Section<DataType>[]) => void;
    onCancel?: () => void;
}


export default function ItemSectionEditor({max, sectionTypes, sectionData, onSave, onCancel}: ItemSectionEditorProps) {

    const [sections, setSections] = useState<Section<DataType>[]>(sectionData);
    const handleSave = () => {
        onSave(sections);
    }
    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
    }

    const handleAddSection = (newSection: Section<DataType>) => {
        if (sections.length < max) {
            setSections([...sections, newSection]);
        }
    }

    const handleRemoveSection = (sectionToRemove: Section<DataType>) => {
        if (sections.length > 1) {
            setSections(sections.filter(section => section !== sectionToRemove));
        }
    }

    const handleUpdateSection = (index: number, newSection: Section<DataType>) => {
        setSections(sections.map((section, i) => i === index ? newSection : section));
    }

    const handleUpdateSectionContent = (index: number, newSection: DataType[] | DataQuery<DataType>) => {
        const newSections = sections.map((section, i) => i === index ? {...section, data: newSection} : section);
        setSections(newSections);
    }

    return (
        <section className={"content-sections flex flex-col gap-lg"}>
            <AnimatePresence>
            {sections.map((section, index) => (
                <PopInOut key={index+section.title}>
                    <MultiSelectFromDB
                        values={section.data}
                        label={section.title}
                        dataKey={"tags"}
                        onSelect={(section) => handleUpdateSectionContent(index, section)}
                        onRemove={() => handleRemoveSection(section)}
                    />
                </PopInOut>
            ))}

            <div className={"add-new-section"}>
                {sectionTypes.map((type, index) => (
                    <ActionIcon
                        key={index}
                        icon={ITEMS[type].icon??<Plus/>}
                        onClick={() => handleAddSection({
                            type,
                            data: [],
                            title: ""
                        })}
                        tooltip={"Add new section"}
                    />
                    ))
                }
            </div>
            </AnimatePresence>
        </section>
    )
}
