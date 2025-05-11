interface ButtonProps {
    icon?: React.ReactNode;
    text: string;
    onClick?: () => void;
    className?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    variant?: 'default' | 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'reverse';
    outline?: boolean;
}

export const Button = ({
                           icon,
                           text,
                           onClick,
                           className = '',
                           size = "md",
                           type = "button",
                           disabled = false,
                           variant = 'default',
                           outline = false
                       }: ButtonProps) => {
    // Build the class string based on props
    const buttonClasses = [
        'btn',
        size,
        className,
        icon ? 'has-icon' : '',
        outline ? 'outline' : '',
        variant !== 'default' ? variant : ''
    ].filter(Boolean).join(' ');

    return (
        <button
            className={buttonClasses}
            onClick={onClick}
            type={type}
            disabled={disabled}
        >
            {icon && <span className="btn-icon">{icon}</span>}
            <span className="btn-text">{text}</span>
        </button>
    );
};