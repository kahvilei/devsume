interface EditableTextProps {
    order?: string
    value?: string
    label: string
    placeholder: string
    change: (value: string) => void
}

export default function EditableText({order = "body", value = '', label, placeholder="Enter text", change}: EditableTextProps) {

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
                onChange={(event) => change(event.currentTarget.value.replace(/[\r\n\v]+/g, ''))}
                aria-label={label}
                className={`${order} text`}
            />
        </div>

    )
}