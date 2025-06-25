import {ItemConfig} from "@/config/items";
import {IBaseItem} from "@/server/models/schemas/IBaseItem";

interface TypeMetaCardProps<T extends IBaseItem> {
    config: ItemConfig<T>;
}

const TypeMetaCard = <T extends IBaseItem>(
    {
        config,
    }: TypeMetaCardProps<T>,) => {
    return(
        <div>
            {config.icon}{config.key}
        </div>
    )
}

export default TypeMetaCard;
