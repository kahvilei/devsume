import {useMemo} from "react";
import {DataService} from "@/app/_data";
import {ItemConfig} from "@/config/items";
import {IBaseItem} from "@/server/models/schemas/IBaseItem";

/**
 * useConfig hook to retrieve configuration values of a specific type.
 * Returns the full configuration object for the given type.
 *
 * @param type - The type key for which the config is requested.
 * @returns ItemConfig<T> - The configuration for the type.
 */
export function useConfig<T extends IBaseItem>(type: string): ItemConfig<T> {
    return useMemo(() => {
        try {
            const service = DataService.getService(type);
            return service.getConfig(type) as unknown as ItemConfig<T>;
        } catch (error) {
            console.error(`Error with useConfig for type "${type}":`, error);
            throw new Error(`Could not load config for type "${type}"`);
        }
    }, [type]);
}
