import joplin from "api";
import { SettingItemType } from "api/types";
import { PluginSetting } from "./base";

export interface DefaultTemplatesConfig {
    [notebookId: string]: {
        defaultNoteTemplateId: string | null;
        defaultTodoTemplateId: string | null;
    }
}

export const DefaultTemplatesConfigSetting: PluginSetting<DefaultTemplatesConfig> = class {
    static id = "defaultTemplatesConfig";

    static manifest = {
        public: false,
        type: SettingItemType.Object,
        value: null,
        label: "Default templates config"
    };

    static async get(): Promise<DefaultTemplatesConfig> {
        const defaultTemplatesConfig: DefaultTemplatesConfig | null = await joplin.settings.value(DefaultTemplatesConfigSetting.id);
        return defaultTemplatesConfig ? defaultTemplatesConfig : {};
    }

    static async set(newValue: DefaultTemplatesConfig): Promise<void> {
        await joplin.settings.setValue(DefaultTemplatesConfigSetting.id, newValue);
    }
}
