// @/app/_components/editor/DataQueryEditor.tsx
import React, {useEffect, useState} from "react";
import {BaseDataModel} from "@/interfaces/data";
import {Plus, X} from "lucide-react";
import {ActionIcon} from "@/app/_components/common/ActionIcon";
import Select, {DropdownOption} from "@/app/_components/common/Select";
import NumberSelect from "@/app/_components/common/NumberSelect";
import DateSelect from "@/app/_components/common/DateSelect";
import TextInput from "@/app/_components/common/TextInput";
import {Chip} from "@/app/_components/common/Chip";
import {ContentVariant, Size} from "@/types/designTypes";
import {MongoOperator} from "@/types/dataTypes";
import {Button} from "@/app/_components/common/Button";
import PopInOut from "@/app/_components/animations/PopInOut";
import {DataFilter, DataQuery} from "@/server/models/schemas/data";

// Field types for specialized inputs
type FieldType = 'text' | 'number' | 'date' | 'select';


interface OperatorOption {
    value: MongoOperator;
    label: string;
    icon?: string;
}

interface FilterField {
    key: string
    value: string
    isActive?: boolean;
    id?: string;
}

interface DataQueryEditorProps<T extends BaseDataModel> {
    query: DataQuery<T>;
    onSave: (query: DataQuery<T>) => void;
    onCancel?: () => void;
    queryFields: { [key: string]: string };
    fieldTypes?: { [key: string]: FieldType };
    showEditToggle?: boolean;
    defaultOpen?: boolean;
    className?: string;
    debounceTime?: number;
    variant?: ContentVariant;
    size?: Size;
}

// Helper function to format field names for display
function formatFieldName(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1');
}

export function DataQueryEditor<T extends BaseDataModel>
({
     query,
     onSave,
     queryFields,
     fieldTypes = {},
     className = '',
     size = "md"
 }: DataQueryEditorProps<T>) {
    const [localQuery, setLocalQuery] = useState<DataQuery<T>>({...query});
    const [filters, setFilters] = useState<FilterField[]>(Object.entries((query.filter as object)??{}).map(([key, value]) => ({
        key,
        value
    })));

    // Watch for localQuery changes and trigger debounced save
    useEffect(() => {
        // Don't save on initial render or if query hasn't actually changed
        if (JSON.stringify(localQuery) !== JSON.stringify(query)) {
            onSave(localQuery);
        }
    }, [localQuery]);

    useEffect(() => {
        if (JSON.stringify(localQuery) !== JSON.stringify(query)) {
            setLocalQuery(query);
            setFilters(Object.entries((query.filter as object)??{}).map(([key, value]) => ({
                key,
                value
            })));
        }
    }, [query]);

    const handleSortChange = (value: string): void => {
        setLocalQuery(prev => ({
            ...prev,
            sort: value || undefined
        }));
    };

    const handleLimitChange = (value: string): void => {
        const limit = value ? parseInt(value, 10) : undefined;
        setLocalQuery(prev => ({
            ...prev,
            limit: (!isNaN(limit as number)) ? limit : undefined
        }));
    };

    // Generate sort options based on available fields

    const sortPreview = (sortInfo: { field: string, direction: "asc" | "desc" }) => {
        return (
            <div className="sort-preview">
                <div className="field-name">
                    {formatFieldName(sortInfo.field)}
                    <span className="text-xs ml-xs">
                        ({sortInfo.direction})
                    </span>
                </div>
                <div className="icon">
                    {sortInfo.direction === 'desc' ? '↓' : '↑'}
                </div>
            </div>
        )
    }
    const sortOptions: DropdownOption[] = Object.entries(queryFields).flatMap(([fieldName]) => [
        {
            value: `${fieldName}:asc`,
            label: sortPreview({field: fieldName, direction: "asc"}),
            option: sortPreview({field: fieldName, direction: "asc"})
        },
        {
            value: `${fieldName}:desc`,
            label: sortPreview({field: fieldName, direction: "desc"}),
            option: sortPreview({field: fieldName, direction: "desc"})
        }
    ]);

    //filters logic

    function addFilterField(value: FilterField = {key: "", value: "", isActive: false}) {
        handleFilterUpdate(filters.length, value);
    }

    function handleFilterUpdate(index: number, value: FilterField) {
        const newFilters = [...filters];
        newFilters[index] = value;
        setFilters(updateFiltersActiveStatus(newFilters));
    }

    function handleDeleteFilter(index: number) {
        const newFilters = [...filters];
        newFilters.splice(index, 1);
        setFilters(updateFiltersActiveStatus(newFilters));
    }

    function updateFiltersActiveStatus(filters: FilterField[]): FilterField[] {
        return filters.map(filter => {
            const [fieldKey, operator] = filter.key.split('.');
            const isValid = Boolean(fieldKey && operator && filter.value);
            return {
                ...filter,
                isActive: isValid
            };
        });
    }

    function validateAndUpdateQuery(filters: FilterField[]) {
        setLocalQuery(prev => {
            const newFilter: { [K in keyof T]?: DataFilter | undefined } = {};
            filters.forEach(({key, value}) => {
                // Check if the filter is valid
                const [fieldKey, operator] = key.split('.');
                if (fieldKey && operator && value) {
                    newFilter[key as keyof T] = value;
                }
            });
            return {
                ...prev,
                filter: newFilter
            } as DataQuery<T>;
        });
    }

// Add this to your useEffect
    useEffect(() => {
        validateAndUpdateQuery(filters);
    }, [filters]);

    return (
        <div className={`query-editor ${className}`}>
            <div className="query-sort-limit">
                {/* Sorting Section */}
                <div className={`query-section`}>
                    <div className="query-section-content">
                        <h4>Sort</h4>
                        <Select
                            label="Sort by"
                            value={localQuery.sort || ''}
                            options={[
                                ...sortOptions
                            ]}
                            onChange={handleSortChange}
                            placeholder="Select sorting"
                            size={size}
                        />
                    </div>
                </div>

                {/* Limit Section */}
                <div className={`query-section`}>
                    <div className="query-section-content">
                        <h4>Limit</h4>
                        <div className="limit-input-group">
                            <NumberSelect
                                label="Limit"
                                value={localQuery.limit?.toString() || ''}
                                onChange={handleLimitChange}
                                placeholder="No limit"
                                size={size}
                                min={1}
                            />
                        </div>
                    </div>
                </div>
            </div>
            {/* Filters Section */}
            <div className={`query-section`}>
                <div className="query-section-content">
                    <h4>Filters</h4>
                        {filters.map((filter, index) => (
                            <PopInOut key={index}>
                                <FilterField
                                    field={filter}  // Properly format the field object
                                    index={index}
                                    fieldTypes={fieldTypes}
                                    queryFields={queryFields}
                                    onChange={(value) => handleFilterUpdate(index, value)}
                                    onDelete={(index) => handleDeleteFilter(index)}
                                />
                            </PopInOut>
                        ))}
                    <div className="add-new">
                        <Button
                            onClick={() => addFilterField()}
                            color="foreground"
                            icon={<Plus/>}
                            text="Add filter"
                            variant="btn-discreet"
                            radius={"rounded"}
                        >
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface FilterFieldProps {
    field: FilterField,
    index: number,
    fieldTypes?: { [key: string]: FieldType },
    queryFields?: { [key: string]: string },
    onChange?: (value: FilterField) => void,
    onDelete?: (index: number) => void,  // Changed to pass field instead of index
}

export function FilterField(
    {
        index,
        field,
        fieldTypes = {},
        queryFields = {},
        onChange = () => {
        },
        onDelete = () => {
        },
    }: FilterFieldProps) {
    // Define operators with plain English descriptions and icons
    const operatorOptions: OperatorOption[] = [
        {value: 'eq', label: 'equals', icon: '='},
        {value: 'ne', label: 'does not equal', icon: '≠'},
        {value: 'gt', label: 'greater than', icon: '>'},
        {value: 'lt', label: 'less than', icon: '<'},
        {value: 'gte', label: 'greater than or equal to', icon: '≥'},
        {value: 'lte', label: 'less than or equal to', icon: '≤'},
        {value: 'in', label: 'is any of', icon: '∈'},
        {value: 'nin', label: 'is none of', icon: '∉'},
        {value: 'regex', label: 'matches pattern', icon: '.*'}
    ];

    const key = field?.key?.split('.')[0] as string;
    const operator = field?.key?.split('.')[1] as MongoOperator;
    const value = field?.value;

    const handleFilterKeyChange = (key: string): void => {
        const newFilter = {key: `${key}.${operator}`, value};
        onChange(newFilter);
    }

    const handleFilterOperatorChange = (operator: MongoOperator): void => {
        const newFilter = {key: `${key}.${operator}`, value};
        onChange(newFilter);
    }

    const handleFilterValueChange = (value: string): void => {
        const newFilter = {key: `${key}.${operator}`, value};
        onChange(newFilter);
    }

    // Render the appropriate field input based on field type
    const renderValueField = () => {
        const fieldType = fieldTypes[key] || 'text';

        switch (fieldType) {
            case 'number':
                return (
                    <NumberSelect
                        label="Value"
                        value={value}
                        onChange={(value) => handleFilterValueChange(value)}
                        placeholder="Enter number"
                    />
                );
            case 'date':
                return (
                    <DateSelect
                        label="Value"
                        value={value}
                        onChange={(value) => handleFilterValueChange(value)}
                        placeholder="Select date"
                    />
                );
            case 'select':
                // For select fields, we'd need options from somewhere
                // This is just a placeholder implementation
                const fieldName = key;
                const selectOptions: DropdownOption[] =
                    // You would need to provide actual options for select fields
                    [{value: "option1", label: "Option 1", option: "Option 1"}, {
                        value: "option2",
                        label: "Option 2",
                        option: "Option 2"
                    }];

                return (
                    <Select
                        label={`${fieldName} value`}
                        value={value}
                        options={selectOptions}
                        onChange={(value) => handleFilterValueChange(value)}
                        placeholder="Select a value"
                    />
                );
            default:
                return (
                    <TextInput
                        label="Value"
                        value={value}
                        onChange={(value) => handleFilterValueChange(value)}
                        placeholder={operator === 'in' || operator === 'nin'
                            ? "e.g. apple, orange"
                            : operator === 'regex'
                                ? "Regular expression"
                                : "Enter value"}
                    />
                );
        }
    };

    return (
        <div
            className={`filter-row ${field.isActive ? 'filter-row-active' : ''}`}>
            <Chip color={`${field.isActive ? 'primary' : 'disabled'}`} text={(index + 1).toString()}/>
            <div className="filter-fields">
                <Select
                    label="Field"
                    value={key}
                    options={Object.entries(queryFields).map(([fieldName]) => ({
                        value: fieldName,
                        label: formatFieldName(fieldName),
                        option: formatFieldName(fieldName)
                    }))}
                    onChange={(value) => handleFilterKeyChange(value)}
                    placeholder="Field"
                />

                <Select
                    label="Operator"
                    value={operator}
                    options={operatorOptions.map((option) => ({
                        value: option.value,
                        label: option.icon ?? option.label,
                        option: `${option.icon ? option.icon + ' ' : ''}${option.label}`
                    }))}
                    onChange={(value) => handleFilterOperatorChange(value as MongoOperator)}
                    placeholder="Operator"
                />

                {renderValueField()}
            </div>

            <ActionIcon
                icon={<X/>}
                size="sm"
                onClick={() => onDelete(index)}  // Pass the field instead of index
                tooltip="Remove filter"
            />

        </div>
    )
}