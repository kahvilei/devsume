import {ItemService} from "@/app/_data/Items/ItemService";
import {IBaseItem} from "@/server/models/schemas/IBaseItem";
import TypeMetaCard from "@/app/_components/items/meta/TypeMetaCard";
import { useSearchParams } from 'next/navigation'
import ItemEdit from "./ItemEdit";
import { Item } from "@/app/_data/Items/Item";


interface AddNewItemPageProps<T extends IBaseItem> {
    service: ItemService<T>;
}

const AddNewItemPage = <T extends IBaseItem>(
    {
        service
    }: AddNewItemPageProps<T>) => {
    const types = service.getAllKeys();
    const searchParams = useSearchParams()

    const type = searchParams.get('type')

    if( type === undefined || !(type?.includes(type))){
        return (
        <div className={"add-_new-item-page"}>
            {types.length !== 0 ?
                <>
                <h2>Add a new {service.getSingularName()}...</h2>
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
    )} else {
        return (
            <ItemEdit
                item={new Item({ title: "" }, type)}
                label="Add a new item"
                onFinished={() => {}}
            />
        )
    }
}

export default AddNewItemPage;