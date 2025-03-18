import joplin from "api";
import { DefaultTemplatesConfigSetting, DefaultNoteTemplateIdSetting, DefaultTodoTemplateIdSetting } from "../settings";

export enum DefaultTemplateType {
    Both,
    Note,
    Todo,
}

export async function getUserDefaultTemplateTypeSelection(dialogHandle: string, prompt?: string): Promise<DefaultTemplateType | null> {
    try {
        await joplin.views.dialogs.setHtml(dialogHandle, `
            <div style="padding: 10px;">
                <p>${prompt || "Select template type:"}</p>
                <select id="templateType" name="templateType">
                    <option value="${DefaultTemplateType.Note}">Note</option>
                    <option value="${DefaultTemplateType.Todo}">To-do</option>
                    <option value="${DefaultTemplateType.Both}">Both</option>
                </select>
            </div>
        `);

        const result = await joplin.views.dialogs.open(dialogHandle);
        const value = result.formData?.templateType;
        return value ? parseInt(value) as DefaultTemplateType : null;
    } catch (error) {
        console.error('Error in getUserDefaultTemplateTypeSelection:', error);
        return null;
    }
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
