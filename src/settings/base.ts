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
