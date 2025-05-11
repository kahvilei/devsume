import {BaseDataModel} from "@/interfaces/data";
import {DataQuery} from "@/interfaces/api";
import {useCallback, useEffect, useState} from "react";
import {Pencil} from "lucide-react";
import {ActionIcon} from "@/app/_components/common/ActionIcon";
import {Pill} from "@/app/_components/common/Pill";

// MongoDB operators supported by the backend
type MongoOperator = 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'nin' | 'regex';

interface FilterField {
    key: string;
    operator: MongoOperator;
    value: string;
}

interface DropdownOption {
    value: string;
    label: string;
}

interface OperatorOption {
    value: MongoOperator;
    label: string;
    icon?: string;
}

interface DataQueryEditorProps<T extends BaseDataModel> {
    query: DataQuery<T>;
    onSave: (query: DataQuery<T>) => void;
    onCancel?: () => void; // Now optional
    // Use queryFields from item manifest
    queryFields: { [key: string]: string };
    // Optional props
    showEditToggle?: boolean;
    defaultOpen?: boolean;
    className?: string;
    debounceTime?: number; // Added debounce time prop
}

export function DataQueryEditor<T extends BaseDataModel>
(
    {
        query,
        onSave,
        onCancel,
        queryFields,
        showEditToggle = true,
        defaultOpen = false,
        className = '',
        debounceTime = 500 // Default debounce time is 500ms
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
                // Extract the operator name without the $ prefix
                const operatorName = key.split(".")[1] as MongoOperator;
                const fieldName = key.split(".")[0];

                // Convert operator name to our internal format
                const operator = ({
                    'eq': 'eq', 'ne': 'ne', 'gt': 'gt', 'lt': 'lt',
                    'gte': 'gte', 'lte': 'lte', 'in': 'in', 'nin': 'nin',
                    'regex': 'regex'
                } as const)[operatorName];

                // Handle array values for $in and $nin operators
                let strValue = '';
                if (Array.isArray(value)) {
                    strValue = value.join(',');
                } else if (value instanceof RegExp) {
                    strValue = value.source;
                } else {
                    strValue = String(value);
                }

                if (operator) {
                    fields.push({
                        key: fieldName,
                        operator,
                        value: strValue
                    });
                }
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
    }, [localQuery, query]);

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
        setFilterFields(updatedFields);
        updateFilterInQuery(updatedFields);
    };

    const updateFilterInQuery = (fields: FilterField[]): void => {
        // Build the filter object in the format expected by the backend
        const newFilter: Record<string, object | string> = {};

        fields.forEach(field => {
            if (field.key && field.value) {
                // Format the query parameter as expected by the backend
                const queryKey = field.operator === 'eq'
                    ? field.key
                    : `${field.key}.${field.operator}`;

                // Process the value based on operator
                let queryValue = field.value;

                // For numeric operators, try to convert to number if possible
                if (['gt', 'lt', 'gte', 'lte', 'eq', 'ne'].includes(field.operator)) {
                    const numValue = Number(field.value);
                    if (!isNaN(numValue)) {
                        queryValue = String(numValue);
                    }
                }

                // Set the value in the filter object
                newFilter[queryKey] = queryValue;
            }
        });

        setLocalQuery(prev => ({
            ...prev,
            filter: Object.keys(newFilter).length > 0 ? newFilter as object : undefined
        }));
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

    // Get the operator object for a given value
    const getOperator = (value: MongoOperator) => {
        return operatorOptions.find(op => op.value === value);
    };

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

    return (
        <div className={`query-editor ${className}`}>
            <div className="query-pills">
                <div className="query-pills-group">
                    <Pill
                        label="Filters"
                        value={activeFilterCount}
                        isActive={activeSection === 'filters' && isEditorOpen}
                        onClick={() => handleSummaryItemClick('filters')}
                    />

                    <Pill
                        label="Sort"
                        value={sortDirectionIcon}
                        isActive={activeSection === 'sorting' && isEditorOpen}
                        onClick={() => handleSummaryItemClick('sorting')}
                    />

                    <Pill
                        label="Limit"
                        value={localQuery.limit}
                        isActive={activeSection === 'limits' && isEditorOpen}
                        onClick={() => handleSummaryItemClick('limits')}
                    />
                </div>

                {showEditToggle && (
                    <ActionIcon
                        icon={<Pencil size={16}/>}
                        action={toggleEditor}
                        tooltip={isEditorOpen ? "Close editor" : "Edit query"}
                        className={isEditorOpen ? "active" : ""}
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
                                     className={`filter-card ${field.key && field.value ? 'filter-card-active' : ''}`}>
                                    <div className="filter-card-header">
                                        <span className="filter-number">{index + 1}</span>
                                        <button
                                            type="button"
                                            className="filter-remove action-icon"
                                            onClick={() => removeFilterField(index)}
                                            aria-label="Remove filter"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <div className="filter-row">
                                        {/* Field Name Dropdown */}
                                        <div className="filter-group">
                                            <label className="filter-label">Field</label>
                                            <select
                                                className="input filter-field"
                                                value={field.key}
                                                onChange={(e) => handleFilterKeyChange(index, e.target.value)}
                                            >
                                                <option value="">Select field</option>
                                                {Object.entries(queryFields).map(([fieldName]) => (
                                                    <option key={fieldName} value={fieldName}>
                                                        {formatFieldName(fieldName)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Operator Dropdown */}
                                        <div className="filter-group">
                                            <label className="filter-label">Operator</label>
                                            {field.key ? (
                                                <select
                                                    className="input filter-field"
                                                    value={field.operator}
                                                    onChange={(e) => handleFilterOperatorChange(index, e.target.value as MongoOperator)}
                                                >
                                                    {operatorOptions.map((option) => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.icon && `${option.icon} `}{option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <select
                                                    disabled
                                                    className="input filter-field disabled"
                                                >
                                                    <option>Select a field first</option>
                                                </select>
                                            )}
                                        </div>

                                        {/* Value Input */}
                                        <div className="filter-group">
                                            <label className="filter-label">Value</label>
                                            {field.key ? (
                                                <div className="value-input-wrapper">
                                                    {field.operator === 'in' || field.operator === 'nin' ? (
                                                        <div className="filter-chip">Comma-separated values</div>
                                                    ) : null}
                                                    <input
                                                        type="text"
                                                        placeholder={field.operator === 'in' || field.operator === 'nin'
                                                            ? "e.g. apple, orange"
                                                            : field.operator === 'regex'
                                                                ? "Regular expression"
                                                                : "Enter value"}
                                                        className="input filter-field"
                                                        value={field.value}
                                                        onChange={(e) => handleFilterValueChange(index, e.target.value)}
                                                    />
                                                    {field.operator && field.value && (
                                                        <div className="operator-preview">
                                                            {getOperator(field.operator)?.icon}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <input
                                                    type="text"
                                                    disabled
                                                    placeholder="Select a field first"
                                                    className="input filter-field disabled"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                className="btn outline secondary btn-add-filter"
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
                                <select
                                    className="input sort-select"
                                    value={localQuery.sort || ''}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                >
                                    <option value="">No sorting</option>
                                    {sortOptions.map((option, i) => (
                                        <option key={i} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>

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
                                    <input
                                        type="number"
                                        className="input limit-input"
                                        placeholder="No limit"
                                        value={localQuery.limit || ''}
                                        onChange={(e) => handleLimitChange(e.target.value)}
                                        min="1"
                                    />
                                    <span className="text-sm">items</span>
                                </div>

                                <div className="limit-buttons">
                                    {[5, 10, 25, 50, 100].map(limit => (
                                        <button
                                            key={limit}
                                            type="button"
                                            className={`limit-button ${localQuery.limit === limit ? 'limit-button-active' : 'limit-button-inactive'}`}
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