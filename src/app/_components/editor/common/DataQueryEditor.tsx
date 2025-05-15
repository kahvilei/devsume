// @/app/_components/editor/DataQueryEditor.tsx
import React, {useCallback, useEffect, useState} from "react";
import {BaseDataModel} from "@/interfaces/data";
import {DataQuery} from "@/interfaces/api";
import {Pencil, X} from "lucide-react";
import {ActionIcon} from "@/app/_components/common/ActionIcon";
import {Pill} from "@/app/_components/common/Pill";
import SelectField, {DropdownOption} from "@/app/_components/editor/common/SelectField";
import NumberField from "@/app/_components/editor/common/NumberField";
import DateField from "@/app/_components/editor/common/DateField";
import TextField from "@/app/_components/editor/text/TextField";
import {Chip} from "@/app/_components/common/Chip";
import {ContentVariant, Size} from "@/types/designTypes";

// MongoDB operators supported by the backend
type MongoOperator = 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'nin' | 'regex';

// Field types for specialized inputs
type FieldType = 'text' | 'number' | 'date' | 'select';


interface FilterField {
    key: string;
    operator: MongoOperator;
    value: string;
    fieldType?: FieldType;
}

interface OperatorOption {
    value: MongoOperator;
    label: string;
    icon?: string;
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

export function DataQueryEditor<T extends BaseDataModel>
({
     query,
     onSave,
     queryFields,
     fieldTypes = {},
     showEditToggle = true,
     defaultOpen = false,
     className = '',
     debounceTime = 500,
     size = "md"
 }: DataQueryEditorProps<T>) {
    const [localQuery, setLocalQuery] = useState<DataQuery<T>>({...query});
    const [filterFields, setFilterFields] = useState<FilterField[]>([]);
    const [activeSection, setActiveSection] = useState<string>('filters');
    const [isEditorOpen, setIsEditorOpen] = useState<boolean>(defaultOpen);
    const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

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

    // Debounced save function
    const debouncedSave = useCallback((newQuery: DataQuery<T>) => {
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }

        const timeoutId = setTimeout(() => {
            onSave(newQuery);
        }, debounceTime);

        setDebounceTimeout(timeoutId);
    }, [debounceTime, debounceTimeout]);

    // Initialize with existing filters or start with one empty filter
    useEffect(() => {
        if (query.filter) {
            const fields: FilterField[] = [];

            // Process filter object to extract fields, operators and values
            Object.entries(query.filter).forEach(([key, value]) => {
                // Check if key contains an operator (e.g., "fieldName.$gt")
                const keyParts = key.split(".");
                const fieldName = keyParts[0];
                const operatorPart = keyParts.length > 1 ? keyParts[1] : "eq";

                // Convert operator name to our internal format or default to 'eq'
                const operator = operatorPart as MongoOperator || 'eq';

                // Handle array values for $in and $nin operators
                let strValue = '';
                if (Array.isArray(value)) {
                    strValue = value.join(',');
                } else if (value instanceof RegExp) {
                    strValue = value.source;
                } else {
                    strValue = String(value);
                }

                // Determine field type from configuration or default to 'text'
                const fieldType = fieldTypes[fieldName] || 'text';

                fields.push({
                    key: fieldName,
                    operator,
                    value: strValue,
                    fieldType
                });
            });

            setFilterFields(fields.length > 0 ? fields : [{key: '', operator: 'eq', value: ''}]);
        } else {
            setFilterFields([{key: '', operator: 'eq', value: ''}]);
        }
    }, [query]);

    // Watch for localQuery changes and trigger debounced save
    useEffect(() => {
        // Don't save on initial render or if query hasn't actually changed
        if (JSON.stringify(localQuery) !== JSON.stringify(query)) {
            debouncedSave(localQuery);
        }
    }, [localQuery]);

    // Clean up timeout on unmount
    useEffect(() => {
        return () => {
            if (debounceTimeout) {
                clearTimeout(debounceTimeout);
            }
        };
    }, [debounceTimeout]);

    const handleFilterKeyChange = (index: number, value: string): void => {
        const updatedFields = [...filterFields];
        updatedFields[index].key = value;

        // Set field type based on configuration or default to text
        updatedFields[index].fieldType = fieldTypes[value] || 'text';

        // Reset the value when field changes, but keep the operator
        updatedFields[index].value = '';

        setFilterFields(updatedFields);
        updateFilterInQuery(updatedFields);
    };

    const handleFilterOperatorChange = (index: number, value: MongoOperator): void => {
        const updatedFields = [...filterFields];
        updatedFields[index].operator = value;
        setFilterFields(updatedFields);
        updateFilterInQuery(updatedFields);
    };

    const handleFilterValueChange = (index: number, value: string): void => {
        const updatedFields = [...filterFields];
        updatedFields[index].value = value;
        setFilterFields(updatedFields);
        updateFilterInQuery(updatedFields);
    };

    const addFilterField = (): void => {
        setFilterFields([...filterFields, {key: '', operator: 'eq', value: ''}]);
    };

    const removeFilterField = (index: number): void => {
        const updatedFields = [...filterFields];
        updatedFields.splice(index, 1);

        // Always keep at least one filter field
        if (updatedFields.length === 0) {
            updatedFields.push({key: '', operator: 'eq', value: ''});
        }

        setFilterFields(updatedFields);
        updateFilterInQuery(updatedFields);
    };

    const updateFilterInQuery = (fields: FilterField[]): void => {
        // Build the filter object in the format expected by the backend
        const newFilter: Record<string, string | number | object> = {};

        fields.forEach(field => {
            if (field.key && field.value) {
                // Format the query parameter as expected by the backend
                const queryKey = field.operator === 'eq'
                    ? field.key
                    : `${field.key}.${field.operator}`;

                // Process the value based on operator and field type
                let queryValue: string | number | object | undefined = field.value;

                // For numeric operators and number fields, convert to number if possible
                if ((field.fieldType === 'number' ||
                        ['gt', 'lt', 'gte', 'lte', 'eq', 'ne'].includes(field.operator)) &&
                    !isNaN(Number(field.value))) {
                    queryValue = Number(field.value);
                }

                // For date fields, ensure proper date format
                if (field.fieldType === 'date' && field.value) {
                    const date = new Date(field.value);
                    if (!isNaN(date.getTime())) {
                        queryValue = date.toISOString();
                    }
                }

                // For 'in' and 'nin' operators, convert comma-separated string to array
                if ((field.operator === 'in' || field.operator === 'nin') && typeof queryValue === 'string') {
                    queryValue = field.value.split(',').map(v => v.trim());

                    // Convert numeric values in arrays if applicable
                    if (field.fieldType === 'number') {
                        queryValue = (queryValue as []).map((v: never) => !isNaN(Number(v)) ? Number(v) : v);
                    }
                }

                // Set the value in the filter object
                newFilter[queryKey] = queryValue;
            }
        });

        setLocalQuery(prev => ({
            ...prev,
            filter: Object.keys(newFilter).length > 0 ? newFilter : undefined
        } as DataQuery<T>));
    };

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

    // Set a predefined limit quickly
    const setQuickLimit = (limit: number): void => {
        setLocalQuery(prev => ({
            ...prev,
            limit
        }));
    };

    // Generate sort options based on available fields
    const sortOptions: DropdownOption[] = Object.entries(queryFields).flatMap(([fieldName]) => [
        {value: `${fieldName}:asc`, label: `${formatFieldName(fieldName)} (ascending)`},
        {value: `${fieldName}:desc`, label: `${formatFieldName(fieldName)} (descending)`}
    ]);

    // Helper function to format field names for display
    function formatFieldName(name: string): string {
        return name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1');
    }

    // Count the active filters
    const activeFilterCount = filterFields.filter(f => f.key && f.value).length;

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

    // Render the appropriate field input based on field type
    const renderValueField = (field: FilterField, index: number) => {
        const fieldType = field.fieldType || 'text';

        switch (fieldType) {
            case 'number':
                return (
                    <NumberField
                        label="Value"
                        value={field.value}
                        onChange={(value) => handleFilterValueChange(index, value)}
                        placeholder="Enter number"
                        size={size}
                    />
                );
            case 'date':
                return (
                    <DateField
                        label="Value"
                        value={field.value}
                        onChange={(value) => handleFilterValueChange(index, value)}
                        placeholder="Select date"
                        size={size}
                    />
                );
            case 'select':
                // For select fields, we'd need options from somewhere
                // This is just a placeholder implementation
                const fieldName = field.key;
                const selectOptions: DropdownOption[] =
                    // You would need to provide actual options for select fields
                    [{value: "option1", label: "Option 1"}, {value: "option2", label: "Option 2"}];

                return (
                    <SelectField
                        label={`${fieldName} value`}
                        value={field.value}
                        options={selectOptions}
                        onChange={(value) => handleFilterValueChange(index, value)}
                        placeholder="Select a value"
                        size={size}
                    />
                );
            default:
                return (
                    <TextField
                        label="Value"
                        value={field.value}
                        onChange={(value) => handleFilterValueChange(index, value)}
                        placeholder={field.operator === 'in' || field.operator === 'nin'
                            ? "e.g. apple, orange"
                            : field.operator === 'regex'
                                ? "Regular expression"
                                : "Enter value"}
                        size={size}
                    />
                );
        }
    };

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
                        action={toggleEditor}
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
                            {filterFields.map((field, index) => (
                                <div key={index}
                                     className={`filter-row ${field.key && field.value ? 'filter-row-active' : ''}`}>
                                    <Chip color={`${field.key && field.value ? 'primary' : 'disabled'}`} text={(index + 1).toString()}/>
                                    <div className="filter-fields">
                                        <SelectField
                                            label="Field"
                                            value={field.key}
                                            options={Object.entries(queryFields).map(([fieldName]) => ({
                                                value: fieldName,
                                                label: formatFieldName(fieldName)
                                            }))}
                                            onChange={(value) => handleFilterKeyChange(index, value)}
                                            placeholder="Select field"
                                            variant={"subtle"}
                                            size={size}
                                        />

                                        <SelectField
                                            label="Operator"
                                            value={field.operator}
                                            options={operatorOptions.map((option) => ({
                                                value: option.value,
                                                label: `${option.icon ? option.icon + ' ' : ''}${option.label}`
                                            }))}
                                            onChange={(value) => handleFilterOperatorChange(index, value as MongoOperator)}
                                            placeholder="Select operator"
                                            size={size}
                                        />

                                        {renderValueField(field, index)}
                                    </div>

                                    <ActionIcon
                                        icon={<X size={16}/>}
                                        action={() => removeFilterField(index)}
                                        tooltip="Remove filter"
                                        size={size}
                                    />
                                </div>
                            ))}

                            <button
                                type="button"
                                className={`btn outline secondary btn-add-filter ${size}`}
                                onClick={addFilterField}
                            >
                                <span className="btn-icon">+</span>
                                <span className="btn-text">Add filter</span>
                            </button>
                        </div>
                    </div>

                    {/* Sorting Section */}
                    <div className={`query-section ${activeSection === 'sorting' ? 'active' : ''}`}>
                        <div className="query-section-content">
                            <div className="sort-container">
                                <SelectField
                                    label="Sort by"
                                    value={localQuery.sort || ''}
                                    options={[
                                        {value: '', label: 'No sorting'},
                                        ...sortOptions
                                    ]}
                                    onChange={handleSortChange}
                                    placeholder="Select sorting"
                                    variant={"subtle"}
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
                                            onClick={() => setQuickLimit(limit)}
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