import joplin from "api";
import { SettingItem } from "api/types";

export interface PluginSetting<T> {
    id: string;
    manifest: SettingItem;

    get(): Promise<T>;
    set(newValue: T): Promise<void>;
}

export const createSimpleSetting = <T>(id: string, manifest: SettingItem): PluginSetting<T> => {
    return class {
        static id = id;
        static manifest = manifest;

        static async get(): Promise<T> {
            return await joplin.settings.value(id);
        }

        static async set(newValue: T): Promise<void> {
            await joplin.settings.setValue(id, newValue);
        }
    }
}

/**
 * This considers that the original setting is of type `string`. On `set` if no original value
 * can be traced back, the setting is set to an empty string.
 */
export const createMappedSetting = <T>(id: string, manifest: SettingItem, valueMap: Record<string, T>, defaultValue: T): PluginSetting<T> => {
    return class {
        static id = id;
        static manifest = manifest;

        static async get(): Promise<T> {
            const value: string = await joplin.settings.value(id);
            return value in valueMap ? valueMap[value] : defaultValue;
        }

        static async set(newValue: T): Promise<void> {
            const potentialValues = Object.entries(valueMap).filter((entry) => entry[1] === newValue);
            await joplin.settings.setValue(id, potentialValues.length ? potentialValues[1][0] : "" );
        }
    }
}
