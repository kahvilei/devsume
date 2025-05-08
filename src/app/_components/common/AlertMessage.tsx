interface AlertMessageProps {
    error?: string;
    warning?: string;
}

export const AlertMessage = ({error, warning}: AlertMessageProps) => {
    if (!error && !warning) return null;
    return (
        <>
            {error && <div className="error">{error}</div>}
            {warning && <div className="warning">{warning}</div>}
        </>
    );
};
