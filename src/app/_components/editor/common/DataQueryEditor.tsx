// @/app/_components/editor/DataQueryEditor.tsx
import React, {useEffect, useState} from "react";
import {BaseDataModel} from "@/interfaces/data";
import {DataFilter, DataQuery} from "@/interfaces/api";
import {Pencil, Plus, X} from "lucide-react";
import {ActionIcon} from "@/app/_components/common/ActionIcon";
import {Pill} from "@/app/_components/common/Pill";
import Select, {DropdownOption} from "@/app/_components/common/Select";
import NumberField from "@/app/_components/editor/common/NumberField";
import DateField from "@/app/_components/editor/common/DateField";
import TextField from "@/app/_components/editor/text/TextField";
import {Chip} from "@/app/_components/common/Chip";
import {ContentVariant, Size} from "@/types/designTypes";
import {MongoOperator} from "@/types/dataTypes";
import {Button} from "@/app/_components/common/Button";

// Field types for specialized inputs
type FieldType = 'text' | 'number' | 'date' | 'select';


interface OperatorOption {
    value: MongoOperator;
    label: string;
    icon?: string;
}

interface FilterField {
    key:string
    value:string
    isActive?: boolean;
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
     showEditToggle = true,
     defaultOpen = false,
     className = '',
     size = "md"
 }: DataQueryEditorProps<T>) {
    const [localQuery, setLocalQuery] = useState<DataQuery<T>>({...query});
    const [filters, setFilters] = useState<FilterField[]>(Object.entries(query.filter as object).map(([key, value]) => ({key, value})));
    const [activeSection, setActiveSection] = useState<string>('filters');
    const [isEditorOpen, setIsEditorOpen] = useState<boolean>(defaultOpen);

    // Watch for localQuery changes and trigger debounced save
    useEffect(() => {
        // Don't save on initial render or if query hasn't actually changed
        if (JSON.stringify(localQuery) !== JSON.stringify(query)) {
            onSave(localQuery);
        }
    }, [localQuery]);

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
    const sortOptions: DropdownOption[] = Object.entries(queryFields).flatMap(([fieldName]) => [
        {value: `${fieldName}:asc`, label: `${formatFieldName(fieldName)} (ascending)`, option: `${formatFieldName(fieldName)} (ascending)`},
        {value: `${fieldName}:desc`, label: `${formatFieldName(fieldName)} (descending)`, option : `${formatFieldName(fieldName)} (descending)`}
    ]);

    // Count the active filters
    const activeFilterCount = Object.values(localQuery.filter as object).length;

    // Parse sort info
    const sortInfo = localQuery.sort ? {
        field: localQuery.sort.split(':')[0],
        direction: localQuery.sort.split(':')[1] as 'asc' | 'desc'
    } : undefined;

    // Get sort direction icon
    const sortDirectionIcon = sortInfo ? (sortInfo.direction === 'desc' ? '↓' : '↑') : undefined;

    const handleSummaryItemClick = (section: string) => {
        setActiveSection(section);
        setIsEditorOpen(true);
    };

    const toggleEditor = () => {
        setIsEditorOpen(!isEditorOpen);
    };

    //filters logic

    function addFilterField(value: FilterField = {key:"", value:"", isActive:false}) {
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
            <div className="query-pills">
                <div className="query-pills-group">
                    <Pill
                        label="Filters"
                        chip={activeFilterCount}
                        isActive={activeSection === 'filters' && isEditorOpen}
                        onClick={() => handleSummaryItemClick('filters')}
                        size={size}
                    />

                    <Pill
                        label="Sort"
                        chip={sortDirectionIcon}
                        isActive={activeSection === 'sorting' && isEditorOpen}
                        onClick={() => handleSummaryItemClick('sorting')}
                        size={size}
                    />

                    <Pill
                        label="Limit"
                        chip={localQuery.limit}
                        isActive={activeSection === 'limits' && isEditorOpen}
                        onClick={() => handleSummaryItemClick('limits')}
                        size={size}
                    />
                </div>

                {showEditToggle && (
                    <ActionIcon
                        icon={<Pencil size={16}/>}
                        onClick={toggleEditor}
                        tooltip={isEditorOpen ? "Close editor" : "Edit query"}
                        size={size}
                    />
                )}
            </div>

            {isEditorOpen && (
                <div className="query-editor-panel">
                    {/* Filters Section */}
                    <div className={`query-section ${activeSection === 'filters' ? 'active' : ''}`}>
                        <div className="query-section-content">
                            {filters.map((filter, index) => (
                                <FilterField
                                    field={filter}  // Properly format the field object
                                    key={index}  // Use key instead of index for better React reconciliation
                                    index={index}
                                    fieldTypes={fieldTypes}
                                    queryFields={queryFields}
                                    onChange={(value) => handleFilterUpdate(index, value)}
                                    onDelete={(index) => handleDeleteFilter(index)}
                                />
                            ))}
                            <Button
                                onClick={() => addFilterField()}
                                color="foreground"
                                icon={<Plus/>}
                                text="Add filter"
                                variant="btn-discreet"
                            >
                            </Button>
                        </div>
                    </div>

                    {/* Sorting Section */}
                    <div className={`query-section ${activeSection === 'sorting' ? 'active' : ''}`}>
                        <div className="query-section-content">
                            <div className="sort-container">
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

                                {sortInfo && (
                                    <div className="sort-preview">
                                        <div className="sort-icon">
                                            {sortInfo.direction === 'desc' ? '↓' : '↑'}
                                        </div>
                                        <div>
                                            {formatFieldName(sortInfo.field)}
                                            <span className="text-xs ml-xs">
                                                ({sortInfo.direction})
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Limit Section */}
                    <div className={`query-section ${activeSection === 'limits' ? 'active' : ''}`}>
                        <div className="query-section-content">
                            <div className="limit-container">
                                <div className="limit-input-group">
                                    <NumberField
                                        label="Limit"
                                        value={localQuery.limit?.toString() || ''}
                                        onChange={handleLimitChange}
                                        placeholder="No limit"
                                        variant={"subtle"}
                                        size={size}
                                        min={1}
                                    />
                                    <span className="text-sm">items</span>
                                </div>

                                <div className="limit-buttons">
                                    {[5, 10, 25, 50, 100].map(limit => (
                                        <button
                                            key={limit}
                                            type="button"
                                            className={`btn limit-button ${size} ${
                                                localQuery.limit === limit
                                                    ? 'primary'
                                                    : 'outline primary'
                                            }`}
                                            onClick={() => handleLimitChange(limit.toString())}
                                        >
                                            {limit}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

interface FilterFieldProps {
    field: FilterField,
    key: number,
    index: number,
    fieldTypes?: { [key: string]: FieldType },
    queryFields?: { [key: string]: string },
    onChange?: (value: FilterField) => void,
    onDelete?: (index: number) => void,  // Changed to pass field instead of index
}

export function FilterField({
    index,
    field,
    fieldTypes = {},
    queryFields = {},
    onChange = () => {},
    onDelete = () => {},
} : FilterFieldProps) {
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
        const newFilter = { key:`${key}.${operator}`, value };
        onChange(newFilter);
    }

    const handleFilterOperatorChange = (operator: MongoOperator): void => {
        const newFilter = { key:`${key}.${operator}`, value };
        onChange(newFilter);
    }

    const handleFilterValueChange = (value: string): void => {
        const newFilter = { key:`${key}.${operator}`, value };
        onChange(newFilter);
    }

    // Render the appropriate field input based on field type
    const renderValueField = () => {
        const fieldType = fieldTypes[key] || 'text';

        switch (fieldType) {
            case 'number':
                return (
                    <NumberField
                        label="Value"
                        value={value}
                        onChange={(value) => handleFilterValueChange(value)}
                        placeholder="Enter number"
                    />
                );
            case 'date':
                return (
                    <DateField
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
                    [{value: "option1", label: "Option 1", option: "Option 1"}, {value: "option2", label: "Option 2", option: "Option 2"}];

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
                    <TextField
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
                    placeholder="Select field"
                />

                <Select
                    label="Operator"
                    value={operator}
                    options={operatorOptions.map((option) => ({
                        value: option.value,
                        label: option.icon??option.label,
                        option: `${option.icon ? option.icon + ' ' : ''}${option.label}`
                    }))}
                    onChange={(value) => handleFilterOperatorChange(value as MongoOperator)}
                    placeholder="Select operator"
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