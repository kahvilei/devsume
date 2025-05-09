import {BaseDataModel} from "@/interfaces/data";
import {DataQuery} from "@/interfaces/api";
import {FormEvent, useEffect, useState} from "react";

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
}

interface DataQueryEditorProps<T extends BaseDataModel> {
    query: DataQuery<T>;
    onSave: (query: DataQuery<T>) => void;
    onCancel: () => void;
    // Use queryFields from item manifest
    queryFields: { [key: string]: string };
}

export function DataQueryEditor<T extends BaseDataModel>
({
     query,
     onSave,
     onCancel,
     queryFields,
 }: DataQueryEditorProps<T>) {
    const [localQuery, setLocalQuery] = useState<DataQuery<T>>({...query});
    const [filterFields, setFilterFields] = useState<FilterField[]>([]);

    // Define operators with plain English descriptions
    const operatorOptions: OperatorOption[] = [
        {value: 'eq', label: 'equals'},
        {value: 'ne', label: 'does not equal'},
        {value: 'gt', label: 'greater than'},
        {value: 'lt', label: 'less than'},
        {value: 'gte', label: 'greater than or equal to'},
        {value: 'lte', label: 'less than or equal to'},
        {value: 'in', label: 'is any of (comma-separated)'},
        {value: 'nin', label: 'is none of (comma-separated)'},
        {value: 'regex', label: 'matches pattern'}
    ];

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

    const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        onSave(localQuery);
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

    return (
        <div className="query-editor">
            <h3 className="h3 mb-md">Configure Query</h3>

            <form onSubmit={handleSubmit}>
                <div className="mb-md">
                    <h4 className="h4 mb-sm">Filters</h4>
                    {filterFields.map((field, index) => (
                        <div key={index} className="mb-sm">
                            <div className="filter-row">
                                {/* Field Name Dropdown */}
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

                                {/* Operator Dropdown */}
                                {field.key ? (
                                    <select
                                        className="input filter-field"
                                        value={field.operator}
                                        onChange={(e) => handleFilterOperatorChange(index, e.target.value as MongoOperator)}
                                    >
                                        {operatorOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <select
                                        disabled
                                        className="input filter-field"
                                    >
                                        <option>Select a field first</option>
                                    </select>
                                )}

                                {/* Value Input */}
                                {field.key ? (
                                    <input
                                        type="text"
                                        placeholder={field.operator === 'in' || field.operator === 'nin'
                                            ? "Enter comma-separated values"
                                            : field.operator === 'regex'
                                                ? "Enter regex pattern"
                                                : "Enter value"}
                                        className="input filter-field"
                                        value={field.value}
                                        onChange={(e) => handleFilterValueChange(index, e.target.value)}
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        disabled
                                        placeholder="Select a field first"
                                        className="input filter-field"
                                    />
                                )}

                                {/* Remove Button */}
                                <button
                                    type="button"
                                    className="filter-remove"
                                    onClick={() => removeFilterField(index)}
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))}
                    <button
                        type="button"
                        className="btn-link"
                        onClick={addFilterField}
                    >
                        + Add filter
                    </button>
                </div>

                <div className="mb-md">
                    <label className="block mb-sm">
                        Sort by:
                        <select
                            className="input mt-xs"
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
                    </label>
                </div>

                <div className="mb-md">
                    <label className="block mb-sm">
                        Limit results:
                        <div className="flex-row items-center mt-xs">
                            <input
                                type="number"
                                className="input"
                                placeholder="Enter limit (e.g. 10)"
                                value={localQuery.limit || ''}
                                onChange={(e) => handleLimitChange(e.target.value)}
                                min="1"
                            />
                            <div className="limit-buttons">
                                {[5, 10, 25, 50, 100].map(limit => (
                                    <button
                                        key={limit}
                                        type="button"
                                        className={`limit-button ${localQuery.limit === limit ? 'limit-button-active' : 'limit-button-inactive'}`}
                                        onClick={() => handleLimitChange(String(limit))}
                                    >
                                        {limit}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </label>
                </div>

                <div className="flex-end gap-sm">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                    >
                        Apply
                    </button>
                </div>
            </form>
        </div>
    );
}