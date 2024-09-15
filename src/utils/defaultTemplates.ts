import joplin from "api";

export interface DefaultTemplatesConfigSetting {
    [notebookId: string]: {
        defaultNoteTemplateId: string | null;
        defaultTodoTemplateId: string | null;
    }
}

export enum DefaultTemplateType {
    Both,
    Note,
    Todo,
}

export const getUserDefaultTemplateTypeSelection = async (promptLabel = "Applicable for:"): Promise<DefaultTemplateType | null> => {
    const defaultTypeOptions = [
        {
            label: "Both notes & todos",
            value: DefaultTemplateType.Both
        },
        {
            label: "Notes",
            value: DefaultTemplateType.Note
        },
        {
            label: "Todos",
            value: DefaultTemplateType.Todo
        },
    ];

    const { answer } = await joplin.commands.execute("showPrompt", {
        label: promptLabel,
        inputType: "dropdown",
        value: defaultTypeOptions[0],
        autocomplete: defaultTypeOptions
    });

    if (!answer) return null;
    return answer.value;
}

export const setDefaultTemplate = async (notebookId: string | null, templateId: string, defaultType: DefaultTemplateType): Promise<void> => {
    if (notebookId === null) {
        // Global default
        switch (defaultType) {
            case DefaultTemplateType.Note:
                await joplin.settings.setValue("defaultNoteTemplateId", templateId);
                break;
            case DefaultTemplateType.Todo:
                await joplin.settings.setValue("defaultTodoTemplateId", templateId);
                break;
            case DefaultTemplateType.Both:
                await joplin.settings.setValue("defaultNoteTemplateId", templateId);
                await joplin.settings.setValue("defaultTodoTemplateId", templateId);
                break;
            default:
                break;
        }
    } else {
        // Notebook specific default
        let defaultTemplatesConfig: DefaultTemplatesConfigSetting | null = await joplin.settings.value("defaultTemplatesConfig");
        if (defaultTemplatesConfig === null) defaultTemplatesConfig = {};

        if (!(notebookId in defaultTemplatesConfig)) {
            defaultTemplatesConfig[notebookId] = {
                defaultNoteTemplateId: null,
                defaultTodoTemplateId: null
            };
        }

        switch (defaultType) {
            case DefaultTemplateType.Note:
                defaultTemplatesConfig[notebookId].defaultNoteTemplateId = templateId;
                break;
            case DefaultTemplateType.Todo:
                defaultTemplatesConfig[notebookId].defaultTodoTemplateId = templateId;
                break;
            case DefaultTemplateType.Both:
                defaultTemplatesConfig[notebookId].defaultNoteTemplateId = templateId;
                defaultTemplatesConfig[notebookId].defaultTodoTemplateId = templateId;
                break;
            default:
                break;
        }

        await joplin.settings.setValue("defaultTemplatesConfig", defaultTemplatesConfig);
    }
}

export const getNotebookDefaultTemplatesConfig = async (): Promise<DefaultTemplatesConfigSetting> => {
    let defaultTemplatesConfig: DefaultTemplatesConfigSetting | null = await joplin.settings.value("defaultTemplatesConfig");
    if (defaultTemplatesConfig === null) defaultTemplatesConfig = {};
    return defaultTemplatesConfig;
}

export const clearDefaultTemplates = async (notebookId: string): Promise<void> => {
    const defaultTemplatesConfig = await getNotebookDefaultTemplatesConfig();
    delete defaultTemplatesConfig[notebookId];
    await joplin.settings.setValue("defaultTemplatesConfig", defaultTemplatesConfig);
}
