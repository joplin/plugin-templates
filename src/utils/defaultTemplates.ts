import joplin from "api";
import { DefaultTemplatesConfigSetting, DefaultNoteTemplateIdSetting, DefaultTodoTemplateIdSetting } from "../settings";

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
                await DefaultNoteTemplateIdSetting.set(templateId);
                break;
            case DefaultTemplateType.Todo:
                await DefaultTodoTemplateIdSetting.set(templateId);
                break;
            case DefaultTemplateType.Both:
                await DefaultNoteTemplateIdSetting.set(templateId);
                await DefaultTodoTemplateIdSetting.set(templateId);
                break;
            default:
                break;
        }
    } else {
        // Notebook specific default
        switch (defaultType) {
            case DefaultTemplateType.Note:
                await DefaultTemplatesConfigSetting.setDefaultTempalte(notebookId, templateId, DefaultTemplatesConfigSetting.DefaultType.Note);
                break;
            case DefaultTemplateType.Todo:
                await DefaultTemplatesConfigSetting.setDefaultTempalte(notebookId, templateId, DefaultTemplatesConfigSetting.DefaultType.Todo);
                break;
            case DefaultTemplateType.Both:
                await DefaultTemplatesConfigSetting.setDefaultTempalte(notebookId, templateId, DefaultTemplatesConfigSetting.DefaultType.Both);
                break;
        }
    }
}
