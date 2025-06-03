import {ItemService} from "@/app/_data/Items/ItemService";
import {IBaseItem} from "@/server/models/schemas/IBaseItem";
import TypeMetaCard from "@/app/_components/items/meta/TypeMetaCard";

interface AddNewItemPageProps<T extends IBaseItem> {
    service: ItemService<T>;
}

const AddNewItemPage = <T extends IBaseItem>(
    {
        service
    }: AddNewItemPageProps<T>) => {
    const types = service.getAllKeys();
    return (
        <div className={"add-new-item-page"}>
            {types.length !== 0 ?
                <>
                <h2>Add a new ...</h2>
                {
                    types.map((type) => {
                        return (
                            <TypeMetaCard config={service.getConfig(type)} key={type}/>
                        )
                    })
                }
                </>
                :
                <p>
                    No data types exist for {service.getSingularName()}
                </p>
            }
        </div>
    )
}

export default AddNewItemPage;