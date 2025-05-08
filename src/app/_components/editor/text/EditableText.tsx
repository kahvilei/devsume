interface EditableTextProps {
    order?: string
    value?: string
    label: string
    placeholder: string
    onUpdate: (value: string) => void
    required?: boolean
}

export default function EditableText({order = "body", value = '', label, placeholder="Enter text", onUpdate, required}: EditableTextProps) {

    return (
        <div className={"editable-text-wrap"}>
            <div className="editable-text-error"></div>
            <div className="editable-text-warning"></div>
            <div aria-hidden className={`${order} text proxy`}>
                {(value==="")?placeholder:value}
            </div>
            <textarea
                value={value}
                placeholder={placeholder}
                onChange={(event) => onUpdate(event.currentTarget.value.replace(/[\r\n\v]+/g, ''))}
                aria-label={label}
                className={`${order} text`}
                required={required}
            />
        </div>

    )
}