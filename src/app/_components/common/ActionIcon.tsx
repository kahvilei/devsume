import Tooltip from "@/app/_components/common/Tooltip";

interface ActionIconProps{
    icon: React.ReactNode;
    action: () => void;
    tooltip: string;
    className?: string;
}

export const ActionIcon = ({icon, action, tooltip, className}: ActionIconProps) => {
    return (
        <Tooltip text={tooltip}>
        <button className={"action-icon " + className} onClick={action}>
                {icon}
            </button>
        </Tooltip>
);
};