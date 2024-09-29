import joplin from "api";

export interface GlobalSetting<T> {
    id: string;
    get(): Promise<T>;
}

export const createGlobalSetting = <T>(id: string): GlobalSetting<T> => {
    return class {
        static id = id;

        static async get(): Promise<T> {
            return await joplin.settings.globalValue(id);
        }
    }
}
