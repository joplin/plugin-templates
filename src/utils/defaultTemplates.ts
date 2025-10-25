import joplin from "api";
import { DefaultTemplatesConfigSetting, DefaultNoteTemplateIdSetting, DefaultTodoTemplateIdSetting } from "../settings";
import { encode } from "html-entities";

export enum DefaultTemplateType {
    Both,
    Note,
    Todo,
}

export async function getUserDefaultTemplateTypeSelection(dialogHandle: string, prompt?: string): Promise<DefaultTemplateType | null> {
    try {
        await joplin.views.dialogs.addScript(dialogHandle, "./views/webview.css");

        const optionsHtml = [
            { value: DefaultTemplateType.Note, label: "Note" },
            { value: DefaultTemplateType.Todo, label: "To-do" },
            { value: DefaultTemplateType.Both, label: "Both" }
        ].map(option => `<option value="${encode(option.value.toString())}">${encode(option.label)}</option>`).join("");

        await joplin.views.dialogs.setHtml(dialogHandle, `
            <h2>${encode(prompt || "Select template type")}</h2>
            <form class="variablesForm" name="template-type-form">
                <div class="variableName">Choose template type:</div>
                <select name="templateType">${optionsHtml}</select>
            </form>
        `);

        // Add buttons to the dialog
        await joplin.views.dialogs.setButtons(dialogHandle, [
            { id: "ok", title: "Select" },
            { id: "cancel", title: "Cancel" }
        ]);

        // Make dialog size adapt to content
        await joplin.views.dialogs.setFitToContent(dialogHandle, true);

        const result = await joplin.views.dialogs.open(dialogHandle);
        
        if (result.id === "cancel") {
            return null;
        }

        // Get the template type value from the nested form data structure
        const value = result.formData?.["template-type-form"]?.templateType;
        
        return value ? parseInt(value) as DefaultTemplateType : null;
    } catch (error) {
        console.error("Error in getUserDefaultTemplateTypeSelection:", error);
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
