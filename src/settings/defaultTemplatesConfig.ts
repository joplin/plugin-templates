import joplin from "api";
import { SettingItemType } from "api/types";

export interface DefaultTemplatesConfig {
    [notebookId: string]: {
        defaultNoteTemplateId: string | null;
        defaultTodoTemplateId: string | null;
    }
}

enum DefaultType {
    Both,
    Note,
    Todo,
}

export const DefaultTemplatesConfigSetting = class {
    static readonly DefaultType = DefaultType;

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

    static async setDefaultTempalte(notebookId: string, templateId: string, defaultType: DefaultType): Promise<void> {
        const defaultTemplatesConfig = await this.get();

        if (!(notebookId in defaultTemplatesConfig)) {
            defaultTemplatesConfig[notebookId] = {
                defaultNoteTemplateId: null,
                defaultTodoTemplateId: null
            };
        }

        switch (defaultType) {
            case DefaultType.Note:
                defaultTemplatesConfig[notebookId].defaultNoteTemplateId = templateId;
                break;
            case DefaultType.Todo:
                defaultTemplatesConfig[notebookId].defaultTodoTemplateId = templateId;
                break;
            case DefaultType.Both:
                defaultTemplatesConfig[notebookId].defaultNoteTemplateId = templateId;
                defaultTemplatesConfig[notebookId].defaultTodoTemplateId = templateId;
                break;
            default:
                break;
        }

        await this.set(defaultTemplatesConfig);
    }

    static async clearDefaultTemplates(notebookId: string): Promise<void> {
        const defaultTemplatesConfig = await this.get();
        delete defaultTemplatesConfig[notebookId];
        await this.set(defaultTemplatesConfig);
    }
}
